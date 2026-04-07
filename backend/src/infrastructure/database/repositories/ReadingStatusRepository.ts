import { PrismaClient } from '@prisma/client';
import { ReadingStatus, Status } from '../../../domain/entities/ReadingStatus';
import { IReadingStatusRepository } from '../../../domain/repositories/IReadingStatusRepository';

/**
 * Prismaを使用した読書ステータスリポジトリの実装
 */
export class ReadingStatusRepository implements IReadingStatusRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ユーザーと書籍の組み合わせで読書ステータスを検索
   */
  async findByUserAndBook(userId: string, bookId: string): Promise<ReadingStatus | null> {
    const status = await this.prisma.readingStatus.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!status) {
      return null;
    }

    return this.mapToEntity(status);
  }

  /**
   * ユーザーの読書ステータス一覧を取得
   */
  async findByUserId(userId: string, status?: Status): Promise<ReadingStatus[]> {
    const statuses = await this.prisma.readingStatus.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return statuses.map((s) => this.mapToEntity(s));
  }

  /**
   * 読書ステータスを保存
   */
  async save(readingStatus: ReadingStatus): Promise<ReadingStatus> {
    // 新規作成の場合
    if (!readingStatus.id) {
      const created = await this.prisma.readingStatus.create({
        data: {
          userId: readingStatus.userId,
          bookId: readingStatus.bookId,
          status: readingStatus.status,
          startedAt: readingStatus.startedAt,
          finishedAt: readingStatus.finishedAt,
        },
      });

      return this.mapToEntity(created);
    }

    // 更新の場合
    const updated = await this.prisma.readingStatus.update({
      where: { id: readingStatus.id },
      data: {
        status: readingStatus.status,
        startedAt: readingStatus.startedAt,
        finishedAt: readingStatus.finishedAt,
      },
    });

    return this.mapToEntity(updated);
  }

  /**
   * 読書ステータスを削除
   */
  async delete(id: string): Promise<void> {
    await this.prisma.readingStatus.delete({
      where: { id },
    });
  }

  /**
   * PrismaのReadingStatusモデルをドメインエンティティにマッピング
   */
  private mapToEntity(prismaStatus: any): ReadingStatus {
    return new ReadingStatus(
      prismaStatus.id,
      prismaStatus.userId,
      prismaStatus.bookId,
      prismaStatus.status as Status,
      prismaStatus.startedAt,
      prismaStatus.finishedAt,
      prismaStatus.createdAt,
      prismaStatus.updatedAt
    );
  }
}
