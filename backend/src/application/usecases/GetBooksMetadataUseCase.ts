import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IBookLikeRepository } from '../../domain/repositories/IBookLikeRepository';

export interface BookMetadataDto {
  googleBooksId: string;
  averageRating: number | null;
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

/**
 * 複数の本のメタデータ（平均評価、いいね数など）を取得するユースケース
 */
export class GetBooksMetadataUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly bookLikeRepository: IBookLikeRepository
  ) {}

  async execute(userId: string, googleBooksIds: string[]): Promise<BookMetadataDto[]> {
    const books = await this.bookRepository.findManyByGoogleBooksIds(googleBooksIds);
    const booksMap = new Map(books.map((b) => [b.googleBooksId, b]));

    const existingBookIds = books.map((b) => b.id);

    const [likesCounts, averageRatings, userLikes] = await Promise.all([
      existingBookIds.length > 0
        ? this.bookLikeRepository.countManyByBookIds(existingBookIds)
        : Promise.resolve({} as Record<string, number>),
      existingBookIds.length > 0
        ? this.bookRepository.getAverageRatings(existingBookIds)
        : Promise.resolve({} as Record<string, number | null>),
      existingBookIds.length > 0
        ? this.bookLikeRepository.findManyByUserAndBookIds(userId, existingBookIds)
        : Promise.resolve({} as Record<string, any>),
    ]);

    return googleBooksIds.map((googleBooksId) => {
      const book = booksMap.get(googleBooksId);
      if (!book) {
        return { googleBooksId, averageRating: null, likesCount: 0, isLikedByCurrentUser: false };
      }
      return {
        googleBooksId,
        averageRating: averageRatings[book.id] ?? null,
        likesCount: likesCounts[book.id] ?? 0,
        isLikedByCurrentUser: !!userLikes[book.id],
      };
    });
  }
}
