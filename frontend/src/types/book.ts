/**
 * Google Books APIのレスポンス型
 */
export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBookItem[];
  totalItems: number;
}

/**
 * 本のエンティティ
 */
export interface Book {
  id: string;
  googleBooksId: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number;
  thumbnailUrl?: string;
  categories?: string[];
  language?: string;
  averageRating?: number;
  likesCount?: number;
  isLikedByCurrentUser?: boolean;
}

/**
 * 読書ステータス
 */
export type ReadingStatus = 'want_to_read' | 'reading' | 'completed' | 'on_hold' | 'dropped';

/**
 * 読書ステータスのラベル
 */
export const ReadingStatusLabel: Record<ReadingStatus, string> = {
  want_to_read: '読みたい',
  reading: '読書中',
  completed: '読了',
  on_hold: '一時中断',
  dropped: '中止',
};

/**
 * 本のカテゴリー（ジャンル）
 */
export const BookCategories = [
  '全て',
  '文学・小説',
  'ビジネス',
  '自己啓発',
  'IT・コンピュータ',
  '技術書・プログラミング',
  '歴史',
  '科学',
  'ミステリー',
  'SF・ファンタジー',
  'ノンフィクション',
  'エッセイ',
  'その他',
] as const;

export type BookCategory = typeof BookCategories[number];
