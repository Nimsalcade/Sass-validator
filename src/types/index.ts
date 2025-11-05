export interface ScrapeRequest {
  url: string;
  user?: string;
  project?: string;
  userAgent?: string;
  timeout?: number;
  maxRedirects?: number;
}

export interface ScrapeResult {
  success: boolean;
  content?: string;
  status?: number;
  headers?: Record<string, string>;
  error?: string;
  cached: boolean;
  rateLimited: boolean;
  robotsAllowed: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  projectId?: string;
  url: string;
  method: string;
  userAgent: string;
  status: number;
  responseTime: number;
  cached: boolean;
  rateLimited: boolean;
  robotsAllowed: boolean;
  error?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface RobotsInfo {
  allowed: boolean;
  crawlDelay?: number;
  userAgent: string;
}

export interface PIIFilterResult {
  filtered: boolean;
  content: string;
  detectedPII: Array<{
    type: string;
    confidence: number;
    position: number;
    length: number;
  }>;
}

export interface CacheEntry {
  content: string;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
  ttl: number;
}

export interface HostRateLimit {
  requests: number;
  window: number;
  currentRequests: number;
  resetTime: number;
  backoffUntil?: number;
}