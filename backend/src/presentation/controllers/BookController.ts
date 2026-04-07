import { Context } from 'hono';
import { GetBooksMetadataUseCase } from '../../application/usecases/GetBooksMetadataUseCase';

export class BookController {
  constructor(
    private readonly getBooksMetadataUseCase: GetBooksMetadataUseCase
  ) {}

  /**
   * 複数の本のメタデータを取得
   */
  async getMetadata(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const { googleBooksIds } = body;

      if (!Array.isArray(googleBooksIds)) {
        return c.json({ error: 'googleBooksIds must be an array' }, 400);
      }

      const metadata = await this.getBooksMetadataUseCase.execute(userId, googleBooksIds);
      return c.json(metadata, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to get books metadata' }, 400);
    }
  }
}
