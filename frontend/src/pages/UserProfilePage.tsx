import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookCard } from '@/components/BookCard';
import { getUserLikedBooks, BookWithStatus } from '@/services/bookLikeService';
import { getBooksByStatus, BooksByStatus } from '@/services/readingStatusService';
import { ReadingStatus, ReadingStatusLabel } from '@/types/readingStatus';
import { Book } from '@/types/book';

type TabType = 'liked' | 'want_to_read' | 'reading' | 'completed';

/**
 * ユーザープロフィールページ
 * いいねした本と読書ステータス別の本を表示
 */
export function UserProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [likedBooks, setLikedBooks] = useState<BookWithStatus[]>([]);
  const [statusBooks, setStatusBooks] = useState<BooksByStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('liked');

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user, activeTab]);

  const loadBooks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (activeTab === 'liked') {
        const books = await getUserLikedBooks();
        setLikedBooks(books);
      } else {
        const books = await getBooksByStatus(activeTab as ReadingStatus);
        setStatusBooks(books);
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signup');
  };

  const handleBookClick = (book: BookWithStatus | BooksByStatus) => {
    const bookData: Book = {
      id: book.googleBooksId,
      googleBooksId: book.googleBooksId,
      title: book.title,
      authors: book.authors,
      publisher: book.publisher || undefined,
      publishedDate: book.publishedDate || undefined,
      description: book.description || undefined,
      isbn10: book.isbn10 || undefined,
      isbn13: book.isbn13 || undefined,
      pageCount: book.pageCount || undefined,
      thumbnailUrl: book.thumbnailUrl || undefined,
      language: book.language,
      averageRating: book.averageRating,
      likesCount: book.likesCount,
    };
    navigate(`/book/${book.googleBooksId}`, { state: { book: bookData } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← ホームに戻る
            </Button>
            <h1 className="text-2xl font-bold">📚マイページ</h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ユーザー情報 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.username}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* タブ */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'liked' ? 'default' : 'outline'}
            onClick={() => setActiveTab('liked')}
          >
            ❤️ いいねした本
          </Button>
          <Button
            variant={activeTab === 'want_to_read' ? 'default' : 'outline'}
            onClick={() => setActiveTab('want_to_read')}
          >
            {ReadingStatusLabel.want_to_read}
          </Button>
          <Button
            variant={activeTab === 'reading' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reading')}
          >
            {ReadingStatusLabel.reading}
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('completed')}
          >
            {ReadingStatusLabel.completed}
          </Button>
        </div>

        {/* 本一覧 */}
        <div>
          <h3 className="text-xl font-bold mb-4">
            {activeTab === 'liked' ? 'いいねした本' : ReadingStatusLabel[activeTab as ReadingStatus]}
            {' '}({activeTab === 'liked' ? likedBooks.length : statusBooks.length})
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <p>読み込み中...</p>
            </div>
          ) : (activeTab === 'liked' ? likedBooks : statusBooks).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                まだ本がありません
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {(activeTab === 'liked' ? likedBooks : statusBooks).map((book) => (
                <BookCard
                  key={book.googleBooksId}
                  book={{
                    id: book.googleBooksId,
                    googleBooksId: book.googleBooksId,
                    title: book.title,
                    authors: book.authors,
                    publisher: book.publisher || undefined,
                    publishedDate: book.publishedDate || undefined,
                    description: book.description || undefined,
                    isbn10: book.isbn10 || undefined,
                    isbn13: book.isbn13 || undefined,
                    pageCount: book.pageCount || undefined,
                    thumbnailUrl: book.thumbnailUrl || undefined,
                    language: book.language,
                    averageRating: book.averageRating,
                    likesCount: book.likesCount,
                  }}
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
