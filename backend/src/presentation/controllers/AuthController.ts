import { Context } from 'hono';
import { RegisterUserUseCase } from '../../application/usecases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/usecases/LoginUserUseCase';
import { GetCurrentUserUseCase } from '../../application/usecases/GetCurrentUserUseCase';
import { UpdateUserUseCase } from '../../application/usecases/UpdateUserUseCase';
import { registerSchema, loginSchema } from '../validators/authValidator';

/**
 * 認証コントローラー
 * HTTPリクエストを受け取り、ユースケースを実行し、レスポンスを返す
 */
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  /**
   * ユーザー登録
   * POST /api/auth/register
   */
  async register(c: Context) {
    try {
      const body = await c.req.json();

      // バリデーション
      const validated = registerSchema.parse(body);

      // ユースケース実行
      const result = await this.registerUserUseCase.execute(validated);

      return c.json(result, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          400
        );
      }

      return c.json(
        {
          error: error.message || 'Failed to register user',
        },
        400
      );
    }
  }

  /**
   * ログイン
   * POST /api/auth/login
   */
  async login(c: Context) {
    try {
      const body = await c.req.json();

      // バリデーション
      const validated = loginSchema.parse(body);

      // ユースケース実行
      const result = await this.loginUserUseCase.execute(validated);

      return c.json(result, 200);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          400
        );
      }

      return c.json(
        {
          error: error.message || 'Failed to login',
        },
        401
      );
    }
  }

  /**
   * ユーザー情報更新
   * PUT /api/auth/profile
   */
  async updateProfile(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const result = await this.updateUserUseCase.execute(userId, {
        username: body.username,
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to update profile' }, 400);
    }
  }

  /**
   * 現在のユーザー情報取得
   * GET /api/auth/me
   */
  async getCurrentUser(c: Context) {
    try {
      // authMiddlewareでセットされたuserIdを取得
      const userId = c.get('userId');

      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // ユースケース実行
      const result = await this.getCurrentUserUseCase.execute(userId);

      return c.json(result, 200);
    } catch (error: any) {
      return c.json(
        {
          error: error.message || 'Failed to get current user',
        },
        404
      );
    }
  }
}
