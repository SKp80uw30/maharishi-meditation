import type { HandlerEvent } from '@netlify/functions';
import { createIncrementHandler, createStatsHandler } from '../handlers';
import type { WorldPeaceStore } from '../worldPeaceStore';

function fakeEvent(httpMethod: string): HandlerEvent {
  return { httpMethod } as unknown as HandlerEvent;
}

function fakeStore(overrides: Partial<WorldPeaceStore> = {}): WorldPeaceStore {
  return {
    increment: jest.fn(),
    getStats: jest.fn(),
    ...overrides,
  };
}

describe('createIncrementHandler', () => {
  it('rejects non-POST requests with 405', async () => {
    const handler = createIncrementHandler(fakeStore());
    const result = await handler(fakeEvent('GET'), {} as never, undefined as never);
    expect(result?.statusCode).toBe(405);
  });

  it('increments the store and returns the resulting totals as JSON on POST', async () => {
    const increment = jest.fn().mockResolvedValue({ total_today: 5, total_all_time: 500 });
    const handler = createIncrementHandler(fakeStore({ increment }));

    const result = await handler(fakeEvent('POST'), {} as never, undefined as never);

    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result!.body as string)).toEqual({ total_today: 5, total_all_time: 500 });
    expect(increment).toHaveBeenCalledTimes(1);
  });

  it('returns 500 (not a crash) if the store throws', async () => {
    const increment = jest.fn().mockRejectedValue(new Error('redis down'));
    const handler = createIncrementHandler(fakeStore({ increment }));

    const result = await handler(fakeEvent('POST'), {} as never, undefined as never);
    expect(result?.statusCode).toBe(500);
  });
});

describe('createStatsHandler', () => {
  it('rejects non-GET requests with 405', async () => {
    const handler = createStatsHandler(fakeStore());
    const result = await handler(fakeEvent('POST'), {} as never, undefined as never);
    expect(result?.statusCode).toBe(405);
  });

  it('returns the store totals as JSON on GET', async () => {
    const getStats = jest.fn().mockResolvedValue({ total_today: 42, total_all_time: 1204996 });
    const handler = createStatsHandler(fakeStore({ getStats }));

    const result = await handler(fakeEvent('GET'), {} as never, undefined as never);

    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result!.body as string)).toEqual({ total_today: 42, total_all_time: 1204996 });
  });

  it('returns 500 (not a crash) if the store throws', async () => {
    const getStats = jest.fn().mockRejectedValue(new Error('redis down'));
    const handler = createStatsHandler(fakeStore({ getStats }));

    const result = await handler(fakeEvent('GET'), {} as never, undefined as never);
    expect(result?.statusCode).toBe(500);
  });
});
