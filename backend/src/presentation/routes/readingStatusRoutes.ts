import { Hono } from 'hono';
import { ReadingStatusController } from '../controllers/ReadingStatusController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createReadingStatusRoutes = (
  controller: ReadingStatusController,
  jwtService: IJwtService
) => {
  const app = new Hono();
  const authMiddleware = createAuthMiddleware(jwtService);

  app.post('/', authMiddleware, (c) => controller.upsert(c));
  app.get('/:bookId', authMiddleware, (c) => controller.get(c));

  return app;
};
