import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/scraping_guardrails',
  },
  scraping: {
    defaultUserAgent: process.env.DEFAULT_USER_AGENT || 'ScrapingGuardrails/1.0 (+https://example.com/bot)',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
    maxRedirects: parseInt(process.env.MAX_REDIRECTS || '5', 10),
  },
  rateLimiting: {
    defaultRequests: parseInt(process.env.DEFAULT_RATE_LIMIT_REQUESTS || '10', 10),
    defaultWindow: parseInt(process.env.DEFAULT_RATE_LIMIT_WINDOW || '60000', 10),
    backoffInitialDelay: parseInt(process.env.BACKOFF_INITIAL_DELAY || '1000', 10),
    backoffMaxDelay: parseInt(process.env.BACKOFF_MAX_DELAY || '60000', 10),
    backoffMultiplier: parseFloat(process.env.BACKOFF_MULTIPLIER || '2'),
  },
  caching: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    maxSize: parseInt(process.env.MAX_CACHE_SIZE || '10000', 10),
  },
  throttling: {
    globalMaxRequestsPerSecond: parseInt(process.env.GLOBAL_MAX_REQUESTS_PER_SECOND || '100', 10),
    globalMaxConcurrentRequests: parseInt(process.env.GLOBAL_MAX_CONCURRENT_REQUESTS || '50', 10),
  },
  allowlist: {
    allowedDomains: process.env.ALLOWED_DOMAINS?.split(',') || [],
    blockedDomains: process.env.BLOCKED_DOMAINS?.split(',') || [],
  },
  pii: {
    enabled: process.env.ENABLE_PII_FILTERING === 'true',
    confidenceThreshold: parseFloat(process.env.PII_CONFIDENCE_THRESHOLD || '0.7'),
  },
  audit: {
    logRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10),
  },
};