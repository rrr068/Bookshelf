import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ILikeRepository } from '../../domain/repositories/ILikeRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';

export interface ReviewDto {
  id: string;
  userId: string;
  bookId: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

/**
 * 本のレビュー一覧を取得するユースケース
 */
export class GetBookReviewsUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly userRepository: IUserRepository,
    private readonly likeRepository: ILikeRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(currentUserId: string, googleBooksId: string): Promise<ReviewDto[]> {
    // 本を取得
    const book = await this.bookRepository.findByGoogleBooksId(googleBooksId);
    if (!book) {
      return [];
    }

    // レビューを取得
    const reviews = await this.reviewRepository.findByBookId(book.id);

    // レビュー詳細を取得
    const reviewDtos = await Promise.all(
      reviews.map(async (review) => {
        const user = await this.userRepository.findById(review.userId);
        const likesCount = await this.likeRepository.countByReviewId(review.id);
        const userLike = await this.likeRepository.findByUserAndReview(currentUserId, review.id);

        return {
          id: review.id,
          userId: review.userId,
          bookId: review.bookId,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString(),
          user: {
            id: user!.id,
            username: user!.username,
          },
          likesCount,
          isLikedByCurrentUser: !!userLike,
        };
      })
    );

    return reviewDtos;
  }
}
