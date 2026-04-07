import { PrismaClient } from '@prisma/client';
import { IBookLikeRepository } from '../../../domain/repositories/IBookLikeRepository';
import { BookLike } from '../../../domain/entities/BookLike';

/**
 * 本へのいいねリポジトリ実装
 */
export class BookLikeRepository implements IBookLikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ユーザーと本のIDでいいねを検索
   */
  async findByUserAndBook(userId: string, bookId: string): Promise<BookLike | null> {
    const bookLike = await this.prisma.bookLike.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!bookLike) return null;

    return new BookLike(
      bookLike.id,
      bookLike.userId,
      bookLike.bookId,
      bookLike.createdAt
    );
  }

  /**
   * いいねを作成
   */
  async create(userId: string, bookId: string): Promise<BookLike> {
    const bookLike = await this.prisma.bookLike.create({
      data: {
        userId,
        bookId,
      },
    });

    return new BookLike(
      bookLike.id,
      bookLike.userId,
      bookLike.bookId,
      bookLike.createdAt
    );
  }

  /**
   * いいねを削除
   */
  async delete(id: string): Promise<void> {
    await this.prisma.bookLike.delete({
      where: { id },
    });
  }

  /**
   * ユーザーがいいねした本の一覧を取得
   */
  async findByUserId(userId: string): Promise<BookLike[]> {
    const bookLikes = await this.prisma.bookLike.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return bookLikes.map(
      (bl) => new BookLike(bl.id, bl.userId, bl.bookId, bl.createdAt)
    );
  }

  /**
   * 本のいいね数を取得
   */
  async countByBookId(bookId: string): Promise<number> {
    return await this.prisma.bookLike.count({
      where: { bookId },
    });
  }
}
