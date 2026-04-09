import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPostLikeRepository } from '../../domain/repositories/IPostLikeRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { PostDto } from '../dto/post.dto';

export class GetBookPostsUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository,
    private readonly postLikeRepository: IPostLikeRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(currentUserId: string, googleBooksId: string): Promise<PostDto[]> {
    const book = await this.bookRepository.findByGoogleBooksId(googleBooksId);
    if (!book) return [];

    const posts = await this.postRepository.findByBookId(book.id);
    if (posts.length === 0) return [];

    const postIds = posts.map((p) => p.id);
    const userIds = [...new Set(posts.map((p) => p.userId))];

    const [users, likesCounts, userLikes] = await Promise.all([
      this.userRepository.findManyByIds(userIds),
      this.postLikeRepository.countManyByPostIds(postIds),
      this.postLikeRepository.findManyByUserAndPostIds(currentUserId, postIds),
    ]);

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return posts.map((post) => ({
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
      likesCount: likesCounts[post.id] ?? 0,
      isLikedByCurrentUser: !!userLikes[post.id],
    }));
  }
}
