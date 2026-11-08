/**
 * Application-wide constants for Battle Arena.
 *
 * NOTE: type definitions live in types.ts. This file exports only
 * runtime constant values (objects, numbers, strings).
 */

// ── Battle modes ──────────────────────────────────────────────
export const BATTLE_MODES = {
  INTELLIGENCE: "intelligence" as const,
  STRENGTH: "strength" as const,
  OVERALL: "overall" as const,
};

// ── Simulation outcomes ───────────────────────────────────────
export const OUTCOMES = {
  A_WINS: "a_wins" as const,
  B_WINS: "b_wins" as const,
  DRAW: "draw" as const,
  INCONCLUSIVE: "inconclusive" as const,
};

// ── Confidence levels ─────────────────────────────────────────
export const CONFIDENCE = {
  HIGH: "high" as const,
  MEDIUM: "medium" as const,
  LOW: "low" as const,
  UNKNOWN: "unknown" as const,
};

// ── Character categories ──────────────────────────────────────
export const CATEGORIES = {
  FICTIONAL: "fictional" as const,
  HISTORICAL: "historical" as const,
};

// ── Evidence status ───────────────────────────────────────────
export const EVIDENCE_STATUS = {
  VERIFIED: "verified" as const,
  DISPUTED: "disputed" as const,
  UNVERIFIED: "unverified" as const,
  REJECTED: "rejected" as const,
};

// ── Default scoring weights ───────────────────────────────────
// These are starting weights from the blueprint and must be
// configurable and tested.
export const DEFAULT_INTELLIGENCE_WEIGHTS: Record<string, number> = {
  strategicIntelligence: 25,
  tacticalIntelligence: 20,
  problemSolving: 15,
  adaptability: 15,
  battleExperience: 10,
  deceptionPrediction: 10,
  decisionMaking: 5,
};

export const DEFAULT_STRENGTH_WEIGHTS: Record<string, number> = {
  strengthAttackPower: 25,
  speedReaction: 20,
  durabilityDefence: 20,
  specialAbilities: 15,
  staminaEndurance: 10,
  combatSkills: 10,
};

// ── Default simulation parameters ─────────────────────────────
export const DEFAULT_TRIALS_PER_SCENARIO = 10;
export const DEFAULT_SCENARIOS_COUNT = 10;
export const DEFAULT_TOTAL_TRIALS = 100; // 10 scenarios × 10 trials

// ── Attribute scale ───────────────────────────────────────────
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_MAX = 100;

// ── Default scenario IDs ──────────────────────────────────────
// These are the 10 default battle scenarios from the blueprint.
// Scenario definitions are stored in the battle-engine package and
// are configurable, not hardcoded into the simulation engine.
export const DEFAULT_SCENARIO_IDS = [
  "standard_battle",
  "max_power",
  "no_preparation",
  "full_preparation",
  "full_knowledge",
  "limited_equipment",
  "full_equipment",
  "unfamiliar_environment",
  "tactical_challenge",
  "randomized_conditions",
] as const;

// ── API ───────────────────────────────────────────────────────
export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ── Rate limiting ─────────────────────────────────────────────
export const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
export const RATE_LIMIT_MAX_BATTLES_PER_USER = 10; // per hour
export const RATE_LIMIT_MAX_RESEARCH_PER_USER = 20; // per hour

// ── Storage ───────────────────────────────────────────────────
export const STORAGE_PATH = process.env.STORAGE_PATH || "./storage";

// ── Auth ──────────────────────────────────────────────────────
export const SESSION_MAX_AGE_DAYS = 30;

// ── Battle queue ──────────────────────────────────────────────
export const BATTLE_QUEUE_NAME = "battle-simulation";
export const BATTLE_QUEUE_CONCURRENCY = 2;
export const BATTLE_QUEUE_MAX_PER_USER = 3;

// ── AI ────────────────────────────────────────────────────────
export const AI_TIMEOUT_MS = 120_000;
export const AI_MAX_CONCURRENCY = 2;
export const AI_PROVIDER_MOCK = "mock";
export const AI_PROVIDER_OLLAMA = "ollama";
export const AI_PROVIDER_LLAMA_CPP = "llama-cpp";

// ── Engine versions ───────────────────────────────────────────
export const SIMULATION_ENGINE_VERSION = "0.1.0";
export const PROMPT_VERSION = "0.1.0";

// ── UI ────────────────────────────────────────────────────────
export const APP_NAME = "Battle Arena";
export const APP_TAGLINE = "Every Universe. Every Legend. One Battlefield.";

// ── Misc ──────────────────────────────────────────────────────
export const UTC = "UTC";