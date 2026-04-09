import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/api';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証コンテキストプロバイダー
 * アプリ全体で認証状態を管理
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * アプリ起動時に認証状態をチェック
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // トークンが有効か確認するため、/auth/meを呼び出す
        const response = await apiClient.get<User>('/auth/me');
        setUser(response.data);
      } catch (error) {
        // トークンが無効な場合は削除
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * ログイン処理
   */
  const login = (userData: User) => {
    setUser(userData);
  };

  /**
   * ログアウト処理
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 認証コンテキストを使用するカスタムフック
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
