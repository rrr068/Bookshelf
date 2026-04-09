/**
 * 読書ステータスの種類
 */
export type Status = 'want_to_read' | 'reading' | 'completed' | 'on_hold' | 'dropped';

/**
 * ReadingStatusエンティティ
 * ユーザーと書籍の関係を管理
 */
export class ReadingStatus {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly status: Status,
    public readonly startedAt: Date | null,
    public readonly finishedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * ビジネスルール: ステータスが有効か検証
   */
  static isValidStatus(status: string): status is Status {
    return ['want_to_read', 'reading', 'completed', 'on_hold', 'dropped'].includes(status);
  }

  /**
   * ファクトリメソッド: 新規読書ステータスを生成
   */
  static create(
    userId: string,
    bookId: string,
    status: Status,
    startedAt?: Date,
    finishedAt?: Date
  ): ReadingStatus {
    if (!this.isValidStatus(status)) {
      throw new Error('Invalid reading status');
    }

    return new ReadingStatus(
      '',
      userId,
      bookId,
      status,
      startedAt || null,
      finishedAt || null,
      new Date(),
      new Date()
    );
  }

  /**
   * ステータスを更新
   */
  updateStatus(newStatus: Status): ReadingStatus {
    const now = new Date();
    let startedAt = this.startedAt;
    let finishedAt = this.finishedAt;

    // 読書中に変更した場合、開始日時を設定
    if (newStatus === 'reading' && !startedAt) {
      startedAt = now;
    }

    // 読了に変更した場合、終了日時を設定
    if (newStatus === 'completed' && !finishedAt) {
      finishedAt = now;
    }

    return new ReadingStatus(
      this.id,
      this.userId,
      this.bookId,
      newStatus,
      startedAt,
      finishedAt,
      this.createdAt,
      now
    );
  }
}
