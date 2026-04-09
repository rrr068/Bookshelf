import { Hono } from 'hono';
import { PostLikeController } from '../controllers/PostLikeController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createPostLikeRoutes = (controller: PostLikeController, jwtService: IJwtService) => {
  const app = new Hono();
  const auth = createAuthMiddleware(jwtService);

  app.get('/liked-posts', auth, (c) => controller.getUserLikedPosts(c));
  app.post('/toggle', auth, (c) => controller.toggle(c));

  return app;
};
