import { BookLike } from '../entities/BookLike';

/**
 * 本へのいいねリポジトリインターフェース
 */
export interface IBookLikeRepository {
  /**
   * ユーザーと本のIDでいいねを検索
   */
  findByUserAndBook(userId: string, bookId: string): Promise<BookLike | null>;

  /**
   * いいねを作成
   */
  create(userId: string, bookId: string): Promise<BookLike>;

  /**
   * いいねを削除
   */
  delete(id: string): Promise<void>;

  /**
   * ユーザーがいいねした本の一覧を取得
   */
  findByUserId(userId: string): Promise<BookLike[]>;

  /**
   * 本のいいね数を取得
   */
  countByBookId(bookId: string): Promise<number>;

  /**
   * 複数の本のいいね数を一括取得
   */
  countManyByBookIds(bookIds: string[]): Promise<Record<string, number>>;

  /**
   * ユーザーが複数の本にいいねしているかを一括取得
   */
  findManyByUserAndBookIds(userId: string, bookIds: string[]): Promise<Record<string, BookLike>>;
}
