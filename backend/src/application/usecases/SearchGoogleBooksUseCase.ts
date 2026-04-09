import axios from 'axios';
import { cacheService } from '../../infrastructure/cache/CacheService';

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
 * Google Books APIを検索するユースケース（Redisキャッシュ付き）
 */
export class SearchGoogleBooksUseCase {
  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly cacheTTL = 60 * 60 * 24; // 24時間

  async execute(
    query: string,
    maxResults: number = 40,
    startIndex: number = 0
  ): Promise<GoogleBooksResponse> {
    // キャッシュキーを生成
    const cacheKey = `google-books:${query}:${maxResults}:${startIndex}`;

    // キャッシュをチェック
    const cached = await cacheService.get<GoogleBooksResponse>(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    console.log(`Cache MISS: ${cacheKey} - Fetching from Google Books API`);

    // Google Books APIにリクエスト
    try {
      const response = await axios.get<GoogleBooksResponse>(this.apiUrl, {
        params: {
          q: query,
          maxResults,
          startIndex,
          langRestrict: 'ja',
          orderBy: 'relevance',
          country: 'JP',
        },
      });

      // 結果を通常キャッシュと期限なしのstaleキャッシュ両方に保存
      await cacheService.set(cacheKey, response.data, this.cacheTTL);
      await cacheService.set(`${cacheKey}:stale`, response.data, 60 * 60 * 24 * 30); // 30日間

      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || '';

      console.error(`Google Books API error [${status}]:`, message);

      // クォータ超過（429 or 403）の場合、期限切れのキャッシュがあれば返す
      if (status === 429 || status === 403) {
        const staleKey = `${cacheKey}:stale`;
        const staleCache = await cacheService.get<GoogleBooksResponse>(staleKey);
        if (staleCache) {
          console.log(`Using stale cache for: ${cacheKey}`);
          return staleCache;
        }

        const quotaError = new Error('QUOTA_EXCEEDED');
        (quotaError as any).status = 429;
        throw quotaError;
      }

      throw new Error('Google Books APIを取得出来ませんでした。');
    }
  }
}
