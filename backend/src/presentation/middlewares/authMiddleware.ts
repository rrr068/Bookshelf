import { Context, Next } from 'hono';
import { IJwtService } from '../../application/interfaces/IJwtService';

/**
 * JWT認証ミドルウェアを生成
 */
export const createAuthMiddleware = (jwtService: IJwtService) => {
  return async (c: Context, next: Next) => {
    try {
      // Authorizationヘッダーからトークンを取得
      const authHeader = c.req.header('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: No token provided' }, 401);
      }

      const token = authHeader.substring(7); // "Bearer "を除去

      // トークン検証
      const payload = jwtService.verifyToken(token);

      if (!payload) {
        return c.json({ error: 'Unauthorized: Invalid token' }, 401);
      }

      // コンテキストにユーザーIDを設定
      c.set('userId', payload.userId);
      c.set('userEmail', payload.email);

      await next();
    } catch (error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  };
};
