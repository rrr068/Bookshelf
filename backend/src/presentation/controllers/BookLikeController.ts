import { Context } from 'hono';
import { ToggleBookLikeUseCase } from '../../application/usecases/ToggleBookLikeUseCase';
import { GetUserLikedBooksUseCase } from '../../application/usecases/GetUserLikedBooksUseCase';

export class BookLikeController {
  constructor(
    private readonly toggleBookLikeUseCase: ToggleBookLikeUseCase,
    private readonly getUserLikedBooksUseCase: GetUserLikedBooksUseCase
  ) {}

  /**
   * 本へのいいねをトグル
   */
  async toggle(c: Context) {
    try {
      const userId = c.get('userId');
      const { googleBooksId } = await c.req.json();

      if (!googleBooksId) {
        return c.json({ error: 'Google Books ID is required' }, 400);
      }

      const result = await this.toggleBookLikeUseCase.execute(userId, googleBooksId);
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to toggle book like' }, 400);
    }
  }

  /**
   * ユーザーがいいねした本の一覧を取得
   */
  async getUserLikedBooks(c: Context) {
    try {
      const userId = c.get('userId');
      const books = await this.getUserLikedBooksUseCase.execute(userId);
      return c.json(books, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to get liked books' }, 400);
    }
  }
}
