import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../database/repositories/UserRepository';
import { BookRepository } from '../database/repositories/BookRepository';
import { ReadingStatusRepository } from '../database/repositories/ReadingStatusRepository';
import { ReviewRepository } from '../database/repositories/ReviewRepository';
import { LikeRepository } from '../database/repositories/LikeRepository';
import { BookLikeRepository } from '../database/repositories/BookLikeRepository';
import { PasswordHasher } from '../auth/PasswordHasher';
import { JwtService } from '../auth/JwtService';
import { RegisterUserUseCase } from '../../application/usecases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/usecases/LoginUserUseCase';
import { GetCurrentUserUseCase } from '../../application/usecases/GetCurrentUserUseCase';
import { UpsertReadingStatusUseCase } from '../../application/usecases/UpsertReadingStatusUseCase';
import { GetReadingStatusUseCase } from '../../application/usecases/GetReadingStatusUseCase';
import { GetUserBooksByStatusUseCase } from '../../application/usecases/GetUserBooksByStatusUseCase';
import { CreateReviewUseCase } from '../../application/usecases/CreateReviewUseCase';
import { GetBookReviewsUseCase } from '../../application/usecases/GetBookReviewsUseCase';
import { UpdateReviewUseCase } from '../../application/usecases/UpdateReviewUseCase';
import { DeleteReviewUseCase } from '../../application/usecases/DeleteReviewUseCase';
import { ToggleLikeUseCase } from '../../application/usecases/ToggleLikeUseCase';
import { GetUserLikedReviewsUseCase } from '../../application/usecases/GetUserLikedReviewsUseCase';
import { ToggleBookLikeUseCase } from '../../application/usecases/ToggleBookLikeUseCase';
import { GetUserLikedBooksUseCase } from '../../application/usecases/GetUserLikedBooksUseCase';
import { GetBooksMetadataUseCase } from '../../application/usecases/GetBooksMetadataUseCase';
import { SearchGoogleBooksUseCase } from '../../application/usecases/SearchGoogleBooksUseCase';
import { AuthController } from '../../presentation/controllers/AuthController';
import { BookController } from '../../presentation/controllers/BookController';
import { GoogleBooksController } from '../../presentation/controllers/GoogleBooksController';
import { ReadingStatusController } from '../../presentation/controllers/ReadingStatusController';
import { ReviewController } from '../../presentation/controllers/ReviewController';
import { LikeController } from '../../presentation/controllers/LikeController';
import { BookLikeController } from '../../presentation/controllers/BookLikeController';

/**
 * DIコンテナ
 * すべての依存関係を一箇所で管理
 */
export class Container {
  private static instance: Container;

  // Infrastructure - Repositories
  public readonly userRepository: UserRepository;
  public readonly bookRepository: BookRepository;
  public readonly readingStatusRepository: ReadingStatusRepository;
  public readonly reviewRepository: ReviewRepository;
  public readonly likeRepository: LikeRepository;
  public readonly bookLikeRepository: BookLikeRepository;

  // Infrastructure - Services
  public readonly passwordHasher: PasswordHasher;
  public readonly jwtService: JwtService;

  // Use Cases
  public readonly registerUserUseCase: RegisterUserUseCase;
  public readonly loginUserUseCase: LoginUserUseCase;
  public readonly getCurrentUserUseCase: GetCurrentUserUseCase;
  public readonly upsertReadingStatusUseCase: UpsertReadingStatusUseCase;
  public readonly getReadingStatusUseCase: GetReadingStatusUseCase;
  public readonly getUserBooksByStatusUseCase: GetUserBooksByStatusUseCase;
  public readonly createReviewUseCase: CreateReviewUseCase;
  public readonly getBookReviewsUseCase: GetBookReviewsUseCase;
  public readonly updateReviewUseCase: UpdateReviewUseCase;
  public readonly deleteReviewUseCase: DeleteReviewUseCase;
  public readonly toggleLikeUseCase: ToggleLikeUseCase;
  public readonly getUserLikedReviewsUseCase: GetUserLikedReviewsUseCase;
  public readonly toggleBookLikeUseCase: ToggleBookLikeUseCase;
  public readonly getUserLikedBooksUseCase: GetUserLikedBooksUseCase;
  public readonly getBooksMetadataUseCase: GetBooksMetadataUseCase;
  public readonly searchGoogleBooksUseCase: SearchGoogleBooksUseCase;

  // Controllers
  public readonly authController: AuthController;
  public readonly readingStatusController: ReadingStatusController;
  public readonly reviewController: ReviewController;
  public readonly likeController: LikeController;
  public readonly bookLikeController: BookLikeController;
  public readonly bookController: BookController;
  public readonly googleBooksController: GoogleBooksController;

  private constructor(prisma: PrismaClient) {
    // Infrastructure層 - Repositoriesの初期化
    this.userRepository = new UserRepository(prisma);
    this.bookRepository = new BookRepository(prisma);
    this.readingStatusRepository = new ReadingStatusRepository(prisma);
    this.reviewRepository = new ReviewRepository(prisma);
    this.likeRepository = new LikeRepository(prisma);
    this.bookLikeRepository = new BookLikeRepository(prisma);

    // Infrastructure層 - Servicesの初期化
    this.passwordHasher = new PasswordHasher();
    this.jwtService = new JwtService();

    // Use Cases層の初期化
    this.registerUserUseCase = new RegisterUserUseCase(
      this.userRepository,
      this.passwordHasher,
      this.jwtService
    );

    this.loginUserUseCase = new LoginUserUseCase(
      this.userRepository,
      this.passwordHasher,
      this.jwtService
    );

    this.getCurrentUserUseCase = new GetCurrentUserUseCase(
      this.userRepository
    );

    this.upsertReadingStatusUseCase = new UpsertReadingStatusUseCase(
      this.readingStatusRepository,
      this.bookRepository
    );

    this.getReadingStatusUseCase = new GetReadingStatusUseCase(
      this.readingStatusRepository,
      this.bookRepository
    );

    this.getUserBooksByStatusUseCase = new GetUserBooksByStatusUseCase(
      this.readingStatusRepository,
      this.bookRepository,
      this.bookLikeRepository
    );

    this.createReviewUseCase = new CreateReviewUseCase(
      this.reviewRepository,
      this.bookRepository,
      this.userRepository,
      this.likeRepository
    );

    this.getBookReviewsUseCase = new GetBookReviewsUseCase(
      this.reviewRepository,
      this.userRepository,
      this.likeRepository,
      this.bookRepository
    );

    this.updateReviewUseCase = new UpdateReviewUseCase(
      this.reviewRepository,
      this.bookRepository
    );

    this.deleteReviewUseCase = new DeleteReviewUseCase(
      this.reviewRepository,
      this.bookRepository
    );

    this.toggleLikeUseCase = new ToggleLikeUseCase(
      this.likeRepository,
      this.reviewRepository
    );

    this.getUserLikedReviewsUseCase = new GetUserLikedReviewsUseCase(
      this.likeRepository,
      this.reviewRepository,
      this.userRepository
    );

    this.toggleBookLikeUseCase = new ToggleBookLikeUseCase(
      this.bookLikeRepository,
      this.bookRepository
    );

    this.getUserLikedBooksUseCase = new GetUserLikedBooksUseCase(
      this.bookLikeRepository,
      this.bookRepository,
      this.readingStatusRepository
    );

    this.getBooksMetadataUseCase = new GetBooksMetadataUseCase(
      this.bookRepository,
      this.bookLikeRepository
    );

    this.searchGoogleBooksUseCase = new SearchGoogleBooksUseCase();

    // Controllers層の初期化
    this.authController = new AuthController(
      this.registerUserUseCase,
      this.loginUserUseCase,
      this.getCurrentUserUseCase
    );

    this.readingStatusController = new ReadingStatusController(
      this.upsertReadingStatusUseCase,
      this.getReadingStatusUseCase,
      this.getUserBooksByStatusUseCase
    );

    this.reviewController = new ReviewController(
      this.createReviewUseCase,
      this.getBookReviewsUseCase,
      this.updateReviewUseCase,
      this.deleteReviewUseCase
    );

    this.likeController = new LikeController(
      this.toggleLikeUseCase,
      this.getUserLikedReviewsUseCase
    );

    this.bookLikeController = new BookLikeController(
      this.toggleBookLikeUseCase,
      this.getUserLikedBooksUseCase
    );

    this.bookController = new BookController(
      this.getBooksMetadataUseCase
    );

    this.googleBooksController = new GoogleBooksController(
      this.searchGoogleBooksUseCase
    );
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(prisma: PrismaClient): Container {
    if (!Container.instance) {
      Container.instance = new Container(prisma);
    }
    return Container.instance;
  }
}

