import { IPostRepository } from '../../domain/repositories/IPostRepository';

export class DeletePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) throw new Error('Unauthorized');

    await this.postRepository.delete(postId);
  }
}
