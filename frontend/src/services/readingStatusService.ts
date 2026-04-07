import { apiClient } from './api';
import { ReadingStatus, ReadingStatusResponse } from '@/types/readingStatus';

/**
 * 読書ステータス関連のAPIサービス
 */

/**
 * 読書ステータスを取得
 */
export async function getReadingStatus(bookId: string): Promise<ReadingStatusResponse | null> {
  try {
    const response = await apiClient.get<ReadingStatusResponse>(`/reading-status/${bookId}`);
    if (response.data && (response.data as any).status === null) {
      return null;
    }
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * 読書ステータスを更新
 */
export async function updateReadingStatus(
  bookId: string,
  status: ReadingStatus,
  bookData?: any
): Promise<ReadingStatusResponse> {
  const response = await apiClient.post<ReadingStatusResponse>('/reading-status', {
    bookId,
    status,
    bookData,
  });
  return response.data;
}

export interface BooksByStatus {
  googleBooksId: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number;
  thumbnailUrl?: string;
  language: string;
  status: ReadingStatus;
  likesCount?: number;
  averageRating?: number;
}

/**
 * ユーザーの読書ステータス別の本一覧を取得
 */
export async function getBooksByStatus(status?: ReadingStatus): Promise<BooksByStatus[]> {
  const url = status ? `/reading-status?status=${status}` : '/reading-status';
  const response = await apiClient.get<BooksByStatus[]>(url);
  return response.data;
}
