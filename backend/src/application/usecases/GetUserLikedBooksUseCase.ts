import { IBookLikeRepository } from '../../domain/repositories/IBookLikeRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IReadingStatusRepository } from '../../domain/repositories/IReadingStatusRepository';

export interface BookWithStatusDto {
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
    const bookLikes = await this.bookLikeRepository.findByUserId(userId);

    if (bookLikes.length === 0) {
      return [];
    }

    const bookIds = bookLikes.map((like) => like.bookId);

    const [books, likesCounts, averageRatings, readingStatuses] = await Promise.all([
      this.bookRepository.findMany(bookIds),
      this.bookLikeRepository.countManyByBookIds(bookIds),
      this.bookRepository.getAverageRatings(bookIds),
      this.readingStatusRepository.findManyByUserAndBookIds(userId, bookIds),
    ]);

    return books.map((book) => ({
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
      likesCount: likesCounts[book.id] ?? 0,
      averageRating: averageRatings[book.id] || undefined,
      readingStatus: readingStatuses[book.id]?.status || null,
    }));
  }
}
