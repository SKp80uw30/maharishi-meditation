import {
  ACTIVE_KEY,
  clampHold,
  createPresenceStore,
  MAX_HOLD_SECONDS,
  MIN_HOLD_SECONDS,
  PresenceRedis,
} from '../presenceStore';

/** In-memory sorted set — enough to exercise real expiry semantics, which a
 * jest.fn() double could not. */
function fakeRedis() {
  const members = new Map<string, number>();
  const redis: PresenceRedis = {
    async zadd(_key, score, member) {
      const isNew = !members.has(member);
      members.set(member, score);
      return isNew ? 1 : 0;
    },
    async zrem(_key, member) {
      return members.delete(member) ? 1 : 0;
    },
    async zremrangebyscore(_key, min, max) {
      let removed = 0;
      for (const [member, score] of [...members]) {
        if (score >= min && score <= max) {
          members.delete(member);
          removed++;
        }
      }
      return removed;
    },
    async zcard() {
      return members.size;
    },
    async zscore(_key, member) {
      return members.get(member) ?? null;
    },
  };
  return { redis, members };
}

describe('clampHold', () => {
  it('keeps a sane requested hold as-is', () => {
    expect(clampHold(600)).toBe(600);
  });

  it('refuses to let a caller park an entry indefinitely', () => {
    expect(clampHold(999999)).toBe(MAX_HOLD_SECONDS);
  });

  it('floors tiny or nonsense values so an entry survives at least one poll', () => {
    expect(clampHold(1)).toBe(MIN_HOLD_SECONDS);
    expect(clampHold(-50)).toBe(MIN_HOLD_SECONDS);
    expect(clampHold(NaN)).toBe(MIN_HOLD_SECONDS);
  });
});

describe('createPresenceStore', () => {
  let now = 1_000_000_000_000; // fixed clock, ms
  const clock = () => now;

  beforeEach(() => {
    now = 1_000_000_000_000;
  });

  it('counts a joined session as live', async () => {
    const { redis } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    await presence.join('session-aaaaaaa', 600);

    expect(await presence.count()).toBe(1);
  });

  it('drops a session once its own hold elapses, without touching the others', async () => {
    const { redis } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    await presence.join('short-session-1', 60); // 1 minute
    await presence.join('long-session-11', 1200); // 20 minutes

    now += 120_000; // two minutes later

    // This is the behaviour the old shared-TTL set could not provide: members
    // expiring individually rather than the whole key dropping at once.
    expect(await presence.count()).toBe(1);
    expect(await redis.zscore(ACTIVE_KEY, 'long-session-11')).not.toBeNull();
  });

  it('does not accumulate stale entries under steady traffic', async () => {
    const { redis } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    // A new 1-minute session every minute for an hour. The previous
    // implementation refreshed one shared TTL on every write, so nothing ever
    // expired and the count climbed to 60.
    for (let i = 0; i < 60; i++) {
      await presence.join(`session-${String(i).padStart(8, '0')}`, 60);
      now += 60_000;
    }

    expect(await presence.count()).toBeLessThanOrEqual(1);
  });

  it('treats a repeat join as a heartbeat that extends the same entry', async () => {
    const { redis, members } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    await presence.join('open-session-1', 120);
    now += 60_000;
    await presence.join('open-session-1', 120); // heartbeat

    expect(members.size).toBe(1);

    now += 90_000; // past the first hold, inside the refreshed one
    expect(await presence.count()).toBe(1);
  });

  it('removes a session immediately on leave', async () => {
    const { redis } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    await presence.join('session-aaaaaaa', 600);
    await presence.leave('session-aaaaaaa');

    expect(await presence.count()).toBe(0);
  });

  it('excludes the caller so the count means "others"', async () => {
    const { redis } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    await presence.join('me-aaaaaaaaaa', 600);
    await presence.join('someone-else', 600);

    expect(await presence.count('me-aaaaaaaaaa')).toBe(1);
    expect(await presence.count()).toBe(2);
  });

  it('leaves the caller\'s own entry and expiry untouched when counting', async () => {
    const { redis } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    await presence.join('me-aaaaaaaaaa', 600);
    const before = await redis.zscore(ACTIVE_KEY, 'me-aaaaaaaaaa');

    await presence.count('me-aaaaaaaaaa');

    expect(await redis.zscore(ACTIVE_KEY, 'me-aaaaaaaaaa')).toBe(before);
  });

  it('excluding an id that is not present does not undercount', async () => {
    const { redis } = fakeRedis();
    const presence = createPresenceStore(redis, clock);

    await presence.join('someone-else', 600);

    expect(await presence.count('never-joined-1')).toBe(1);
  });
});
