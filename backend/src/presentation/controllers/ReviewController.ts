import { Context } from 'hono';
import { CreateReviewUseCase } from '../../application/usecases/CreateReviewUseCase';
import { createReviewSchema } from '../validators/reviewValidator';

export class ReviewController {
  constructor(private readonly createReviewUseCase: CreateReviewUseCase) {}

  async create(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const validated = createReviewSchema.parse(body);

      const result = await this.createReviewUseCase.execute(
        userId,
        {
          bookId: validated.bookId,
          rating: validated.rating,
          comment: validated.comment,
        },
        validated.bookData,
        userId
      );

      return c.json(result, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to create review' }, 400);
    }
  }
}
