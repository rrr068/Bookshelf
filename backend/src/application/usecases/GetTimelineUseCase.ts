import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPostLikeRepository } from '../../domain/repositories/IPostLikeRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { PostDto } from '../dto/post.dto';

export class GetTimelineUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository,
    private readonly postLikeRepository: IPostLikeRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(currentUserId: string, limit: number = 50): Promise<PostDto[]> {
    const posts = await this.postRepository.findAll(limit);
    if (posts.length === 0) return [];

    const postIds = posts.map((p) => p.id);
    const userIds = [...new Set(posts.map((p) => p.userId))];
    const bookIds = [...new Set(posts.map((p) => p.bookId))];

    const [users, books, likesCounts, userLikes] = await Promise.all([
      this.userRepository.findManyByIds(userIds),
      this.bookRepository.findMany(bookIds),
      this.postLikeRepository.countManyByPostIds(postIds),
      this.postLikeRepository.findManyByUserAndPostIds(currentUserId, postIds),
    ]);

    const usersMap = new Map(users.map((u) => [u.id, u]));
    const booksMap = new Map(books.map((b) => [b.id, b]));

    return posts.map((post) => {
      const book = booksMap.get(post.bookId);
      return {
        id: post.id,
        userId: post.userId,
        bookId: post.bookId,
        title: post.title,
        body: post.body,
        rating: post.rating,
        spoiler: post.spoiler,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        user: {
          id: usersMap.get(post.userId)!.id,
          username: usersMap.get(post.userId)!.username,
        },
        book: book ? {
          googleBooksId: book.googleBooksId,
          title: book.title,
          authors: book.authors ? book.authors.split(',').map((a: string) => a.trim()) : [],
          thumbnailUrl: book.thumbnailUrl,
        } : undefined,
        likesCount: likesCounts[post.id] ?? 0,
        isLikedByCurrentUser: !!userLikes[post.id],
      };
    });
  }
}
