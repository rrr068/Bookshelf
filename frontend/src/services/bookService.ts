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
        langRestrict: 'ja', // 日本語の本を優先
        orderBy: 'relevance',
      },
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map(mapGoogleBookToBook);
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
  if (category === '全て') {
    // デフォルトで人気の本を取得
    return searchBooks('ベストセラー OR 話題', maxResults);
  }

  const categoryQuery = mapCategoryToQuery(category);
  return searchBooks(`subject:${categoryQuery}`, maxResults);
}

/**
 * 新着・人気の本を取得
 */
export async function getFeaturedBooks(maxResults: number = 20): Promise<Book[]> {
  return searchBooks('ベストセラー OR 話題の本', maxResults);
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
 */
function mapCategoryToQuery(category: string): string {
  const categoryMap: Record<string, string> = {
    '文学・小説': 'fiction',
    'ビジネス': 'business',
    '自己啓発': 'self-help',
    '技術書': 'computers',
    '歴史': 'history',
    '科学': 'science',
    'ミステリー': 'mystery',
    'SF・ファンタジー': 'fantasy',
    'ノンフィクション': 'non-fiction',
    'エッセイ': 'essay',
  };

  return categoryMap[category] || category;
}
