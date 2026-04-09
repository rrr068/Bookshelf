import { apiClient } from './api';

/**
 * 本へのいいね関連のAPIサービス
 */

export interface BookWithStatus {
  googleBooksId: string;
  title: string;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  description: string | null;
  isbn10: string | null;
  isbn13: string | null;
  pageCount: number | null;
  thumbnailUrl: string | null;
  language: string;
  likesCount: number;
  averageRating?: number;
  readingStatus?: string | null;
}

/**
 * 本へのいいねをトグル
 */
export async function toggleBookLike(googleBooksId: string): Promise<{ liked: boolean; likesCount: number }> {
  const response = await apiClient.post('/book-likes/toggle', { googleBooksId });
  return response.data;
}

/**
 * ユーザーがいいねした本の一覧を取得
 */
export async function getUserLikedBooks(): Promise<BookWithStatus[]> {
  const response = await apiClient.get('/book-likes/user');
  return response.data;
}
