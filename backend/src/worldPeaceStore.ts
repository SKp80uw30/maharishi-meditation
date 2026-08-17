// Data model per the PRD's "Data model" section: topic key fixed to
// WORLD_PEACE, keyed by time bucket (day), plus a derived all-time total.
//
// These are *completion* counters — they move when a session ends. Live
// presence ("who is meditating right now") is a separate concern with its own
// storage and lifecycle; see presenceStore.ts. They were previously entangled,
// which is why the active count could only ever describe people who had already
// finished.

import type { PresenceRedis } from './presenceStore';

export type WorldPeaceStats = {
  total_today: number;
  total_all_time: number;
  current_active_estimate?: number;
};

export interface WorldPeaceStore {
  /** Increments the day bucket and the all-time total, returning both. */
  increment(): Promise<Omit<WorldPeaceStats, 'current_active_estimate'>>;
  getStats(): Promise<Omit<WorldPeaceStats, 'current_active_estimate'>>;
}

/** The full command surface the adapters in redisClient.ts must implement.
 * Kept in one place on purpose: a duplicate copy of this interface once drifted
 * from its real shape and broke every Railway build for weeks. */
export interface RedisClient extends PresenceRedis {
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
      const [total_today, total_all_time] = await Promise.all([
        redis.incr(dayKey()),
        redis.incr(ALL_TIME_KEY),
      ]);

      return { total_today, total_all_time };
    },

    async getStats() {
      const [today, all] = await redis.mget(dayKey(), ALL_TIME_KEY);

      return {
        total_today: today ?? 0,
        total_all_time: all ?? 0,
      };
    },
  };
}
