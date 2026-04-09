import { IPostRepository } from '../../domain/repositories/IPostRepository';
import { UpdatePostRequestDto } from '../dto/post.dto';

export class UpdatePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(userId: string, postId: string, data: UpdatePostRequestDto): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) throw new Error('Unauthorized');

    const updated = post.update(data.title, data.body, data.rating, data.spoiler);
    await this.postRepository.save(updated);
  }
}
