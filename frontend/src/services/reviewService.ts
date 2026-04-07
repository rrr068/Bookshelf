import { apiClient } from './api';
import { Review, CreateReviewRequest } from '@/types/review';

/**
 * レビュー関連のAPIサービス
 */

/**
 * レビューを作成
 */
export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const response = await apiClient.post<Review>('/reviews', data);
  return response.data;
}

/**
 * いいねをトグル
 */
export async function toggleLike(reviewId: string): Promise<{ liked: boolean; likesCount: number }> {
  const response = await apiClient.post('/likes/toggle', { reviewId });
  return response.data;
}

/**
 * ユーザーがいいねしたレビュー一覧を取得
 */
export async function getUserLikedReviews(userId: string): Promise<Review[]> {
  const response = await apiClient.get<Review[]>(`/likes/user/${userId}`);
  return response.data;
}
