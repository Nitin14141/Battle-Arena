/**
 * Free-model OpenRouter client.
 *
 * Financial guard: only `:free` variants (or the `openrouter/free` router) may
 * ever be called. There is no paid fallback and no env bypass in this path.
 * Calls are attempted over a short list of open-weight free models so a single
 * retired or rate-limited endpoint does not take research down.
 */

/**
 * Ordered fastest-first. Reasoning-only models (for example
 * nvidia/nemotron-3.5-lightning) spend the whole token budget on hidden
 * reasoning and return `content: null`, which used to cost ~35s per research
 * before falling back. Every entry below is known to emit JSON content.
 */
export const DEFAULT_FREE_MODELS = [
  "baidu/ernie-5.5-flash-preview:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "inclusionai/ling-3.2-flash:free",
] as const;

export type FreeModelErrorCode =
  | "not_configured"
  | "invalid_model"
  | "rate_limited"
  | "unavailable"
  | "timeout";

export class FreeModelError extends Error {
  code: FreeModelErrorCode;
  detail: string;

  constructor(code: FreeModelErrorCode, message: string, detail = "") {
    super(message);
    this.name = "FreeModelError";
    this.code = code;
    this.detail = detail;
  }
}

export function isFreeModelId(model: string): boolean {
  const value = model.trim();
  return value === "openrouter/free" || value.endsWith(":free");
}

export interface FreeModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface FreeModelOptions {
  apiKey: string | undefined;
  baseUrl?: string;
  model?: string;
  messages: FreeModelMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  jsonMode?: boolean;
}

export interface FreeModelResult {
  text: string;
  model: string;
}

interface ChatCompletionResponse {
  choices?: {
    finish_reason?: string | null;
    message?: {
      content?: string | null;
      reasoning?: string | null;
    };
  }[];
  usage?: { completion_tokens_details?: { reasoning_tokens?: number } };
  error?: { message?: string };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Models that answered with reasoning but no content are unusable for profile
 * generation. Remember them briefly so only the first request pays the cost.
 */
const UNUSABLE_TTL_MS = 10 * 60 * 1000;
const unusable = new Map<string, number>();

function isUnusable(model: string): boolean {
  const at = unusable.get(model);
  if (at === undefined) return false;
  if (Date.now() - at > UNUSABLE_TTL_MS) {
    unusable.delete(model);
    return false;
  }
  return true;
}

/**
 * Calls the first free model that answers. Retries the next candidate on
 * 404/429/5xx. Never adds a paid model to the list.
 */
export async function completeWithFreeModel(options: FreeModelOptions): Promise<FreeModelResult> {
  if (!options.apiKey) {
    throw new FreeModelError(
      "not_configured",
      "OpenRouter is not configured. Add OPENROUTER_API_KEY to the project .env.",
    );
  }

  const requested = options.model?.trim();
  if (requested && !isFreeModelId(requested)) {
    throw new FreeModelError(
      "invalid_model",
      `Refused to call '${requested}': Battle Arena may only use free models (':free' or 'openrouter/free').`,
    );
  }

  const ordered = [...new Set([requested, ...DEFAULT_FREE_MODELS].filter(Boolean) as string[])];
  const models = [...ordered.filter((model) => !isUnusable(model)), ...ordered.filter((model) => isUnusable(model))];
  const baseUrl = (options.baseUrl || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
  // A profile is ~1k tokens; a free model that needs longer than this is not
  // worth blocking the research request for.
  const budgetMs = Math.max(12000, options.timeoutMs ?? 40000);
  const startedAt = Date.now();
  let lastDetail = "";
  let sawRateLimit = false;

  for (const [index, model] of models.entries()) {
    const remaining = budgetMs - (Date.now() - startedAt);
    if (remaining < 5000) break;

    const attemptTimeout = Math.min(index === 0 ? 30000 : 18000, remaining);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), attemptTimeout);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://battle-arena.local",
          "X-Title": "Battle Arena Character Research",
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 2600,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
          // Reasoning models otherwise spend the whole token budget thinking and
          // return the chain of thought as the answer. The JSON answer is in
          // `content` once reasoning is excluded.
          reasoning: { exclude: true },
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = (await response.text()).slice(0, 500);
        lastDetail = `${model} → HTTP ${response.status}: ${body}`;
        if (response.status === 429) sawRateLimit = true;
        // Try the next free model for endpoint/rate-limit/upstream failures.
        if ([400, 401, 402, 403, 404, 408, 409, 429, 500, 502, 503, 504].includes(response.status)) {
          continue;
        }
        throw new FreeModelError("unavailable", "The free model request was rejected.", lastDetail);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const text = data.choices?.[0]?.message?.content ?? "";
      if (typeof text === "string" && text.trim().length > 0) {
        return { text, model };
      }

      // A reasoning model that exhausts max_tokens returns no content at all.
      // Retrying it is pointless, so move straight to the next candidate.
      const reasoningTokens = data.usage?.completion_tokens_details?.reasoning_tokens ?? 0;
      lastDetail = `${model} → empty content (${reasoningTokens} reasoning tokens)`;
      unusable.set(model, Date.now());
      continue;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        lastDetail = `${model} → timed out after ${attemptTimeout}ms`;
        continue;
      }
      if (error instanceof FreeModelError) throw error;
      lastDetail = `${model} → ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      clearTimeout(timer);
    }

    await sleep(350);
  }

  throw new FreeModelError(
    sawRateLimit ? "rate_limited" : "unavailable",
    sawRateLimit
      ? "All free models are rate-limited right now. Free tiers allow about 50 requests per day."
      : "No free model could complete the request.",
    lastDetail,
  );
}
