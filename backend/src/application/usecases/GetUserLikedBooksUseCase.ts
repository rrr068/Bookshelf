import { IBookLikeRepository } from '../../domain/repositories/IBookLikeRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IReadingStatusRepository } from '../../domain/repositories/IReadingStatusRepository';

export interface BookWithStatusDto {
  googleBooksId: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number;
  thumbnailUrl?: string;
  language: string;
  likesCount: number;
  averageRating?: number;
  readingStatus?: string | null;
}

/**
 * ユーザーがいいねした本の一覧を取得するユースケース
 */
export class GetUserLikedBooksUseCase {
  constructor(
    private readonly bookLikeRepository: IBookLikeRepository,
    private readonly bookRepository: IBookRepository,
    private readonly readingStatusRepository: IReadingStatusRepository
  ) {}

  async execute(userId: string): Promise<BookWithStatusDto[]> {
    // ユーザーのいいねを取得
    const bookLikes = await this.bookLikeRepository.findByUserId(userId);

    // 各本の詳細情報を取得
    const books = await Promise.all(
      bookLikes.map(async (like) => {
        const book = await this.bookRepository.findById(like.bookId);
        if (!book) return null;

        // いいね数を取得
        const likesCount = await this.bookLikeRepository.countByBookId(book.id);

        // 平均評価を取得
        const averageRating = await this.bookRepository.getAverageRating(book.id);

        // 読書ステータスを取得
        const readingStatus = await this.readingStatusRepository.findByUserAndBook(userId, book.id);

        return {
          googleBooksId: book.googleBooksId,
          title: book.title,
          authors: book.authors,
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          description: book.description,
          isbn10: book.isbn10,
          isbn13: book.isbn13,
          pageCount: book.pageCount,
          thumbnailUrl: book.thumbnailUrl,
          language: book.language,
          likesCount,
          averageRating: averageRating || undefined,
          readingStatus: readingStatus?.status || null,
        };
      })
    );

    // nullを除外
    return books.filter((book): book is BookWithStatusDto => book !== null);
  }
}
