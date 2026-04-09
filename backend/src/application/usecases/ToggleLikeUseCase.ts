import { ILikeRepository } from '../../domain/repositories/ILikeRepository';
import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { Like } from '../../domain/entities/Like';

/**
 * いいねトグルユースケース
 * いいねがあれば削除、なければ追加
 */
export class ToggleLikeUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly reviewRepository: IReviewRepository
  ) {}

  async execute(
    userId: string,
    reviewId: string
  ): Promise<{ liked: boolean; likesCount: number }> {
    // レビューの存在確認
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // 既存のいいねを検索
    const existingLike = await this.likeRepository.findByUserAndReview(
      userId,
      reviewId
    );

    if (existingLike) {
      // いいねを削除
      await this.likeRepository.delete(existingLike.id);
      const likesCount = await this.likeRepository.countByReviewId(reviewId);
      return { liked: false, likesCount };
    } else {
      // いいねを追加
      const like = Like.create(userId, reviewId);
      await this.likeRepository.save(like);
      const likesCount = await this.likeRepository.countByReviewId(reviewId);
      return { liked: true, likesCount };
    }
  }
}
