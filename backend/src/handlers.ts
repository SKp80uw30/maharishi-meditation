import type { PresenceStore } from './presenceStore';
import type { WorldPeaceStore } from './worldPeaceStore';

type HttpEvent = {
  httpMethod: string;
  /** Parsed JSON body, when the route takes one. */
  body?: unknown;
  /** Query string values, already decoded. */
  query?: Record<string, string | undefined>;
};
type HttpResponse = { statusCode: number; headers: Record<string, string>; body: string };

// Factories (not the handlers themselves) so tests can inject a fake store
// without touching Redis or env vars — the real Express server wires in the
// real Redis-backed store (see server.ts).

const JSON_HEADERS = { 'content-type': 'application/json' };

const json = (statusCode: number, payload: unknown): HttpResponse => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify(payload),
});

const methodNotAllowed = () => json(405, { error: 'Method not allowed' });
const internalError = () => json(500, { error: 'Internal error' });

/** Session ids are opaque, client-generated, and ephemeral — never a user or
 * device identifier. Bounded and character-restricted so a caller can't wedge
 * arbitrary payloads into a Redis member. */
function readSessionId(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null;
  const value = (body as { session_id?: unknown }).session_id;
  if (typeof value !== 'string') return null;
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(value)) return null;
  return value;
}

function readHoldSeconds(body: unknown): number {
  if (typeof body !== 'object' || body === null) return 0;
  const value = (body as { hold_seconds?: unknown }).hold_seconds;
  return typeof value === 'number' ? value : 0;
}

export function createIncrementHandler(store: WorldPeaceStore) {
  return async (event: HttpEvent): Promise<HttpResponse> => {
    if (event.httpMethod !== 'POST') return methodNotAllowed();
    try {
      return json(200, await store.increment());
    } catch {
      return internalError();
    }
  };
}

/** Stats = completion counters plus the live presence count. `?exclude=<id>`
 * leaves the caller's own session out, so the client can honestly say
 * "others". */
export function createStatsHandler(store: WorldPeaceStore, presence: PresenceStore) {
  return async (event: HttpEvent): Promise<HttpResponse> => {
    if (event.httpMethod !== 'GET') return methodNotAllowed();
    try {
      const exclude = event.query?.exclude;
      const [totals, current_active_estimate] = await Promise.all([
        store.getStats(),
        presence.count(exclude),
      ]);
      return json(200, { ...totals, current_active_estimate });
    } catch {
      return internalError();
    }
  };
}

/** Join or refresh presence. Start and heartbeat are the same operation — both
 * just push the entry's expiry out — so they share one handler. */
export function createPresenceJoinHandler(presence: PresenceStore) {
  return async (event: HttpEvent): Promise<HttpResponse> => {
    if (event.httpMethod !== 'POST') return methodNotAllowed();
    const sessionId = readSessionId(event.body);
    if (!sessionId) return json(400, { error: 'Invalid session_id' });
    try {
      await presence.join(sessionId, readHoldSeconds(event.body));
      return json(200, { current_active_estimate: await presence.count(sessionId) });
    } catch {
      return internalError();
    }
  };
}

export function createPresenceLeaveHandler(presence: PresenceStore) {
  return async (event: HttpEvent): Promise<HttpResponse> => {
    if (event.httpMethod !== 'POST') return methodNotAllowed();
    const sessionId = readSessionId(event.body);
    if (!sessionId) return json(400, { error: 'Invalid session_id' });
    try {
      await presence.leave(sessionId);
      return json(200, { current_active_estimate: await presence.count(sessionId) });
    } catch {
      return internalError();
    }
  };
}
