import type { Redis } from '@upstash/redis';
import { createRedisWorldPeaceStore, dayKey } from '../worldPeaceStore';

function fakeRedis(overrides: Partial<Redis> = {}): Redis {
  return {
    incr: jest.fn(),
    mget: jest.fn(),
    ...overrides,
  } as unknown as Redis;
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
    const redis = fakeRedis({ incr });

    const store = createRedisWorldPeaceStore(redis);
    const result = await store.increment();

    expect(result).toEqual({ total_today: 43, total_all_time: 1205000 });
    expect(incr).toHaveBeenCalledTimes(2);
    expect(incr).toHaveBeenNthCalledWith(1, dayKey());
    expect(incr).toHaveBeenNthCalledWith(2, 'wp:total:all');
  });

  it('getStats() reads both keys via mget and defaults missing keys to 0', async () => {
    const mget = jest.fn().mockResolvedValue([42, 1204996]);
    const redis = fakeRedis({ mget });

    const store = createRedisWorldPeaceStore(redis);
    const result = await store.getStats();

    expect(result).toEqual({ total_today: 42, total_all_time: 1204996 });
    expect(mget).toHaveBeenCalledWith(dayKey(), 'wp:total:all');
  });

  it('getStats() treats a brand-new day (no key yet) as 0, not an error', async () => {
    const mget = jest.fn().mockResolvedValue([null, null]);
    const redis = fakeRedis({ mget });

    const store = createRedisWorldPeaceStore(redis);
    expect(await store.getStats()).toEqual({ total_today: 0, total_all_time: 0 });
  });
});
