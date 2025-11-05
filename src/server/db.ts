import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const redis = globalForRedis.redis ?? createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Connect to Redis
if (!redis.isOpen) {
  redis.connect().catch(console.error);
}

// Storage helpers
export const storage = {
  upload: async (key: string, data: Buffer | string): Promise<void> => {
    // This would integrate with your storage solution (S3, etc.)
    // For now, we'll use Redis as a simple key-value store
    await redis.set(key, data);
  },
  
  download: async (key: string): Promise<string | null> => {
    return await redis.get(key);
  },
  
  delete: async (key: string): Promise<void> => {
    await redis.del(key);
  },
  
  exists: async (key: string): Promise<boolean> => {
    const result = await redis.exists(key);
    return result === 1;
  }
};