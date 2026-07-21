import type { Handler } from '@netlify/functions';
import type { WorldPeaceStore } from './worldPeaceStore';

// Factories (not the handlers themselves) so tests can inject a fake store
// without touching Redis or env vars — the real netlify/functions/*.ts entry
// points wire in the real Redis-backed store (see redisClient.ts).

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
