import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

/**
 * APIクライアントの基本設定
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Axiosインスタンスの作成
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒でタイムアウト
});

/**
 * リクエストインターセプター
 * すべてのリクエストにトークンを自動的に追加
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * レスポンスインターセプター
 * エラーハンドリングを統一
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // エラーレスポンスの処理
    if (error.response) {
      // サーバーからエラーレスポンスが返ってきた場合
      const errorMessage = (error.response.data as any)?.error || 'API request failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // リクエストは送信されたが、レスポンスがない場合
      throw new Error('サーバーに接続できません');
    } else {
      // リクエスト設定時にエラーが発生した場合
      throw new Error(error.message || '予期しないエラーが発生しました');
    }
  }
);

/**
 * 汎用APIリクエスト関数
 */
export async function apiRequest<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.request<T>({
    url: endpoint,
    ...config,
  });
  return response.data;
}
