import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { getBooksByStatus, BooksByStatus } from '@/services/readingStatusService';
import { User } from '@/types/auth';

export function UserMenu() {
  const { user, logout, updateUser } = useAuth();
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
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border z-50 py-1 overflow-hidden">
            {/* ユーザー情報 */}
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {/* メニュー項目 */}
            <button
              onClick={openModal}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ユーザー情報の編集
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold">ユーザー情報の編集</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* ユーザー名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  maxLength={50}
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* 目標 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm resize-none"
                  rows={3}
                  maxLength={200}
                  placeholder="例：今年100冊読む、毎日30分読書する..."
                  disabled={saving}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{goal.length}/200</p>
              </div>

              {/* 好きな本 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  好きな本（最大5冊）
                </label>
                {loadingBookshelf ? (
                  <p className="text-sm text-gray-400 py-4 text-center">読み込み中...</p>
                ) : bookshelf.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">本棚に本がありません</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2">
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
                              ? 'bg-primary/10 border border-primary/30'
                              : 'hover:bg-gray-50 disabled:opacity-40'
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
                          <span className="truncate flex-1">{book.title}</span>
                          {selected && (
                            <span className="text-primary text-xs font-medium flex-shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedBookIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
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
                  className="flex-1 border py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
