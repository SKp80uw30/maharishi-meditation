import { Redis } from '@upstash/redis';
import { createRedisWorldPeaceStore, WorldPeaceStore } from './worldPeaceStore';

// Railway provides Redis via REDIS_URL env var (RESP protocol, redis://...)
// Upstash (alternative) uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (REST API)
// This client auto-detects which is available.
let store: WorldPeaceStore | null = null;

export function getWorldPeaceStore(): WorldPeaceStore {
  if (!store) {
    let redis: Redis;

    if (process.env.REDIS_URL) {
      // Railway: native Redis RESP protocol via connection string
      redis = new Redis({
        url: process.env.REDIS_URL,
      });
    } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Upstash: REST API with separate URL and token
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } else {
      throw new Error(
        'Redis configuration missing. Set either REDIS_URL (Railway) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash).',
      );
    }

    store = createRedisWorldPeaceStore(redis);
  }
  return store;
}
