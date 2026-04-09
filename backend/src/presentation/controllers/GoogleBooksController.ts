import { Context } from 'hono';
import { SearchGoogleBooksUseCase } from '../../application/usecases/SearchGoogleBooksUseCase';

export class GoogleBooksController {
  constructor(
    private readonly searchGoogleBooksUseCase: SearchGoogleBooksUseCase
  ) {}

  /**
   * Google Books APIを検索（キャッシュ付き）
   */
  async search(c: Context) {
    try {
      const query = c.req.query('q');
      const maxResults = parseInt(c.req.query('maxResults') || '40', 10);
      const startIndex = parseInt(c.req.query('startIndex') || '0', 10);

      if (!query) {
        return c.json({ error: 'Query parameter "q" is required' }, 400);
      }

      const result = await this.searchGoogleBooksUseCase.execute(
        query,
        maxResults,
        startIndex
      );

      return c.json(result, 200);
    } catch (error: any) {
      console.error('Google Books search error:', error.message);

      if (error.message === 'QUOTA_EXCEEDED') {
        return c.json({ error: 'QUOTA_EXCEEDED' }, 429);
      }

      return c.json({ error: 'Failed to search books' }, 500);
    }
  }
}
