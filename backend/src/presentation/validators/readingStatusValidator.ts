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
      publisher: z.string().nullish(),
      publishedDate: z.string().nullish(),
      description: z.string().nullish(),
      isbn10: z.string().nullish(),
      isbn13: z.string().nullish(),
      pageCount: z.number().nullish(),
      thumbnailUrl: z.string().nullish(),
      language: z.string().nullish(),
    })
    .optional(),
});
