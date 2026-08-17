import { createRedisWorldPeaceStore, RedisClient, WorldPeaceStore } from './worldPeaceStore';

// The commands both the `redis` (Railway, RESP) and `@upstash/redis` (REST)
// adapters below must provide. Imported from the store rather than re-declared
// here: a local copy silently drifted when the store started using sadd/scard
// for the active-session count, which broke every deploy until it was fixed.
type RedisLike = RedisClient;

let store: WorldPeaceStore | null = null;

export function getWorldPeaceStore(): WorldPeaceStore {
  if (!store) {
    const redis = createRedisClient();
    store = createRedisWorldPeaceStore(redis);
  }
  return store;
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
    async sadd(key: string, member: string, expirySeconds?: number): Promise<number> {
      await ensure();
      const result = await client.sAdd(key, member);
      if (expirySeconds) {
        await client.expire(key, expirySeconds);
      }
      return result;
    },
    async scard(key: string): Promise<number> {
      await ensure();
      return client.sCard(key);
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
    async sadd(key: string, member: string, expirySeconds?: number): Promise<number> {
      const result = await redis.sadd(key, member);
      if (expirySeconds) {
        await redis.expire(key, expirySeconds);
      }
      return result;
    },
    async scard(key: string): Promise<number> {
      return redis.scard(key);
    },
  };
}
