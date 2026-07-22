// API contract per the PRD's "Backend architecture" / "Recommended MVP decision
// set" and CLAUDE.md's "API contract" — see also backend/ (Phase 10) for the
// real Netlify Function + Upstash implementation this interface will eventually
// be backed by (Phase 11). No user identifiers anywhere in this contract.

export type WorldPeaceStats = {
  total_today: number;
  total_all_time: number;
  current_active_estimate?: number;
};

export interface WorldPeaceApiClient {
  /** POST /meditations/world-peace equivalent — increments the shared counter.
   * No body, no user identifier: the topic is implied, the request is anonymous. */
  increment(): Promise<void>;
  /** GET /stats/world-peace equivalent. */
  getStats(): Promise<WorldPeaceStats>;
}

const DEFAULT_SEED: WorldPeaceStats = {
  // Matches the design mockup's example numbers (StatsScreen.jsx) so the app
  // feels like part of something larger even before a real backend exists —
  // "inspiring social proof" per the PRD's product principles.
  total_today: 12483,
  total_all_time: 1204996,
};

/** In-memory mock client — the MVP default, per TODO.md Phase 8, so the app is
 * fully usable offline before the real backend (Phase 10/11) exists. Each
 * instance holds its own state (not a module-level singleton) so tests don't
 * leak counts into each other. */
export function createMockWorldPeaceApi(seed: WorldPeaceStats = DEFAULT_SEED): WorldPeaceApiClient {
  let stats: WorldPeaceStats = { ...seed };

  return {
    async increment() {
      stats = {
        ...stats,
        total_today: stats.total_today + 1,
        total_all_time: stats.total_all_time + 1,
      };
    },
    async getStats() {
      return { ...stats };
    },
  };
}

/** The client the app actually uses. Phase 11 swaps this for a real HTTP
 * implementation (behind the same interface) once a live backend URL exists. */
export const worldPeaceApi: WorldPeaceApiClient = createMockWorldPeaceApi();
