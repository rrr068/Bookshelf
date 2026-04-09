/**
 * 本へのいいねエンティティ
 */
export class BookLike {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly createdAt: Date
  ) {}
}
