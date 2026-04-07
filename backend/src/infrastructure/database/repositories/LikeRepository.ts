import { PrismaClient } from '@prisma/client';
import { Like } from '../../../domain/entities/Like';
import { ILikeRepository } from '../../../domain/repositories/ILikeRepository';

/**
 * Prismaを使用したいいねリポジトリの実装
 */
export class LikeRepository implements ILikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ユーザーとレビューの組み合わせでいいねを検索
   */
  async findByUserAndReview(userId: string, reviewId: string): Promise<Like | null> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    if (!like) {
      return null;
    }

    return this.mapToEntity(like);
  }

  /**
   * ユーザーがいいねしたレビューIDの一覧を取得
   */
  async findReviewIdsByUserId(userId: string): Promise<string[]> {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      select: { reviewId: true },
    });

    return likes.map((like) => like.reviewId);
  }

  /**
   * レビューのいいね数を取得
   */
  async countByReviewId(reviewId: string): Promise<number> {
    return await this.prisma.like.count({
      where: { reviewId },
    });
  }

  /**
   * いいねを保存
   */
  async save(like: Like): Promise<Like> {
    const created = await this.prisma.like.create({
      data: {
        userId: like.userId,
        reviewId: like.reviewId,
      },
    });

    return this.mapToEntity(created);
  }

  /**
   * いいねを削除
   */
  async delete(id: string): Promise<void> {
    await this.prisma.like.delete({
      where: { id },
    });
  }

  /**
   * PrismaのLikeモデルをドメインエンティティにマッピング
   */
  private mapToEntity(prismaLike: any): Like {
    return new Like(
      prismaLike.id,
      prismaLike.userId,
      prismaLike.reviewId,
      prismaLike.createdAt
    );
  }
}
