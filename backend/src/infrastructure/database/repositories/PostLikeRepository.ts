import { PrismaClient } from '@prisma/client';
import { PostLike } from '../../../domain/entities/PostLike';
import { IPostLikeRepository } from '../../../domain/repositories/IPostLikeRepository';

export class PostLikeRepository implements IPostLikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserAndPost(userId: string, postId: string): Promise<PostLike | null> {
    const pl = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return pl ? new PostLike(pl.id, pl.userId, pl.postId, pl.createdAt) : null;
  }

  async findPostIdsByUserId(userId: string): Promise<string[]> {
    const likes = await this.prisma.postLike.findMany({
      where: { userId },
      select: { postId: true },
    });
    return likes.map((l) => l.postId);
  }

  async countByPostId(postId: string): Promise<number> {
    return this.prisma.postLike.count({ where: { postId } });
  }

  async countManyByPostIds(postIds: string[]): Promise<Record<string, number>> {
    const counts = await this.prisma.postLike.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: { postId: true },
    });
    const result: Record<string, number> = {};
    for (const c of counts) result[c.postId] = c._count.postId;
    return result;
  }

  async findManyByUserAndPostIds(userId: string, postIds: string[]): Promise<Record<string, PostLike>> {
    const likes = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
    });
    const result: Record<string, PostLike> = {};
    for (const l of likes) result[l.postId] = new PostLike(l.id, l.userId, l.postId, l.createdAt);
    return result;
  }

  async save(postLike: PostLike): Promise<PostLike> {
    const created = await this.prisma.postLike.create({
      data: { userId: postLike.userId, postId: postLike.postId },
    });
    return new PostLike(created.id, created.userId, created.postId, created.createdAt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.postLike.delete({ where: { id } });
  }
}
