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
    const book = await this.bookRepository.findByGoogleBooksId(googleBooksId);
    if (!book) {
      return [];
    }

    const reviews = await this.reviewRepository.findByBookId(book.id);
    if (reviews.length === 0) {
      return [];
    }

    const reviewIds = reviews.map((r) => r.id);
    const userIds = [...new Set(reviews.map((r) => r.userId))];

    const [users, likesCounts, userLikes] = await Promise.all([
      this.userRepository.findManyByIds(userIds),
      this.likeRepository.countManyByReviewIds(reviewIds),
      this.likeRepository.findManyByUserAndReviewIds(currentUserId, reviewIds),
    ]);

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return reviews.map((review) => ({
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
