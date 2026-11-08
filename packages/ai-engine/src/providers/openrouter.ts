import { AIRequest, AIResponse, PROMPT_VERSION } from "@battle-arena/shared";
import { AIProvider } from "./mock";

export class OpenRouterAIProvider implements AIProvider {
  name = "openrouter";
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private timeout: number;

  constructor(apiKey: string, baseUrl?: string, defaultModel?: string, timeout?: number) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://openrouter.ai/api/v1";
    this.defaultModel = defaultModel || "deepseek/deepseek-chat:free";
    this.timeout = timeout || 60000;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const modelToUse = request.model || this.defaultModel;

    // Financial Safety Guard: Ensure only approved free models are used unless explicitly instructed
    if (!modelToUse.includes(":free") && process.env.ALLOW_PAID_MODELS !== "true") {
      throw new Error(`Financial Safeguard Block: Attempted to call non-free model '${modelToUse}' without explicit paid authorization.`);
    }

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://battlearena.com",
          "X-Title": "Battle Arena Simulation Engine",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1500,
          response_format: request.schema ? { type: "json_object" } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          data: null,
          raw: null,
          model: modelToUse,
          promptVersion: PROMPT_VERSION,
          durationMs: Date.now() - start,
          error: `OpenRouter API Error (${response.status}): ${errorText}`,
        };
      }

      const responseData = await response.json();
      const content = responseData.choices?.[0]?.message?.content || "";

      let parsedData: Record<string, unknown> | null = null;
      if (request.schema) {
        try {
          parsedData = JSON.parse(content);
        } catch {
          // Keep raw content if JSON parsing fails
        }
      }

      return {
        success: true,
        data: parsedData || { result: content },
        raw: content,
        model: modelToUse,
        promptVersion: PROMPT_VERSION,
        durationMs: Date.now() - start,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      return {
        success: false,
        data: null,
        raw: null,
        model: modelToUse,
        promptVersion: PROMPT_VERSION,
        durationMs: Date.now() - start,
        error: error.message || "Failed to connect to OpenRouter endpoint.",
      };
    }
  }
}
