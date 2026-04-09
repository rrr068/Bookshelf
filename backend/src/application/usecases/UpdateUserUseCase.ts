import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { User } from '../../domain/entities/User';

export interface UpdateUserRequestDto {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateUserResponseDto {
  id: string;
  email: string;
  username: string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(userId: string, request: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (request.username !== undefined && !User.isValidUsername(request.username)) {
      throw new Error('Username must be between 1 and 50 characters');
    }

    let newPasswordHash = user.passwordHash;
    if (request.newPassword) {
      if (!request.currentPassword) {
        throw new Error('Current password is required to change password');
      }
      const isValid = await this.passwordHasher.compare(request.currentPassword, user.passwordHash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }
      if (!User.isValidPasswordLength(request.newPassword)) {
        throw new Error('New password must be at least 8 characters');
      }
      newPasswordHash = await this.passwordHasher.hash(request.newPassword);
    }

    const updatedUser = new User(
      user.id,
      user.email,
      newPasswordHash,
      request.username ?? user.username,
      user.createdAt,
      new Date()
    );

    const saved = await this.userRepository.save(updatedUser);
    return {
      id: saved.id,
      email: saved.email,
      username: saved.username,
    };
  }
}
