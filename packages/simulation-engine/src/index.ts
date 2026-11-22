import { OUTCOMES } from "@battle-arena/shared";
import type {
  BattleMode,
  BattleRunResult,
  CharacterProfile,
  CombatAttributes,
  IntelligenceAttributes,
  ModeBattleResult,
  Outcome,
  ScenarioResult,
  ScenarioSummary,
  TrialResult,
} from "@battle-arena/shared";
import { buildScenarioReports } from "@battle-arena/report-engine";

/**
 * Battle Arena deterministic simulation engine.
 *
 * Rules enforced here:
 * - Ten fixed scenarios, ten trials each, 100 trials per mode.
 * - Every trial is computed from character attributes, scenario modifiers,
 *   ability interactions and a seeded PRNG.
 * - The engine never calls an AI provider and never changes a winner to make a
 *   story better. AI narration is added afterwards and may only describe this
 *   output.
 */

export const ENGINE_VERSION = "0.3.0";
export const TRIALS_PER_SCENARIO = 10;

const INTELLIGENCE_WEIGHTS: Record<keyof IntelligenceAttributes, number> = {
  strategic: 18,
  tactical: 16,
  problemSolving: 14,
  adaptability: 14,
  experience: 12,
  prediction: 10,
  deception: 8,
  decisionMaking: 5,
  resourceManagement: 3,
};

const COMBAT_WEIGHTS: Record<keyof CombatAttributes, number> = {
  strength: 14,
  attackPower: 18,
  speed: 10,
  reactionSpeed: 10,
  durability: 14,
  defence: 10,
  stamina: 6,
  endurance: 6,
  combatSkill: 12,
};

const ATTRIBUTE_LABELS: Record<string, string> = {
  strategic: "strategic planning",
  tactical: "tactical execution",
  problemSolving: "problem solving",
  adaptability: "adaptability",
  experience: "battle experience",
  prediction: "prediction",
  deception: "deception",
  decisionMaking: "decision making",
  resourceManagement: "resource management",
  strength: "physical strength",
  attackPower: "attack power",
  speed: "speed",
  reactionSpeed: "reaction speed",
  durability: "durability",
  defence: "defence",
  stamina: "stamina",
  endurance: "endurance",
  combatSkill: "combat skill",
};

type ModMap<T> = Partial<Record<keyof T, number>>;

interface ScenarioDefinition {
  id: string;
  name: Record<BattleMode, string>;
  description: Record<BattleMode, string>;
  intelligenceMods?: ModMap<IntelligenceAttributes>;
  combatMods?: ModMap<CombatAttributes>;
  volatility: number;
  equipmentFactor: number;
  /**
   * How strongly a mind edge moves an overall fight. The score is
   * `combat + (intelligence - 50) * influence`, so a superior brain can decide
   * a close fight but never out-weigh a far stronger body.
   */
  intelligenceInfluence: number;
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "standard_battle",
    name: {
      intelligence: "Standard Intelligence Engagement",
      strength: "Standard Combat Clash",
      overall: "Standard Crossover Engagement",
    },
    description: {
      intelligence: "Both minds meet on neutral ground with ordinary information.",
      strength: "Both fighters open with their standard doctrine.",
      overall: "Balanced conditions with no unusual advantages.",
    },
    volatility: 1,
    equipmentFactor: 1,
    intelligenceInfluence: 0.3,
  },
  {
    id: "max_power",
    name: {
      intelligence: "Peak Cognitive Output",
      strength: "Maximum Power Unleashed",
      overall: "Maximum Potential Unleashed",
    },
    description: {
      intelligence: "Both fighters operate at their highest reasoning capacity.",
      strength: "Both sides escalate to their strongest eligible output.",
      overall: "Every capability is pushed to its ceiling.",
    },
    combatMods: { attackPower: 1.2, strength: 1.15, stamina: 1.1 },
    intelligenceMods: { strategic: 1.1, problemSolving: 1.1 },
    volatility: 1.25,
    equipmentFactor: 1,
    intelligenceInfluence: 0.22,
  },
  {
    id: "no_preparation",
    name: {
      intelligence: "Unscripted Ambush",
      strength: "Unprepared Strike",
      overall: "Ambush / Zero Preparation",
    },
    description: {
      intelligence: "No time to plan; instinct and reaction dominate.",
      strength: "Neither fighter warms up or chooses the ground.",
      overall: "Neither side has time to prepare.",
    },
    intelligenceMods: { strategic: 0.8, tactical: 0.8, prediction: 0.7, experience: 0.9 },
    combatMods: { reactionSpeed: 0.9 },
    volatility: 1.15,
    equipmentFactor: 0.8,
    intelligenceInfluence: 0.24,
  },
  {
    id: "full_preparation",
    name: {
      intelligence: "Full Strategic Preparation",
      strength: "Fully Conditioned",
      overall: "Full Strategic Preparation",
    },
    description: {
      intelligence: "Both sides arrive with complete plans and contingencies.",
      strength: "Both fighters are rested, conditioned and ready.",
      overall: "Both sides can prepare without restriction.",
    },
    intelligenceMods: { strategic: 1.15, tactical: 1.15, prediction: 1.2, decisionMaking: 1.1 },
    combatMods: { stamina: 1.1, endurance: 1.1 },
    volatility: 0.85,
    equipmentFactor: 1.1,
    intelligenceInfluence: 0.38,
  },
  {
    id: "full_knowledge",
    name: {
      intelligence: "Complete Psychological Dossier",
      strength: "Complete Combat Scouting",
      overall: "Complete Knowledge Dossier",
    },
    description: {
      intelligence: "Each side knows the other's full thought process and habits.",
      strength: "Each fighter has scouted the other's full combat toolkit.",
      overall: "Both sides know every ability and weakness in advance.",
    },
    intelligenceMods: { prediction: 1.25, deception: 1.2, problemSolving: 1.1 },
    volatility: 0.8,
    equipmentFactor: 1,
    intelligenceInfluence: 0.36,
  },
  {
    id: "limited_equipment",
    name: {
      intelligence: "Improvised Resources",
      strength: "Restricted Arsenal",
      overall: "Restricted Resources",
    },
    description: {
      intelligence: "Analytical tools and support are stripped away.",
      strength: "Fighters work with almost nothing.",
      overall: "Only minimal equipment is available.",
    },
    combatMods: { combatSkill: 0.95 },
    volatility: 1.05,
    equipmentFactor: 0.15,
    intelligenceInfluence: 0.3,
  },
  {
    id: "full_equipment",
    name: {
      intelligence: "Full Analytical Toolkit",
      strength: "Full Standard Arsenal",
      overall: "Full Standard Arsenal",
    },
    description: {
      intelligence: "Every planning and support tool is available.",
      strength: "Every standard weapon and armour piece is available.",
      overall: "Both sides deploy their complete standard kit.",
    },
    volatility: 0.9,
    equipmentFactor: 1.35,
    intelligenceInfluence: 0.26,
  },
  {
    id: "unfamiliar_environment",
    name: {
      intelligence: "Unknown Strategic Terrain",
      strength: "Hazardous Arena",
      overall: "Hostile Unknown Terrain",
    },
    description: {
      intelligence: "An unfamiliar theatre punishes rigid thinking.",
      strength: "Hazardous ground punishes raw strength without balance.",
      overall: "An unknown battlefield rewards adaptation.",
    },
    intelligenceMods: { adaptability: 1.25, experience: 1.15 },
    combatMods: { speed: 0.95, durability: 0.95 },
    volatility: 1.2,
    equipmentFactor: 1,
    intelligenceInfluence: 0.33,
  },
  {
    id: "tactical_challenge",
    name: {
      intelligence: "Multi-Stage War Objective",
      strength: "Endurance Gauntlet",
      overall: "Multi-Stage War Objective",
    },
    description: {
      intelligence: "Winning requires objectives, resource control and patience.",
      strength: "A long gauntlet where endurance decides the last exchange.",
      overall: "A multi-stage objective, not a single duel.",
    },
    intelligenceMods: { strategic: 1.2, tactical: 1.2, resourceManagement: 1.3 },
    combatMods: { stamina: 1.15, endurance: 1.2 },
    volatility: 0.95,
    equipmentFactor: 1,
    intelligenceInfluence: 0.5,
  },
  {
    id: "randomized_conditions",
    name: {
      intelligence: "Randomized Cognitive Anomalies",
      strength: "Chaotic Arena Shifts",
      overall: "Randomized Arena Anomalies",
    },
    description: {
      intelligence: "Information and conditions shift unpredictably.",
      strength: "The arena changes under both fighters.",
      overall: "Conditions shift unpredictably between trials.",
    },
    volatility: 1.9,
    equipmentFactor: 1,
    intelligenceInfluence: 0.3,
  },
];

/** Ability tags that beat other tags. */
const COUNTERS: Record<string, string[]> = {
  precognition: ["deception", "stealth", "ambush"],
  regeneration: ["physical-damage", "attrition"],
  "superhuman-speed": ["range", "brute-force"],
  "mind-manipulation": ["willpower"],
  "energy-projection": ["brute-force", "flight"],
  magic: ["technology"],
  technology: ["magic"],
  immortality: ["physical-damage"],
  flight: ["ground"],
  tactics: ["brute-force"],
  "martial-arts": ["weapon-reach"],
  swordplay: ["brute-force"],
  gunplay: ["close-quarters"],
  leadership: ["morale"],
  deception: ["prediction"],
  stealth: ["range"],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function weighted<K extends string>(
  values: Record<K, number>,
  weights: Record<K, number>,
  mods?: Partial<Record<K, number>>,
): number {
  const keys = Object.keys(weights) as K[];
  let sum = 0;
  let total = 0;
  for (const key of keys) {
    const weight = weights[key];
    const base = clamp(values[key], 0, 100);
    const modifier = mods?.[key] ?? 1;
    sum += clamp(base * modifier, 0, 100) * weight;
    total += weight;
  }
  return total === 0 ? 0 : sum / total;
}

function intelligenceScore(character: CharacterProfile, scenario: ScenarioDefinition): number {
  return weighted(character.intelligence, INTELLIGENCE_WEIGHTS, scenario.intelligenceMods);
}

function combatScore(character: CharacterProfile, scenario: ScenarioDefinition): number {
  return weighted(character.combat, COMBAT_WEIGHTS, scenario.combatMods);
}

function tagEdge(self: CharacterProfile, other: CharacterProfile): number {
  let edge = 0;
  for (const tag of self.tags) {
    const targets = COUNTERS[tag];
    if (targets && targets.some((target) => other.tags.includes(target))) {
      edge += 2;
    }
  }
  for (const weakness of self.weaknessTags) {
    if (other.tags.includes(weakness) && !self.resistances.includes(weakness)) {
      edge -= 2.2;
    }
  }
  return clamp(edge, -8, 7);
}

function equipmentBonus(character: CharacterProfile, scenario: ScenarioDefinition): number {
  return Math.min(character.equipment.length, 4) * 0.5 * scenario.equipmentFactor;
}

function gaussian(rng: () => number): number {
  return (rng() + rng() + rng() - 1.5) * 5;
}

function baseScores(
  mode: BattleMode,
  a: CharacterProfile,
  b: CharacterProfile,
  scenario: ScenarioDefinition,
): { a: number; b: number } {
  const edgeA = tagEdge(a, b);
  const edgeB = tagEdge(b, a);
  const gearA = equipmentBonus(a, scenario);
  const gearB = equipmentBonus(b, scenario);
  const intelA = intelligenceScore(a, scenario);
  const intelB = intelligenceScore(b, scenario);
  const combatA = combatScore(a, scenario);
  const combatB = combatScore(b, scenario);

  if (mode === "intelligence") {
    return {
      a: intelA + edgeA * 0.9 + gearA * 0.4,
      b: intelB + edgeB * 0.9 + gearB * 0.4,
    };
  }

  if (mode === "strength") {
    return {
      a: combatA + edgeA * 0.9 + gearA,
      b: combatB + edgeB * 0.9 + gearB,
    };
  }

  // A flat weighted average let a brilliant lightweight out-score a vastly
  // stronger fighter, so an overall battle is built from the combat score and
  // a bounded bonus for the sharper mind.
  const influence = scenario.intelligenceInfluence;
  const scale = 100 / (100 + 50 * influence);
  const overall = (combat: number, intel: number) =>
    (combat + (intel - 50) * influence) * scale;
  return {
    a: overall(combatA, intelA) + edgeA * 0.7 + gearA * 0.6,
    b: overall(combatB, intelB) + edgeB * 0.7 + gearB * 0.6,
  };
}

function decisiveFactors(
  mode: BattleMode,
  a: CharacterProfile,
  b: CharacterProfile,
): string[] {
  const comparisons: { label: string; gap: number; weight: number }[] = [];

  if (mode !== "strength") {
    (Object.keys(INTELLIGENCE_WEIGHTS) as (keyof IntelligenceAttributes)[]).forEach((key) => {
      comparisons.push({
        label: ATTRIBUTE_LABELS[key] ?? key,
        gap: a.intelligence[key] - b.intelligence[key],
        weight: INTELLIGENCE_WEIGHTS[key],
      });
    });
  }

  if (mode !== "intelligence") {
    (Object.keys(COMBAT_WEIGHTS) as (keyof CombatAttributes)[]).forEach((key) => {
      comparisons.push({
        label: ATTRIBUTE_LABELS[key] ?? key,
        gap: a.combat[key] - b.combat[key],
        weight: COMBAT_WEIGHTS[key],
      });
    });
  }

  comparisons.sort((x, y) => Math.abs(y.gap * y.weight) - Math.abs(x.gap * x.weight));

  const factors: string[] = [];
  for (const comparison of comparisons) {
    if (factors.length >= 2) break;
    if (Math.abs(comparison.gap) < 4) continue;
    const owner = comparison.gap > 0 ? a.name : b.name;
    factors.push(`${owner} edge in ${comparison.label}`);
  }

  const edgeDifference = tagEdge(a, b) - tagEdge(b, a);
  if (edgeDifference > 1.5) {
    factors.push(`${a.name} ability interaction neutralised ${b.name}'s approach`);
  } else if (edgeDifference < -1.5) {
    factors.push(`${b.name} ability interaction neutralised ${a.name}'s approach`);
  }

  if (factors.length === 0) {
    factors.push("Marginal attribute separation");
  }

  return factors.slice(0, 3);
}

function outcomeFor(difference: number): Outcome {
  const magnitude = Math.abs(difference);
  if (magnitude < 1.2) return OUTCOMES.DRAW;
  if (magnitude < 2.2) return OUTCOMES.INCONCLUSIVE;
  return difference > 0 ? OUTCOMES.A_WINS : OUTCOMES.B_WINS;
}

function runScenario(
  mode: BattleMode,
  scenario: ScenarioDefinition,
  a: CharacterProfile,
  b: CharacterProfile,
  seed: number,
  trialsPerScenario: number,
): ScenarioResult {
  const rng = mulberry32(seed + hashString(scenario.id) + hashString(mode));
  const base = baseScores(mode, a, b, scenario);
  const factors = decisiveFactors(mode, a, b);

  const trials: TrialResult[] = [];
  let aWins = 0;
  let bWins = 0;
  let draws = 0;
  let inconclusive = 0;

  for (let index = 0; index < trialsPerScenario; index += 1) {
    // Noise is applied to the score difference, never to each score separately:
    // clamping a fighter at 100 otherwise pushed the strongest characters down
    // on every trial while their opponents fluctuated both ways.
    const swing = (gaussian(rng) - gaussian(rng)) * scenario.volatility;
    const difference = base.a - base.b + swing;
    const midpoint = (base.a + base.b) / 2;
    const aScore = clamp(midpoint + difference / 2, 0, 100);
    const bScore = clamp(midpoint - difference / 2, 0, 100);
    const outcome = outcomeFor(difference);

    if (outcome === OUTCOMES.A_WINS) aWins += 1;
    else if (outcome === OUTCOMES.B_WINS) bWins += 1;
    else if (outcome === OUTCOMES.DRAW) draws += 1;
    else inconclusive += 1;

    trials.push({
      trialIndex: index + 1,
      outcome,
      aScore: Math.round(aScore * 10) / 10,
      bScore: Math.round(bScore * 10) / 10,
      decisiveFactors: factors,
    });
  }

  const summary: ScenarioSummary = {
    aWins,
    bWins,
    draws,
    inconclusive,
    totalTrials: trialsPerScenario,
    aWinRate: (aWins / trialsPerScenario) * 100,
    bWinRate: (bWins / trialsPerScenario) * 100,
  };

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name[mode],
    trials,
    summary,
  };
}

function pickDecisiveFactor(
  results: ScenarioResult[],
  winner: Outcome,
  aName: string,
  bName: string,
): string {
  if (winner !== OUTCOMES.A_WINS && winner !== OUTCOMES.B_WINS) {
    return "No single decisive factor — outcomes split across scenarios";
  }

  const winnerName = winner === OUTCOMES.A_WINS ? aName : bName;
  const counts = new Map<string, number>();
  for (const scenario of results) {
    for (const trial of scenario.trials) {
      for (const factor of trial.decisiveFactors) {
        if (!factor.includes(winnerName)) continue;
        counts.set(factor, (counts.get(factor) ?? 0) + 1);
      }
    }
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? `${winnerName} held a marginal, repeated advantage across scenarios`;
}

export interface RunBattleParams {
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  modes: BattleMode[];
  seed?: number;
  trialsPerScenario?: number;
}

export function runBattleMode(
  mode: BattleMode,
  characterA: CharacterProfile,
  characterB: CharacterProfile,
  seed: number,
  trialsPerScenario: number = TRIALS_PER_SCENARIO,
): ModeBattleResult {
  const scenarioResults = SCENARIOS.map((scenario, index) =>
    runScenario(mode, scenario, characterA, characterB, seed + index * 7919, trialsPerScenario),
  );

  let aWins = 0;
  let bWins = 0;
  let draws = 0;
  let inconclusive = 0;
  let totalTrials = 0;
  let marginTotal = 0;

  for (const scenario of scenarioResults) {
    aWins += scenario.summary.aWins;
    bWins += scenario.summary.bWins;
    draws += scenario.summary.draws;
    inconclusive += scenario.summary.inconclusive;
    totalTrials += scenario.summary.totalTrials;
    for (const trial of scenario.trials) {
      marginTotal += Math.abs(trial.aScore - trial.bScore);
    }
  }

  let winner: Outcome = OUTCOMES.DRAW;
  if (aWins > bWins) winner = OUTCOMES.A_WINS;
  else if (bWins > aWins) winner = OUTCOMES.B_WINS;
  else if (draws === 0 && inconclusive === totalTrials) winner = OUTCOMES.INCONCLUSIVE;

  const aWinRate = totalTrials === 0 ? 0 : (aWins / totalTrials) * 100;
  const bWinRate = totalTrials === 0 ? 0 : (bWins / totalTrials) * 100;
  const averageMargin = totalTrials === 0 ? 0 : marginTotal / totalTrials;
  const confidence = Math.round(
    clamp(50 + Math.abs(aWinRate - bWinRate) * 0.45 + averageMargin * 1.2, 50, 98),
  );

  return {
    mode,
    seed,
    engineVersion: ENGINE_VERSION,
    characterA,
    characterB,
    scenarioResults,
    overall: {
      aWins,
      bWins,
      draws,
      inconclusive,
      totalTrials,
      aWinRate,
      bWinRate,
      winner,
      confidence,
      averageMargin: Math.round(averageMargin * 10) / 10,
      decisiveFactor: pickDecisiveFactor(scenarioResults, winner, characterA.name, characterB.name),
    },
    reports: buildScenarioReports(mode, scenarioResults, characterA, characterB, seed),
    generatedAt: new Date().toISOString(),
  };
}

export function runBattle(params: RunBattleParams): BattleRunResult {
  const uniqueModes = [...new Set(params.modes)];
  const modes = uniqueModes.length > 0 ? uniqueModes : (["overall"] as BattleMode[]);
  const seed = params.seed ?? 20261107;
  const trialsPerScenario = params.trialsPerScenario ?? TRIALS_PER_SCENARIO;

  const results = modes.map((mode) =>
    runBattleMode(mode, params.characterA, params.characterB, seed, trialsPerScenario),
  );

  return {
    runId: `arena-${seed.toString(36)}-${hashString(
      `${params.characterA.id}:${params.characterB.id}:${modes.join(",")}`,
    ).toString(36)}`,
    seed,
    engineVersion: ENGINE_VERSION,
    trialsPerScenario,
    characterA: params.characterA,
    characterB: params.characterB,
    modes: results,
    generatedAt: new Date().toISOString(),
  };
}

export { INTELLIGENCE_WEIGHTS, COMBAT_WEIGHTS, SCENARIOS as BATTLE_SCENARIOS };
