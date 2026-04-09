import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Book } from '@/types/book';
import { Review } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { createReview, updateReview, deleteReview, toggleLike, getBookReviews } from '@/services/reviewService';
import { updateReadingStatus, getReadingStatus } from '@/services/readingStatusService';
import { ReadingStatus, ReadingStatusLabel } from '@/types/readingStatus';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 本の詳細ページ
 * location.stateから本のデータを受け取る
 */
export function BookDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // location.stateから本のデータを取得
  const book = (location.state as { book?: Book })?.book || null;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [hasReview, setHasReview] = useState(false);

  /**
   * ページ読み込み時に読書ステータスとレビューを取得
   */
  useEffect(() => {
    if (book) {
      loadReadingStatus();
      loadReviews();
    }
  }, [book]);

  const loadReadingStatus = async () => {
    if (!book) return;

    setStatusLoading(true);
    try {
      const status = await getReadingStatus(book.googleBooksId);
      if (status) {
        setSelectedStatus(status.status);
      }
    } catch (error) {
      console.error('Failed to load reading status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  /**
   * レビュー一覧を読み込む
   */
  const loadReviews = async () => {
    if (!book || !user) return;

    try {
      const bookReviews = await getBookReviews(book.googleBooksId);
      setReviews(bookReviews);

      // 自分のレビューがあるかチェック
      const myReview = bookReviews.find(r => r.userId === user.id);
      if (myReview) {
        setHasReview(true);
        setRating(myReview.rating);
        setComment(myReview.comment || '');
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  /**
   * レビュー投稿または更新
   */
  const submitReview = async (ratingValue?: number) => {
    if (!book) return;

    setLoading(true);
    try {
      if (hasReview) {
        // 既存レビューを更新
        await updateReview(book.googleBooksId, {
          rating: ratingValue || undefined,
          comment: comment || undefined,
        });
      } else {
        // 新規レビューを作成
        await createReview({
          bookId: book.googleBooksId,
          rating: ratingValue || undefined,
          comment: comment || undefined,
          bookData: {
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
          },
        });
        setHasReview(true);
      }

      // レビュー一覧を再読み込み
      await loadReviews();

      setRating(ratingValue || null);
    } catch (error: any) {
      alert(error.message || 'レビューの投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * レビューフォーム送信（感想のみ）
   */
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReview(rating || undefined);
  };

  /**
   * 星をクリックした時点でレビューを投稿/更新
   */
  const handleRatingClick = async (star: number) => {
    setRating(star);
    await submitReview(star);
  };

  /**
   * 評価をクリア（レビューを削除）
   */
  const handleClearRating = async () => {
    if (!book) return;
    if (!hasReview) {
      setRating(null);
      return;
    }

    setLoading(true);
    try {
      await deleteReview(book.googleBooksId);
      setRating(null);
      setComment('');
      setHasReview(false);

      // レビュー一覧を再読み込み
      await loadReviews();
    } catch (error: any) {
      alert(error.message || '評価のクリアに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * いいねトグル
   */
  const handleToggleLike = async (reviewId: string) => {
    try {
      const result = await toggleLike(reviewId);

      // レビューのいいね数を更新
      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                likesCount: result.likesCount,
                isLikedByCurrentUser: result.liked,
              }
            : review
        )
      );
    } catch (error: any) {
      alert(error.message || 'いいねに失敗しました');
    }
  };

  /**
   * 読書ステータス更新
   */
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
      alert(`「${ReadingStatusLabel[status]}」に設定しました！`);
    } catch (error: any) {
      alert(error.message || 'ステータスの更新に失敗しました');
      console.error('Failed to update status:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← 戻る
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 本の情報セクション */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 本の画像 */}
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

              {/* 本の詳細情報 */}
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold mb-3">{book.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{book.authors.join(', ')}</p>

                {/* 書籍情報 */}
                <div className="text-sm text-gray-600 mb-6 space-y-1">
                  {book.publisher && <p>📚 出版社: {book.publisher}</p>}
                  {book.publishedDate && <p>📅 出版日: {book.publishedDate}</p>}
                  {book.pageCount && <p>📖 ページ数: {book.pageCount}ページ</p>}
                  {book.isbn13 && <p>🔖 ISBN: {book.isbn13}</p>}
                </div>

                {/* 読書ステータス */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">読書ステータス</Label>
                  {statusLoading ? (
                    <p className="text-sm text-gray-500">読み込み中...</p>
                  ) : selectedStatus ? (
                    <div className="text-sm font-medium text-green-600 mb-2">
                      現在: {ReadingStatusLabel[selectedStatus]}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">未設定</p>
                  )}
                  <div className="flex gap-2">
                    {(['want_to_read', 'reading', 'completed'] as ReadingStatus[]).map(
                      (status) => (
                        <Button
                          key={status}
                          variant={selectedStatus === status ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(status)}
                          className="flex-1"
                          disabled={statusLoading}
                        >
                          {ReadingStatusLabel[status]}
                        </Button>
                      )
                    )}
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

        {/* レビューセクション */}
        <div className="space-y-6">
          {/* レビュー投稿フォーム */}
          <Card>
              <CardHeader>
                <CardTitle>レビューを投稿</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <Label htmlFor="rating">評価（星をクリックで即座に確定）</Label>
                    <div className="flex gap-2 mt-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className={`text-2xl ${
                            rating && star <= rating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                          disabled={loading}
                        >
                          ★
                        </button>
                      ))}
                      {rating && (
                        <button
                          type="button"
                          onClick={handleClearRating}
                          className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                          disabled={loading}
                        >
                          クリア
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">感想（任意）</Label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      placeholder="この本の感想を書いてください..."
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" disabled={loading || !comment.trim()} className="w-full">
                    {loading ? '投稿中...' : hasReview ? '感想を更新' : '感想を投稿'}
                  </Button>
                </form>
              </CardContent>
            </Card>

          {/* レビュー一覧 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">レビュー ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  まだレビューがありません
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{review.user.username}</p>
                        {review.rating ? (
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className={
                                  i < review.rating!
                                    ? 'text-yellow-500'
                                    : 'text-gray-300'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">評価なし</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={review.isLikedByCurrentUser ? 'default' : 'outline'}
                        onClick={() => handleToggleLike(review.id)}
                      >
                        ❤️ {review.likesCount}
                      </Button>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
