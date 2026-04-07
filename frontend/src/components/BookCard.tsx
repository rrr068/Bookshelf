import { Book } from '@/types/book';
import { Card } from '@/components/ui/card';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

/**
 * 本のカードコンポーネント
 */
export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] bg-gray-100">
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
        <p className="text-xs text-gray-600 line-clamp-1">
          {book.authors.join(', ')}
        </p>
      </div>
    </Card>
  );
}
