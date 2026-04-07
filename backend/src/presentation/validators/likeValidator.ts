import { z } from 'zod';

/**
 * いいね追加のバリデーションスキーマ
 */
export const createLikeSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
});
