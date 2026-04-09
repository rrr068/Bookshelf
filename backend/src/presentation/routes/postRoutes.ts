import { Hono } from 'hono';
import { PostController } from '../controllers/PostController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createPostRoutes = (controller: PostController, jwtService: IJwtService) => {
  const app = new Hono();
  const auth = createAuthMiddleware(jwtService);

  app.post('/', auth, (c) => controller.create(c));
  app.get('/book/:googleBooksId', auth, (c) => controller.getBookPosts(c));
  app.put('/:postId', auth, (c) => controller.update(c));
  app.delete('/:postId', auth, (c) => controller.delete(c));

  return app;
};
