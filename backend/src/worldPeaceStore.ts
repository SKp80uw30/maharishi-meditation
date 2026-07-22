// Data model per the PRD's "Data model" section: topic key fixed to
// WORLD_PEACE, keyed by time bucket (day), plus a derived all-time total. No
// user record, no session record — just two counters.

export type WorldPeaceStats = {
  total_today: number;
  total_all_time: number;
};

export interface WorldPeaceStore {
  /** Atomically increments both counters, returns the resulting totals. */
  increment(): Promise<WorldPeaceStats>;
  getStats(): Promise<WorldPeaceStats>;
}

interface RedisClient {
  incr(key: string): Promise<number>;
  mget(...keys: string[]): Promise<(number | null)[]>;
}

const ALL_TIME_KEY = 'wp:total:all';

/** UTC day bucket key, e.g. "wp:total:2026-07-21". UTC (not local time) so the
 * "today" boundary is well-defined for a globally-distributed, anonymous user
 * base with no stored timezone. */
export function dayKey(date: Date = new Date()): string {
  return `wp:total:${date.toISOString().slice(0, 10)}`;
}

export function createRedisWorldPeaceStore(redis: RedisClient): WorldPeaceStore {
  return {
    async increment() {
      const [total_today, total_all_time] = await Promise.all([redis.incr(dayKey()), redis.incr(ALL_TIME_KEY)]);
      return { total_today, total_all_time };
    },

    async getStats() {
      const [today, all] = await redis.mget(dayKey(), ALL_TIME_KEY);
      return { total_today: today ?? 0, total_all_time: all ?? 0 };
    },
  };
}
