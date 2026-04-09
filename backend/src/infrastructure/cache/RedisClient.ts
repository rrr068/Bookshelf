import Redis from 'ioredis';

/**
 * Redisクライアントのシングルトン
 */
class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
      console.log('Redis URL:', redisUrl);
      RedisClient.instance = new Redis(redisUrl, {
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
        console.error('Redis connection error:', error);
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
