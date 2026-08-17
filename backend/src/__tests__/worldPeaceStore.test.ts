import { createRedisWorldPeaceStore, dayKey, RedisClient } from '../worldPeaceStore';

// The store's own command surface — typed against the exported interface so
// this double can't drift from the real client the way it did when
// sadd/scard were added.
function fakeRedis(overrides: Partial<RedisClient> = {}): RedisClient {
  return {
    incr: jest.fn().mockResolvedValue(0),
    mget: jest.fn().mockResolvedValue([null, null]),
    sadd: jest.fn().mockResolvedValue(1),
    scard: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

describe('dayKey', () => {
  it('formats a UTC day bucket as wp:total:YYYY-MM-DD', () => {
    expect(dayKey(new Date('2026-07-21T23:59:00Z'))).toBe('wp:total:2026-07-21');
    expect(dayKey(new Date('2026-01-05T00:00:00Z'))).toBe('wp:total:2026-01-05');
  });
});

describe('createRedisWorldPeaceStore', () => {
  it('increment() bumps both the day bucket and the all-time counter, and returns the new totals', async () => {
    const incr = jest.fn().mockResolvedValueOnce(43).mockResolvedValueOnce(1205000);
    const redis = fakeRedis({ incr, scard: jest.fn().mockResolvedValue(7) });

    const store = createRedisWorldPeaceStore(redis);
    const result = await store.increment();

    expect(result).toEqual({ total_today: 43, total_all_time: 1205000, current_active_estimate: 7 });
    expect(incr).toHaveBeenCalledTimes(2);
    expect(incr).toHaveBeenNthCalledWith(1, dayKey());
    expect(incr).toHaveBeenNthCalledWith(2, 'wp:total:all');
  });

  it('increment() records an active session with an expiry so the count self-drains', async () => {
    const sadd = jest.fn().mockResolvedValue(1);
    const store = createRedisWorldPeaceStore(fakeRedis({ sadd }));

    await store.increment();

    expect(sadd).toHaveBeenCalledTimes(1);
    const [key, member, expiry] = sadd.mock.calls[0];
    expect(key).toBe('wp:active:sessions');
    expect(typeof member).toBe('string');
    expect(expiry).toBe(1800);
  });

  it('getStats() reads both keys via mget and reports the active count', async () => {
    const mget = jest.fn().mockResolvedValue([42, 1204996]);
    const redis = fakeRedis({ mget, scard: jest.fn().mockResolvedValue(3) });

    const store = createRedisWorldPeaceStore(redis);
    const result = await store.getStats();

    expect(result).toEqual({ total_today: 42, total_all_time: 1204996, current_active_estimate: 3 });
    expect(mget).toHaveBeenCalledWith(dayKey(), 'wp:total:all');
  });

  it('getStats() treats a brand-new day (no key yet) as 0, not an error', async () => {
    const redis = fakeRedis({ mget: jest.fn().mockResolvedValue([null, null]) });

    const store = createRedisWorldPeaceStore(redis);
    expect(await store.getStats()).toEqual({
      total_today: 0,
      total_all_time: 0,
      current_active_estimate: 0,
    });
  });
});
