import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/BookCard';
import { Book, BookCategories, BookCategory } from '@/types/book';
import { searchBooks, searchBooksByCategory, getFeaturedBooks } from '@/services/bookService';
import { toggleBookLike } from '@/services/bookLikeService';

/**
 * 本の一覧ページ（Filmarksライクなデザイン）
 */
export function BooksPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('全て');
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 初期表示：人気の本を取得
   */
  useEffect(() => {
    loadBooks();
  }, [selectedCategory]);

  /**
   * 本を読み込む
   */
  const loadBooks = async () => {
    setLoading(true);
    try {
      const result = selectedCategory === '全て'
        ? await getFeaturedBooks(40)
        : await searchBooksByCategory(selectedCategory, 40);
      setBooks(result);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 検索実行
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const result = await searchBooks(searchQuery, 40);
      setBooks(result);
      setSelectedCategory('全て');
    } catch (error) {
      console.error('Failed to search books:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * カテゴリー変更
   */
  const handleCategoryChange = (category: BookCategory) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  /**
   * ログアウト
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * 本をクリック - 詳細ページに遷移
   */
  const handleBookClick = (book: Book) => {
    navigate(`/book/${book.id}`, { state: { book } });
  };

  /**
   * いいねボタンクリック
   */
  const handleLike = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    try {
      const result = await toggleBookLike(book.googleBooksId);

      // 本の一覧を更新
      setBooks(books.map(b =>
        b.googleBooksId === book.googleBooksId
          ? { ...b, isLikedByCurrentUser: result.liked, likesCount: result.likesCount }
          : b
      ));
    } catch (error: any) {
      alert(error.message || 'いいねに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              📚 Bookshelf
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/profile'}
              >
                {user?.username} さん
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                ログアウト
              </Button>
            </div>
          </div>

          {/* 検索バー */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="本のタイトル、著者名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">検索</Button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* カテゴリーフィルター */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {BookCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* 本の一覧 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-lg mb-2">読み込み中...</div>
              <div className="text-sm text-gray-500">本を取得しています</div>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">本が見つかりませんでした</p>
            <Button onClick={loadBooks}>再読み込み</Button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {books.length} 件の本が見つかりました
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => handleBookClick(book)}
                  onLike={(e) => handleLike(e, book)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
