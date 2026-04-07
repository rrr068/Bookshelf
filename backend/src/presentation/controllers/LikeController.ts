import { Context } from 'hono';
import { ToggleLikeUseCase } from '../../application/usecases/ToggleLikeUseCase';
import { GetUserLikedReviewsUseCase } from '../../application/usecases/GetUserLikedReviewsUseCase';
import { createLikeSchema } from '../validators/likeValidator';

export class LikeController {
  constructor(
    private readonly toggleLikeUseCase: ToggleLikeUseCase,
    private readonly getUserLikedReviewsUseCase: GetUserLikedReviewsUseCase
  ) {}

  async toggle(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const validated = createLikeSchema.parse(body);

      const result = await this.toggleLikeUseCase.execute(userId, validated.reviewId);

      return c.json(result, 200);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to toggle like' }, 400);
    }
  }

  async getUserLikes(c: Context) {
    try {
      const userId = c.req.param('userId');
      const currentUserId = c.get('userId');

      const result = await this.getUserLikedReviewsUseCase.execute(userId, currentUserId);

      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to get user likes' }, 400);
    }
  }
}
