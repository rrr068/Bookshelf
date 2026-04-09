/**
 * いいね追加リクエストDTO
 */
export interface CreateLikeRequestDto {
  reviewId: string;
}

/**
 * いいねレスポンスDTO
 */
export interface LikeResponseDto {
  id: string;
  userId: string;
  reviewId: string;
  createdAt: string;
}
