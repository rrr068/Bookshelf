import Database from 'better-sqlite3';
import { UserRepository } from '../database/repositories/UserRepository';
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

  // Infrastructure
  public readonly userRepository: UserRepository;
  public readonly passwordHasher: PasswordHasher;
  public readonly jwtService: JwtService;

  // Use Cases
  public readonly registerUserUseCase: RegisterUserUseCase;
  public readonly loginUserUseCase: LoginUserUseCase;
  public readonly getCurrentUserUseCase: GetCurrentUserUseCase;

  // Controllers
  public readonly authController: AuthController;

  private constructor(db: Database.Database) {
    // Infrastructure層の初期化
    this.userRepository = new UserRepository(db);
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
  static getInstance(db: Database.Database): Container {
    if (!Container.instance) {
      Container.instance = new Container(db);
    }
    return Container.instance;
  }
}
