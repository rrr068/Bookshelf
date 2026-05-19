/**
 * Postエンティティ
 * 書籍に対するユーザーの読書感想投稿
 */
export class Post {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly title: string,
    public readonly body: string,
    public readonly rating: number | null,
    public readonly spoiler: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    userId: string,
    bookId: string,
    title: string,
    body: string,
    rating?: number,
    spoiler: boolean = false
  ): Post {
    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      throw new Error('Rating must be between 1 and 5');
    }
    return new Post('', userId, bookId, title, body, rating ?? null, spoiler, new Date(), new Date());
  }

  update(title: string, body: string, rating?: number, spoiler?: boolean): Post {
    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      throw new Error('Rating must be between 1 and 5');
    }
    return new Post(
      this.id, this.userId, this.bookId,
      title, body,
      rating !== undefined ? rating : this.rating,
      spoiler !== undefined ? spoiler : this.spoiler,
      this.createdAt, new Date()
    );
  }
}
