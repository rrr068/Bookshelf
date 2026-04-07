import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { Review } from '../../domain/entities/Review';

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

/**
 * レビューを更新するユースケース
 */
export class UpdateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string, googleBooksId: string, data: UpdateReviewDto): Promise<void> {
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

    // レビューを更新
    const updatedReview = new Review(
      existingReview.id,
      existingReview.userId,
      existingReview.bookId,
      data.rating !== undefined ? data.rating : existingReview.rating,
      data.comment !== undefined ? data.comment : existingReview.comment,
      existingReview.createdAt,
      new Date()
    );

    await this.reviewRepository.save(updatedReview);
  }
}
