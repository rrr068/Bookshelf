import { PrismaClient } from '@prisma/client';
import { Post } from '../../../domain/entities/Post';
import { IPostRepository } from '../../../domain/repositories/IPostRepository';

export class PostRepository implements IPostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    return post ? this.mapToEntity(post) : null;
  }

  async findManyByIds(ids: string[]): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({ where: { id: { in: ids } } });
    return posts.map((p) => this.mapToEntity(p));
  }

  async findByBookId(bookId: string): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapToEntity(p));
  }

  async findByUserId(userId: string): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapToEntity(p));
  }

  async save(post: Post): Promise<Post> {
    if (!post.id) {
      const created = await this.prisma.post.create({
        data: {
          userId: post.userId,
          bookId: post.bookId,
          title: post.title,
          body: post.body,
          rating: post.rating,
          spoiler: post.spoiler,
        },
      });
      return this.mapToEntity(created);
    }

    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data: {
        title: post.title,
        body: post.body,
        rating: post.rating,
        spoiler: post.spoiler,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }

  private mapToEntity(p: any): Post {
    return new Post(p.id, p.userId, p.bookId, p.title, p.body, p.rating, p.spoiler, p.createdAt, p.updatedAt);
  }
}
