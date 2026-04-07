import { IReadingStatusRepository } from '../../domain/repositories/IReadingStatusRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IBookLikeRepository } from '../../domain/repositories/IBookLikeRepository';

export interface BooksByStatusDto {
  googleBooksId: string;
  title: string;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  description: string | null;
  isbn10: string | null;
  isbn13: string | null;
  pageCount: number | null;
  thumbnailUrl: string | null;
  language: string;
  status: string;
  likesCount: number;
  averageRating?: number;
}

/**
 * ユーザーの読書ステータス別の本一覧を取得するユースケース
 */
export class GetUserBooksByStatusUseCase {
  constructor(
    private readonly readingStatusRepository: IReadingStatusRepository,
    private readonly bookRepository: IBookRepository,
    private readonly bookLikeRepository: IBookLikeRepository
  ) {}

  async execute(userId: string, status?: string): Promise<BooksByStatusDto[]> {
    // ユーザーの読書ステータスを取得
    const readingStatuses = await this.readingStatusRepository.findByUserId(userId);

    // statusが指定されている場合はフィルタリング
    const filteredStatuses = status
      ? readingStatuses.filter((rs) => rs.status === status)
      : readingStatuses;

    // 各本の詳細情報を取得
    const books = await Promise.all(
      filteredStatuses.map(async (rs) => {
        const book = await this.bookRepository.findById(rs.bookId);
        if (!book) return null;

        // いいね数を取得
        const likesCount = await this.bookLikeRepository.countByBookId(book.id);

        // 平均評価を取得
        const averageRating = await this.bookRepository.getAverageRating(book.id);

        return {
          googleBooksId: book.googleBooksId,
          title: book.title,
          authors: book.authors.split(', ').filter(a => a.trim()),
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          description: book.description,
          isbn10: book.isbn10,
          isbn13: book.isbn13,
          pageCount: book.pageCount,
          thumbnailUrl: book.thumbnailUrl,
          language: book.language,
          status: rs.status,
          likesCount,
          averageRating: averageRating || undefined,
        };
      })
    );

    // nullを除外
    return books.filter(book => book !== null) as BooksByStatusDto[];
  }
}
