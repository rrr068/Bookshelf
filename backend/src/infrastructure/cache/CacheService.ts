import { redis } from './RedisClient';

/**
 * インメモリキャッシュのエントリ
 */
interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

/**
 * キャッシュサービス
 * Redis が利用可能な場合は Redis を使用し、利用不可の場合はインメモリキャッシュにフォールバック
 */
export class CacheService {
  private defaultTTL = 60 * 60; // 1時間（秒単位）
  private memoryCache = new Map<string, MemoryCacheEntry>();
  private redisAvailable = redis !== null;

  constructor() {
    if (!redis) return;

    // Redis の接続状態を監視
    redis.on('error', () => {
      if (this.redisAvailable) {
        console.warn('Redis unavailable — falling back to in-memory cache');
        this.redisAvailable = false;
      }
    });
    redis.on('connect', () => {
      if (!this.redisAvailable) {
        console.log('Redis reconnected — switching back from in-memory cache');
        this.redisAvailable = true;
      }
    });
    redis.on('ready', () => {
      this.redisAvailable = true;
    });
  }

  /**
   * インメモリキャッシュから値を取得（期限切れエントリを削除）
   */
  private memGet<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  }

  /**
   * インメモリキャッシュに値を設定
   */
  private memSet(key: string, value: any, ttl: number): void {
    this.memoryCache.set(key, {
      value: JSON.stringify(value),
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  /**
   * キャッシュから値を取得
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redisAvailable || !redis) {
      return this.memGet<T>(key);
    }
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return this.memGet<T>(key);
    }
  }

  /**
   * キャッシュに値を設定
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const effectiveTTL = ttl || this.defaultTTL;
    if (!this.redisAvailable || !redis) {
      this.memSet(key, value, effectiveTTL);
      return;
    }
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, effectiveTTL, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
      this.memSet(key, value, effectiveTTL);
    }
  }

  /**
   * キャッシュから値を削除
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (!this.redisAvailable || !redis) return;
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
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) this.memoryCache.delete(key);
    }
    if (!this.redisAvailable || !redis) return;
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
    if (!this.redisAvailable || !redis) {
      return this.memGet(key) !== null;
    }
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return this.memGet(key) !== null;
    }
  }
}

export const cacheService = new CacheService();
