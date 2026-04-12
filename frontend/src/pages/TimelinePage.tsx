import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Post, UpdatePostRequest } from '@/types/post';
import { getTimeline, updatePost, deletePost, togglePostLike } from '@/services/postService';

export function TimelinePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // 編集状態
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const data = await getTimeline();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
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

  const startEditing = (post: Post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditRating(post.rating);
    setEditSpoiler(post.spoiler);
  };

  const cancelEditing = () => setEditingPostId(null);

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
      await loadTimeline();
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
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error: any) {
      alert(error.message || '削除に失敗しました');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              📚 Bookshelf
            </h1>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                ダッシュボード
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">タイムライン</h2>

        {loading ? (
          <div className="text-center py-20 text-gray-500">読み込み中...</div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500 py-16">
              <p className="text-4xl mb-4">📝</p>
              <p>まだ投稿がありません</p>
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                最初の投稿をする
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-5">
                  {/* 本の情報 */}
                  {post.book && (
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                      {post.book.thumbnailUrl ? (
                        <img
                          src={post.book.thumbnailUrl}
                          alt={post.book.title}
                          className="w-9 h-12 object-cover rounded shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                          📖
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{post.book.title}</p>
                        <p className="text-xs text-gray-500 truncate">{post.book.authors.join(', ')}</p>
                      </div>
                    </div>
                  )}

                  {editingPostId === post.id ? (
                    // 編集フォーム
                    <div className="space-y-3">
                      <div>
                        <Label>タイトル</Label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full p-2 border rounded-md mt-1 text-sm"
                          maxLength={200}
                          disabled={editLoading}
                          autoFocus
                        />
                      </div>
                      <div>
                        <Label>感想</Label>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full min-h-[100px] p-2 border rounded-md mt-1 text-sm"
                          maxLength={5000}
                          disabled={editLoading}
                        />
                      </div>
                      <div className="flex gap-1 items-center">
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
                            className="ml-1 text-sm text-gray-500"
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
                          <p className="text-sm font-semibold text-gray-500">{post.user.username}</p>
                          <h3 className="font-bold text-lg leading-snug">{post.title}</h3>
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
                        <div className="flex items-center gap-2 flex-shrink-0">
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
                        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
                      )}

                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString('ja-JP', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
