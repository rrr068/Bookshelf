import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPostLikeRepository } from '../../domain/repositories/IPostLikeRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { PostDto } from '../dto/post.dto';

export class GetUserLikedPostsUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository,
    private readonly postLikeRepository: IPostLikeRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(userId: string): Promise<PostDto[]> {
    const likedPostIds = await this.postLikeRepository.findPostIdsByUserId(userId);
    if (likedPostIds.length === 0) return [];

    const posts = await this.postRepository.findManyByIds(likedPostIds);
    if (posts.length === 0) return [];

    // 新着順にソート
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const postIds = posts.map((p) => p.id);
    const userIds = [...new Set(posts.map((p) => p.userId))];
    const bookIds = [...new Set(posts.map((p) => p.bookId))];

    const [users, books, likesCounts] = await Promise.all([
      this.userRepository.findManyByIds(userIds),
      this.bookRepository.findMany(bookIds),
      this.postLikeRepository.countManyByPostIds(postIds),
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
        isLikedByCurrentUser: true,
      };
    });
  }
}
