import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Book } from '@/types/book';
import { Post, UpdatePostRequest } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { createPost, getBookPosts, updatePost, deletePost, togglePostLike } from '@/services/postService';
import { updateReadingStatus, getReadingStatus } from '@/services/readingStatusService';
import { ReadingStatus, ReadingStatusLabel } from '@/types/readingStatus';
import { useAuth } from '@/contexts/AuthContext';

export function BookDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const book = (location.state as { book?: Book })?.book || null;

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // 新規投稿フォーム
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formRating, setFormRating] = useState<number | null>(null);
  const [formSpoiler, setFormSpoiler] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // 編集中の投稿
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // ネタバレ表示トグル
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (book) {
      loadReadingStatus();
      loadPosts();
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

  const loadPosts = async () => {
    if (!book) return;
    try {
      const bookPosts = await getBookPosts(book.googleBooksId);
      setPosts(bookPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !formTitle.trim() || !formBody.trim()) return;

    setFormLoading(true);
    try {
      await createPost({
        bookId: book.googleBooksId,
        title: formTitle.trim(),
        body: formBody.trim(),
        rating: formRating ?? undefined,
        spoiler: formSpoiler,
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
      setFormTitle('');
      setFormBody('');
      setFormRating(null);
      setFormSpoiler(false);
      await loadPosts();
    } catch (error: any) {
      alert(error.message || '投稿に失敗しました');
    } finally {
      setFormLoading(false);
    }
  };

  const startEditing = (post: Post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditRating(post.rating);
    setEditSpoiler(post.spoiler);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editTitle.trim() || !editBody.trim()) return;
    setEditLoading(true);
    try {
      const data: UpdatePostRequest = {
        title: editTitle.trim(),
        body: editBody.trim(),
        rating: editRating ?? undefined,
        spoiler: editSpoiler,
      };
      await updatePost(postId, data);
      setEditingPostId(null);
      await loadPosts();
    } catch (error: any) {
      alert(error.message || '更新に失敗しました');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;
    try {
      await deletePost(postId);
      await loadPosts();
    } catch (error: any) {
      alert(error.message || '削除に失敗しました');
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const result = await togglePostLike(postId);
      setPosts(posts.map((p) =>
        p.id === postId
          ? { ...p, likesCount: result.likesCount, isLikedByCurrentUser: result.liked }
          : p
      ));
    } catch (error: any) {
      alert(error.message || 'いいねに失敗しました');
    }
  };

  const toggleSpoilerReveal = (postId: string) => {
    setRevealedSpoilers((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← 戻る
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 本の情報 */}
        <Card className="mb-8">
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
                <h1 className="text-3xl font-bold mb-3">{book.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{book.authors.join(', ')}</p>
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

        {/* 投稿セクション */}
        <div className="space-y-6">
          {/* 投稿フォーム */}
          <Card>
            <CardHeader>
              <CardTitle>感想を投稿</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <Label htmlFor="post-title">タイトル</Label>
                  <input
                    id="post-title"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2 border rounded-md mt-1"
                    placeholder="タイトルを入力..."
                    maxLength={200}
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="post-body">感想</Label>
                  <textarea
                    id="post-body"
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full min-h-[120px] p-2 border rounded-md mt-1"
                    placeholder="この本の感想を書いてください..."
                    maxLength={5000}
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <Label>評価（任意）</Label>
                  <div className="flex gap-2 mt-1 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(formRating === star ? null : star)}
                        className={`text-2xl ${formRating && star <= formRating ? 'text-yellow-500' : 'text-gray-300'}`}
                        disabled={formLoading}
                      >
                        ★
                      </button>
                    ))}
                    {formRating && (
                      <button
                        type="button"
                        onClick={() => setFormRating(null)}
                        className="ml-1 text-sm text-gray-500 hover:text-gray-700"
                        disabled={formLoading}
                      >
                        クリア
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="spoiler"
                    type="checkbox"
                    checked={formSpoiler}
                    onChange={(e) => setFormSpoiler(e.target.checked)}
                    disabled={formLoading}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="spoiler">ネタバレを含む</Label>
                </div>

                <Button
                  type="submit"
                  disabled={formLoading || !formTitle.trim() || !formBody.trim()}
                  className="w-full"
                >
                  {formLoading ? '投稿中...' : '投稿する'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 投稿一覧 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">感想 ({posts.length})</h2>
            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  まだ投稿がありません
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    {editingPostId === post.id ? (
                      // 編集フォーム
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          maxLength={200}
                          disabled={editLoading}
                        />
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full min-h-[100px] p-2 border rounded-md"
                          maxLength={5000}
                          disabled={editLoading}
                        />
                        <div className="flex gap-2 items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(editRating === star ? null : star)}
                              className={`text-xl ${editRating && star <= editRating ? 'text-yellow-500' : 'text-gray-300'}`}
                              disabled={editLoading}
                            >
                              ★
                            </button>
                          ))}
                          {editRating && (
                            <button
                              type="button"
                              onClick={() => setEditRating(null)}
                              className="text-sm text-gray-500 hover:text-gray-700"
                              disabled={editLoading}
                            >
                              クリア
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editSpoiler}
                            onChange={(e) => setEditSpoiler(e.target.checked)}
                            disabled={editLoading}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-gray-600">ネタバレを含む</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePost(post.id)}
                            disabled={editLoading || !editTitle.trim() || !editBody.trim()}
                          >
                            {editLoading ? '更新中...' : '保存'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing} disabled={editLoading}>
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 通常表示
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm text-gray-500">{post.user.username}</p>
                            <h3 className="font-bold text-lg">{post.title}</h3>
                            {post.rating && (
                              <div className="flex gap-0.5 mt-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span key={i} className={i < post.rating! ? 'text-yellow-500' : 'text-gray-300'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {post.spoiler && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                ネタバレ
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant={post.isLikedByCurrentUser ? 'default' : 'outline'}
                              onClick={() => handleToggleLike(post.id)}
                            >
                              ❤️ {post.likesCount}
                            </Button>
                          </div>
                        </div>

                        {post.spoiler && !revealedSpoilers.has(post.id) ? (
                          <div className="bg-gray-100 rounded p-3 text-center">
                            <p className="text-sm text-gray-500 mb-2">ネタバレを含む投稿です</p>
                            <Button size="sm" variant="outline" onClick={() => toggleSpoilerReveal(post.id)}>
                              表示する
                            </Button>
                          </div>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-wrap mt-2">{post.body}</p>
                        )}

                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                            {post.updatedAt !== post.createdAt && ' (編集済み)'}
                          </p>
                          {user && post.userId === user.id && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => startEditing(post)}>
                                編集
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeletePost(post.id)}>
                                削除
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
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
