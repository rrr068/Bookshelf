/**
 * Likeエンティティ
 * レビューに対するいいね
 */
export class Like {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly reviewId: string,
    public readonly createdAt: Date
  ) {}

  /**
   * ファクトリメソッド: 新規いいねを生成
   */
  static create(userId: string, reviewId: string): Like {
    return new Like('', userId, reviewId, new Date());
  }
}
