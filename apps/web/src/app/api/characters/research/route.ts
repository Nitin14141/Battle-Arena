import { NextResponse } from "next/server";
import {
  configuredResearchModel,
  isResearchConfigured,
  researchCharacterByName,
  ResearchError,
} from "@/lib/character-research";

export const runtime = "nodejs";
export const maxDuration = 120;

// Local abuse guard. The provider's free tier is the real ceiling (~50/day).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const buckets = new Map<string, number[]>();

function rateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    buckets.set(key, recent);
    return { allowed: false, retryAfter: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 500) {
    for (const [entry, stamps] of buckets) {
      if (stamps.every((stamp) => now - stamp >= WINDOW_MS)) buckets.delete(entry);
    }
  }
  return { allowed: true, retryAfter: 0 };
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many research requests. Try again in ${limit.retryAfter} seconds.`,
        code: "RATE_LIMITED",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Send a JSON body." }, { status: 400 });
  }

  const name =
    typeof body === "object" && body !== null && typeof (body as { name?: unknown }).name === "string"
      ? (body as { name: string }).name
      : "";

  try {
    const result = await researchCharacterByName(name);
    return NextResponse.json({
      success: true,
      data: {
        character: result.character,
        meta: {
          cached: result.cached,
          sourced: result.sourced,
          fallback: result.fallback ?? false,
          model: result.model,
          sources: result.sources,
          engineVersion: "0.2.0",
          note: "The AI produced this profile. The deterministic engine decides every battle outcome.",
        },
      },
    });
  } catch (error) {
    if (error instanceof ResearchError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          detail: error.detail || undefined,
        },
        { status: error.status },
      );
    }
    console.error("Character research failed:", error);
    return NextResponse.json(
      { success: false, error: "Character research failed unexpectedly." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      configured: isResearchConfigured(),
      model: configuredResearchModel(),
      freeModelsOnly: true,
      evidenceSource: "Wikipedia (free API)",
      limits: { perTenMinutes: MAX_PER_WINDOW, providerFreeDaily: "about 50" },
    },
  });
}
