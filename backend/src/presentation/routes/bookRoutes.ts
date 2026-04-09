import { Hono } from 'hono';
import { BookController } from '../controllers/BookController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createBookRoutes = (
  controller: BookController,
  jwtService: IJwtService
) => {
  const app = new Hono();
  const authMiddleware = createAuthMiddleware(jwtService);

  app.post('/metadata', authMiddleware, (c) => controller.getMetadata(c));

  return app;
};
