import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Book } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { updateReadingStatus, getReadingStatus } from '@/services/readingStatusService';
import { getBooksMetadata } from '@/services/bookMetadataService';
import { ReadingStatus, ReadingStatusLabel } from '@/types/readingStatus';

export function BookDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const book = (location.state as { book?: Book })?.book || null;

  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    if (book) {
      loadReadingStatus();
      loadRating();
    }
  }, [book]);

  const loadReadingStatus = async () => {
    if (!book) return;
    setStatusLoading(true);
    try {
      const status = await getReadingStatus(book.googleBooksId);
      if (status) setSelectedStatus(status.status);
    } catch (error) {
      console.error('Failed to load reading status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const loadRating = async () => {
    if (!book) return;
    try {
      const metadata = await getBooksMetadata([book.googleBooksId]);
      if (metadata[0]) setAverageRating(metadata[0].averageRating);
    } catch {
      // 評価取得失敗は無視
    }
  };

  const handleStatusChange = async (status: ReadingStatus) => {
    if (!book) return;
    try {
      await updateReadingStatus(book.googleBooksId, status, {
        googleBooksId: book.googleBooksId,
        title: book.title,
        authors: book.authors,
        publisher: book.publisher,
        publishedDate: book.publishedDate,
        description: book.description,
        isbn10: book.isbn10,
        isbn13: book.isbn13,
        pageCount: book.pageCount,
        thumbnailUrl: book.thumbnailUrl,
        language: book.language,
      });
      setSelectedStatus(status);
    } catch (error: any) {
      alert(error.message || 'ステータスの更新に失敗しました');
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">本が見つかりません</p>
        <Button onClick={() => navigate('/books')}>一覧に戻る</Button>
      </div>
    );
  }

  const displayRating = averageRating ?? book.averageRating ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← 戻る
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {book.thumbnailUrl ? (
                  <img
                    src={book.thumbnailUrl}
                    alt={book.title}
                    className="w-full rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                <p className="text-lg text-gray-600 mb-3">{book.authors.join(', ')}</p>

                {/* 評価 */}
                {displayRating !== null ? (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-xl ${i < Math.round(displayRating) ? 'text-yellow-500' : 'text-gray-200'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-base font-semibold text-gray-700">
                      {displayRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">/ 5.0</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">まだ評価がありません</p>
                )}

                <div className="text-sm text-gray-600 mb-6 space-y-1">
                  {book.publisher && <p>出版社: {book.publisher}</p>}
                  {book.publishedDate && <p>出版日: {book.publishedDate}</p>}
                  {book.pageCount && <p>ページ数: {book.pageCount}ページ</p>}
                  {book.isbn13 && <p>ISBN: {book.isbn13}</p>}
                </div>

                {/* 読書ステータス */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">読書ステータス</Label>
                  {statusLoading ? (
                    <p className="text-sm text-gray-500">読み込み中...</p>
                  ) : selectedStatus ? (
                    <p className="text-sm font-medium text-green-600 mb-2">
                      現在: {ReadingStatusLabel[selectedStatus]}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">未設定</p>
                  )}
                  <div className="flex gap-2">
                    {(['want_to_read', 'reading', 'completed'] as ReadingStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(status)}
                        className="flex-1"
                        disabled={statusLoading}
                      >
                        {ReadingStatusLabel[status]}
                      </Button>
                    ))}
                  </div>
                </div>

                {book.description && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-base">概要</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{book.description}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
