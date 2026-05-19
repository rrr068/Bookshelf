import Redis from 'ioredis';

/**
 * Redisクライアントのシングルトン
 * REDIS_URL が未設定の場合は接続しない
 */
class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis | null {
    if (RedisClient.instance !== undefined && RedisClient.instance === null && !process.env.REDIS_URL) {
      return null;
    }
    if (!RedisClient.instance) {
      if (!process.env.REDIS_URL) {
        console.log('REDIS_URL not set — Redis disabled, using in-memory cache');
        return null;
      }
      RedisClient.instance = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      RedisClient.instance.on('connect', () => {
        console.log('Redis connected successfully');
      });

      RedisClient.instance.on('error', (error) => {
        console.error('Redis connection error:', error.message);
      });
    }

    return RedisClient.instance;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
    }
  }
}

export const redis = RedisClient.getInstance();
