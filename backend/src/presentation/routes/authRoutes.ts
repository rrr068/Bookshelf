import { Hono } from 'hono';
import { AuthController } from '../controllers/AuthController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

/**
 * 認証ルートを作成
 */
export const createAuthRoutes = (
  authController: AuthController,
  jwtService: IJwtService
) => {
  const app = new Hono();
  const authMiddleware = createAuthMiddleware(jwtService);

  // 公開エンドポイント
  app.post('/register', (c) => authController.register(c));
  app.post('/login', (c) => authController.login(c));

  // 保護されたエンドポイント
  app.get('/me', authMiddleware, (c) => authController.getCurrentUser(c));
  app.put('/profile', authMiddleware, (c) => authController.updateProfile(c));

  return app;
};
