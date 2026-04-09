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
    const reviewIds = await this.likeRepository.findReviewIdsByUserId(userId);

    if (reviewIds.length === 0) {
      return [];
    }

    const reviews = await this.reviewRepository.findManyByIds(reviewIds);
    const validReviews = reviews.filter((r) => r);

    if (validReviews.length === 0) {
      return [];
    }

    const userIds = [...new Set(validReviews.map((r) => r.userId))];
    const validReviewIds = validReviews.map((r) => r.id);

    const [users, likesCounts, userLikes] = await Promise.all([
      this.userRepository.findManyByIds(userIds),
      this.likeRepository.countManyByReviewIds(validReviewIds),
      currentUserId
        ? this.likeRepository.findManyByUserAndReviewIds(currentUserId, validReviewIds)
        : Promise.resolve({} as Record<string, any>),
    ]);

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return validReviews
      .filter((review) => usersMap.has(review.userId))
      .map((review) => ({
        id: review.id,
        userId: review.userId,
        bookId: review.bookId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        user: {
          id: usersMap.get(review.userId)!.id,
          username: usersMap.get(review.userId)!.username,
        },
        likesCount: likesCounts[review.id] ?? 0,
        isLikedByCurrentUser: !!userLikes[review.id],
      }));
  }
}
