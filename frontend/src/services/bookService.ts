import axios from 'axios';
import { GoogleBooksResponse, GoogleBookItem, Book } from '@/types/book';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Google Books APIから本を検索
 */
export async function searchBooks(
  query: string,
  maxResults: number = 40,
  startIndex: number = 0
): Promise<Book[]> {
  try {
    const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults,
        startIndex,
        langRestrict: 'ja', // 日本語の本のみ
        orderBy: 'relevance',
        country: 'JP', // 日本で利用可能な本
      },
    });

    if (!response.data.items) {
      return [];
    }

    // 日本語の本のみフィルタリング
    const books = response.data.items
      .map(mapGoogleBookToBook)
      .filter((book) => book.language === 'ja');

    return books;
  } catch (error) {
    console.error('Failed to search books:', error);
    throw new Error('本の検索に失敗しました');
  }
}

/**
 * カテゴリーで本を検索
 */
export async function searchBooksByCategory(
  category: string,
  maxResults: number = 40
): Promise<Book[]> {
  if (category === 'おすすめ') {
    // おすすめは複数カテゴリから取得
    return getRecommendedBooks(maxResults);
  }

  if (category === '全て') {
    // 日本の人気書籍を取得
    return searchBooks('日本 書籍', maxResults);
  }

  const categoryQuery = mapCategoryToQuery(category);
  // 日本語のクエリを追加して、より日本の本を取得しやすくする
  return searchBooks(`${categoryQuery} 日本語`, maxResults);
}

/**
 * おすすめの本を取得（複数カテゴリから人気の本を取得）
 */
async function getRecommendedBooks(maxResults: number = 40): Promise<Book[]> {
  try {
    // 複数のカテゴリから少しずつ取得
    const categories = ['ビジネス', 'IT・コンピュータ', '自己啓発', '文学・小説'];
    const booksPerCategory = Math.ceil(maxResults / categories.length);

    const allBooks = await Promise.all(
      categories.map(cat => searchBooksByCategory(cat, booksPerCategory))
    );

    // 結果を結合して重複削除
    const uniqueBooks = new Map<string, Book>();
    allBooks.flat().forEach(book => {
      if (!uniqueBooks.has(book.googleBooksId)) {
        uniqueBooks.set(book.googleBooksId, book);
      }
    });

    return Array.from(uniqueBooks.values()).slice(0, maxResults);
  } catch (error) {
    console.error('Failed to get recommended books:', error);
    return [];
  }
}

/**
 * 新着・人気の本を取得
 */
export async function getFeaturedBooks(maxResults: number = 20): Promise<Book[]> {
  return searchBooks('日本 新刊 書籍', maxResults);
}

/**
 * Google Books APIのレスポンスを本のエンティティに変換
 */
function mapGoogleBookToBook(item: GoogleBookItem): Book {
  const volumeInfo = item.volumeInfo;
  const isbn10 = volumeInfo.industryIdentifiers?.find((id) => id.type === 'ISBN_10')?.identifier;
  const isbn13 = volumeInfo.industryIdentifiers?.find((id) => id.type === 'ISBN_13')?.identifier;

  return {
    id: item.id,
    googleBooksId: item.id,
    title: volumeInfo.title || '不明',
    authors: volumeInfo.authors || ['著者不明'],
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description,
    isbn10,
    isbn13,
    pageCount: volumeInfo.pageCount,
    thumbnailUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
    categories: volumeInfo.categories,
    language: volumeInfo.language,
  };
}

/**
 * カテゴリー名をGoogle Books APIのクエリに変換
 * 日本語のクエリを使用して、より日本の本を取得しやすくする
 */
function mapCategoryToQuery(category: string): string {
  const categoryMap: Record<string, string> = {
    '文学・小説': '小説 OR 文学',
    'ビジネス': 'ビジネス OR 経営',
    '自己啓発': '自己啓発',
    'IT・コンピュータ': 'IT OR コンピュータ',
    '技術書・プログラミング': 'プログラミング OR 技術書',
    '歴史': '歴史',
    '科学': '科学',
    'ミステリー': 'ミステリー OR 推理小説',
    'SF・ファンタジー': 'SF OR ファンタジー',
    'ノンフィクション': 'ノンフィクション',
    'エッセイ': 'エッセイ',
  };

  return categoryMap[category] || category;
}
