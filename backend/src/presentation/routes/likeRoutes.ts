import { Hono } from 'hono';
import { LikeController } from '../controllers/LikeController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createLikeRoutes = (
  controller: LikeController,
  jwtService: IJwtService
) => {
  const app = new Hono();
  const authMiddleware = createAuthMiddleware(jwtService);

  app.post('/toggle', authMiddleware, (c) => controller.toggle(c));
  app.get('/user/:userId', authMiddleware, (c) => controller.getUserLikes(c));

  return app;
};
