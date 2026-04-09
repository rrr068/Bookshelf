import { IPostLikeRepository } from '../../domain/repositories/IPostLikeRepository';
import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { PostLike } from '../../domain/entities/PostLike';

export class TogglePostLikeUseCase {
  constructor(
    private readonly postLikeRepository: IPostLikeRepository,
    private readonly postRepository: IPostRepository
  ) {}

  async execute(userId: string, postId: string): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error('Post not found');

    const existing = await this.postLikeRepository.findByUserAndPost(userId, postId);
    if (existing) {
      await this.postLikeRepository.delete(existing.id);
      const likesCount = await this.postLikeRepository.countByPostId(postId);
      return { liked: false, likesCount };
    } else {
      await this.postLikeRepository.save(PostLike.create(userId, postId));
      const likesCount = await this.postLikeRepository.countByPostId(postId);
      return { liked: true, likesCount };
    }
  }
}
