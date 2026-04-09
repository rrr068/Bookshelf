import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, BarChart2 } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-gray-900">Bookshelf</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">ログイン</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">アカウント登録</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            あなたの読書を、<br className="hidden sm:block" />
            もっと豊かに。
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bookshelf は読書記録を簡単に管理できるアプリです。
            読んだ本・読みたい本を整理して、あなたの読書体験を可視化しましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/signup">無料でアカウント登録</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link to="/login">ログイン</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Bookshelf でできること
          </h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            読書習慣をサポートする3つの機能
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-5">
                <div className="bg-blue-100 p-4 rounded-full">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">読書記録</h3>
              <p className="text-gray-600 leading-relaxed">
                読んだ本・読書中・積読を3つのステータスで管理。レビューや星評価も残せます。
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-5">
                <div className="bg-green-100 p-4 rounded-full">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">本の検索</h3>
              <p className="text-gray-600 leading-relaxed">
                Google Books と連携した膨大な書籍データベースから読みたい本を素早く検索・登録できます。
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-5">
                <div className="bg-purple-100 p-4 rounded-full">
                  <BarChart2 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">読書統計</h3>
              <p className="text-gray-600 leading-relaxed">
                月別の読書ペースや累計ページ数をダッシュボードで確認。読書習慣の可視化をサポートします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐ読書記録を始めよう
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            無料でアカウントを作成して、あなたの読書ライフを管理しましょう。
          </p>
          <Button size="lg" variant="secondary" className="text-base px-8" asChild>
            <Link to="/signup">無料でアカウント登録</Link>
          </Button>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-white border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          © 2025 Bookshelf. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
