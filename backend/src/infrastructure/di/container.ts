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
import { AuthController } from '../../presentation/controllers/AuthController';

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

  // Controllers
  public readonly authController: AuthController;

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

    // Controllers層の初期化
    this.authController = new AuthController(
      this.registerUserUseCase,
      this.loginUserUseCase,
      this.getCurrentUserUseCase
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

