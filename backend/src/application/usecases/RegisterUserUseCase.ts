import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { IJwtService } from '../interfaces/IJwtService';
import { RegisterUserRequestDto, AuthResponseDto } from '../dto/auth.dto';

/**
 * ユーザー登録ユースケース
 * ビジネスフローをオーケストレーション
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(request: RegisterUserRequestDto): Promise<AuthResponseDto> {
    const { email, password, username } = request;

    // ビジネスルール検証（ドメイン層）
    if (!User.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!User.isValidPasswordLength(password)) {
      throw new Error('Password must be at least 8 characters');
    }

    if (!User.isValidUsername(username)) {
      throw new Error('Username must be between 1 and 50 characters');
    }

    // 重複チェック
    const existingUser = await this.userRepository.existsByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // パスワードのハッシュ化
    const passwordHash = await this.passwordHasher.hash(password);

    // ユーザーエンティティ生成
    const user = User.create(email, passwordHash, username);

    // 永続化
    const savedUser = await this.userRepository.save(user);

    // JWTトークン生成
    const token = this.jwtService.generateToken({
      userId: savedUser.id,
      email: savedUser.email,
    });

    // レスポンス生成
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
      },
      token,
    };
  }
}
