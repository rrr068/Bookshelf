import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../database/repositories/UserRepository';
import { BookRepository } from '../database/repositories/BookRepository';
import { ReadingStatusRepository } from '../database/repositories/ReadingStatusRepository';
import { ReviewRepository } from '../database/repositories/ReviewRepository';
import { LikeRepository } from '../database/repositories/LikeRepository';
import { PasswordHasher } from '../auth/PasswordHasher';
import { JwtService } from '../auth/JwtService';
import { RegisterUserUseCase } from '../../application/usecases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/usecases/LoginUserUseCase';
import { GetCurrentUserUseCase } from '../../application/usecases/GetCurrentUserUseCase';
import { UpsertReadingStatusUseCase } from '../../application/usecases/UpsertReadingStatusUseCase';
import { GetReadingStatusUseCase } from '../../application/usecases/GetReadingStatusUseCase';
import { CreateReviewUseCase } from '../../application/usecases/CreateReviewUseCase';
import { ToggleLikeUseCase } from '../../application/usecases/ToggleLikeUseCase';
import { GetUserLikedReviewsUseCase } from '../../application/usecases/GetUserLikedReviewsUseCase';
import { AuthController } from '../../presentation/controllers/AuthController';
import { ReadingStatusController } from '../../presentation/controllers/ReadingStatusController';
import { ReviewController } from '../../presentation/controllers/ReviewController';
import { LikeController } from '../../presentation/controllers/LikeController';

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

  // Infrastructure - Services
  public readonly passwordHasher: PasswordHasher;
  public readonly jwtService: JwtService;

  // Use Cases
  public readonly registerUserUseCase: RegisterUserUseCase;
  public readonly loginUserUseCase: LoginUserUseCase;
  public readonly getCurrentUserUseCase: GetCurrentUserUseCase;
  public readonly upsertReadingStatusUseCase: UpsertReadingStatusUseCase;
  public readonly getReadingStatusUseCase: GetReadingStatusUseCase;
  public readonly createReviewUseCase: CreateReviewUseCase;
  public readonly toggleLikeUseCase: ToggleLikeUseCase;
  public readonly getUserLikedReviewsUseCase: GetUserLikedReviewsUseCase;

  // Controllers
  public readonly authController: AuthController;
  public readonly readingStatusController: ReadingStatusController;
  public readonly reviewController: ReviewController;
  public readonly likeController: LikeController;

  private constructor(prisma: PrismaClient) {
    // Infrastructure層 - Repositoriesの初期化
    this.userRepository = new UserRepository(prisma);
    this.bookRepository = new BookRepository(prisma);
    this.readingStatusRepository = new ReadingStatusRepository(prisma);
    this.reviewRepository = new ReviewRepository(prisma);
    this.likeRepository = new LikeRepository(prisma);

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

    this.createReviewUseCase = new CreateReviewUseCase(
      this.reviewRepository,
      this.bookRepository,
      this.userRepository,
      this.likeRepository
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

    // Controllers層の初期化
    this.authController = new AuthController(
      this.registerUserUseCase,
      this.loginUserUseCase,
      this.getCurrentUserUseCase
    );

    this.readingStatusController = new ReadingStatusController(
      this.upsertReadingStatusUseCase,
      this.getReadingStatusUseCase
    );

    this.reviewController = new ReviewController(
      this.createReviewUseCase
    );

    this.likeController = new LikeController(
      this.toggleLikeUseCase,
      this.getUserLikedReviewsUseCase
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

