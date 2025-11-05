import { PIIService } from '../services/pii.service';

describe('Unit Tests', () => {
  describe('PII Service', () => {
    let piiService: PIIService;

    beforeAll(() => {
      piiService = new PIIService();
    });

    it('should filter email addresses', () => {
      const content = 'Contact support@example.com for help';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[EMAIL_REDACTED]');
      expect(result.content).not.toContain('support@example.com');
    });

    it('should filter phone numbers', () => {
      const content = 'Call (555) 123-4567 for support';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[PHONE_REDACTED]');
      expect(result.content).not.toContain('(555) 123-4567');
    });

    it('should filter SSN', () => {
      const content = 'SSN: 123-45-6789';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[SSN_REDACTED]');
      expect(result.content).not.toContain('123-45-6789');
    });

    it('should filter valid credit card numbers', () => {
      const content = 'Card: 4539 1488 0343 6467';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[CREDIT_CARD_REDACTED]');
      expect(result.content).not.toContain('4539 1488 0343 6467');
    });

    it('should not filter invalid credit card numbers', () => {
      const content = 'Not a card: 1234 5678 9012 3456';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(false);
      expect(result.content).toBe(content);
    });

    it('should filter public IP addresses', () => {
      const content = 'Server IP: 8.8.8.8';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[IP_REDACTED]');
      expect(result.content).not.toContain('8.8.8.8');
    });

    it('should not filter private IP addresses', () => {
      const content = 'Local IP: 192.168.1.1';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(false);
      expect(result.content).toBe(content);
    });

    it('should filter addresses', () => {
      const content = 'Visit 123 Main Street';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[ADDRESS_REDACTED]');
      expect(result.content).not.toContain('123 Main Street');
    });

    it('should handle content without PII', () => {
      const content = 'This is just regular text without any personal information.';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(false);
      expect(result.content).toBe(content);
      expect(result.detectedPII).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should have valid configuration values', () => {
      const { config } = require('../config');
      
      expect(config.server.port).toBeGreaterThan(0);
      expect(config.server.port).toBeLessThan(65536);
      expect(config.redis.port).toBeGreaterThan(0);
      expect(config.redis.port).toBeLessThan(65536);
      expect(config.scraping.requestTimeout).toBeGreaterThan(0);
      expect(config.scraping.maxRedirects).toBeGreaterThan(0);
      expect(config.rateLimiting.defaultRequests).toBeGreaterThan(0);
      expect(config.rateLimiting.defaultWindow).toBeGreaterThan(0);
      expect(config.caching.ttl).toBeGreaterThan(0);
      expect(config.throttling.globalMaxRequestsPerSecond).toBeGreaterThan(0);
      expect(config.throttling.globalMaxConcurrentRequests).toBeGreaterThan(0);
    });
  });

  describe('URL Validation', () => {
    it('should validate URL patterns', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path',
        'https://example.com:8080/path?query=value',
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        '',
      ];

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });

      invalidUrls.forEach(url => {
        expect(() => new URL(url)).toThrow();
      });
    });
  });
});