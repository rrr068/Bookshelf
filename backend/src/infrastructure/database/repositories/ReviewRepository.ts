import { PrismaClient } from '@prisma/client';
import { Review } from '../../../domain/entities/Review';
import { IReviewRepository } from '../../../domain/repositories/IReviewRepository';

/**
 * Prismaを使用したレビューリポジトリの実装
 */
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * IDでレビューを検索
   */
  async findById(id: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return null;
    }

    return this.mapToEntity(review);
  }

  /**
   * ユーザーと書籍の組み合わせでレビューを検索
   */
  async findByUserAndBook(userId: string, bookId: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!review) {
      return null;
    }

    return this.mapToEntity(review);
  }

  /**
   * 書籍のレビュー一覧を取得
   */
  async findByBookId(bookId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { bookId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((r) => this.mapToEntity(r));
  }

  /**
   * ユーザーのレビュー一覧を取得
   */
  async findByUserId(userId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((r) => this.mapToEntity(r));
  }

  /**
   * レビューを保存
   */
  async save(review: Review): Promise<Review> {
    // 新規作成の場合
    if (!review.id) {
      const created = await this.prisma.review.create({
        data: {
          userId: review.userId,
          bookId: review.bookId,
          rating: review.rating,
          comment: review.comment,
        },
      });

      return this.mapToEntity(created);
    }

    // 更新の場合
    const updated = await this.prisma.review.update({
      where: { id: review.id },
      data: {
        rating: review.rating,
        comment: review.comment,
      },
    });

    return this.mapToEntity(updated);
  }

  /**
   * レビューを削除
   */
  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  /**
   * PrismaのReviewモデルをドメインエンティティにマッピング
   */
  private mapToEntity(prismaReview: any): Review {
    return new Review(
      prismaReview.id,
      prismaReview.userId,
      prismaReview.bookId,
      prismaReview.rating,
      prismaReview.comment,
      prismaReview.createdAt,
      prismaReview.updatedAt
    );
  }
}
