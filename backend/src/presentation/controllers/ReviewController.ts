import { Context } from 'hono';
import { CreateReviewUseCase } from '../../application/usecases/CreateReviewUseCase';
import { GetBookReviewsUseCase } from '../../application/usecases/GetBookReviewsUseCase';
import { UpdateReviewUseCase } from '../../application/usecases/UpdateReviewUseCase';
import { DeleteReviewUseCase } from '../../application/usecases/DeleteReviewUseCase';
import { createReviewSchema, updateReviewSchema } from '../validators/reviewValidator';

export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getBookReviewsUseCase: GetBookReviewsUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase
  ) {}

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

  async getBookReviews(c: Context) {
    try {
      const userId = c.get('userId');
      const googleBooksId = c.req.param('googleBooksId');

      if (!googleBooksId) {
        return c.json({ error: 'Google Books ID is required' }, 400);
      }

      const reviews = await this.getBookReviewsUseCase.execute(userId, googleBooksId);
      return c.json(reviews, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to get reviews' }, 400);
    }
  }

  async update(c: Context) {
    try {
      const userId = c.get('userId');
      const googleBooksId = c.req.param('googleBooksId');
      const body = await c.req.json();
      const validated = updateReviewSchema.parse(body);

      if (!googleBooksId) {
        return c.json({ error: 'Google Books ID is required' }, 400);
      }

      await this.updateReviewUseCase.execute(userId, googleBooksId, validated);
      return c.json({ message: 'Review updated successfully' }, 200);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to update review' }, 400);
    }
  }

  async delete(c: Context) {
    try {
      const userId = c.get('userId');
      const googleBooksId = c.req.param('googleBooksId');

      if (!googleBooksId) {
        return c.json({ error: 'Google Books ID is required' }, 400);
      }

      await this.deleteReviewUseCase.execute(userId, googleBooksId);
      return c.json({ message: 'Review deleted successfully' }, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to delete review' }, 400);
    }
  }
}
