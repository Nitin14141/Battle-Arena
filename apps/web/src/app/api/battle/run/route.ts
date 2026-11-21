import { NextResponse } from "next/server";
import type {
  BattleMode,
  CharacterCategory,
  CharacterProfile,
  CombatAttributes,
  EmblemTheme,
  IntelligenceAttributes,
} from "@battle-arena/shared";
import { runBattle } from "@battle-arena/simulation-engine";
import { resolveCharacterById } from "@/lib/server-characters";

const VALID_MODES: BattleMode[] = ["intelligence", "strength", "overall"];

const INTELLIGENCE_KEYS = [
  "strategic",
  "tactical",
  "problemSolving",
  "adaptability",
  "experience",
  "prediction",
  "deception",
  "decisionMaking",
  "resourceManagement",
] as const;

const COMBAT_KEYS = [
  "strength",
  "attackPower",
  "speed",
  "reactionSpeed",
  "durability",
  "defence",
  "stamina",
  "endurance",
  "combatSkill",
] as const;

const THEMES = new Set<EmblemTheme>([
  "violet",
  "crimson",
  "azure",
  "emerald",
  "amber",
  "steel",
  "rose",
  "teal",
]);

function toScore(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(1, Math.min(100, Math.round(number)));
}

function toList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim().slice(0, 220))
    .filter(Boolean)
    .slice(0, max);
}

function toOptionalText(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

/**
 * The browser can send the profile it just researched. Validate it strictly so
 * the output shape and score ranges stay under server control, and ignore
 * anything that does not match the requested fighter.
 */
function sanitiseProfile(value: unknown, expectedId: string): CharacterProfile | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (raw.id !== expectedId) return null;

  const name = typeof raw.name === "string" ? raw.name.trim().slice(0, 90) : "";
  if (!name) return null;

  const intelligenceRaw = raw.intelligence as Record<string, unknown> | undefined;
  const combatRaw = raw.combat as Record<string, unknown> | undefined;
  if (!intelligenceRaw || typeof intelligenceRaw !== "object") return null;
  if (!combatRaw || typeof combatRaw !== "object") return null;

  const intelligence = {} as IntelligenceAttributes;
  for (const key of INTELLIGENCE_KEYS) {
    const score = toScore(intelligenceRaw[key]);
    if (score === null) return null;
    intelligence[key] = score;
  }

  const combat = {} as CombatAttributes;
  for (const key of COMBAT_KEYS) {
    const score = toScore(combatRaw[key]);
    if (score === null) return null;
    combat[key] = score;
  }

  const category: CharacterCategory = raw.category === "historical" ? "historical" : "fictional";
  const theme = typeof raw.theme === "string" && THEMES.has(raw.theme as EmblemTheme)
    ? (raw.theme as EmblemTheme)
    : "steel";

  return {
    id: expectedId,
    name,
    aliases: toList(raw.aliases, 8),
    universe: toOptionalText(raw.universe, 90) ?? "Unknown universe",
    franchise: toOptionalText(raw.franchise, 90),
    category,
    origin: toOptionalText(raw.origin, 90) ?? "Unknown origin",
    era: toOptionalText(raw.era, 90),
    description: toOptionalText(raw.description, 800) ?? "Researched fighter.",
    intelligence,
    combat,
    abilities: toList(raw.abilities, 10),
    weaknesses: toList(raw.weaknesses, 8),
    weaknessTags: toList(raw.weaknessTags, 8),
    equipment: toList(raw.equipment, 10),
    resistances: toList(raw.resistances, 8),
    feats: toList(raw.feats, 8),
    evidence: toList(raw.evidence, 8),
    tags: toList(raw.tags, 10),
    theme,
    imageUrl: toOptionalText(raw.imageUrl, 500),
    source: "ai-researched",
    researchedAt: toOptionalText(raw.researchedAt, 40) ?? new Date().toISOString(),
  };
}

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
      sanitiseProfile(body.characterA, aId) ?? resolveCharacterById(aId),
      sanitiseProfile(body.characterB, bId) ?? resolveCharacterById(bId),
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
