/**
 * Shared TypeScript types for Battle Arena.
 * These are the canonical definitions used across all packages.
 */

// ── Battle modes ──────────────────────────────────────────────
export type BattleMode = "intelligence" | "strength" | "overall";

// ── Simulation outcomes ───────────────────────────────────────
export type Outcome = "a_wins" | "b_wins" | "draw" | "inconclusive";

// ── Confidence levels ─────────────────────────────────────────
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

// ── Character categories ──────────────────────────────────────
export type CharacterCategory = "fictional" | "historical";

// ── Evidence status ───────────────────────────────────────────
export type EvidenceStatus = "verified" | "disputed" | "unverified" | "rejected";

// ── Core entity shapes ────────────────────────────────────────
export interface CharacterSummary {
  id: string;
  name: string;
  originalName: string | null;
  aliases: string[];
  category: CharacterCategory;
  countryOfOrigin: string | null;
  originalLanguage: string | null;
  universe: string | null;
  franchise: string | null;
  version: string | null;
  timeline: string | null;
  description: string | null;
  profileVersion: number;
  createdAt: string;
}

export interface CharacterAttributes {
  // Intelligence
  strategicIntelligence: number | null;
  tacticalIntelligence: number | null;
  problemSolving: number | null;
  adaptability: number | null;
  experience: number | null;
  prediction: number | null;
  decisionMaking: number | null;
  planning: number | null;
  // Combat
  physicalStrength: number | null;
  attackPower: number | null;
  speed: number | null;
  reactionSpeed: number | null;
  durability: number | null;
  defence: number | null;
  stamina: number | null;
  endurance: number | null;
  combatSkill: number | null;
}

export interface CharacterAbilities {
  specialAbilities: string[];
  weaknesses: string[];
  equipment: string[];
  weapons: string[];
  resistances: string[];
  regeneration: string | null;
  demonstratedFeats: string[];
  evidence: string[];
  confidenceLevels: Record<string, ConfidenceLevel>;
}

// ── Character battle profile (canonical engine input) ────────
export type EmblemTheme =
  | "violet"
  | "crimson"
  | "azure"
  | "emerald"
  | "amber"
  | "steel"
  | "rose"
  | "teal";

export interface IntelligenceAttributes {
  strategic: number;
  tactical: number;
  problemSolving: number;
  adaptability: number;
  experience: number;
  prediction: number;
  deception: number;
  decisionMaking: number;
  resourceManagement: number;
}

export interface CombatAttributes {
  strength: number;
  attackPower: number;
  speed: number;
  reactionSpeed: number;
  durability: number;
  defence: number;
  stamina: number;
  endurance: number;
  combatSkill: number;
}

export interface CharacterProfile {
  id: string;
  name: string;
  aliases: string[];
  universe: string;
  franchise: string | null;
  category: CharacterCategory;
  origin: string;
  era: string | null;
  description: string;
  intelligence: IntelligenceAttributes;
  combat: CombatAttributes;
  abilities: string[];
  weaknesses: string[];
  weaknessTags: string[];
  equipment: string[];
  resistances: string[];
  feats: string[];
  evidence: string[];
  tags: string[];
  theme: EmblemTheme;
  /** Where the profile came from. Curated profiles omit this. */
  source?: "curated" | "ai-researched";
  /** ISO timestamp for profiles created by the AI researcher. */
  researchedAt?: string;
}

// ── Battle ────────────────────────────────────────────────────
export interface BattleConfig {
  mode: BattleMode;
  characterAId: string;
  characterAVersionId: string;
  characterBId: string;
  characterBVersionId: string;
  scenarios: ScenarioConfig[];
  numTrialsPerScenario: number;
  seed: number;
  engineVersion: string;
  conditions?: BattleConditions;
}

export interface BattleConditions {
  preparation: "none" | "full" | "partial";
  knowledgeOfOpponent: "none" | "partial" | "full";
  equipment: "none" | "limited" | "standard" | "full";
  environment: "familiar" | "unfamiliar" | "randomized";
  tacticalObjective?: string;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  conditions: Partial<BattleConditions>;
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  trials: TrialResult[];
  summary: ScenarioSummary;
}

export interface TrialResult {
  trialIndex: number;
  outcome: Outcome;
  aScore: number;
  bScore: number;
  decisiveFactors: string[];
}

export interface ScenarioSummary {
  aWins: number;
  bWins: number;
  draws: number;
  inconclusive: number;
  totalTrials: number;
  aWinRate: number;
  bWinRate: number;
}

export interface ScenarioReport {
  scenarioId: string;
  scenarioName: string;
  headline: string;
  narrative: string;
  keyFactors: string[];
  turningPoint: string;
  aScore: number;
  bScore: number;
}

export interface ModeBattleResult {
  mode: BattleMode;
  seed: number;
  engineVersion: string;
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  scenarioResults: ScenarioResult[];
  overall: {
    aWins: number;
    bWins: number;
    draws: number;
    inconclusive: number;
    totalTrials: number;
    aWinRate: number;
    bWinRate: number;
    winner: Outcome;
    confidence: number;
    averageMargin: number;
    decisiveFactor: string;
  };
  reports: ScenarioReport[];
  generatedAt: string;
}

export interface BattleRunResult {
  runId: string;
  seed: number;
  engineVersion: string;
  trialsPerScenario: number;
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  modes: ModeBattleResult[];
  generatedAt: string;
}

export interface BattleResults {
  battleId: string;
  mode: BattleMode;
  seed: number;
  engineVersion: string;
  characterA: CharacterSummary;
  characterB: CharacterSummary;
  scenarioResults: ScenarioResult[];
  overall: {
    aWins: number;
    bWins: number;
    draws: number;
    inconclusive: number;
    totalTrials: number;
    aWinRate: number;
    bWinRate: number;
    winner: Outcome;
    estimatedUncertainty: number;
  };
  generatedAt: string;
}

// ── AI ────────────────────────────────────────────────────────
export interface AIRequest {
  task: string;
  prompt: string;
  systemPrompt?: string;
  schema?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIResponse {
  success: boolean;
  data: Record<string, unknown> | null;
  raw: string | null;
  model: string | null;
  promptVersion: string;
  durationMs: number;
  error?: string;
}

// ── Research ──────────────────────────────────────────────────
export interface ResearchClaim {
  claimId: string;
  characterId: string;
  claim: string;
  category: string;
  value: string | null;
  confidence: ConfidenceLevel;
  evidence: string[];
  sources: string[];
  status: EvidenceStatus;
}

// ── API responses ─────────────────────────────────────────────
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ── Pagination ────────────────────────────────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}