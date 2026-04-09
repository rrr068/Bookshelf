import { PrismaClient } from '@prisma/client';
import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * Prismaを使用したユーザーリポジトリの実装
 * データベースへのアクセスを抽象化し、ドメインエンティティとの変換を行う
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * メールアドレスでユーザーを検索
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  /**
   * IDでユーザーを検索
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  /**
   * 複数のIDでユーザーを一括取得
   */
  async findManyByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return users.map((u) => this.mapToEntity(u));
  }

  /**
   * メールアドレスが既に登録されているかチェック
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * ユーザーを保存（新規作成 or 更新）
   */
  async save(user: User): Promise<User> {
    // 新規作成の場合（IDが空）
    if (!user.id) {
      const created = await this.prisma.user.create({
        data: {
          email: user.email,
          passwordHash: user.passwordHash,
          username: user.username,
        },
      });

      return this.mapToEntity(created);
    }

    // 更新の場合
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        username: user.username,
      },
    });

    return this.mapToEntity(updated);
  }

  /**
   * PrismaのUserモデルをドメインエンティティにマッピング
   */
  private mapToEntity(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.username,
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }
}

