import express, { NextFunction, Request, Response } from 'express';
import {
  createIncrementHandler,
  createPresenceJoinHandler,
  createPresenceLeaveHandler,
  createStatsHandler,
} from './handlers';
import { getStores } from './redisClient';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '4kb' }));

// The API is anonymous and public by design (no credentials, no cookies, no
// user data), so a wildcard origin is safe. Required by the react-native-web
// build, which calls this API cross-origin from the browser — without it every
// browser request fails at the preflight.
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

let stores: ReturnType<typeof getStores> | null = null;
let storeError: Error | null = null;

// Lazy initialization: a Redis misconfiguration degrades the affected routes
// rather than crashing the process on boot.
function initStores() {
  if (stores || storeError) return;
  try {
    stores = getStores();
  } catch (err) {
    storeError = err as Error;
  }
}

/** Wraps a handler factory so each route shares the same lazy-init, 503-on-
 * misconfiguration, never-throw behaviour. */
function route(
  build: (s: NonNullable<typeof stores>) => (event: {
    httpMethod: string;
    body?: unknown;
    query?: Record<string, string | undefined>;
  }) => Promise<{ statusCode: number; headers: Record<string, string>; body: string }>,
) {
  return async (req: Request, res: Response) => {
    try {
      initStores();
      if (!stores) {
        res.status(503).json({ error: storeError?.message || 'Redis not configured' });
        return;
      }
      const result = await build(stores)({
        httpMethod: req.method,
        body: req.body,
        query: req.query as Record<string, string | undefined>,
      });
      res.status(result.statusCode).set(result.headers).send(result.body);
    } catch {
      res.status(500).json({ error: 'Internal error' });
    }
  };
}

app.get('/health', (req: Request, res: Response) => {
  if (storeError) {
    res.status(503).json({ status: 'degraded', error: storeError.message });
    return;
  }
  res.json({ status: 'ok' });
});

// Completion counter — fires once, when a session reaches the Stats screen.
app.post('/meditations/world-peace', route((s) => createIncrementHandler(s.worldPeace)));

// Totals + live presence. `?exclude=<session_id>` omits the caller's own
// session so the client can honestly say "others".
app.get('/stats/world-peace', route((s) => createStatsHandler(s.worldPeace, s.presence)));

// Live presence. Start and heartbeat are the same operation: both push the
// entry's expiry out. Timed sessions declare their length up front and so need
// no heartbeat at all; open-ended ones refresh periodically.
app.post('/presence/start', route((s) => createPresenceJoinHandler(s.presence)));
app.post('/presence/heartbeat', route((s) => createPresenceJoinHandler(s.presence)));
app.post('/presence/end', route((s) => createPresenceLeaveHandler(s.presence)));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`POST  /meditations/world-peace — increment counter`);
  console.log(`GET   /stats/world-peace — totals + live presence`);
  console.log(`POST  /presence/start | /presence/heartbeat | /presence/end`);
  console.log(`GET   /health — health check`);
  console.log(``);
  console.log(`Redis URL: ${process.env.REDIS_URL ? '✓ configured' : '✗ not configured'}`);
  console.log(`Upstash: ${process.env.UPSTASH_REDIS_REST_URL ? '✓ configured' : '✗ not configured'}`);
});

export default app;
