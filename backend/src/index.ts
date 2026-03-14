import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { runMigrations } from './infrastructure/database/migrations/index.js';

// マイグレーション実行
runMigrations();

const app = new Hono();

app.use('/*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Backend is running with SQLite' });
});

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
