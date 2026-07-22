// GET /stats/world-peace (see netlify.toml redirect) — returns
// { total_today, total_all_time }. See ../../src/handlers.ts for the testable
// implementation.
import { createStatsHandler } from '../../src/handlers';
import { getWorldPeaceStore } from '../../src/redisClient';

export const handler = createStatsHandler(getWorldPeaceStore());
