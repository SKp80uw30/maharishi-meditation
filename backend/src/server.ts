import express from 'express';
import { createIncrementHandler, createStatsHandler } from './handlers';
import { getWorldPeaceStore } from './redisClient';

const app = express();
const port = process.env.PORT || 3000;

let store: ReturnType<typeof getWorldPeaceStore> | null = null;
let storeError: Error | null = null;

// Lazy initialization of Redis store
function initStore() {
  if (store || storeError) return;

  try {
    store = getWorldPeaceStore();
  } catch (err) {
    storeError = err as Error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  if (storeError) {
    return res.status(503).json({ status: 'degraded', error: storeError.message });
  }
  res.json({ status: 'ok' });
});

// World Peace meditation increment endpoint
app.post('/meditations/world-peace', async (req, res) => {
  try {
    initStore();
    if (!store) {
      return res.status(503).json({ error: storeError?.message || 'Redis not configured' });
    }

    const incrementHandler = createIncrementHandler(store);
    const result = await incrementHandler({ httpMethod: 'POST' } as any);
    res.status(result.statusCode).send(result.body);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// World Peace stats endpoint
app.get('/stats/world-peace', async (req, res) => {
  try {
    initStore();
    if (!store) {
      return res.status(503).json({ error: storeError?.message || 'Redis not configured' });
    }

    const statsHandler = createStatsHandler(store);
    const result = await statsHandler({ httpMethod: 'GET' } as any);
    res.status(result.statusCode).send(result.body);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`POST  /meditations/world-peace — increment counter`);
  console.log(`GET   /stats/world-peace — read stats`);
  console.log(`GET   /health — health check`);
  console.log(``);
  console.log(`Redis URL: ${process.env.REDIS_URL ? '✓ configured' : '✗ not configured'}`);
  console.log(`Upstash: ${process.env.UPSTASH_REDIS_REST_URL ? '✓ configured' : '✗ not configured'}`);
});

export default app;
