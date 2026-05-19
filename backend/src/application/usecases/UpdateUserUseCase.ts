import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface UpdateUserRequestDto {
  username?: string;
  goal?: string | null;
  favoriteBookIds?: string[];
}

export interface UpdateUserResponseDto {
  id: string;
  email: string;
  username: string;
  goal: string | null;
  favoriteBookIds: string[];
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, request: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (request.username !== undefined && !User.isValidUsername(request.username)) {
      throw new Error('Username must be between 1 and 50 characters');
    }

    const updatedUser = new User(
      user.id,
      user.email,
      user.passwordHash,
      request.username ?? user.username,
      user.createdAt,
      new Date(),
      request.goal !== undefined ? request.goal : user.goal,
      request.favoriteBookIds !== undefined ? request.favoriteBookIds : user.favoriteBookIds
    );

    const saved = await this.userRepository.save(updatedUser);
    return {
      id: saved.id,
      email: saved.email,
      username: saved.username,
      goal: saved.goal,
      favoriteBookIds: saved.favoriteBookIds,
    };
  }
}
