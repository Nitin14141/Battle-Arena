/**
 * Environment variable validation and access.
 *
 * Every value has a safe development default so a missing optional service
 * (Redis, a database) can never crash the whole application. Values that are
 * genuinely required to call a paid or external service are checked where
 * they are used, not at import time.
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Optional until the persistence phase. Never required for a battle run.
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(16).default("battle-arena-local-development-secret"),
  APP_URL: z.string().default("http://localhost:3000"),
  AI_PROVIDER: z
    .enum(["mock", "ollama", "llama-cpp", "openrouter"])
    .default("mock"),
  AI_BASE_URL: z.string().optional(),
  AI_MODEL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
  AI_TIMEOUT: z.coerce.number().positive().default(120000),
  AI_MAX_CONCURRENCY: z.coerce.number().positive().default(2),
  STORAGE_PATH: z.string().default("./storage"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SIMULATION_ENGINE_VERSION: z.string().default("0.2.0"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  SESSION_MAX_AGE_DAYS: z.coerce.number().positive().default(30),
  BATTLE_QUEUE_CONCURRENCY: z.coerce.number().positive().default(2),
  BATTLE_QUEUE_MAX_PER_USER: z.coerce.number().positive().default(3),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${errors}`);
  }
  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Reset cached env (useful for testing).
 */
export function resetEnv(): void {
  cachedEnv = null;
}
