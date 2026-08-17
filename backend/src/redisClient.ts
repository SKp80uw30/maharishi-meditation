import { Redis } from '@upstash/redis';
import { createRedisWorldPeaceStore, WorldPeaceStore } from './worldPeaceStore';

// @upstash/redis is a REST client: it needs UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN (set as Railway env vars). It cannot speak the
// redis:// wire protocol, so a Railway-provisioned REDIS_URL is *not* usable
// here — switching to Railway's own Redis would mean switching client
// libraries, not just env vars.
let store: WorldPeaceStore | null = null;

export function getWorldPeaceStore(): WorldPeaceStore {
  if (!store) {
    store = createRedisWorldPeaceStore(Redis.fromEnv());
  }
  return store;
}
