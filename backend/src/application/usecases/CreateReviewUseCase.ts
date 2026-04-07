import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { ILikeRepository } from '../../domain/repositories/ILikeRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Review } from '../../domain/entities/Review';
import { Book } from '../../domain/entities/Book';
import { CreateReviewRequestDto, ReviewResponseDto } from '../dto/review.dto';
import { CreateBookRequestDto } from '../dto/book.dto';

/**
 * レビュー作成ユースケース
 */
export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly bookRepository: IBookRepository,
    private readonly userRepository: IUserRepository,
    private readonly likeRepository: ILikeRepository
  ) {}

  async execute(
    userId: string,
    request: CreateReviewRequestDto,
    bookData?: CreateBookRequestDto,
    currentUserId?: string
  ): Promise<ReviewResponseDto> {
    const { bookId, rating, comment } = request;

    // 書籍が存在しない場合は作成
    let book = await this.bookRepository.findByGoogleBooksId(bookId);
    if (!book && bookData) {
      book = Book.create(
        bookData.googleBooksId,
        bookData.title,
        bookData.authors,
        userId,
        {
          publisher: bookData.publisher,
          publishedDate: bookData.publishedDate,
          description: bookData.description,
          isbn10: bookData.isbn10,
          isbn13: bookData.isbn13,
          pageCount: bookData.pageCount,
          thumbnailUrl: bookData.thumbnailUrl,
          language: bookData.language,
        }
      );
      book = await this.bookRepository.save(book);
    }

    if (!book) {
      throw new Error('Book not found');
    }

    // 既存のレビューをチェック（1ユーザー1レビュー）
    const existingReview = await this.reviewRepository.findByUserAndBook(
      userId,
      book.id
    );

    if (existingReview) {
      throw new Error('Already reviewed this book');
    }

    // レビュー作成
    const review = Review.create(userId, book.id, rating, comment || null);
    const savedReview = await this.reviewRepository.save(review);

    // ユーザー情報を取得
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // いいね数を取得
    const likesCount = await this.likeRepository.countByReviewId(savedReview.id);

    // 現在のユーザーがいいねしているかチェック
    let isLikedByCurrentUser = false;
    if (currentUserId) {
      const like = await this.likeRepository.findByUserAndReview(
        currentUserId,
        savedReview.id
      );
      isLikedByCurrentUser = !!like;
    }

    return {
      id: savedReview.id,
      userId: savedReview.userId,
      bookId: savedReview.bookId,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt.toISOString(),
      updatedAt: savedReview.updatedAt.toISOString(),
      user: {
        id: user.id,
        username: user.username,
      },
      likesCount,
      isLikedByCurrentUser,
    };
  }
}
