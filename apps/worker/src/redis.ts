import { getEnv } from "@battle-arena/shared";
import Redis from "ioredis";

const env = getEnv();

// Lazy initialization for Redis connection
let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return redis;
}
