import { apiClient } from './api';

export interface BookMetadata {
  googleBooksId: string;
  averageRating: number | null;
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

/**
 * 複数の本のメタデータを取得
 */
export async function getBooksMetadata(googleBooksIds: string[]): Promise<BookMetadata[]> {
  const response = await apiClient.post<BookMetadata[]>('/books/metadata', {
    googleBooksIds,
  });
  return response.data;
}
