import { z } from 'zod';

/**
 * レビュー作成のバリデーションスキーマ
 */
export const createReviewSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000, 'Comment must be 1000 characters or less').optional(),
  bookData: z
    .object({
      googleBooksId: z.string(),
      title: z.string(),
      authors: z.array(z.string()),
      publisher: z.string().optional(),
      publishedDate: z.string().optional(),
      description: z.string().optional(),
      isbn10: z.string().optional(),
      isbn13: z.string().optional(),
      pageCount: z.number().optional(),
      thumbnailUrl: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

/**
 * レビュー更新のバリデーションスキーマ
 */
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000, 'Comment must be 1000 characters or less').optional(),
});
