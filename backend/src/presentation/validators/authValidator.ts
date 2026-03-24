import { z } from 'zod';

/**
 * ユーザー登録リクエストのバリデーションスキーマ
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters'),
});

/**
 * ログインリクエストのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
