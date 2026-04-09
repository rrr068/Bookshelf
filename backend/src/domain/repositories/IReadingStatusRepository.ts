import { ReadingStatus, Status } from '../entities/ReadingStatus';

/**
 * 読書ステータスリポジトリのインターフェース
 */
export interface IReadingStatusRepository {
  /**
   * ユーザーと書籍の組み合わせで読書ステータスを検索
   */
  findByUserAndBook(userId: string, bookId: string): Promise<ReadingStatus | null>;

  /**
   * ユーザーの読書ステータス一覧を取得
   */
  findByUserId(userId: string, status?: Status): Promise<ReadingStatus[]>;

  /**
   * 読書ステータスを保存
   */
  save(readingStatus: ReadingStatus): Promise<ReadingStatus>;

  /**
   * 読書ステータスを削除
   */
  delete(id: string): Promise<void>;

  /**
   * ユーザーの複数の本の読書ステータスを一括取得
   */
  findManyByUserAndBookIds(userId: string, bookIds: string[]): Promise<Record<string, ReadingStatus>>;
}
