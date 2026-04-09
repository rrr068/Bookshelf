import { Hono } from 'hono';
import { GoogleBooksController } from '../controllers/GoogleBooksController';

export const createGoogleBooksRoutes = (controller: GoogleBooksController) => {
  const app = new Hono();

  // 認証不要のパブリックエンドポイント
  app.get('/search', (c) => controller.search(c));

  return app;
};
