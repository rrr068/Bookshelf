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
  app.get('/book/:googleBooksId', authMiddleware, (c) => controller.getBookReviews(c));
  app.put('/:googleBooksId', authMiddleware, (c) => controller.update(c));
  app.delete('/:googleBooksId', authMiddleware, (c) => controller.delete(c));

  return app;
};
