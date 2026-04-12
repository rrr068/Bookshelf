/**
 * ユーザー登録リクエスト
 */
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

/**
 * ログインリクエスト
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * お気に入り本
 */
export interface FavoriteBook {
  googleBooksId: string;
  title: string;
  thumbnailUrl: string | null;
}

/**
 * ユーザー情報
 */
export interface User {
  id: string;
  email: string;
  username: string;
  goal?: string | null;
  favoriteBooks?: FavoriteBook[];
}

/**
 * 認証レスポンス
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  error: string;
  details?: any;
}
