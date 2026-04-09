/**
 * レビューの型定義
 */
export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount: number;
  isLikedByCurrentUser?: boolean;
}

/**
 * レビュー作成リクエスト
 */
export interface CreateReviewRequest {
  bookId: string;
  rating?: number;
  comment?: string;
  bookData?: {
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
    language?: string;
  };
}
