import axios, { AxiosResponse } from 'axios';
import { config } from '../config';
import { ScrapeRequest, ScrapeResult, RateLimitInfo, RobotsInfo } from '../types';
import { RedisService } from './redis.service';
import { RobotsService } from './robots.service';
import { PIIService } from './pii.service';
import { AuditService } from './audit.service';

export class ScrapingService {
  private redis: RedisService;
  private robots: RobotsService;
  private pii: PIIService;
  private audit: AuditService;

  constructor() {
    this.redis = new RedisService();
    this.robots = new RobotsService(this.redis);
    this.pii = new PIIService();
    this.audit = new AuditService();
  }

  async scrape(request: ScrapeRequest): Promise<ScrapeResult> {
    const startTime = Date.now();
    let result: ScrapeResult = {
      success: false,
      cached: false,
      rateLimited: false,
      robotsAllowed: true,
    };

    try {
      // Extract host from URL
      const urlObj = new URL(request.url);
      const host = urlObj.hostname;

      // Check if host is in allowlist/blocklist
      if (!this.isHostAllowed(host)) {
        result.error = `Host ${host} is not allowed`;
        await this.logAuditEntry(request, result, startTime);
        return result;
      }

      // Check global throttle
      const globalThrottle = await this.redis.checkGlobalThrottle();
      if (!globalThrottle.allowed) {
        result.rateLimited = true;
        result.error = 'Global rate limit exceeded';
        await this.logAuditEntry(request, result, startTime);
        return result;
      }

      // Check concurrent request limit
      if (await this.redis.isConcurrentLimitReached()) {
        result.rateLimited = true;
        result.error = 'Concurrent request limit reached';
        await this.logAuditEntry(request, result, startTime);
        return result;
      }

      // Check robots.txt
      const robotsInfo: RobotsInfo = await this.robots.isAllowed(
        request.url,
        request.userAgent || config.scraping.defaultUserAgent
      );

      if (!robotsInfo.allowed) {
        result.robotsAllowed = false;
        result.error = 'Blocked by robots.txt';
        await this.logAuditEntry(request, result, startTime);
        return result;
      }

      // Apply crawl delay if specified
      if (robotsInfo.crawlDelay && robotsInfo.crawlDelay > 0) {
        await this.delay(robotsInfo.crawlDelay);
      }

      // Check backoff time for this host
      const backoffTime = await this.redis.getBackoffTime(host);
      if (backoffTime && backoffTime > Date.now()) {
        result.rateLimited = true;
        result.error = `Host in backoff period, retry after ${backoffTime - Date.now()}ms`;
        await this.logAuditEntry(request, result, startTime);
        return result;
      }

      // Check rate limit for this host
      const rateLimitInfo: RateLimitInfo = await this.redis.checkRateLimit(host);
      if (!rateLimitInfo.allowed) {
        result.rateLimited = true;
        result.error = `Rate limit exceeded for ${host}`;
        
        // Set exponential backoff
        const backoffDelay = this.calculateBackoffDelay();
        await this.redis.setBackoffTime(host, backoffDelay);
        
        await this.logAuditEntry(request, result, startTime);
        return result;
      }

      // Check cache first
      const cachedEntry = await this.redis.getCacheEntry(request.url);
      if (cachedEntry) {
        result = {
          success: true,
          content: cachedEntry.content,
          status: cachedEntry.status,
          headers: cachedEntry.headers,
          cached: true,
          rateLimited: false,
          robotsAllowed: true,
        };
        
        await this.logAuditEntry(request, result, startTime);
        return result;
      }

      // Increment concurrent requests counter
      await this.redis.incrementConcurrentRequests();

      try {
        // Make the actual request
        const response = await this.makeRequest(request);
        
        // Filter PII from content
        const piiResult = this.pii.filterPII(response.data);
        
        result = {
          success: true,
          content: piiResult.content,
          status: response.status,
          headers: response.headers as Record<string, string>,
          cached: false,
          rateLimited: false,
          robotsAllowed: true,
        };

        // Cache the result
        await this.redis.setCacheEntry(request.url, {
          content: piiResult.content,
          status: response.status,
          headers: response.headers as Record<string, string>,
          ttl: config.caching.ttl,
        });

        // Clear any backoff for this host on success
        await this.redis.setBackoffTime(host, 0);

      } finally {
        // Decrement concurrent requests counter
        await this.redis.decrementConcurrentRequests();
      }

    } catch (error: any) {
      result.error = error.message;
      
      // If it's a rate limit error (429), set backoff
      if (error.response?.status === 429) {
        const urlObj = new URL(request.url);
        const host = urlObj.hostname;
        const backoffDelay = this.calculateBackoffDelay();
        await this.redis.setBackoffTime(host, backoffDelay);
        result.rateLimited = true;
      }
    }

    await this.logAuditEntry(request, result, startTime);
    return result;
  }

  private async makeRequest(request: ScrapeRequest): Promise<AxiosResponse> {
    const userAgent = request.userAgent || config.scraping.defaultUserAgent;
    const timeout = request.timeout || config.scraping.requestTimeout;
    const maxRedirects = request.maxRedirects || config.scraping.maxRedirects;

    return axios.get(request.url, {
      timeout,
      maxRedirects,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      validateStatus: (status) => status < 500, // Don't throw for 4xx errors
    });
  }

  private isHostAllowed(host: string): boolean {
    // Check blocked domains first
    if (config.allowlist.blockedDomains.length > 0) {
      for (const blocked of config.allowlist.blockedDomains) {
        if (host === blocked || host.endsWith(`.${blocked}`)) {
          return false;
        }
      }
    }

    // If allowlist is configured, only allow those domains
    if (config.allowlist.allowedDomains.length > 0) {
      for (const allowed of config.allowlist.allowedDomains) {
        if (host === allowed || host.endsWith(`.${allowed}`)) {
          return true;
        }
      }
      return false;
    }

    // If no allowlist is configured, allow all (except blocked)
    return true;
  }

  private calculateBackoffDelay(): number {
    const baseDelay = config.rateLimiting.backoffInitialDelay;
    const maxDelay = config.rateLimiting.backoffMaxDelay;
    const multiplier = config.rateLimiting.backoffMultiplier;
    
    // Add some jitter to avoid thundering herd
    const jitter = Math.random() * 1000;
    const delay = Math.min(baseDelay * multiplier + jitter, maxDelay);
    
    return Math.floor(delay);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async logAuditEntry(request: ScrapeRequest, result: ScrapeResult, startTime: number): Promise<void> {
    const responseTime = Date.now() - startTime;
    
    await this.audit.logRequest({
      userId: request.user,
      projectId: request.project,
      url: request.url,
      method: 'GET',
      userAgent: request.userAgent || config.scraping.defaultUserAgent,
      status: result.status || (result.success ? 200 : 500),
      responseTime,
      cached: result.cached,
      rateLimited: result.rateLimited,
      robotsAllowed: result.robotsAllowed,
      error: result.error,
      metadata: {
        host: new URL(request.url).hostname,
        contentLength: result.content?.length || 0,
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
    await this.audit.disconnect();
  }
}