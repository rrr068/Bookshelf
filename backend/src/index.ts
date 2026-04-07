import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { prisma } from './infrastructure/database/prisma.js';
import { Container } from './infrastructure/di/container.js';
import { createAuthRoutes } from './presentation/routes/authRoutes.js';
import { errorHandler } from './presentation/middlewares/errorHandler.js';

// DIコンテナの初期化
const container = Container.getInstance(prisma);

const app = new Hono();

// CORS設定
app.use('/*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Backend is running with Prisma + SQLite' });
});

// 認証ルートのマウント
const authRoutes = createAuthRoutes(
  container.authController,
  container.jwtService
);
app.route('/api/auth', authRoutes);

// エラーハンドラー
app.onError(errorHandler);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on http://localhost:${port}`);
console.log(`Database: ${process.env.DATABASE_URL || 'Not configured'}`);

serve({
  fetch: app.fetch,
  port
});
