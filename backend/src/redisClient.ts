import { Redis } from '@upstash/redis';
import { createRedisWorldPeaceStore, WorldPeaceStore } from './worldPeaceStore';

// Railway provides Redis via REDIS_URL env var (e.g. redis://user:pass@host:port)
// Upstash (alternative) uses UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
// This client auto-detects which is available.
let store: WorldPeaceStore | null = null;

export function getWorldPeaceStore(): WorldPeaceStore {
  if (!store) {
    const redis = process.env.REDIS_URL
      ? new Redis({ url: process.env.REDIS_URL })
      : Redis.fromEnv();
    store = createRedisWorldPeaceStore(redis);
  }
  return store;
}
