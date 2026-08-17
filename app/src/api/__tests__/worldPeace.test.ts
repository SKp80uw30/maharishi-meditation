import { createMockWorldPeaceApi, createSessionId } from '../worldPeace';

describe('createMockWorldPeaceApi', () => {
  it('starts from the given seed and returns a copy (not a live reference)', async () => {
    const client = createMockWorldPeaceApi({ total_today: 5, total_all_time: 50 });
    const stats = await client.getStats();
    expect(stats).toEqual({ total_today: 5, total_all_time: 50, current_active_estimate: 0 });
  });

  it('increments both total_today and total_all_time by 1 per call', async () => {
    const client = createMockWorldPeaceApi({ total_today: 5, total_all_time: 50 });
    await client.increment();
    await client.increment();
    expect(await client.getStats()).toMatchObject({ total_today: 7, total_all_time: 52 });
  });

  it('keeps separate instances independent (no shared module-level state)', async () => {
    const a = createMockWorldPeaceApi({ total_today: 0, total_all_time: 0 });
    const b = createMockWorldPeaceApi({ total_today: 100, total_all_time: 100 });

    await a.increment();

    expect(await a.getStats()).toMatchObject({ total_today: 1, total_all_time: 1 });
    expect(await b.getStats()).toMatchObject({ total_today: 100, total_all_time: 100 });
  });

  it('counts presence separately from completions', async () => {
    const client = createMockWorldPeaceApi({ total_today: 0, total_all_time: 0 });

    // Finishing a session must not make anyone look "currently meditating" —
    // that conflation is exactly what the presence model exists to fix.
    await client.increment();
    expect((await client.getStats()).current_active_estimate).toBe(0);

    await client.startPresence('someone-else', 600);
    expect((await client.getStats()).current_active_estimate).toBe(1);
  });

  it('excludes the caller so a lone meditator sees zero others', async () => {
    const client = createMockWorldPeaceApi({ total_today: 0, total_all_time: 0 });

    const others = await client.startPresence('me-session-1', 600);

    expect(others).toBe(0);
    expect((await client.getStats('me-session-1')).current_active_estimate).toBe(0);
    expect((await client.getStats()).current_active_estimate).toBe(1);
  });

  it('drops a session from the live count on end', async () => {
    const client = createMockWorldPeaceApi({ total_today: 0, total_all_time: 0 });

    await client.startPresence('them-session', 600);
    expect((await client.getStats()).current_active_estimate).toBe(1);

    await client.endPresence('them-session');
    expect((await client.getStats()).current_active_estimate).toBe(0);
  });

  it('expires a session whose hold has elapsed even if end never arrives', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-18T10:00:00Z'));
    const client = createMockWorldPeaceApi({ total_today: 0, total_all_time: 0 });

    await client.startPresence('abandoned-1', 60);
    expect((await client.getStats()).current_active_estimate).toBe(1);

    jest.setSystemTime(new Date('2026-08-18T10:02:00Z'));
    expect((await client.getStats()).current_active_estimate).toBe(0);

    jest.useRealTimers();
  });
});

describe('createSessionId', () => {
  it('is opaque, unique per call, and within the shape the backend accepts', () => {
    const a = createSessionId();
    const b = createSessionId();

    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });
});
