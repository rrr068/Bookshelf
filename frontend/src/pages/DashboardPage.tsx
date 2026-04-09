import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getDashboard } from '@/services/dashboardService';
import { createPost } from '@/services/postService';
import { getBooksByStatus, BooksByStatus } from '@/services/readingStatusService';
import { DashboardData } from '@/types/dashboard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const STATUS_LABELS: Record<string, string> = {
  want_to_read: '読みたい',
  reading: '読書中',
  completed: '読了',
  on_hold: '一時停止',
  dropped: '読むのをやめた',
};

const DONUT_COLORS = {
  want: '#f97316',
  reading: '#3b82f6',
  done: '#22c55e',
};

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // 投稿モーダル
  const [modalOpen, setModalOpen] = useState(false);
  const [userBooks, setUserBooks] = useState<BooksByStatus[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<BooksByStatus | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postRating, setPostRating] = useState<number | null>(null);
  const [postSpoiler, setPostSpoiler] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  const openPostModal = async () => {
    setModalOpen(true);
    setSelectedBook(null);
    setBookSearch('');
    setPostTitle('');
    setPostBody('');
    setPostRating(null);
    setPostSpoiler(false);
    setBooksLoading(true);
    try {
      const books = await getBooksByStatus();
      setUserBooks(books);
    } catch {
      setUserBooks([]);
    } finally {
      setBooksLoading(false);
    }
  };

  const closePostModal = () => {
    setModalOpen(false);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !postTitle.trim() || !postBody.trim()) return;
    setPostLoading(true);
    try {
      await createPost({
        bookId: selectedBook.googleBooksId,
        title: postTitle.trim(),
        body: postBody.trim(),
        rating: postRating ?? undefined,
        spoiler: postSpoiler,
        bookData: {
          googleBooksId: selectedBook.googleBooksId,
          title: selectedBook.title,
          authors: selectedBook.authors,
          publisher: selectedBook.publisher ?? undefined,
          publishedDate: selectedBook.publishedDate ?? undefined,
          description: selectedBook.description ?? undefined,
          isbn10: selectedBook.isbn10 ?? undefined,
          isbn13: selectedBook.isbn13 ?? undefined,
          pageCount: selectedBook.pageCount ?? undefined,
          thumbnailUrl: selectedBook.thumbnailUrl ?? undefined,
          language: selectedBook.language,
        },
      });
      closePostModal();
    } catch (error: any) {
      alert(error.message || '投稿に失敗しました');
    } finally {
      setPostLoading(false);
    }
  };

  const filteredBooks = userBooks.filter((b) => {
    const q = bookSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.authors.some((a) => a.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBooks = dashboard
    ? dashboard.stats.total.want +
      dashboard.stats.total.reading +
      dashboard.stats.total.done
    : 0;

  const donutData = dashboard
    ? [
        { name: '読みたい', value: dashboard.stats.total.want, color: DONUT_COLORS.want },
        { name: '読書中', value: dashboard.stats.total.reading, color: DONUT_COLORS.reading },
        { name: '読了', value: dashboard.stats.total.done, color: DONUT_COLORS.done },
      ].filter(d => d.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 投稿モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b">
              <h2 className="text-lg font-semibold">感想を投稿</h2>
              <button
                onClick={closePostModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                disabled={postLoading}
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
              {/* 本の選択 */}
              <div>
                <Label className="text-sm font-semibold">本を選択</Label>
                {selectedBook ? (
                  <div className="mt-2 flex items-center gap-3 p-3 border-2 border-blue-500 rounded-lg bg-blue-50">
                    {selectedBook.thumbnailUrl ? (
                      <img
                        src={selectedBook.thumbnailUrl}
                        alt={selectedBook.title}
                        className="w-9 h-12 object-cover rounded shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        📖
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{selectedBook.title}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedBook.authors.join(', ')}</p>
                    </div>
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                      disabled={postLoading}
                    >
                      変更
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="w-full p-2 border rounded-md mt-2 text-sm"
                      placeholder="タイトルや著者で検索..."
                      autoFocus
                    />
                    <div className="mt-2 max-h-48 overflow-y-auto border rounded-md divide-y">
                      {booksLoading ? (
                        <p className="text-sm text-gray-500 p-3 text-center">読み込み中...</p>
                      ) : filteredBooks.length === 0 ? (
                        <p className="text-sm text-gray-500 p-3 text-center">
                          {userBooks.length === 0 ? '登録した本がありません' : '該当する本がありません'}
                        </p>
                      ) : (
                        filteredBooks.map((book) => (
                          <button
                            key={book.googleBooksId}
                            type="button"
                            onClick={() => setSelectedBook(book)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition"
                          >
                            {book.thumbnailUrl ? (
                              <img
                                src={book.thumbnailUrl}
                                alt={book.title}
                                className="w-8 h-11 object-cover rounded shadow-sm flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-11 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                                📖
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{book.title}</p>
                              <p className="text-xs text-gray-500 truncate">{book.authors.join(', ')}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                              book.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : book.status === 'reading'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {STATUS_LABELS[book.status] ?? book.status}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* 投稿フォーム（本が選択されたら表示） */}
              {selectedBook && (
                <form id="post-form" onSubmit={handleSubmitPost} className="space-y-4">
                  <div>
                    <Label htmlFor="modal-post-title">タイトル</Label>
                    <input
                      id="modal-post-title"
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full p-2 border rounded-md mt-1 text-sm"
                      placeholder="タイトルを入力..."
                      maxLength={200}
                      disabled={postLoading}
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label htmlFor="modal-post-body">感想</Label>
                    <textarea
                      id="modal-post-body"
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                      className="w-full min-h-[100px] p-2 border rounded-md mt-1 text-sm"
                      placeholder="この本の感想を書いてください..."
                      maxLength={5000}
                      disabled={postLoading}
                    />
                  </div>

                  <div>
                    <Label>評価（任意）</Label>
                    <div className="flex gap-1 mt-1 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setPostRating(postRating === star ? null : star)}
                          className={`text-2xl ${postRating && star <= postRating ? 'text-yellow-500' : 'text-gray-300'}`}
                          disabled={postLoading}
                        >
                          ★
                        </button>
                      ))}
                      {postRating && (
                        <button
                          type="button"
                          onClick={() => setPostRating(null)}
                          className="ml-1 text-sm text-gray-500 hover:text-gray-700"
                          disabled={postLoading}
                        >
                          クリア
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="modal-spoiler"
                      type="checkbox"
                      checked={postSpoiler}
                      onChange={(e) => setPostSpoiler(e.target.checked)}
                      disabled={postLoading}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="modal-spoiler">ネタバレを含む</Label>
                  </div>
                </form>
              )}
            </div>

            {/* フッターボタン */}
            <div className="px-6 py-4 border-t flex gap-2">
              <Button
                type="submit"
                form="post-form"
                disabled={postLoading || !selectedBook || !postTitle.trim() || !postBody.trim()}
                className="flex-1"
              >
                {postLoading ? '投稿中...' : '投稿する'}
              </Button>
              <Button type="button" variant="outline" onClick={closePostModal} disabled={postLoading}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📚 Bookshelf</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={openPostModal}>
                投稿する
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/books')}>
                本を探す
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                {user?.username} さん
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-lg mb-2">読み込み中...</div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800">
                おかえりなさい、{user?.username} さん
              </h2>
              <p className="text-gray-500 text-sm mt-1">あなたの読書記録ダッシュボード</p>
            </div>

            {/* サマリーカード */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-5 border">
                <p className="text-xs text-gray-500 mb-1">登録した本</p>
                <p className="text-3xl font-bold text-gray-800">{totalBooks}</p>
                <p className="text-xs text-gray-400 mt-1">冊</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border">
                <p className="text-xs text-gray-500 mb-1">今月の読了</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboard?.stats.thisMonth.booksRead ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">冊</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border">
                <p className="text-xs text-gray-500 mb-1">今月読んだページ</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(dashboard?.stats.thisMonth.pagesRead ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">ページ</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border">
                <p className="text-xs text-gray-500 mb-1">今年の読了</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboard?.stats.thisYear.booksRead ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">冊</p>
              </div>
            </div>

            {totalBooks === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📚</p>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  まだ本が登録されていません
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  気になる本を探して、読書記録をはじめましょう
                </p>
                <Button onClick={() => navigate('/books')}>本を探す</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* ドーナツチャート */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    読書ステータス内訳
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}冊`]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* ステータス別内訳 */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                  <h3 className="text-sm font-semibold text-gray-700 mb-6">
                    ステータス別
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm text-gray-600">読みたい</span>
                      </div>
                      <span className="text-lg font-bold text-gray-800">
                        {dashboard?.stats.total.want}
                        <span className="text-sm font-normal text-gray-400 ml-1">冊</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-600">読書中</span>
                      </div>
                      <span className="text-lg font-bold text-gray-800">
                        {dashboard?.stats.total.reading}
                        <span className="text-sm font-normal text-gray-400 ml-1">冊</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-600">読了</span>
                      </div>
                      <span className="text-lg font-bold text-gray-800">
                        {dashboard?.stats.total.done}
                        <span className="text-sm font-normal text-gray-400 ml-1">冊</span>
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-8 w-full"
                    onClick={() => navigate('/profile')}
                  >
                    本棚を見る
                  </Button>
                </div>
              </div>
            )}

            {/* 最近の活動 */}
            {dashboard && dashboard.recentBooks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">最近の活動</h3>
                <div className="space-y-2">
                  {dashboard.recentBooks.map((book, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      onClick={() =>
                        navigate(`/book/${book.googleBooksId}`, {
                          state: {
                            book: {
                              id: book.googleBooksId,
                              googleBooksId: book.googleBooksId,
                              title: book.title,
                              authors: book.authors,
                              thumbnailUrl: book.thumbnailUrl,
                            },
                          },
                        })
                      }
                    >
                      {book.thumbnailUrl ? (
                        <img
                          src={book.thumbnailUrl}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                          📖
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {book.authors.join(', ')}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          book.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : book.status === 'reading'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {STATUS_LABELS[book.status] ?? book.status}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-gray-500"
                  onClick={() => navigate('/profile')}
                >
                  すべて見る
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
