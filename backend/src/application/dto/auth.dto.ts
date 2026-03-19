/**
 * ユーザー登録リクエストDTO
 */
export interface RegisterUserRequestDto {
  email: string;
  password: string;
  username: string;
}

/**
 * ログインリクエストDTO
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * 認証レスポンスDTO
 */
export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

/**
 * ユーザー情報レスポンスDTO
 */
export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
