import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { IJwtService } from '../interfaces/IJwtService';
import { LoginRequestDto, AuthResponseDto } from '../dto/auth.dto';

/**
 * ログインユースケース
 * 認証フローをオーケストレーション
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(request: LoginRequestDto): Promise<AuthResponseDto> {
    const { email, password } = request;

    // ユーザー検索
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // パスワード検証
    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // JWTトークン生成
    const token = this.jwtService.generateToken({
      userId: user.id,
      email: user.email,
    });

    // レスポンス生成
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    };
  }
}
