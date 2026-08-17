import {
  createIncrementHandler,
  createPresenceJoinHandler,
  createPresenceLeaveHandler,
  createStatsHandler,
} from '../handlers';
import type { PresenceStore } from '../presenceStore';
import type { WorldPeaceStore } from '../worldPeaceStore';

type Event = { httpMethod: string; body?: unknown; query?: Record<string, string | undefined> };

function fakeStore(overrides: Partial<WorldPeaceStore> = {}): WorldPeaceStore {
  return {
    increment: jest.fn().mockResolvedValue({ total_today: 0, total_all_time: 0 }),
    getStats: jest.fn().mockResolvedValue({ total_today: 0, total_all_time: 0 }),
    ...overrides,
  };
}

function fakePresence(overrides: Partial<PresenceStore> = {}): PresenceStore {
  return {
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
    count: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

const VALID_ID = 'abcdef0123456789';

describe('createIncrementHandler', () => {
  it('rejects non-POST requests with 405', async () => {
    const result = await createIncrementHandler(fakeStore())({ httpMethod: 'GET' });
    expect(result.statusCode).toBe(405);
  });

  it('increments the store and returns the resulting totals as JSON on POST', async () => {
    const increment = jest.fn().mockResolvedValue({ total_today: 5, total_all_time: 500 });
    const result = await createIncrementHandler(fakeStore({ increment }))({ httpMethod: 'POST' });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ total_today: 5, total_all_time: 500 });
    expect(increment).toHaveBeenCalledTimes(1);
  });

  it('returns 500 (not a crash) if the store throws', async () => {
    const increment = jest.fn().mockRejectedValue(new Error('redis down'));
    const result = await createIncrementHandler(fakeStore({ increment }))({ httpMethod: 'POST' });
    expect(result.statusCode).toBe(500);
  });
});

describe('createStatsHandler', () => {
  it('rejects non-GET requests with 405', async () => {
    const result = await createStatsHandler(fakeStore(), fakePresence())({ httpMethod: 'POST' });
    expect(result.statusCode).toBe(405);
  });

  it('merges completion totals with the live presence count', async () => {
    const getStats = jest.fn().mockResolvedValue({ total_today: 42, total_all_time: 1204996 });
    const presence = fakePresence({ count: jest.fn().mockResolvedValue(3) });

    const result = await createStatsHandler(fakeStore({ getStats }), presence)({ httpMethod: 'GET' });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      total_today: 42,
      total_all_time: 1204996,
      current_active_estimate: 3,
    });
  });

  it('passes ?exclude through so the count can mean "others"', async () => {
    const presence = fakePresence();
    await createStatsHandler(fakeStore(), presence)({ httpMethod: 'GET', query: { exclude: VALID_ID } });

    expect(presence.count).toHaveBeenCalledWith(VALID_ID);
  });

  it('returns 500 (not a crash) if the store throws', async () => {
    const getStats = jest.fn().mockRejectedValue(new Error('redis down'));
    const result = await createStatsHandler(fakeStore({ getStats }), fakePresence())({ httpMethod: 'GET' });
    expect(result.statusCode).toBe(500);
  });
});

describe('presence handlers', () => {
  const post = (body: unknown): Event => ({ httpMethod: 'POST', body });

  it('joins with the requested hold and answers with the count of others', async () => {
    const presence = fakePresence({ count: jest.fn().mockResolvedValue(4) });
    const result = await createPresenceJoinHandler(presence)(post({ session_id: VALID_ID, hold_seconds: 1260 }));

    expect(result.statusCode).toBe(200);
    expect(presence.join).toHaveBeenCalledWith(VALID_ID, 1260);
    // Excludes the caller — "4 others", not "4 including me".
    expect(presence.count).toHaveBeenCalledWith(VALID_ID);
    expect(JSON.parse(result.body)).toEqual({ current_active_estimate: 4 });
  });

  it('leaves on end', async () => {
    const presence = fakePresence();
    const result = await createPresenceLeaveHandler(presence)(post({ session_id: VALID_ID }));

    expect(result.statusCode).toBe(200);
    expect(presence.leave).toHaveBeenCalledWith(VALID_ID);
  });

  it.each([
    ['missing', {}],
    ['not a string', { session_id: 42 }],
    ['too short', { session_id: 'abc' }],
    ['illegal characters', { session_id: 'abcdef0123456789 drop-table' }],
    ['absurdly long', { session_id: 'a'.repeat(500) }],
  ])('rejects a session_id that is %s', async (_label, body) => {
    const presence = fakePresence();
    const result = await createPresenceJoinHandler(presence)(post(body));

    expect(result.statusCode).toBe(400);
    expect(presence.join).not.toHaveBeenCalled();
  });

  it('rejects non-POST requests with 405', async () => {
    const result = await createPresenceJoinHandler(fakePresence())({ httpMethod: 'GET' });
    expect(result.statusCode).toBe(405);
  });

  it('returns 500 (not a crash) if presence storage throws', async () => {
    const presence = fakePresence({ join: jest.fn().mockRejectedValue(new Error('redis down')) });
    const result = await createPresenceJoinHandler(presence)(post({ session_id: VALID_ID }));
    expect(result.statusCode).toBe(500);
  });
});
