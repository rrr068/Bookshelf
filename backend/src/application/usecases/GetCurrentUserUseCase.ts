import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserResponseDto } from '../dto/auth.dto';

/**
 * 現在のユーザー情報取得ユースケース
 */
export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
