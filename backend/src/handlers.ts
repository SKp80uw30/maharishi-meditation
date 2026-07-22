import type { WorldPeaceStore } from './worldPeaceStore';

type HttpEvent = { httpMethod: string };
type HttpResponse = { statusCode: number; headers: Record<string, string>; body: string };

// Factories (not the handlers themselves) so tests can inject a fake store
// without touching Redis or env vars — the real Express server wires in the
// real Redis-backed store (see server.ts).

const JSON_HEADERS = { 'content-type': 'application/json' };

export function createIncrementHandler(store: WorldPeaceStore) {
  return async (event: HttpEvent): Promise<HttpResponse> => {
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

export function createStatsHandler(store: WorldPeaceStore) {
  return async (event: HttpEvent): Promise<HttpResponse> => {
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
