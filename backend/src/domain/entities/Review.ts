/**
 * Reviewエンティティ
 * 書籍に対するユーザーのレビュー
 */
export class Review {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly rating: number | null,
    public readonly comment: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * ビジネスルール: 評価が有効か検証（1〜5の範囲）
   */
  static isValidRating(rating: number): boolean {
    return rating >= 1 && rating <= 5 && Number.isInteger(rating);
  }

  /**
   * ビジネスルール: コメントが有効か検証
   */
  static isValidComment(comment: string | null): boolean {
    if (comment === null) return true;
    return comment.length <= 1000;
  }

  /**
   * ファクトリメソッド: 新規レビューを生成
   */
  static create(
    userId: string,
    bookId: string,
    rating: number | undefined,
    comment: string | null = null
  ): Review {
    if (rating !== undefined && !this.isValidRating(rating)) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!this.isValidComment(comment)) {
      throw new Error('Comment must be 1000 characters or less');
    }

    return new Review(
      '',
      userId,
      bookId,
      rating ?? null,
      comment,
      new Date(),
      new Date()
    );
  }

  /**
   * レビューを更新
   */
  update(rating: number | undefined, comment: string | null): Review {
    if (rating !== undefined && !Review.isValidRating(rating)) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!Review.isValidComment(comment)) {
      throw new Error('Comment must be 1000 characters or less');
    }

    return new Review(
      this.id,
      this.userId,
      this.bookId,
      rating ?? null,
      comment,
      this.createdAt,
      new Date()
    );
  }
}
