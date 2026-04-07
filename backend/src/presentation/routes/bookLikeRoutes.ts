import { Hono } from 'hono';
import { BookLikeController } from '../controllers/BookLikeController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createBookLikeRoutes = (
  controller: BookLikeController,
  jwtService: IJwtService
) => {
  const app = new Hono();
  const authMiddleware = createAuthMiddleware(jwtService);

  app.post('/toggle', authMiddleware, (c) => controller.toggle(c));
  app.get('/user', authMiddleware, (c) => controller.getUserLikedBooks(c));

  return app;
};
