import express, { NextFunction, Request, Response } from 'express';
import { createIncrementHandler, createStatsHandler } from './handlers';
import { getWorldPeaceStore } from './redisClient';

const app = express();
const port = process.env.PORT || 3000;

// The API is anonymous and public by design (no credentials, no cookies, no
// user data), so a wildcard origin is safe. Required by the react-native-web
// build, which calls this API cross-origin from the browser.
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

const store = getWorldPeaceStore();
const incrementHandler = createIncrementHandler(store);
const statsHandler = createStatsHandler(store);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// World Peace meditation increment endpoint
app.post('/meditations/world-peace', async (req: Request, res: Response) => {
  try {
    const result = await incrementHandler({ httpMethod: 'POST' });
    res.status(result.statusCode).set(result.headers).send(result.body);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// World Peace stats endpoint
app.get('/stats/world-peace', async (req: Request, res: Response) => {
  try {
    const result = await statsHandler({ httpMethod: 'GET' });
    res.status(result.statusCode).set(result.headers).send(result.body);
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
