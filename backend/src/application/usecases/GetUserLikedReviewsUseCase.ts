import { ILikeRepository } from '../../domain/repositories/ILikeRepository';
import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ReviewResponseDto } from '../dto/review.dto';

/**
 * ユーザーがいいねしたレビュー一覧取得ユースケース
 */
export class GetUserLikedReviewsUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly reviewRepository: IReviewRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string, currentUserId?: string): Promise<ReviewResponseDto[]> {
    // ユーザーがいいねしたレビューIDを取得
    const reviewIds = await this.likeRepository.findReviewIdsByUserId(userId);

    if (reviewIds.length === 0) {
      return [];
    }

    // レビューの詳細を取得
    const reviews: ReviewResponseDto[] = [];

    for (const reviewId of reviewIds) {
      const review = await this.reviewRepository.findById(reviewId);
      if (!review) continue;

      const user = await this.userRepository.findById(review.userId);
      if (!user) continue;

      const likesCount = await this.likeRepository.countByReviewId(review.id);

      let isLikedByCurrentUser = false;
      if (currentUserId) {
        const like = await this.likeRepository.findByUserAndReview(
          currentUserId,
          review.id
        );
        isLikedByCurrentUser = !!like;
      }

      reviews.push({
        id: review.id,
        userId: review.userId,
        bookId: review.bookId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: {
          id: user.id,
          username: user.username,
        },
        likesCount,
        isLikedByCurrentUser,
      });
    }

    return reviews;
  }
}
