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
   * いいねを保存
   */
  save(like: Like): Promise<Like>;

  /**
   * いいねを削除
   */
  delete(id: string): Promise<void>;
}
