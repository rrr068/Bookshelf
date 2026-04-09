import { IReadingStatusRepository } from '../../domain/repositories/IReadingStatusRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { ReadingStatus } from '../../domain/entities/ReadingStatus';
import { Book } from '../../domain/entities/Book';
import { UpsertReadingStatusRequestDto, ReadingStatusResponseDto } from '../dto/readingStatus.dto';
import { CreateBookRequestDto } from '../dto/book.dto';

/**
 * 読書ステータス登録/更新ユースケース
 */
export class UpsertReadingStatusUseCase {
  constructor(
    private readonly readingStatusRepository: IReadingStatusRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(
    userId: string,
    request: UpsertReadingStatusRequestDto,
    bookData?: CreateBookRequestDto
  ): Promise<ReadingStatusResponseDto> {
    const { bookId, status } = request;

    // 書籍が存在しない場合は作成（Google Books APIから取得したデータ）
    let book = await this.bookRepository.findByGoogleBooksId(bookId);
    if (!book && bookData) {
      book = Book.create(
        bookData.googleBooksId,
        bookData.title,
        bookData.authors,
        userId,
        {
          publisher: bookData.publisher,
          publishedDate: bookData.publishedDate,
          description: bookData.description,
          isbn10: bookData.isbn10,
          isbn13: bookData.isbn13,
          pageCount: bookData.pageCount,
          thumbnailUrl: bookData.thumbnailUrl,
          language: bookData.language,
        }
      );
      book = await this.bookRepository.save(book);
    }

    if (!book) {
      throw new Error('Book not found');
    }

    // 既存の読書ステータスを検索
    const existingStatus = await this.readingStatusRepository.findByUserAndBook(
      userId,
      book.id
    );

    let readingStatus: ReadingStatus;

    if (existingStatus) {
      // 更新
      readingStatus = existingStatus.updateStatus(status);
      readingStatus = await this.readingStatusRepository.save(readingStatus);
    } else {
      // 新規作成
      readingStatus = ReadingStatus.create(userId, book.id, status);
      readingStatus = await this.readingStatusRepository.save(readingStatus);
    }

    return {
      id: readingStatus.id,
      userId: readingStatus.userId,
      bookId: readingStatus.bookId,
      status: readingStatus.status,
      startedAt: readingStatus.startedAt?.toISOString() || null,
      finishedAt: readingStatus.finishedAt?.toISOString() || null,
      createdAt: readingStatus.createdAt.toISOString(),
      updatedAt: readingStatus.updatedAt.toISOString(),
    };
  }
}
