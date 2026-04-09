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
 * ユーザー情報
 */
export interface User {
  id: string;
  email: string;
  username: string;
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
