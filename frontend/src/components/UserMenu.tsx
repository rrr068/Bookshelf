import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/services/api';
import { getBooksByStatus, BooksByStatus } from '@/services/readingStatusService';
import { User } from '@/types/auth';

export function UserMenu() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 編集フォーム状態
  const [username, setUsername] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [bookshelf, setBookshelf] = useState<BooksByStatus[]>([]);
  const [loadingBookshelf, setLoadingBookshelf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openModal = async () => {
    setUsername(user?.username ?? '');
    setGoal(user?.goal ?? '');
    setSelectedBookIds(user?.favoriteBooks?.map((b) => b.googleBooksId) ?? []);
    setError('');
    setOpen(false);
    setModalOpen(true);

    // 本棚を取得
    setLoadingBookshelf(true);
    try {
      const books = await getBooksByStatus();
      setBookshelf(books);
    } catch {
      setBookshelf([]);
    } finally {
      setLoadingBookshelf(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleBook = (googleBooksId: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(googleBooksId)
        ? prev.filter((id) => id !== googleBooksId)
        : prev.length < 5
        ? [...prev, googleBooksId]
        : prev
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, any> = {
        username: username.trim(),
        goal: goal.trim() || null,
        favoriteBookIds: selectedBookIds,
      };
      const response = await apiClient.put<User>('/auth/profile', body);
      updateUser(response.data);
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* アバターボタン + ドロップダウン */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="ユーザーメニュー"
        >
          {user.username.charAt(0).toUpperCase()}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 z-50 py-1 overflow-hidden">
            {/* ユーザー情報 */}
            <div className="px-4 py-3 border-b dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>

            {/* メニュー項目 */}
            <button
              onClick={openModal}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ユーザー情報の編集
            </button>
            <button
              onClick={toggleTheme}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              {theme === 'light' ? '🌙' : '☀️'} テーマ
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ユーザー情報の編集</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xl leading-none"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* ユーザー名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  maxLength={50}
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* 目標 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  目標
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm resize-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  maxLength={200}
                  placeholder="例：今年100冊読む、毎日30分読書する..."
                  disabled={saving}
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{goal.length}/200</p>
              </div>

              {/* 好きな本 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  好きな本（最大5冊）
                </label>
                {loadingBookshelf ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">読み込み中...</p>
                ) : bookshelf.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">本棚に本がありません</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto border dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700/50">
                    {bookshelf.map((book) => {
                      const selected = selectedBookIds.includes(book.googleBooksId);
                      return (
                        <button
                          key={book.googleBooksId}
                          type="button"
                          onClick={() => toggleBook(book.googleBooksId)}
                          disabled={saving || (!selected && selectedBookIds.length >= 5)}
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors text-sm ${
                            selected
                              ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40'
                          }`}
                        >
                          {book.thumbnailUrl ? (
                            <img
                              src={book.thumbnailUrl}
                              alt={book.title}
                              className="w-7 h-9 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                              📖
                            </div>
                          )}
                          <span className="truncate flex-1 dark:text-white">{book.title}</span>
                          {selected && (
                            <span className="text-primary dark:text-primary text-xs font-medium flex-shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedBookIds.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedBookIds.length}冊選択中
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 border dark:border-gray-600 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
