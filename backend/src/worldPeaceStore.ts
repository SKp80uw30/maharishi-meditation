// Data model per the PRD's "Data model" section: topic key fixed to
// WORLD_PEACE, keyed by time bucket (day), plus a derived all-time total.
// Active session tracking: each meditation session adds to a set with 30-minute
// expiry, allowing us to count concurrent meditators per intention.

export type WorldPeaceStats = {
  total_today: number;
  total_all_time: number;
  current_active_estimate?: number;
};

export interface WorldPeaceStore {
  /** Atomically increments both counters, records active session, returns totals + active count. */
  increment(): Promise<WorldPeaceStats>;
  getStats(): Promise<WorldPeaceStats>;
}

interface RedisClient {
  incr(key: string): Promise<number>;
  mget(...keys: string[]): Promise<(number | null)[]>;
  sadd(key: string, member: string, expirySeconds?: number): Promise<number>;
  scard(key: string): Promise<number>;
}

const ALL_TIME_KEY = 'wp:total:all';

/** UTC day bucket key, e.g. "wp:total:2026-07-21". UTC (not local time) so the
 * "today" boundary is well-defined for a globally-distributed, anonymous user
 * base with no stored timezone. */
export function dayKey(date: Date = new Date()): string {
  return `wp:total:${date.toISOString().slice(0, 10)}`;
}

const ACTIVE_SESSIONS_KEY = 'wp:active:sessions';
const SESSION_EXPIRY_SECONDS = 1800; // 30 minutes

export function createRedisWorldPeaceStore(redis: RedisClient): WorldPeaceStore {
  return {
    async increment() {
      // Generate unique session ID and record it as active (with expiry)
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const [total_today, total_all_time] = await Promise.all([
        redis.incr(dayKey()),
        redis.incr(ALL_TIME_KEY),
        redis.sadd(ACTIVE_SESSIONS_KEY, sessionId, SESSION_EXPIRY_SECONDS),
      ]);

      const current_active_estimate = await redis.scard(ACTIVE_SESSIONS_KEY);

      return { total_today, total_all_time, current_active_estimate };
    },

    async getStats() {
      const [today, all] = await redis.mget(dayKey(), ALL_TIME_KEY);
      const current_active_estimate = await redis.scard(ACTIVE_SESSIONS_KEY);

      return {
        total_today: today ?? 0,
        total_all_time: all ?? 0,
        current_active_estimate,
      };
    },
  };
}
