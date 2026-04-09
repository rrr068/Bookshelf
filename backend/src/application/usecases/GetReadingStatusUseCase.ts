import { IReadingStatusRepository } from '../../domain/repositories/IReadingStatusRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { ReadingStatusResponseDto } from '../dto/readingStatus.dto';

/**
 * 読書ステータス取得ユースケース
 */
export class GetReadingStatusUseCase {
  constructor(
    private readonly readingStatusRepository: IReadingStatusRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string, bookId: string): Promise<ReadingStatusResponseDto | null> {
    // Google Books IDで書籍を検索
    const book = await this.bookRepository.findByGoogleBooksId(bookId);

    if (!book) {
      return null;
    }

    // 読書ステータスを取得
    const status = await this.readingStatusRepository.findByUserAndBook(userId, book.id);

    if (!status) {
      return null;
    }

    return {
      id: status.id,
      userId: status.userId,
      bookId: status.bookId,
      status: status.status,
      startedAt: status.startedAt?.toISOString() || null,
      finishedAt: status.finishedAt?.toISOString() || null,
      createdAt: status.createdAt.toISOString(),
      updatedAt: status.updatedAt.toISOString(),
    };
  }
}
