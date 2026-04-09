import { Post } from '../entities/Post';

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findManyByIds(ids: string[]): Promise<Post[]>;
  findByBookId(bookId: string): Promise<Post[]>;
  findByUserId(userId: string): Promise<Post[]>;
  save(post: Post): Promise<Post>;
  delete(id: string): Promise<void>;
}
