import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { UserResponseDto } from '../dto/auth.dto';

/**
 * 現在のユーザー情報取得ユースケース
 */
export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // お気に入り本の詳細を取得
    let favoriteBooks: UserResponseDto['favoriteBooks'] = [];
    if (user.favoriteBookIds.length > 0) {
      const books = await this.bookRepository.findManyByGoogleBooksIds(user.favoriteBookIds);
      favoriteBooks = user.favoriteBookIds
        .map((gid) => {
          const book = books.find((b) => b.googleBooksId === gid);
          if (!book) return null;
          return {
            googleBooksId: book.googleBooksId,
            title: book.title,
            thumbnailUrl: book.thumbnailUrl ?? null,
          };
        })
        .filter((b): b is NonNullable<typeof b> => b !== null);
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      goal: user.goal,
      favoriteBooks,
    };
  }
}
