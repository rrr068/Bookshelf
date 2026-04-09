import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { getDashboard } from '@/services/dashboardService';
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📚 Bookshelf</h1>
            <div className="flex items-center gap-3">
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
                      <Tooltip formatter={(value: number) => [`${value}冊`]} />
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
