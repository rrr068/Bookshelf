import { PostLike } from '../entities/PostLike';

export interface IPostLikeRepository {
  findByUserAndPost(userId: string, postId: string): Promise<PostLike | null>;
  findPostIdsByUserId(userId: string): Promise<string[]>;
  countByPostId(postId: string): Promise<number>;
  countManyByPostIds(postIds: string[]): Promise<Record<string, number>>;
  findManyByUserAndPostIds(userId: string, postIds: string[]): Promise<Record<string, PostLike>>;
  save(postLike: PostLike): Promise<PostLike>;
  delete(id: string): Promise<void>;
}
