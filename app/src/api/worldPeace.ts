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
  /** GET /stats/world-peace equivalent. Pass the caller's own session id to
   * have it excluded, so `current_active_estimate` counts *others*. */
  getStats(sessionId?: string): Promise<WorldPeaceStats>;
  /** Marks a session as meditating right now, holding for `holdSeconds`.
   * Repeating it is a heartbeat — it just pushes the expiry out. Returns how
   * many *other* people are currently meditating. */
  startPresence(sessionId: string, holdSeconds: number): Promise<number>;
  /** Drops the session from the live count immediately. */
  endPresence(sessionId: string): Promise<number>;
}

/** Opaque, ephemeral, and generated on-device: not a user id, not a device id,
 * never persisted, and meaningless once the session's hold expires. Kept to the
 * character set and length the backend accepts. */
export function createSessionId(): string {
  const random = () => Math.random().toString(36).slice(2, 12);
  return `${random()}${random()}`.slice(0, 24);
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
  // Mirrors the backend's sorted set: session id -> the moment it stops counting.
  const present = new Map<string, number>();

  const liveOthers = (exclude?: string) => {
    const now = Date.now();
    for (const [id, expiresAt] of [...present]) {
      if (expiresAt <= now) present.delete(id);
    }
    return [...present.keys()].filter((id) => id !== exclude).length;
  };

  return {
    async increment() {
      stats = {
        ...stats,
        total_today: stats.total_today + 1,
        total_all_time: stats.total_all_time + 1,
      };
    },
    async getStats(sessionId?: string) {
      return { ...stats, current_active_estimate: liveOthers(sessionId) };
    },
    async startPresence(sessionId: string, holdSeconds: number) {
      present.set(sessionId, Date.now() + holdSeconds * 1000);
      return liveOthers(sessionId);
    },
    async endPresence(sessionId: string) {
      present.delete(sessionId);
      return liveOthers(sessionId);
    },
  };
}

/** Real HTTP client — connects to the deployed backend (Phase 10+). Uses the
 * EXPO_PUBLIC_API_URL environment variable; if not set, falls back to mock. */
export function createRealWorldPeaceApi(baseUrl: string): WorldPeaceApiClient {
  return {
    async increment() {
      const response = await fetch(`${baseUrl}/meditations/world-peace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Increment failed: ${response.status}`);
      }
    },
    async getStats(sessionId?: string) {
      const query = sessionId ? `?exclude=${encodeURIComponent(sessionId)}` : '';
      const response = await fetch(`${baseUrl}/stats/world-peace${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Stats fetch failed: ${response.status}`);
      }
      return response.json();
    },
    async startPresence(sessionId: string, holdSeconds: number) {
      const response = await fetch(`${baseUrl}/presence/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, hold_seconds: holdSeconds }),
      });
      if (!response.ok) {
        throw new Error(`Presence start failed: ${response.status}`);
      }
      const body = await response.json();
      return body.current_active_estimate ?? 0;
    },
    async endPresence(sessionId: string) {
      const response = await fetch(`${baseUrl}/presence/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!response.ok) {
        throw new Error(`Presence end failed: ${response.status}`);
      }
      const body = await response.json();
      return body.current_active_estimate ?? 0;
    },
  };
}

/** The client the app actually uses. Phase 11 (now): uses real backend if
 * EXPO_PUBLIC_API_URL is set, otherwise falls back to mock for offline dev. */
export const worldPeaceApi: WorldPeaceApiClient = process.env.EXPO_PUBLIC_API_URL
  ? createRealWorldPeaceApi(process.env.EXPO_PUBLIC_API_URL)
  : createMockWorldPeaceApi();
