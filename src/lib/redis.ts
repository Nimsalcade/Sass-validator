import { Redis } from 'ioredis';

// Redis client configuration
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Handle Redis connection events
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

// Graceful shutdown
process.on('SIGINT', () => {
  redis.quit();
});

process.on('SIGTERM', () => {
  redis.quit();
});

export { redis };
