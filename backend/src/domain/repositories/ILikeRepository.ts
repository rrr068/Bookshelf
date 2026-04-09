import { Like } from '../entities/Like';

/**
 * いいねリポジトリのインターフェース
 */
export interface ILikeRepository {
  /**
   * ユーザーとレビューの組み合わせでいいねを検索
   */
  findByUserAndReview(userId: string, reviewId: string): Promise<Like | null>;

  /**
   * ユーザーがいいねしたレビューIDの一覧を取得
   */
  findReviewIdsByUserId(userId: string): Promise<string[]>;

  /**
   * レビューのいいね数を取得
   */
  countByReviewId(reviewId: string): Promise<number>;

  /**
   * 複数のレビューIDのいいね数を一括取得
   */
  countManyByReviewIds(reviewIds: string[]): Promise<Record<string, number>>;

  /**
   * ユーザーが複数のレビューにいいねしているかを一括取得
   */
  findManyByUserAndReviewIds(userId: string, reviewIds: string[]): Promise<Record<string, Like>>;

  /**
   * いいねを保存
   */
  save(like: Like): Promise<Like>;

  /**
   * いいねを削除
   */
  delete(id: string): Promise<void>;
}
