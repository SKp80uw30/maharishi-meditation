import { createRedisWorldPeaceStore, dayKey, RedisClient } from '../worldPeaceStore';

// Typed against the exported interface so this double can't drift from the real
// client the way it did when the store started needing new commands.
function fakeRedis(overrides: Partial<RedisClient> = {}): RedisClient {
  return {
    incr: jest.fn().mockResolvedValue(0),
    mget: jest.fn().mockResolvedValue([null, null]),
    zadd: jest.fn().mockResolvedValue(1),
    zrem: jest.fn().mockResolvedValue(1),
    zremrangebyscore: jest.fn().mockResolvedValue(0),
    zcard: jest.fn().mockResolvedValue(0),
    zscore: jest.fn().mockResolvedValue(null),
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
    const store = createRedisWorldPeaceStore(fakeRedis({ incr }));

    const result = await store.increment();

    expect(result).toEqual({ total_today: 43, total_all_time: 1205000 });
    expect(incr).toHaveBeenCalledTimes(2);
    expect(incr).toHaveBeenNthCalledWith(1, dayKey());
    expect(incr).toHaveBeenNthCalledWith(2, 'wp:total:all');
  });

  it('does not touch live presence — completions and presence are separate concerns', async () => {
    const redis = fakeRedis();
    const store = createRedisWorldPeaceStore(redis);

    await store.increment();
    await store.getStats();

    // The old implementation wrote an active-session member here, which is why
    // the "active" count could only ever describe people who had finished.
    expect(redis.zadd).not.toHaveBeenCalled();
    expect(redis.zcard).not.toHaveBeenCalled();
  });

  it('getStats() reads both keys via mget', async () => {
    const mget = jest.fn().mockResolvedValue([42, 1204996]);
    const store = createRedisWorldPeaceStore(fakeRedis({ mget }));

    expect(await store.getStats()).toEqual({ total_today: 42, total_all_time: 1204996 });
    expect(mget).toHaveBeenCalledWith(dayKey(), 'wp:total:all');
  });

  it('getStats() treats a brand-new day (no key yet) as 0, not an error', async () => {
    const store = createRedisWorldPeaceStore(fakeRedis({ mget: jest.fn().mockResolvedValue([null, null]) }));

    expect(await store.getStats()).toEqual({ total_today: 0, total_all_time: 0 });
  });
});
