import Redis from 'ioredis';
import { config } from '../config';
import { CacheEntry, HostRateLimit, RateLimitInfo } from '../types';

export class RedisService {
  private client: Redis;
  private globalCounter: number = 0;
  private lastGlobalReset: number = Date.now();

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  async checkRateLimit(host: string, customLimit?: number): Promise<RateLimitInfo> {
    const key = `rate_limit:${host}`;
    const now = Date.now();
    const window = config.rateLimiting.defaultWindow;
    const requests = customLimit || config.rateLimiting.defaultRequests;

    try {
      const pipeline = this.client.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, Math.ceil(window / 1000));
      
      const results = await pipeline.exec();
      const currentRequests = results?.[0]?.[1] as number || 0;

      if (currentRequests > requests) {
        const ttl = await this.client.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + (ttl * 1000),
          retryAfter: ttl * 1000,
        };
      }

      return {
        allowed: true,
        remaining: requests - currentRequests,
        resetTime: now + window,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return {
        allowed: true,
        remaining: requests,
        resetTime: now + window,
      };
    }
  }

  async checkGlobalThrottle(): Promise<RateLimitInfo> {
    const now = Date.now();
    const second = Math.floor(now / 1000);
    const key = `global_throttle:${second}`;

    try {
      const current = await this.client.incr(key);
      await this.client.expire(key, 2);

      if (current > config.throttling.globalMaxRequestsPerSecond) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (second + 1) * 1000,
          retryAfter: 1000,
        };
      }

      return {
        allowed: true,
        remaining: config.throttling.globalMaxRequestsPerSecond - current,
        resetTime: (second + 1) * 1000,
      };
    } catch (error) {
      console.error('Global throttle check failed:', error);
      return {
        allowed: true,
        remaining: config.throttling.globalMaxRequestsPerSecond,
        resetTime: (second + 1) * 1000,
      };
    }
  }

  async getCacheEntry(url: string): Promise<CacheEntry | null> {
    try {
      const key = `cache:${Buffer.from(url).toString('base64')}`;
      const data = await this.client.get(key);
      
      if (data) {
        const entry: CacheEntry = JSON.parse(data);
        if (Date.now() < entry.timestamp + entry.ttl) {
          return entry;
        } else {
          await this.client.del(key);
        }
      }
      return null;
    } catch (error) {
      console.error('Cache get failed:', error);
      return null;
    }
  }

  async setCacheEntry(url: string, entry: Omit<CacheEntry, 'timestamp'>): Promise<void> {
    try {
      const key = `cache:${Buffer.from(url).toString('base64')}`;
      const fullEntry: CacheEntry = {
        ...entry,
        timestamp: Date.now(),
      };
      
      await this.client.setex(key, Math.ceil(entry.ttl / 1000), JSON.stringify(fullEntry));
    } catch (error) {
      console.error('Cache set failed:', error);
    }
  }

  async getBackoffTime(host: string): Promise<number | null> {
    try {
      const key = `backoff:${host}`;
      const backoffUntil = await this.client.get(key);
      return backoffUntil ? parseInt(backoffUntil, 10) : null;
    } catch (error) {
      console.error('Backoff get failed:', error);
      return null;
    }
  }

  async setBackoffTime(host: string, delay: number): Promise<void> {
    try {
      const key = `backoff:${host}`;
      const backoffUntil = Date.now() + delay;
      await this.client.setex(key, Math.ceil(delay / 1000), backoffUntil.toString());
    } catch (error) {
      console.error('Backoff set failed:', error);
    }
  }

  async incrementConcurrentRequests(): Promise<number> {
    try {
      return await this.client.incr('concurrent_requests');
    } catch (error) {
      console.error('Concurrent requests increment failed:', error);
      return 0;
    }
  }

  async decrementConcurrentRequests(): Promise<void> {
    try {
      await this.client.decr('concurrent_requests');
    } catch (error) {
      console.error('Concurrent requests decrement failed:', error);
    }
  }

  async isConcurrentLimitReached(): Promise<boolean> {
    try {
      const current = await this.client.get('concurrent_requests');
      const currentNum = current ? parseInt(current, 10) : 0;
      return currentNum >= config.throttling.globalMaxConcurrentRequests;
    } catch (error) {
      console.error('Concurrent limit check failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}