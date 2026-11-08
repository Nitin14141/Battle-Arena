import { NextResponse } from "next/server";
import type { BattleMode } from "@battle-arena/shared";
import { runBattle } from "@battle-arena/simulation-engine";
import { resolveCharacterById } from "@/lib/server-characters";

const VALID_MODES: BattleMode[] = ["intelligence", "strength", "overall"];

function parseModes(value: unknown): BattleMode[] {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return raw.filter(
    (entry): entry is BattleMode =>
      typeof entry === "string" && (VALID_MODES as string[]).includes(entry),
  );
}

function parseSeed(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Date.now() % 2147483647;
  return Math.abs(Math.trunc(parsed)) % 2147483647;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const aId = typeof body.a === "string" ? body.a : body.characterAId;
    const bId = typeof body.b === "string" ? body.b : body.characterBId;

    if (typeof aId !== "string" || typeof bId !== "string") {
      return NextResponse.json(
        { success: false, error: "Both fighter IDs are required." },
        { status: 400 },
      );
    }

    if (aId === bId) {
      return NextResponse.json(
        { success: false, error: "Choose two different fighters." },
        { status: 400 },
      );
    }

    const [characterA, characterB] = await Promise.all([
      resolveCharacterById(aId),
      resolveCharacterById(bId),
    ]);

    if (!characterA || !characterB) {
      return NextResponse.json(
        { success: false, error: "One or both fighters are unknown. Research the character again." },
        { status: 404 },
      );
    }

    const modes = parseModes(body.modes ?? body.mode);
    if (modes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Select at least one battle mode." },
        { status: 400 },
      );
    }

    const requestedTrials = Number(body.trialsPerScenario);
    const trialsPerScenario = Number.isFinite(requestedTrials)
      ? Math.min(25, Math.max(5, Math.trunc(requestedTrials)))
      : 10;

    const result = runBattle({
      characterA,
      characterB,
      modes,
      seed: parseSeed(body.seed),
      trialsPerScenario,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Battle run failed:", error);
    return NextResponse.json(
      { success: false, error: "The simulation engine could not complete this battle." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      detail: "POST { a, b, modes, seed } to run a deterministic battle.",
      modes: VALID_MODES,
      scenarios: 10,
      trialsPerScenario: 10,
    },
  });
}
