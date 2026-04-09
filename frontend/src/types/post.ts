/**
 * 投稿の型定義
 */
export interface Post {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  body: string;
  rating: number | null;
  spoiler: boolean;
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
 * 投稿作成リクエスト
 */
export interface CreatePostRequest {
  bookId: string;
  title: string;
  body: string;
  rating?: number;
  spoiler?: boolean;
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

/**
 * 投稿更新リクエスト
 */
export interface UpdatePostRequest {
  title: string;
  body: string;
  rating?: number;
  spoiler?: boolean;
}
