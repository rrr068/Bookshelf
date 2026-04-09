/**
 * PostLikeエンティティ
 * 投稿へのいいね
 */
export class PostLike {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly postId: string,
    public readonly createdAt: Date
  ) {}

  static create(userId: string, postId: string): PostLike {
    return new PostLike('', userId, postId, new Date());
  }
}
