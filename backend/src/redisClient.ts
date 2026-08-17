import { createPresenceStore, PresenceStore } from './presenceStore';
import { createRedisWorldPeaceStore, RedisClient, WorldPeaceStore } from './worldPeaceStore';

// The commands both the `redis` (Railway, RESP) and `@upstash/redis` (REST)
// adapters below must provide. Imported from the store rather than re-declared
// here: a local copy silently drifted when the store started needing new
// commands, which broke every deploy until it was fixed.
type RedisLike = RedisClient;

export type Stores = { worldPeace: WorldPeaceStore; presence: PresenceStore };

let stores: Stores | null = null;

/** Both stores share one Redis connection. Completion counters and live
 * presence are separate concerns (see presenceStore.ts) but the same backend. */
export function getStores(): Stores {
  if (!stores) {
    const redis = createRedisClient();
    stores = {
      worldPeace: createRedisWorldPeaceStore(redis),
      presence: createPresenceStore(redis),
    };
  }
  return stores;
}

function createRedisClient(): RedisLike {
  if (process.env.REDIS_URL) {
    // Railway: native Redis via RESP protocol
    return createOfficialRedisClient(process.env.REDIS_URL);
  } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Upstash: REST API client
    return createUpstashClient(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN);
  } else {
    throw new Error(
      'Redis configuration missing. Set either REDIS_URL (Railway) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash).',
    );
  }
}

function createOfficialRedisClient(redisUrl: string): RedisLike {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const redis = require('redis');
  const client = redis.createClient({ url: redisUrl });

  let connected = false;
  client.on('connect', () => {
    connected = true;
  });

  // Connection happens lazily on first command
  const ensure = async () => {
    if (!connected) {
      await client.connect();
    }
  };

  return {
    async incr(key: string): Promise<number> {
      await ensure();
      return client.incr(key);
    },
    async mget(...keys: string[]): Promise<(number | null)[]> {
      await ensure();
      const values = await client.mGet(keys);
      return values.map((v: string | null) => (v ? parseInt(v, 10) : null));
    },
    async zadd(key: string, score: number, member: string): Promise<number> {
      await ensure();
      return client.zAdd(key, [{ score, value: member }]);
    },
    async zrem(key: string, member: string): Promise<number> {
      await ensure();
      return client.zRem(key, member);
    },
    async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
      await ensure();
      return client.zRemRangeByScore(key, min, max);
    },
    async zcard(key: string): Promise<number> {
      await ensure();
      return client.zCard(key);
    },
    async zscore(key: string, member: string): Promise<number | null> {
      await ensure();
      return client.zScore(key, member);
    },
  };
}

function createUpstashClient(url: string, token: string): RedisLike {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Redis } = require('@upstash/redis');

  const redis = new Redis({ url, token });

  return {
    async incr(key: string): Promise<number> {
      return redis.incr(key);
    },
    async mget(...keys: string[]): Promise<(number | null)[]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return redis.mget(...keys) as Promise<(number | null)[]>;
    },
    async zadd(key: string, score: number, member: string): Promise<number> {
      return redis.zadd(key, { score, member });
    },
    async zrem(key: string, member: string): Promise<number> {
      return redis.zrem(key, member);
    },
    async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
      return redis.zremrangebyscore(key, min, max);
    },
    async zcard(key: string): Promise<number> {
      return redis.zcard(key);
    },
    async zscore(key: string, member: string): Promise<number | null> {
      return redis.zscore(key, member);
    },
  };
}
