import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { prisma } from './infrastructure/database/prisma.js';
import { Container } from './infrastructure/di/container.js';
import { createAuthRoutes } from './presentation/routes/authRoutes.js';
import { createReadingStatusRoutes } from './presentation/routes/readingStatusRoutes.js';
import { createReviewRoutes } from './presentation/routes/reviewRoutes.js';
import { createLikeRoutes } from './presentation/routes/likeRoutes.js';
import { createBookLikeRoutes } from './presentation/routes/bookLikeRoutes.js';
import { createBookRoutes } from './presentation/routes/bookRoutes.js';
import { createGoogleBooksRoutes } from './presentation/routes/googleBooksRoutes.js';
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

// ルートのマウント
const authRoutes = createAuthRoutes(
  container.authController,
  container.jwtService
);
app.route('/api/auth', authRoutes);

const readingStatusRoutes = createReadingStatusRoutes(
  container.readingStatusController,
  container.jwtService
);
app.route('/api/reading-status', readingStatusRoutes);

const reviewRoutes = createReviewRoutes(
  container.reviewController,
  container.jwtService
);
app.route('/api/reviews', reviewRoutes);

const likeRoutes = createLikeRoutes(
  container.likeController,
  container.jwtService
);
app.route('/api/likes', likeRoutes);

const bookLikeRoutes = createBookLikeRoutes(
  container.bookLikeController,
  container.jwtService
);
app.route('/api/book-likes', bookLikeRoutes);

const bookRoutes = createBookRoutes(
  container.bookController,
  container.jwtService
);
app.route('/api/books', bookRoutes);

const googleBooksRoutes = createGoogleBooksRoutes(
  container.googleBooksController
);
app.route('/api/google-books', googleBooksRoutes);

// エラーハンドラー
app.onError(errorHandler);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on http://localhost:${port}`);
console.log(`Database: ${process.env.DATABASE_URL || 'Not configured'}`);

serve({
  fetch: app.fetch,
  port
});
