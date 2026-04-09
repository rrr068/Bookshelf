import { PrismaClient } from '@prisma/client';
import { Book } from '../../../domain/entities/Book';
import { IBookRepository } from '../../../domain/repositories/IBookRepository';

/**
 * Prismaを使用した書籍リポジトリの実装
 */
export class BookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Google Books IDで書籍を検索
   */
  async findByGoogleBooksId(googleBooksId: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({
      where: { googleBooksId },
    });

    if (!book) {
      return null;
    }

    return this.mapToEntity(book);
  }

  /**
   * IDで書籍を検索
   */
  async findById(id: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return null;
    }

    return this.mapToEntity(book);
  }

  /**
   * 書籍を保存
   */
  async save(book: Book): Promise<Book> {
    // 新規作成の場合
    if (!book.id) {
      const created = await this.prisma.book.create({
        data: {
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
          createdBy: book.createdBy,
        },
      });

      return this.mapToEntity(created);
    }

    // 更新の場合
    const updated = await this.prisma.book.update({
      where: { id: book.id },
      data: {
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
      },
    });

    return this.mapToEntity(updated);
  }

  /**
   * 複数の書籍を取得
   */
  async findMany(ids: string[]): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return books.map((book) => this.mapToEntity(book));
  }

  /**
   * 書籍の平均評価を取得
   */
  async getAverageRating(bookId: string): Promise<number | null> {
    const result = await this.prisma.review.aggregate({
      where: {
        bookId,
        rating: {
          not: null,
        },
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating;
  }

  /**
   * 複数の書籍の平均評価を一括取得
   */
  async getAverageRatings(bookIds: string[]): Promise<Record<string, number | null>> {
    const results = await this.prisma.review.groupBy({
      by: ['bookId'],
      where: { bookId: { in: bookIds }, rating: { not: null } },
      _avg: { rating: true },
    });
    const ratingMap: Record<string, number | null> = {};
    for (const r of results) {
      ratingMap[r.bookId] = r._avg.rating;
    }
    return ratingMap;
  }

  /**
   * 複数のGoogle Books IDで書籍を一括取得
   */
  async findManyByGoogleBooksIds(googleBooksIds: string[]): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: { googleBooksId: { in: googleBooksIds } },
    });
    return books.map((b) => this.mapToEntity(b));
  }

  /**
   * PrismaのBookモデルをドメインエンティティにマッピング
   */
  private mapToEntity(prismaBook: any): Book {
    return new Book(
      prismaBook.id,
      prismaBook.googleBooksId,
      prismaBook.title,
      prismaBook.authors || '',
      prismaBook.publisher,
      prismaBook.publishedDate,
      prismaBook.description,
      prismaBook.isbn10,
      prismaBook.isbn13,
      prismaBook.pageCount,
      prismaBook.thumbnailUrl,
      prismaBook.language,
      prismaBook.createdBy,
      prismaBook.createdAt,
      prismaBook.updatedAt
    );
  }
}
