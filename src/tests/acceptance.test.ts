import { ScrapingService } from '../services/scraping.service';
import { RedisService } from '../services/redis.service';
import { RobotsService } from '../services/robots.service';
import { PIIService } from '../services/pii.service';
import { AuditService } from '../services/audit.service';
import { ScrapeRequest } from '../types';

describe('Acceptance Tests', () => {
  let scrapingService: ScrapingService;
  let redis: RedisService;

  beforeAll(async () => {
    scrapingService = new ScrapingService();
    redis = new RedisService();
  });

  afterAll(async () => {
    await scrapingService.disconnect();
  });

  describe('Robots.txt Compliance', () => {
    it('should respect robots.txt disallow rules', async () => {
      // Test with a URL that should be disallowed by robots.txt
      const request: ScrapeRequest = {
        url: 'https://www.google.com/search',
        user: 'test-user',
        project: 'test-project',
      };

      const result = await scrapingService.scrape(request);
      
      // The request should be blocked by robots.txt
      expect(result.robotsAllowed).toBe(false);
      expect(result.success).toBe(false);
      expect(result.error).toContain('robots.txt');
    });

    it('should allow URLs permitted by robots.txt', async () => {
      const request: ScrapeRequest = {
        url: 'https://example.com',
        user: 'test-user',
        project: 'test-project',
      };

      const result = await scrapingService.scrape(request);
      
      // The request should be allowed by robots.txt
      expect(result.robotsAllowed).toBe(true);
      // May still fail for other reasons (network, etc.)
    });
  });

  describe('Request Caching', () => {
    it('should use cache for repeated requests to the same URL', async () => {
      const request: ScrapeRequest = {
        url: 'https://httpbin.org/html',
        user: 'test-user',
        project: 'test-project',
      };

      // First request
      const result1 = await scrapingService.scrape(request);
      expect(result1.cached).toBe(false);

      // Second request to same URL
      const result2 = await scrapingService.scrape(request);
      expect(result2.cached).toBe(true);

      // Results should be identical
      expect(result1.content).toBe(result2.content);
      expect(result1.status).toBe(result2.status);
    });

    it('should have different cache entries for different URLs', async () => {
      const request1: ScrapeRequest = {
        url: 'https://httpbin.org/html',
        user: 'test-user',
        project: 'test-project',
      };

      const request2: ScrapeRequest = {
        url: 'https://httpbin.org/robots.txt',
        user: 'test-user',
        project: 'test-project',
      };

      const result1 = await scrapingService.scrape(request1);
      const result2 = await scrapingService.scrape(request2);

      expect(result1.content).not.toBe(result2.content);
    });
  });

  describe('Audit Logging', () => {
    it('should create audit log entries for all requests', async () => {
      const request: ScrapeRequest = {
        url: 'https://httpbin.org/html',
        user: 'test-user',
        project: 'test-project',
      };

      await scrapingService.scrape(request);

      // Give some time for the audit log to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditService = new AuditService();
      const logs = await auditService.getAuditLogs({
        userId: 'test-user',
        projectId: 'test-project',
        limit: 10,
      });

      expect(logs.length).toBeGreaterThan(0);
      
      const latestLog = logs[0];
      expect(latestLog.userId).toBe('test-user');
      expect(latestLog.projectId).toBe('test-project');
      expect(latestLog.url).toBe('https://httpbin.org/html');
      expect(latestLog.method).toBe('GET');
      expect(latestLog.timestamp).toBeInstanceOf(Date);

      await auditService.disconnect();
    });

    it('should include rate limiting information in audit logs', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const request: ScrapeRequest = {
        url: 'https://httpbin.org/delay/1',
        user: 'test-user',
        project: 'test-project',
      };

      const promises = Array(15).fill(null).map(() => scrapingService.scrape(request));
      const results = await Promise.all(promises);

      // At least one should be rate limited
      const rateLimitedResults = results.filter(r => r.rateLimited);
      expect(rateLimitedResults.length).toBeGreaterThan(0);

      // Check audit logs for rate limiting
      const auditService = new AuditService();
      const logs = await auditService.getAuditLogs({
        userId: 'test-user',
        projectId: 'test-project',
        limit: 50,
      });

      const rateLimitedLogs = logs.filter(l => l.rateLimited);
      expect(rateLimitedLogs.length).toBeGreaterThan(0);

      await auditService.disconnect();
    });
  });

  describe('Rate Limiting Enforcement', () => {
    it('should enforce per-host rate limits', async () => {
      const request: ScrapeRequest = {
        url: 'https://httpbin.org/delay/0',
        user: 'test-user',
        project: 'test-project',
      };

      // Make multiple requests rapidly
      const promises = Array(15).fill(null).map(() => scrapingService.scrape(request));
      const results = await Promise.all(promises);

      // Some should be rate limited
      const rateLimitedCount = results.filter(r => r.rateLimited).length;
      expect(rateLimitedCount).toBeGreaterThan(0);

      // At least some should succeed
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('should implement exponential backoff', async () => {
      const request: ScrapeRequest = {
        url: 'https://httpbin.org/status/429',
        user: 'test-user',
        project: 'test-project',
      };

      const result = await scrapingService.scrape(request);
      
      // Should be rate limited due to 429 response
      expect(result.rateLimited).toBe(true);
      expect(result.error).toContain('Rate limit exceeded');
    });
  });

  describe('PII Filtering', () => {
    it('should filter PII from scraped content', async () => {
      const piiService = new PIIService();
      const contentWithPII = `
        Contact us at support@example.com or call (555) 123-4567.
        SSN: 123-45-6789, Credit Card: 4539 1488 0343 6467.
        Visit us at 123 Main Street, IP: 8.8.8.8.
      `;

      const result = piiService.filterPII(contentWithPII);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[EMAIL_REDACTED]');
      expect(result.content).toContain('[PHONE_REDACTED]');
      expect(result.content).toContain('[SSN_REDACTED]');
      expect(result.content).toContain('[CREDIT_CARD_REDACTED]');
      expect(result.content).toContain('[ADDRESS_REDACTED]');
      expect(result.content).toContain('[IP_REDACTED]');
      expect(result.content).not.toContain('support@example.com');
      expect(result.content).not.toContain('(555) 123-4567');
      expect(result.content).not.toContain('123-45-6789');
      expect(result.content).not.toContain('4539 1488 0343 6467');
      expect(result.content).not.toContain('123 Main Street');
      expect(result.content).not.toContain('8.8.8.8');
    });
  });

  describe('Integration Test - Complete Workflow', () => {
    it('should demonstrate complete scraping workflow with all guardrails', async () => {
      const request: ScrapeRequest = {
        url: 'https://httpbin.org/html',
        user: 'integration-test-user',
        project: 'integration-test-project',
        userAgent: 'IntegrationTestBot/1.0',
      };

      // First request
      const result1 = await scrapingService.scrape(request);
      
      expect(result1.robotsAllowed).toBe(true);
      expect(result1.cached).toBe(false);
      // May or may not succeed depending on network, but should not fail due to guardrails

      // Second request (should use cache)
      const result2 = await scrapingService.scrape(request);
      
      expect(result2.robotsAllowed).toBe(true);
      expect(result2.cached).toBe(true);
      expect(result2.content).toBe(result1.content);

      // Verify audit log entries
      const auditService = new AuditService();
      const logs = await auditService.getAuditLogs({
        userId: 'integration-test-user',
        projectId: 'integration-test-project',
        limit: 10,
      });

      expect(logs.length).toBeGreaterThanOrEqual(2);
      
      const cachedLog = logs.find(l => l.cached);
      const nonCachedLog = logs.find(l => !l.cached);
      
      expect(cachedLog).toBeDefined();
      expect(nonCachedLog).toBeDefined();
      expect(cachedLog?.url).toBe('https://httpbin.org/html');
      expect(nonCachedLog?.url).toBe('https://httpbin.org/html');

      await auditService.disconnect();
    });
  });
});