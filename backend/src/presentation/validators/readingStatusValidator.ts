import { z } from 'zod';

/**
 * 読書ステータスのバリデーションスキーマ
 */
export const upsertReadingStatusSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  status: z.enum(['want_to_read', 'reading', 'completed', 'on_hold', 'dropped']),
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
