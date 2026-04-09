import { apiClient } from './api';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';

/**
 * 認証関連のAPIサービス
 */

/**
 * ユーザー登録
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);

  // トークンをローカルストレージに保存
  localStorage.setItem('token', response.data.token);

  return response.data;
}

/**
 * ログイン
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);

  // トークンをローカルストレージに保存
  localStorage.setItem('token', response.data.token);

  return response.data;
}

/**
 * ログアウト
 */
export function logout(): void {
  localStorage.removeItem('token');
}

/**
 * トークンの存在確認
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}
