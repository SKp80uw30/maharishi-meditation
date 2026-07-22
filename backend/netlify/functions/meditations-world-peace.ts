// POST /meditations/world-peace (see netlify.toml redirect) — increments the
// anonymous World Peace counter. No body, no user identifier. See
// ../../src/handlers.ts for the testable implementation.
import { createIncrementHandler } from '../../src/handlers';
import { getWorldPeaceStore } from '../../src/redisClient';

export const handler = createIncrementHandler(getWorldPeaceStore());
