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
    const metadata = await Promise.all(
      googleBooksIds.map(async (googleBooksId) => {
        const book = await this.bookRepository.findByGoogleBooksId(googleBooksId);

        if (!book) {
          return {
            googleBooksId,
            averageRating: null,
            likesCount: 0,
            isLikedByCurrentUser: false,
          };
        }

        const averageRating = await this.bookRepository.getAverageRating(book.id);
        const likesCount = await this.bookLikeRepository.countByBookId(book.id);
        const userLike = await this.bookLikeRepository.findByUserAndBook(userId, book.id);

        return {
          googleBooksId,
          averageRating,
          likesCount,
          isLikedByCurrentUser: !!userLike,
        };
      })
    );

    return metadata;
  }
}
