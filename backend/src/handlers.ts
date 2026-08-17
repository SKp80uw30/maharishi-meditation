import type { WorldPeaceStore } from './worldPeaceStore';

// Factories (not the handlers themselves) so tests can inject a fake store
// without touching Redis or env vars — server.ts wires in the real
// Redis-backed store (see redisClient.ts).
//
// The event/response shapes are deliberately transport-agnostic (a leftover
// virtue of the original Netlify Functions deploy target): the Express layer
// adapts them, and tests drive them without any HTTP at all.

export interface HandlerEvent {
  httpMethod: string;
}

export interface HandlerResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export type Handler = (event: HandlerEvent) => Promise<HandlerResponse>;

const JSON_HEADERS = { 'content-type': 'application/json' };

export function createIncrementHandler(store: WorldPeaceStore): Handler {
  return async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    try {
      const stats = await store.increment();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(stats) };
    } catch {
      return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Internal error' }) };
    }
  };
}

export function createStatsHandler(store: WorldPeaceStore): Handler {
  return async (event) => {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    try {
      const stats = await store.getStats();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(stats) };
    } catch {
      return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Internal error' }) };
    }
  };
}
