import { Context } from 'hono';
import { TogglePostLikeUseCase } from '../../application/usecases/TogglePostLikeUseCase';

export class PostLikeController {
  constructor(private readonly togglePostLikeUseCase: TogglePostLikeUseCase) {}

  async toggle(c: Context) {
    try {
      const userId = c.get('userId');
      const { postId } = await c.req.json();
      if (!postId) return c.json({ error: 'postId is required' }, 400);

      const result = await this.togglePostLikeUseCase.execute(userId, postId);
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to toggle like' }, 400);
    }
  }
}
