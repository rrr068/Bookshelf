import { IBookLikeRepository } from '../../domain/repositories/IBookLikeRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';

/**
 * 本へのいいねをトグルするユースケース
 */
export class ToggleBookLikeUseCase {
  constructor(
    private readonly bookLikeRepository: IBookLikeRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string, googleBooksId: string): Promise<{ liked: boolean; likesCount: number }> {
    // 本がDBに存在するか確認
    const book = await this.bookRepository.findByGoogleBooksId(googleBooksId);
    if (!book) {
      throw new Error('Book not found');
    }

    // 既存のいいねを検索
    const existingLike = await this.bookLikeRepository.findByUserAndBook(userId, book.id);

    if (existingLike) {
      // いいねを削除
      await this.bookLikeRepository.delete(existingLike.id);
      const likesCount = await this.bookLikeRepository.countByBookId(book.id);
      return { liked: false, likesCount };
    } else {
      // いいねを作成
      await this.bookLikeRepository.create(userId, book.id);
      const likesCount = await this.bookLikeRepository.countByBookId(book.id);
      return { liked: true, likesCount };
    }
  }
}
