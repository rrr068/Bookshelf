import { z } from 'zod';

export const createPostSchema = z.object({
  bookId: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
  spoiler: z.boolean().optional(),
  bookData: z.object({
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
  }).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
  spoiler: z.boolean().optional(),
});
