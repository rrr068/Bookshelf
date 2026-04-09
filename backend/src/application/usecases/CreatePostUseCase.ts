import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPostLikeRepository } from '../../domain/repositories/IPostLikeRepository';
import { Post } from '../../domain/entities/Post';
import { Book } from '../../domain/entities/Book';
import { CreatePostRequestDto, PostDto } from '../dto/post.dto';

export class CreatePostUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly bookRepository: IBookRepository,
    private readonly userRepository: IUserRepository,
    private readonly postLikeRepository: IPostLikeRepository
  ) {}

  async execute(userId: string, request: CreatePostRequestDto): Promise<PostDto> {
    // 書籍をGoogleBooksIdで検索（なければ作成）
    let book = await this.bookRepository.findByGoogleBooksId(request.bookId);
    if (!book && request.bookData) {
      book = Book.create(
        request.bookData.googleBooksId,
        request.bookData.title,
        request.bookData.authors,
        userId,
        {
          publisher: request.bookData.publisher,
          publishedDate: request.bookData.publishedDate,
          description: request.bookData.description,
          isbn10: request.bookData.isbn10,
          isbn13: request.bookData.isbn13,
          pageCount: request.bookData.pageCount,
          thumbnailUrl: request.bookData.thumbnailUrl,
          language: request.bookData.language,
        }
      );
      book = await this.bookRepository.save(book);
    }
    if (!book) throw new Error('Book not found');

    const post = Post.create(userId, book.id, request.title, request.body, request.rating, request.spoiler ?? false);
    const saved = await this.postRepository.save(post);

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    return {
      id: saved.id,
      userId: saved.userId,
      bookId: saved.bookId,
      title: saved.title,
      body: saved.body,
      rating: saved.rating,
      spoiler: saved.spoiler,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
      user: { id: user.id, username: user.username },
      likesCount: 0,
      isLikedByCurrentUser: false,
    };
  }
}
