import { NextResponse } from "next/server";
import { rosterStats } from "@/lib/roster";
import { ENGINE_VERSION, SCENARIOS } from "@battle-arena/simulation-engine";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Battle Arena API",
    timestamp: new Date().toISOString(),
    engine: {
      version: ENGINE_VERSION,
      scenarios: SCENARIOS.length,
      trialsPerScenario: 10,
    },
    roster: rosterStats(),
    persistence: {
      database: Boolean(process.env.DATABASE_URL),
      mode: "guest-local",
    },
  });
}
