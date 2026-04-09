import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../database/repositories/UserRepository';
import { BookRepository } from '../database/repositories/BookRepository';
import { ReadingStatusRepository } from '../database/repositories/ReadingStatusRepository';
import { PostRepository } from '../database/repositories/PostRepository';
import { PostLikeRepository } from '../database/repositories/PostLikeRepository';
import { BookLikeRepository } from '../database/repositories/BookLikeRepository';
import { PasswordHasher } from '../auth/PasswordHasher';
import { JwtService } from '../auth/JwtService';
import { RegisterUserUseCase } from '../../application/usecases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/usecases/LoginUserUseCase';
import { GetCurrentUserUseCase } from '../../application/usecases/GetCurrentUserUseCase';
import { UpsertReadingStatusUseCase } from '../../application/usecases/UpsertReadingStatusUseCase';
import { GetReadingStatusUseCase } from '../../application/usecases/GetReadingStatusUseCase';
import { GetUserBooksByStatusUseCase } from '../../application/usecases/GetUserBooksByStatusUseCase';
import { CreatePostUseCase } from '../../application/usecases/CreatePostUseCase';
import { GetBookPostsUseCase } from '../../application/usecases/GetBookPostsUseCase';
import { GetTimelineUseCase } from '../../application/usecases/GetTimelineUseCase';
import { UpdatePostUseCase } from '../../application/usecases/UpdatePostUseCase';
import { DeletePostUseCase } from '../../application/usecases/DeletePostUseCase';
import { TogglePostLikeUseCase } from '../../application/usecases/TogglePostLikeUseCase';
import { ToggleBookLikeUseCase } from '../../application/usecases/ToggleBookLikeUseCase';
import { GetUserLikedBooksUseCase } from '../../application/usecases/GetUserLikedBooksUseCase';
import { GetBooksMetadataUseCase } from '../../application/usecases/GetBooksMetadataUseCase';
import { SearchGoogleBooksUseCase } from '../../application/usecases/SearchGoogleBooksUseCase';
import { AuthController } from '../../presentation/controllers/AuthController';
import { BookController } from '../../presentation/controllers/BookController';
import { GoogleBooksController } from '../../presentation/controllers/GoogleBooksController';
import { ReadingStatusController } from '../../presentation/controllers/ReadingStatusController';
import { PostController } from '../../presentation/controllers/PostController';
import { PostLikeController } from '../../presentation/controllers/PostLikeController';
import { BookLikeController } from '../../presentation/controllers/BookLikeController';
import { DashboardController } from '../../presentation/controllers/DashboardController';
import { GetUserDashboardUseCase } from '../../application/usecases/GetUserDashboardUseCase';

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
  public readonly postRepository: PostRepository;
  public readonly postLikeRepository: PostLikeRepository;
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
  public readonly createPostUseCase: CreatePostUseCase;
  public readonly getBookPostsUseCase: GetBookPostsUseCase;
  public readonly getTimelineUseCase: GetTimelineUseCase;
  public readonly updatePostUseCase: UpdatePostUseCase;
  public readonly deletePostUseCase: DeletePostUseCase;
  public readonly togglePostLikeUseCase: TogglePostLikeUseCase;
  public readonly toggleBookLikeUseCase: ToggleBookLikeUseCase;
  public readonly getUserLikedBooksUseCase: GetUserLikedBooksUseCase;
  public readonly getBooksMetadataUseCase: GetBooksMetadataUseCase;
  public readonly searchGoogleBooksUseCase: SearchGoogleBooksUseCase;
  public readonly getUserDashboardUseCase: GetUserDashboardUseCase;

  // Controllers
  public readonly authController: AuthController;
  public readonly readingStatusController: ReadingStatusController;
  public readonly postController: PostController;
  public readonly postLikeController: PostLikeController;
  public readonly bookLikeController: BookLikeController;
  public readonly bookController: BookController;
  public readonly googleBooksController: GoogleBooksController;
  public readonly dashboardController: DashboardController;

  private constructor(prisma: PrismaClient) {
    // Infrastructure層 - Repositoriesの初期化
    this.userRepository = new UserRepository(prisma);
    this.bookRepository = new BookRepository(prisma);
    this.readingStatusRepository = new ReadingStatusRepository(prisma);
    this.postRepository = new PostRepository(prisma);
    this.postLikeRepository = new PostLikeRepository(prisma);
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

    this.createPostUseCase = new CreatePostUseCase(
      this.postRepository,
      this.bookRepository,
      this.userRepository,
      this.postLikeRepository
    );

    this.getBookPostsUseCase = new GetBookPostsUseCase(
      this.postRepository,
      this.userRepository,
      this.postLikeRepository,
      this.bookRepository
    );

    this.getTimelineUseCase = new GetTimelineUseCase(
      this.postRepository,
      this.userRepository,
      this.postLikeRepository,
      this.bookRepository
    );

    this.updatePostUseCase = new UpdatePostUseCase(
      this.postRepository
    );

    this.deletePostUseCase = new DeletePostUseCase(
      this.postRepository
    );

    this.togglePostLikeUseCase = new TogglePostLikeUseCase(
      this.postLikeRepository,
      this.postRepository
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

    this.getUserDashboardUseCase = new GetUserDashboardUseCase(
      this.readingStatusRepository,
      this.bookRepository
    );

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

    this.postController = new PostController(
      this.createPostUseCase,
      this.getBookPostsUseCase,
      this.getTimelineUseCase,
      this.updatePostUseCase,
      this.deletePostUseCase
    );

    this.postLikeController = new PostLikeController(
      this.togglePostLikeUseCase
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

    this.dashboardController = new DashboardController(
      this.getUserDashboardUseCase
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
