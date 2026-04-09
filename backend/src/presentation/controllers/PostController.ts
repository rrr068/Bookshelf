import { Context } from 'hono';
import { CreatePostUseCase } from '../../application/usecases/CreatePostUseCase';
import { GetBookPostsUseCase } from '../../application/usecases/GetBookPostsUseCase';
import { UpdatePostUseCase } from '../../application/usecases/UpdatePostUseCase';
import { DeletePostUseCase } from '../../application/usecases/DeletePostUseCase';
import { createPostSchema, updatePostSchema } from '../validators/postValidator';

export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getBookPostsUseCase: GetBookPostsUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase
  ) {}

  async create(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const validated = createPostSchema.parse(body);

      const result = await this.createPostUseCase.execute(userId, {
        bookId: validated.bookId,
        title: validated.title,
        body: validated.body,
        rating: validated.rating,
        spoiler: validated.spoiler,
        bookData: validated.bookData,
      });
      return c.json(result, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') return c.json({ error: 'Validation error', details: error.errors }, 400);
      return c.json({ error: error.message || 'Failed to create post' }, 400);
    }
  }

  async getBookPosts(c: Context) {
    try {
      const userId = c.get('userId');
      const googleBooksId = c.req.param('googleBooksId') as string;
      const posts = await this.getBookPostsUseCase.execute(userId, googleBooksId);
      return c.json(posts, 200);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to get posts' }, 400);
    }
  }

  async update(c: Context) {
    try {
      const userId = c.get('userId');
      const postId = c.req.param('postId') as string;
      const body = await c.req.json();
      const validated = updatePostSchema.parse(body);

      await this.updatePostUseCase.execute(userId, postId, validated);
      return c.json({ message: 'Post updated successfully' }, 200);
    } catch (error: any) {
      if (error.name === 'ZodError') return c.json({ error: 'Validation error', details: error.errors }, 400);
      if (error.message === 'Unauthorized') return c.json({ error: 'Unauthorized' }, 403);
      return c.json({ error: error.message || 'Failed to update post' }, 400);
    }
  }

  async delete(c: Context) {
    try {
      const userId = c.get('userId');
      const postId = c.req.param('postId') as string;
      await this.deletePostUseCase.execute(userId, postId);
      return c.json({ message: 'Post deleted successfully' }, 200);
    } catch (error: any) {
      if (error.message === 'Unauthorized') return c.json({ error: 'Unauthorized' }, 403);
      return c.json({ error: error.message || 'Failed to delete post' }, 400);
    }
  }
}
