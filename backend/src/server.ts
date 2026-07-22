import express from 'express';
import { createIncrementHandler, createStatsHandler } from './handlers';
import { getWorldPeaceStore } from './redisClient';

const app = express();
const port = process.env.PORT || 3000;

const store = getWorldPeaceStore();
const incrementHandler = createIncrementHandler(store);
const statsHandler = createStatsHandler(store);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// World Peace meditation increment endpoint
app.post('/meditations/world-peace', async (req, res) => {
  try {
    const result = await incrementHandler({ httpMethod: 'POST' } as any);
    res.status(result.statusCode).send(result.body);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// World Peace stats endpoint
app.get('/stats/world-peace', async (req, res) => {
  try {
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
});

export default app;
