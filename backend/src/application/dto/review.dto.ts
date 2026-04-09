/**
 * レビュー作成リクエストDTO
 */
export interface CreateReviewRequestDto {
  bookId: string;
  rating?: number;
  comment?: string;
}

/**
 * レビュー更新リクエストDTO
 */
export interface UpdateReviewRequestDto {
  rating: number;
  comment?: string;
}

/**
 * レビューレスポンスDTO
 */
export interface ReviewResponseDto {
  id: string;
  userId: string;
  bookId: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount: number;
  isLikedByCurrentUser?: boolean;
}
