import request from 'supertest';
import { app } from '../server';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /scrape', () => {
    it('should reject requests without URL', async () => {
      const response = await request(app)
        .post('/scrape')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'URL is required');
    });

    it('should reject invalid URLs', async () => {
      const response = await request(app)
        .post('/scrape')
        .send({ url: 'invalid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should accept valid scrape requests', async () => {
      const response = await request(app)
        .post('/scrape')
        .send({
          url: 'https://example.com',
          user: 'test-user',
          project: 'test-project',
        });

      // The request might fail due to rate limiting, network issues, etc.
      // But it should be a valid response with the expected structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('cached');
      expect(response.body).toHaveProperty('rateLimited');
      expect(response.body).toHaveProperty('robotsAllowed');
    });

    it('should handle custom user agent', async () => {
      const response = await request(app)
        .post('/scrape')
        .send({
          url: 'https://example.com',
          userAgent: 'CustomBot/1.0',
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('cached');
      expect(response.body).toHaveProperty('rateLimited');
      expect(response.body).toHaveProperty('robotsAllowed');
    });
  });

  describe('GET /audit/logs', () => {
    it('should return audit logs structure', async () => {
      const response = await request(app)
        .get('/audit/logs')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    it('should support filtering parameters', async () => {
      const response = await request(app)
        .get('/audit/logs')
        .query({
          userId: 'test-user',
          limit: 10,
          offset: 0,
        })
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('GET /audit/stats', () => {
    it('should return audit statistics', async () => {
      const response = await request(app)
        .get('/audit/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalRequests');
      expect(response.body).toHaveProperty('successfulRequests');
      expect(response.body).toHaveProperty('cachedRequests');
      expect(response.body).toHaveProperty('rateLimitedRequests');
      expect(response.body).toHaveProperty('blockedByRobotsRequests');
      expect(response.body).toHaveProperty('averageResponseTime');
    });

    it('should support filtering parameters', async () => {
      const response = await request(app)
        .get('/audit/stats')
        .query({
          userId: 'test-user',
          projectId: 'test-project',
        })
        .expect(200);

      expect(response.body).toHaveProperty('totalRequests');
      expect(response.body).toHaveProperty('successfulRequests');
    });
  });

  describe('GET /config (development only)', () => {
    it('should return 404 in production', async () => {
      // Temporarily set environment to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/config')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });
});