import { Context } from 'hono';
import { UpsertReadingStatusUseCase } from '../../application/usecases/UpsertReadingStatusUseCase';
import { GetReadingStatusUseCase } from '../../application/usecases/GetReadingStatusUseCase';
import { GetUserBooksByStatusUseCase } from '../../application/usecases/GetUserBooksByStatusUseCase';
import { upsertReadingStatusSchema } from '../validators/readingStatusValidator';

export class ReadingStatusController {
  constructor(
    private readonly upsertReadingStatusUseCase: UpsertReadingStatusUseCase,
    private readonly getReadingStatusUseCase: GetReadingStatusUseCase,
    private readonly getUserBooksByStatusUseCase: GetUserBooksByStatusUseCase
  ) {}

  async upsert(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const validated = upsertReadingStatusSchema.parse(body);

      const result = await this.upsertReadingStatusUseCase.execute(
        userId,
        { bookId: validated.bookId, status: validated.status },
        validated.bookData
      );

      return c.json(result, 200);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to update reading status' }, 400);
    }
  }

  async get(c: Context) {
    try {
      const userId = c.get('userId');
      const bookId = c.req.param('bookId');

      if (!bookId) {
        return c.json({ error: 'Book ID is required' }, 400);
      }

      const result = await this.getReadingStatusUseCase.execute(userId, bookId);

      if (!result) {
        return c.json({ status: null }, 200);
      }

      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to get reading status' }, 400);
    }
  }

  async getUserBooks(c: Context) {
    try {
      const userId = c.get('userId');
      const status = c.req.query('status');

      const books = await this.getUserBooksByStatusUseCase.execute(userId, status);
      return c.json(books, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to get user books' }, 400);
    }
  }
}
