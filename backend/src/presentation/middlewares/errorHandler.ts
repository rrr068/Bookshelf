import { Context } from 'hono';

/**
 * グローバルエラーハンドラー
 */
export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  return c.json(
    {
      error: err.message || 'Internal server error',
    },
    500
  );
};
