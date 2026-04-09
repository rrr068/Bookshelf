import { redis } from './RedisClient';

/**
 * キャッシュサービス
 */
export class CacheService {
  private defaultTTL = 60 * 60; // 1時間（秒単位）

  /**
   * キャッシュから値を取得
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (!cached) return null;

      return JSON.parse(cached) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * キャッシュに値を設定
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl || this.defaultTTL, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * キャッシュから値を削除
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * パターンに一致するキーをすべて削除
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * キャッシュが存在するかチェック
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService();
