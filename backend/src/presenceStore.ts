// Live presence: how many people are meditating *right now*.
//
// This deliberately does NOT reuse the completion counters in worldPeaceStore.
// Those count sessions that have finished; presence counts sessions in flight.
// Conflating the two is what made the old "current_active_estimate" dishonest —
// it was derived from the increment that fires when a session *ends*, so every
// person it counted had already stopped meditating.
//
// Storage is a sorted set whose score is the moment the entry stops counting
// (unix seconds). Reads first drop everything already past its expiry, so each
// session ages out on its own clock. The previous implementation put a single
// TTL on one shared set key and refreshed it on every write, which meant
// members never expired individually: the count accumulated while traffic was
// steady, then dropped to zero all at once when it stopped.

export interface PresenceRedis {
  zadd(key: string, score: number, member: string): Promise<number>;
  zrem(key: string, member: string): Promise<number>;
  zremrangebyscore(key: string, min: number, max: number): Promise<number>;
  zcard(key: string): Promise<number>;
  zscore(key: string, member: string): Promise<number | null>;
}

export interface PresenceStore {
  /** Marks a session live until `holdSeconds` from now. Idempotent per id: a
   * repeat call just pushes the expiry out, which is what a heartbeat is. */
  join(sessionId: string, holdSeconds: number): Promise<void>;
  /** Drops a session immediately (finished, ended early, or screen unmounted). */
  leave(sessionId: string): Promise<void>;
  /** How many sessions are live, excluding one id — normally the caller's own,
   * so the UI can honestly say "others". */
  count(excludeSessionId?: string): Promise<number>;
}

export const ACTIVE_KEY = 'wp:active';

/** Hard ceiling on how long one entry may claim to be live. A client can ask
 * for its session length plus grace, but never more than this — otherwise a
 * bad or malicious `holdSeconds` could pin a ghost meditator in the count. */
export const MAX_HOLD_SECONDS = 3600;

/** Floor, so a near-instant expiry can't slip a session out of the count
 * before a single poll would ever observe it. */
export const MIN_HOLD_SECONDS = 30;

export function clampHold(holdSeconds: number): number {
  if (!Number.isFinite(holdSeconds)) return MIN_HOLD_SECONDS;
  return Math.min(MAX_HOLD_SECONDS, Math.max(MIN_HOLD_SECONDS, Math.floor(holdSeconds)));
}

/** `now` is injectable for tests; production passes the server clock. Scores are
 * always computed server-side — a client-supplied timestamp could be used to
 * park an entry far in the future. */
export function createPresenceStore(
  redis: PresenceRedis,
  now: () => number = () => Date.now(),
): PresenceStore {
  const nowSeconds = () => Math.floor(now() / 1000);

  const sweep = async () => {
    // Everything whose expiry has already passed. Cheap, and keeps the set from
    // growing without bound even if no one ever calls leave().
    await redis.zremrangebyscore(ACTIVE_KEY, 0, nowSeconds());
  };

  return {
    async join(sessionId, holdSeconds) {
      await redis.zadd(ACTIVE_KEY, nowSeconds() + clampHold(holdSeconds), sessionId);
    },

    async leave(sessionId) {
      await redis.zrem(ACTIVE_KEY, sessionId);
    },

    async count(excludeSessionId) {
      await sweep();
      const total = await redis.zcard(ACTIVE_KEY);
      if (!excludeSessionId) return total;
      // Read-only membership test: reading the count must never disturb the
      // caller's own entry or its expiry. The sweep above already dropped
      // anything stale, so a score here means genuinely live.
      const score = await redis.zscore(ACTIVE_KEY, excludeSessionId);
      return score == null ? total : Math.max(0, total - 1);
    },
  };
}
