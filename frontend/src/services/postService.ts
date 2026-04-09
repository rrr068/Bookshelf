import { apiClient } from './api';
import { Post, CreatePostRequest, UpdatePostRequest } from '@/types/post';

/**
 * 投稿を作成
 */
export async function createPost(data: CreatePostRequest): Promise<Post> {
  const response = await apiClient.post<Post>('/posts', data);
  return response.data;
}

/**
 * 本の投稿一覧を取得
 */
export async function getBookPosts(googleBooksId: string): Promise<Post[]> {
  const response = await apiClient.get<Post[]>(`/posts/book/${googleBooksId}`);
  return response.data;
}

/**
 * 投稿を更新
 */
export async function updatePost(postId: string, data: UpdatePostRequest): Promise<void> {
  await apiClient.put(`/posts/${postId}`, data);
}

/**
 * 投稿を削除
 */
export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}`);
}

/**
 * 投稿へのいいねをトグル
 */
export async function togglePostLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
  const response = await apiClient.post('/post-likes/toggle', { postId });
  return response.data;
}
