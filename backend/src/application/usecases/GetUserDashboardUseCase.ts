import { IReadingStatusRepository } from '../../domain/repositories/IReadingStatusRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';

export interface DashboardStatsDto {
  total: {
    want: number;
    reading: number;
    done: number;
  };
  thisMonth: {
    booksRead: number;
    pagesRead: number;
  };
  thisYear: {
    booksRead: number;
  };
}

export interface RecentBookDto {
  googleBooksId: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  description: string | null;
  publisher: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  status: string;
  updatedAt: Date;
}

export interface DashboardDto {
  stats: DashboardStatsDto;
  recentBooks: RecentBookDto[];
}

/**
 * ユーザーの読書ダッシュボード情報を取得するユースケース
 * CQRS: 集計専用のクエリとして実装
 */
export class GetUserDashboardUseCase {
  constructor(
    private readonly readingStatusRepository: IReadingStatusRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string): Promise<DashboardDto> {
    // ユーザーの全読書ステータスを取得（updatedAt降順）
    const allStatuses = await this.readingStatusRepository.findByUserId(userId);

    // ステータス別カウント
    const total = {
      want: allStatuses.filter(s => s.status === 'want_to_read').length,
      reading: allStatuses.filter(s => s.status === 'reading').length,
      done: allStatuses.filter(s => s.status === 'completed').length,
    };

    // 今月・今年の期間を定義
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const completedStatuses = allStatuses.filter(s => s.status === 'completed');
    const thisMonthCompleted = completedStatuses.filter(
      s => s.finishedAt && s.finishedAt >= startOfMonth
    );
    const thisYearCompleted = completedStatuses.filter(
      s => s.finishedAt && s.finishedAt >= startOfYear
    );

    // 今月読了した本のページ数を集計
    let pagesRead = 0;
    if (thisMonthCompleted.length > 0) {
      const bookIds = thisMonthCompleted.map(s => s.bookId);
      const books = await this.bookRepository.findMany(bookIds);
      pagesRead = books.reduce((sum, book) => sum + (book.pageCount || 0), 0);
    }

    // 最近の活動（直近5件）
    const recentStatuses = allStatuses.slice(0, 5);
    const recentBookIds = recentStatuses.map(s => s.bookId);
    const recentBooksMap = new Map<string, any>();

    if (recentBookIds.length > 0) {
      const books = await this.bookRepository.findMany(recentBookIds);
      books.forEach(book => recentBooksMap.set(book.id, book));
    }

    const recentBooks: RecentBookDto[] = recentStatuses
      .map(s => {
        const book = recentBooksMap.get(s.bookId);
        if (!book) return null;
        return {
          googleBooksId: book.googleBooksId,
          title: book.title,
          authors: book.authors
            ? book.authors.split(', ').filter((a: string) => a.trim())
            : [],
          thumbnailUrl: book.thumbnailUrl || null,
          description: book.description || null,
          publisher: book.publisher || null,
          publishedDate: book.publishedDate || null,
          pageCount: book.pageCount || null,
          status: s.status,
          updatedAt: s.updatedAt,
        };
      })
      .filter(b => b !== null) as RecentBookDto[];

    return {
      stats: {
        total,
        thisMonth: {
          booksRead: thisMonthCompleted.length,
          pagesRead,
        },
        thisYear: {
          booksRead: thisYearCompleted.length,
        },
      },
      recentBooks,
    };
  }
}
