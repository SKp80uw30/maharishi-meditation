import { createMockWorldPeaceApi } from '../worldPeace';

describe('createMockWorldPeaceApi', () => {
  it('starts from the given seed and returns a copy (not a live reference)', async () => {
    const client = createMockWorldPeaceApi({ total_today: 5, total_all_time: 50 });
    const stats = await client.getStats();
    expect(stats).toEqual({ total_today: 5, total_all_time: 50 });
  });

  it('increments both total_today and total_all_time by 1 per call', async () => {
    const client = createMockWorldPeaceApi({ total_today: 5, total_all_time: 50 });
    await client.increment();
    await client.increment();
    expect(await client.getStats()).toEqual({ total_today: 7, total_all_time: 52 });
  });

  it('keeps separate instances independent (no shared module-level state)', async () => {
    const a = createMockWorldPeaceApi({ total_today: 0, total_all_time: 0 });
    const b = createMockWorldPeaceApi({ total_today: 100, total_all_time: 100 });

    await a.increment();

    expect(await a.getStats()).toEqual({ total_today: 1, total_all_time: 1 });
    expect(await b.getStats()).toEqual({ total_today: 100, total_all_time: 100 });
  });
});
