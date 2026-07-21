import { Redis } from '@upstash/redis';
import { createRedisWorldPeaceStore, WorldPeaceStore } from './worldPeaceStore';

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from the environment
// (Redis.fromEnv()) — set as Netlify site env vars, not committed anywhere. See
// TODO.md Phase 11: these are account-owned credentials, provisioned when the
// live backend is actually connected.
let store: WorldPeaceStore | null = null;

export function getWorldPeaceStore(): WorldPeaceStore {
  if (!store) {
    store = createRedisWorldPeaceStore(Redis.fromEnv());
  }
  return store;
}
