import { IReadingStatusRepository } from '../../domain/repositories/IReadingStatusRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';

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
  averageRating?: number;
}

/**
 * ユーザーの読書ステータス別の本一覧を取得するユースケース
 */
export class GetUserBooksByStatusUseCase {
  constructor(
    private readonly readingStatusRepository: IReadingStatusRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string, status?: string): Promise<BooksByStatusDto[]> {
    const readingStatuses = await this.readingStatusRepository.findByUserId(userId);

    const filteredStatuses = status
      ? readingStatuses.filter((rs) => rs.status === status)
      : readingStatuses;

    if (filteredStatuses.length === 0) {
      return [];
    }

    const bookIds = filteredStatuses.map((rs) => rs.bookId);

    const [books, averageRatings] = await Promise.all([
      this.bookRepository.findMany(bookIds),
      this.bookRepository.getAverageRatings(bookIds),
    ]);

    const statusMap = new Map(filteredStatuses.map((rs) => [rs.bookId, rs]));

    return books
      .filter((book) => statusMap.has(book.id))
      .map((book) => {
        const rs = statusMap.get(book.id)!;
        return {
          googleBooksId: book.googleBooksId,
          title: book.title,
          authors: book.authors.split(', ').filter((a) => a.trim()),
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          description: book.description,
          isbn10: book.isbn10,
          isbn13: book.isbn13,
          pageCount: book.pageCount,
          thumbnailUrl: book.thumbnailUrl,
          language: book.language,
          status: rs.status,
          averageRating: averageRatings[book.id] || undefined,
        };
      });
  }
}
