import { Book } from '@/types/book';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  onLike?: (e: React.MouseEvent) => void;
}

/**
 * 本のカードコンポーネント
 * クリックすると詳細ページに遷移
 */
export function BookCard({ book, onClick, onLike }: BookCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div
        className="relative aspect-[2/3] bg-gray-100 cursor-pointer"
        onClick={onClick}
      >
        {book.thumbnailUrl ? (
          <img
            src={book.thumbnailUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        {/* ホバー時のオーバーレイ */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium">
            詳細を見る
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
          {book.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
          {book.authors.join(', ')}
        </p>

        {/* 平均評価といいねボタン */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {book.averageRating ? (
              <>
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-xs font-medium">{book.averageRating.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">未評価</span>
            )}
          </div>
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={onLike}
            >
              <span className={book.isLikedByCurrentUser ? 'text-red-500' : 'text-gray-400'}>
                ❤️
              </span>
              <span className="ml-1 text-xs">{book.likesCount || 0}</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
