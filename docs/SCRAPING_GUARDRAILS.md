# Web Scraping Guardrails and Best Practices

This guide outlines the guardrails, policies, and best practices for web scraping in this application to ensure ethical, legal, and technical compliance.

## Overview

Web scraping is a powerful feature but comes with responsibilities. This application implements several layers of guardrails to ensure scraping is performed ethically and legally.

## Legal and Ethical Considerations

### 1. Respect robots.txt

Always check and respect the target website's `robots.txt` file:

```javascript
// Example robots.txt checker
const robotsParser = require('robots-parser');
const robots = robotsParser('https://example.com/robots.txt', 'User-agent: *\nDisallow: /private/');

if (!robots.isAllowed('https://example.com/page-to-scrape', 'MyBot')) {
  throw new Error('Scraping not allowed by robots.txt');
}
```

### 2. Terms of Service Compliance

- Review and respect website Terms of Service
- Implement rate limiting to avoid overwhelming servers
- Do not scrape behind paywalls or restricted content
- Respect copyright and intellectual property

### 3. Data Privacy Regulations

- **GDPR**: For EU citizens' data
- **CCPA**: For California residents' data
- **PIPL**: For Chinese citizens' data

## Technical Guardrails

### 1. Rate Limiting

Implement conservative rate limiting:

```javascript
// Example rate limiting configuration
const rateLimits = {
  default: { requests: 1, per: 1000 }, // 1 request per second
  aggressive: { requests: 1, per: 2000 }, // 1 request per 2 seconds
  conservative: { requests: 1, per: 5000 }, // 1 request per 5 seconds
};
```

### 2. Request Headers

Set appropriate headers to identify your bot:

```javascript
const headers = {
  'User-Agent': 'MyApp-Bot/1.0 (+http://myapp.com/bot-info)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
};
```

### 3. Error Handling

Implement robust error handling:

```javascript
const maxRetries = 3;
const retryDelay = 5000; // 5 seconds

async function scrapeWithRetry(url, options = {}) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrape(url, options);
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      if (error.status === 429) { // Rate limited
        await delay(parseInt(error.headers['retry-after']) || retryDelay);
      } else if (error.status >= 500) { // Server error
        await delay(retryDelay * attempt);
      } else {
        throw error; // Client errors shouldn't be retried
      }
    }
  }
}
```

## Content Filtering and Validation

### 1. Content Type Validation

Only scrape supported content types:

```javascript
const allowedContentTypes = [
  'text/html',
  'application/xhtml+xml',
  'text/plain',
  'application/json'
];

if (!allowedContentTypes.includes(response.headers['content-type'])) {
  throw new Error(`Unsupported content type: ${response.headers['content-type']}`);
}
```

### 2. Content Size Limits

Prevent excessive bandwidth usage:

```javascript
const maxContentSize = 10 * 1024 * 1024; // 10MB

if (response.headers['content-length'] > maxContentSize) {
  throw new Error('Content too large');
}
```

### 3. Sensitive Data Filtering

Filter out sensitive information:

```javascript
const sensitivePatterns = [
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit cards
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /password/i,
  /api[_-]?key/i,
  /secret/i
];

function filterSensitiveData(content) {
  let filtered = content;
  sensitivePatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '[REDACTED]');
  });
  return filtered;
}
```

## Domain and URL Restrictions

### 1. Allowed Domains

Maintain a whitelist of allowed domains:

```javascript
const allowedDomains = [
  'example.com',
  'subdomain.example.com',
  'trusted-source.org'
];

function isDomainAllowed(url) {
  try {
    const hostname = new URL(url).hostname;
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}
```

### 2. URL Pattern Restrictions

Define allowed URL patterns:

```javascript
const allowedPatterns = [
  /^https?:\/\/(www\.)?example\.com\/articles\//,
  /^https?:\/\/(www\.)?example\.com\/blog\//,
  /^https?:\/\/(www\.)?trusted-source\.org\/public\//
];

function isUrlAllowed(url) {
  return allowedPatterns.some(pattern => pattern.test(url));
}
```

## Browserless Configuration

### 1. Connection Limits

Configure Browserless with appropriate limits:

```javascript
const browserlessConfig = {
  // Connection limits
  maxConcurrentSessions: 5,
  maxQueueLength: 100,
  
  // Timeout settings
  timeout: 30000, // 30 seconds
  idleTimeout: 10000, // 10 seconds
  
  // Resource limits
  blockAds: true,
  stealth: true,
  
  // Security settings
  rejectResourceTypes: ['image', 'stylesheet', 'font'],
};
```

### 2. Stealth Features

Enable stealth mode to avoid detection:

```javascript
const puppeteerOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ],
  stealth: true,
};
```

## Monitoring and Logging

### 1. Request Logging

Log all scraping activities:

```javascript
function logScrapingActivity(url, status, duration, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    url,
    status,
    duration,
    error: error ? error.message : null,
    userAgent: process.env.USER_AGENT
  };
  
  // Log to monitoring system
  logger.info('Scraping activity', logEntry);
  
  // Store in database for analysis
  await db.scrapingLogs.create(logEntry);
}
```

### 2. Rate Limit Monitoring

Monitor and alert on rate limit violations:

```javascript
const rateLimitTracker = new Map();

function checkRateLimit(domain) {
  const now = Date.now();
  const requests = rateLimitTracker.get(domain) || [];
  const recentRequests = requests.filter(time => now - time < 60000); // Last minute
  
  if (recentRequests.length >= 60) { // More than 60 requests per minute
    alertService.notify('Rate limit exceeded', { domain, count: recentRequests.length });
    return false;
  }
  
  recentRequests.push(now);
  rateLimitTracker.set(domain, recentRequests);
  return true;
}
```

## Data Storage and Retention

### 1. Data Retention Policy

Define clear retention policies:

```javascript
const retentionPolicies = {
  scrapedContent: 30, // days
  metadata: 90, // days
  logs: 365, // days
  errorLogs: 180 // days
};
```

### 2. Data Encryption

Encrypt sensitive scraped data:

```javascript
const crypto = require('crypto');

function encryptData(data, key) {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}
```

## Testing and Validation

### 1. Scraping Tests

Implement comprehensive tests:

```javascript
describe('Scraping Guardrails', () => {
  test('should respect robots.txt', async () => {
    const result = await scrapeUrl('https://example.com/disallowed-page');
    expect(result.error).toContain('not allowed by robots.txt');
  });
  
  test('should rate limit requests', async () => {
    const promises = Array(10).fill().map(() => scrapeUrl('https://example.com'));
    const results = await Promise.allSettled(promises);
    const rejected = results.filter(r => r.status === 'rejected');
    expect(rejected.length).toBeGreaterThan(0);
  });
});
```

### 2. Integration Tests

Test end-to-end scraping workflows:

```javascript
describe('Scraping Integration', () => {
  test('should complete full scraping workflow', async () => {
    const result = await scrapeWorkflow({
      url: 'https://example.com/article',
      options: { timeout: 10000 }
    });
    
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('metadata');
    expect(result).toHaveProperty('timestamp');
  });
});
```

## Emergency Procedures

### 1. Emergency Stop

Implement emergency stop functionality:

```javascript
let emergencyStop = false;

function setEmergencyStop(reason) {
  emergencyStop = true;
  logger.error('Emergency stop activated', { reason });
  alertService.critical('Scraping emergency stop', { reason });
}

async function scrapeWithEmergencyCheck(url, options) {
  if (emergencyStop) {
    throw new Error('Scraping stopped due to emergency');
  }
  return await scrape(url, options);
}
```

### 2. Circuit Breaker Pattern

Implement circuit breaker for failing domains:

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = new Map();
  }
  
  async call(domain, fn) {
    const failures = this.failures.get(domain) || 0;
    const lastFailure = this.lastFailureTime?.get(domain);
    
    if (failures >= this.threshold && 
        lastFailure && Date.now() - lastFailure < this.timeout) {
      throw new Error('Circuit breaker open for domain');
    }
    
    try {
      const result = await fn();
      this.reset(domain);
      return result;
    } catch (error) {
      this.recordFailure(domain);
      throw error;
    }
  }
}
```

## Compliance Checklist

Before deploying scraping functionality:

- [ ] robots.txt compliance implemented
- [ ] Rate limiting configured
- [ ] User-Agent properly set
- [ ] Error handling robust
- [ ] Logging and monitoring in place
- [ ] Data retention policies defined
- [ ] Sensitive data filtering implemented
- [ ] Legal review completed
- [ ] Emergency procedures documented
- [ ] Testing coverage adequate

## Resources

- [robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- [GDPR Compliance](https://gdpr.eu/)
- [CCPA Compliance](https://oag.ca.gov/privacy/ccpa)
- [Ethical Web Scraping Guidelines](https://scrapethissite.com/pages/ethical-scraping/)

## Support

For questions about scraping guardrails or to report issues:

1. Check the documentation above
2. Review the monitoring dashboard
3. Contact the development team
4. Create an issue in the project repository
