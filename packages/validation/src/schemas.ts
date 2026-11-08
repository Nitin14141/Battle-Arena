/**
 * Zod schemas for API input validation.
 * These are the single source of truth for what the API accepts.
 */

import { z } from "zod";

import {
  BATTLE_MODES,
  OUTCOMES,
  DEFAULT_TRIALS_PER_SCENARIO,
} from "@battle-arena/shared";

// ── Character search ──────────────────────────────────────────
export const characterSearchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(200, "Search query too long")
    .trim(),
  category: z.enum(["fictional", "historical"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CharacterSearchInput = z.infer<typeof characterSearchSchema>;

// ── Battle creation ───────────────────────────────────────────
export const battleModeSchema = z.enum([
  BATTLE_MODES.INTELLIGENCE,
  BATTLE_MODES.STRENGTH,
  BATTLE_MODES.OVERALL,
]);

export const battleConditionsSchema = z.object({
  preparation: z
    .enum(["none", "full", "partial"])
    .optional()
    .default("none"),
  knowledgeOfOpponent: z
    .enum(["none", "partial", "full"])
    .optional()
    .default("none"),
  equipment: z
    .enum(["none", "limited", "standard", "full"])
    .optional()
    .default("none"),
  environment: z
    .enum(["familiar", "unfamiliar", "randomized"])
    .optional()
    .default("familiar"),
  tacticalObjective: z.string().max(500).optional(),
});

export const createBattleSchema = z.object({
  characterAId: z.string().min(1, "Character A is required"),
  characterAVersionId: z.string().min(1, "Character A version is required"),
  characterBId: z.string().min(1, "Character B is required"),
  characterBVersionId: z.string().min(1, "Character B version is required"),
  modes: z
    .array(battleModeSchema)
    .min(1, "At least one battle mode is required")
    .max(3, "Maximum 3 battle modes"),
  conditions: battleConditionsSchema.optional(),
  trialsPerScenario: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(DEFAULT_TRIALS_PER_SCENARIO),
});

export type CreateBattleInput = z.infer<typeof createBattleSchema>;

// ── Pagination ────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ── Vote ──────────────────────────────────────────────────────
export const voteSchema = z.object({
  battleId: z.string().min(1),
  winner: z.enum([
    OUTCOMES.A_WINS,
    OUTCOMES.B_WINS,
    OUTCOMES.DRAW,
    OUTCOMES.INCONCLUSIVE,
  ]),
});

export type VoteInput = z.infer<typeof voteSchema>;

// ── Comment ───────────────────────────────────────────────────
export const commentSchema = z.object({
  battleId: z.string().min(1),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment too long"),
});

export type CommentInput = z.infer<typeof commentSchema>;

// ── Research claim review ─────────────────────────────────────
export const reviewClaimSchema = z.object({
  claimId: z.string().min(1),
  action: z.enum(["approve", "reject", "mark_disputed"]),
  adminNotes: z.string().max(2000).optional(),
});

export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>;