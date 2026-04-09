import { Review } from '../entities/Review';

/**
 * レビューリポジトリのインターフェース
 */
export interface IReviewRepository {
  /**
   * IDでレビューを検索
   */
  findById(id: string): Promise<Review | null>;

  /**
   * 複数のIDでレビューを一括取得
   */
  findManyByIds(ids: string[]): Promise<Review[]>;

  /**
   * ユーザーと書籍の組み合わせでレビューを検索
   */
  findByUserAndBook(userId: string, bookId: string): Promise<Review | null>;

  /**
   * 書籍のレビュー一覧を取得
   */
  findByBookId(bookId: string): Promise<Review[]>;

  /**
   * ユーザーのレビュー一覧を取得
   */
  findByUserId(userId: string): Promise<Review[]>;

  /**
   * レビューを保存
   */
  save(review: Review): Promise<Review>;

  /**
   * レビューを削除
   */
  delete(id: string): Promise<void>;
}
