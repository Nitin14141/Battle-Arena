/**
 * Custom error classes for Battle Arena.
 * Using typed errors makes error handling explicit and auditable.
 */

export class BattleArenaError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BattleArenaError";
    Object.setPrototypeOf(this, BattleArenaError.prototype);
  }
}

export class ValidationError extends BattleArenaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends BattleArenaError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends BattleArenaError {
  constructor(message: string = "Insufficient permissions") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends BattleArenaError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends BattleArenaError {
  constructor(message: string = "Too many requests. Please try again later.") {
    super(message, "RATE_LIMIT_ERROR", 429);
    this.name = "RateLimitError";
  }
}

export class BattleNotFoundError extends BattleArenaError {
  constructor(battleId: string) {
    super(`Battle not found: ${battleId}`, "BATTLE_NOT_FOUND", 404);
    this.name = "BattleNotFoundError";
  }
}

export class CharacterNotFoundError extends BattleArenaError {
  constructor(characterId: string) {
    super(`Character not found: ${characterId}`, "CHARACTER_NOT_FOUND", 404);
    this.name = "CharacterNotFoundError";
  }
}

export class AIProviderError extends BattleArenaError {
  constructor(message: string, public model?: string) {
    super(message, "AI_PROVIDER_ERROR", 502, { model });
    this.name = "AIProviderError";
  }
}

export class SimulationError extends BattleArenaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "SIMULATION_ERROR", 500, details);
    this.name = "SimulationError";
  }
}

export class ResearchError extends BattleArenaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "RESEARCH_ERROR", 500, details);
    this.name = "ResearchError";
  }
}

export class QueueError extends BattleArenaError {
  constructor(message: string) {
    super(message, "QUEUE_ERROR", 503);
    this.name = "QueueError";
  }
}

export class ConflictError extends BattleArenaError {
  constructor(message: string) {
    super(message, "CONFLICT_ERROR", 409);
    this.name = "ConflictError";
  }
}

/**
 * Wrap an unknown error into a BattleArenaError for consistent handling.
 */
export function toBattleArenaError(error: unknown): BattleArenaError {
  if (error instanceof BattleArenaError) return error;
  if (error instanceof Error) {
    return new BattleArenaError(error.message, "INTERNAL_ERROR", 500, {
      originalError: error.name,
    });
  }
  return new BattleArenaError(
    String(error),
    "INTERNAL_ERROR",
    500
  );
}