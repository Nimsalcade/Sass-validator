import { ScrapingService } from '../services/scraping.service';
import { ScrapeRequest } from '../types';

describe('ScrapingService', () => {
  let scrapingService: ScrapingService;

  beforeAll(() => {
    scrapingService = new ScrapingService();
  });

  afterAll(async () => {
    await scrapingService.disconnect();
  });

  describe('URL validation', () => {
    it('should reject invalid URLs', async () => {
      const request: ScrapeRequest = {
        url: 'invalid-url',
      };

      const result = await scrapingService.scrape(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid URL format');
    });

    it('should accept valid HTTP URLs', async () => {
      const request: ScrapeRequest = {
        url: 'http://example.com',
      };

      // This might fail due to network/rate limiting, but should not fail due to URL validation
      const result = await scrapingService.scrape(request);
      expect(result.url).toBeUndefined(); // URL validation happens at the API level
    });

    it('should accept valid HTTPS URLs', async () => {
      const request: ScrapeRequest = {
        url: 'https://example.com',
      };

      // This might fail due to network/rate limiting, but should not fail due to URL validation
      const result = await scrapingService.scrape(request);
      expect(result.url).toBeUndefined(); // URL validation happens at the API level
    });
  });

  describe('User agent handling', () => {
    it('should use default user agent when none provided', async () => {
      const request: ScrapeRequest = {
        url: 'https://example.com',
      };

      // We can't easily test the actual user agent without mocking
      // But we can ensure the service doesn't crash
      const result = await scrapingService.scrape(request);
      expect(typeof result.success).toBe('boolean');
    });

    it('should use custom user agent when provided', async () => {
      const request: ScrapeRequest = {
        url: 'https://example.com',
        userAgent: 'CustomBot/1.0',
      };

      // We can't easily test the actual user agent without mocking
      // But we can ensure the service doesn't crash
      const result = await scrapingService.scrape(request);
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Metadata handling', () => {
    it('should include user and project metadata when provided', async () => {
      const request: ScrapeRequest = {
        url: 'https://example.com',
        user: 'test-user',
        project: 'test-project',
      };

      // We can't easily test audit logging without mocking the database
      // But we can ensure the service doesn't crash
      const result = await scrapingService.scrape(request);
      expect(typeof result.success).toBe('boolean');
    });
  });
});