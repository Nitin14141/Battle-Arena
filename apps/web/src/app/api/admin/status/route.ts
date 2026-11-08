import { NextResponse } from "next/server";
import { rosterStats } from "@/lib/roster";
import { listResearchedCharacters } from "@/lib/character-store";
import { configuredResearchModel, isResearchConfigured } from "@/lib/character-research";
import { ENGINE_VERSION, SCENARIOS } from "@battle-arena/simulation-engine";

export const runtime = "nodejs";

export async function GET() {
  const researchConfigured = isResearchConfigured();
  const provider = researchConfigured ? "openrouter" : (process.env.AI_PROVIDER ?? "mock");
  const model = researchConfigured ? configuredResearchModel() : "not configured";
  const researched = await listResearchedCharacters(300);

  return NextResponse.json({
    success: true,
    data: {
      engine: {
        version: ENGINE_VERSION,
        scenarios: SCENARIOS.length,
        trialsPerScenario: 10,
        totalTrialsPerMode: SCENARIOS.length * 10,
        deterministic: true,
      },
      roster: {
        ...rosterStats(),
        researched: researched.length,
        note: "Curated fighters plus any character created by the AI researcher.",
      },
      ai: {
        provider,
        model,
        configured: researchConfigured || provider !== "mock",
        freeOnlyGuard: true,
        evidenceSource: "Wikipedia (free API)",
        researchedCharacters: researched.length,
        note: researchConfigured
          ? "Free-model research enabled. The AI builds profiles; the local engine decides outcomes."
          : "No OpenRouter key loaded. AI research is disabled and the battle engine still works.",
      },
      infrastructure: {
        databaseConfigured: Boolean(process.env.DATABASE_URL),
        redisConfigured: Boolean(process.env.REDIS_URL),
        dockerAvailable: false,
      },
      phases: [
        { id: "A", name: "Stabilize", status: "complete" },
        { id: "B", name: "Battle flow", status: "complete" },
        { id: "C", name: "Visual system", status: "in progress" },
        { id: "D", name: "AI research & narration", status: "in progress" },
        { id: "E", name: "Database, accounts, community", status: "pending" },
        { id: "F", name: "Security & deployment", status: "pending" },
      ],
    },
  });
}
