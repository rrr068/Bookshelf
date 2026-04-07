import { Context } from 'hono';
import { UpsertReadingStatusUseCase } from '../../application/usecases/UpsertReadingStatusUseCase';
import { upsertReadingStatusSchema } from '../validators/readingStatusValidator';

export class ReadingStatusController {
  constructor(private readonly upsertReadingStatusUseCase: UpsertReadingStatusUseCase) {}

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
}
