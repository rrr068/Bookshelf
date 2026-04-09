import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';

/**
 * レビューを削除するユースケース
 */
export class DeleteReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string, googleBooksId: string): Promise<void> {
    // 本を取得
    const book = await this.bookRepository.findByGoogleBooksId(googleBooksId);
    if (!book) {
      throw new Error('Book not found');
    }

    // 既存のレビューを取得
    const existingReview = await this.reviewRepository.findByUserAndBook(userId, book.id);
    if (!existingReview) {
      throw new Error('Review not found');
    }

    // 自分のレビューかチェック
    if (existingReview.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.reviewRepository.delete(existingReview.id);
  }
}
