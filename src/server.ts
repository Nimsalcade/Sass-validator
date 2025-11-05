import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { ScrapingService } from './services/scraping.service';
import { AuditService } from './services/audit.service';
import { ScrapeRequest } from './types';
import { scrapeRequestSchema, auditLogsQuerySchema, auditStatsQuerySchema } from './validation/scrape.schema';
import * as Joi from 'joi';

const app = express();
const scrapingService = new ScrapingService();
const auditService = new AuditService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Validation middleware
const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' = 'body') => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const data = source === 'query' ? req.query : req.body;
    const { error, value } = schema.validate(data);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map((d: any) => d.message) 
      });
    }
    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }
    next();
  };
};

// Scrape endpoint
app.post('/scrape', validate(scrapeRequestSchema), async (req, res) => {
  try {
    const scrapeRequest: ScrapeRequest = req.body;
    const result = await scrapingService.scrape(scrapeRequest);
    
    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        status: result.status,
        headers: result.headers,
        cached: result.cached,
        rateLimited: result.rateLimited,
        robotsAllowed: result.robotsAllowed,
      });
    } else {
      res.status(result.rateLimited ? 429 : 400).json({
        success: false,
        error: result.error,
        cached: result.cached,
        rateLimited: result.rateLimited,
        robotsAllowed: result.robotsAllowed,
      });
    }
  } catch (error: any) {
    console.error('Scrape endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Audit logs endpoint
app.get('/audit/logs', validate(auditLogsQuerySchema, 'query'), async (req, res) => {
  try {
    const filters = req.query as any;
    const logs = await auditService.getAuditLogs(filters);
    res.json({ logs, total: logs.length });
  } catch (error: any) {
    console.error('Audit logs endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Audit stats endpoint
app.get('/audit/stats', validate(auditStatsQuerySchema, 'query'), async (req, res) => {
  try {
    const filters = req.query as any;
    const stats = await auditService.getAuditStats(filters);
    res.json(stats);
  } catch (error: any) {
    console.error('Audit stats endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Configuration endpoint (for debugging)
app.get('/config', (req, res) => {
  if (config.server.env !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json({
    scraping: {
      defaultUserAgent: config.scraping.defaultUserAgent,
      requestTimeout: config.scraping.requestTimeout,
      maxRedirects: config.scraping.maxRedirects,
    },
    rateLimiting: {
      defaultRequests: config.rateLimiting.defaultRequests,
      defaultWindow: config.rateLimiting.defaultWindow,
    },
    caching: {
      ttl: config.caching.ttl,
      maxSize: config.caching.maxSize,
    },
    throttling: {
      globalMaxRequestsPerSecond: config.throttling.globalMaxRequestsPerSecond,
      globalMaxConcurrentRequests: config.throttling.globalMaxConcurrentRequests,
    },
    allowlist: {
      allowedDomains: config.allowlist.allowedDomains,
      blockedDomains: config.allowlist.blockedDomains,
    },
    pii: {
      enabled: config.pii.enabled,
      confidenceThreshold: config.pii.confidenceThreshold,
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await scrapingService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await scrapingService.disconnect();
  process.exit(0);
});

export { app };