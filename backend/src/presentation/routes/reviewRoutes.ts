import { Hono } from 'hono';
import { ReviewController } from '../controllers/ReviewController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createReviewRoutes = (
  controller: ReviewController,
  jwtService: IJwtService
) => {
  const app = new Hono();
  const authMiddleware = createAuthMiddleware(jwtService);

  app.post('/', authMiddleware, (c) => controller.create(c));

  return app;
};
