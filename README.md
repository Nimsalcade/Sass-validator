# Scraping Guardrails

A comprehensive scraping service with built-in guardrails for ethical and responsible web scraping.

## Features

- **Robots.txt Compliance**: Automatically respects robots.txt rules for each domain
- **Rate Limiting**: Per-host rate limits with exponential backoff
- **Request Caching**: Intelligent caching to reduce redundant requests
- **PII Filtering**: Automatic detection and redaction of personally identifiable information
- **Audit Logging**: Comprehensive logging of all scraping activities
- **Global Throttling**: System-wide request limits to prevent abuse
- **Allowlist/Blocklist**: Domain-based access control
- **User-Agent Customization**: Configurable user agents for different use cases

## Architecture

The service is built with:
- **Node.js/TypeScript** for type safety and maintainability
- **Express.js** for the REST API
- **Redis** for rate limiting, caching, and backoff management
- **PostgreSQL** with Prisma for audit logging
- **Axios** for HTTP requests

## Quick Start

### Prerequisites

- Node.js 18+
- Redis server
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration

5. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /scrape

Scrape a URL with all guardrails applied.

**Request Body:**
```json
{
  "url": "https://example.com",
  "user": "optional-user-id",
  "project": "optional-project-id",
  "userAgent": "CustomBot/1.0",
  "timeout": 30000,
  "maxRedirects": 5
}
```

**Response:**
```json
{
  "success": true,
  "content": "Page content with PII filtered",
  "status": 200,
  "headers": { "content-type": "text/html" },
  "cached": false,
  "rateLimited": false,
  "robotsAllowed": true
}
```

### GET /audit/logs

Retrieve audit logs with optional filtering.

**Query Parameters:**
- `userId` - Filter by user ID
- `projectId` - Filter by project ID
- `url` - Filter by URL
- `startDate` - Filter start date (ISO string)
- `endDate` - Filter end date (ISO string)
- `limit` - Maximum number of results (default: 100)
- `offset` - Number of results to skip (default: 0)

### GET /audit/stats

Get scraping statistics and metrics.

**Query Parameters:**
- `userId` - Filter by user ID
- `projectId` - Filter by project ID
- `startDate` - Filter start date (ISO string)
- `endDate` - Filter end date (ISO string)

### GET /health

Health check endpoint.

## Configuration

### Environment Variables

#### Server Configuration
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

#### Redis Configuration
- `REDIS_HOST` - Redis server host
- `REDIS_PORT` - Redis server port
- `REDIS_PASSWORD` - Redis password (optional)
- `REDIS_DB` - Redis database number

#### Database Configuration
- `DATABASE_URL` - PostgreSQL connection string

#### Scraping Configuration
- `DEFAULT_USER_AGENT` - Default user agent string
- `REQUEST_TIMEOUT` - Request timeout in milliseconds
- `MAX_REDIRECTS` - Maximum number of redirects

#### Rate Limiting Configuration
- `DEFAULT_RATE_LIMIT_REQUESTS` - Default requests per window
- `DEFAULT_RATE_LIMIT_WINDOW` - Rate limit window in milliseconds
- `BACKOFF_INITIAL_DELAY` - Initial backoff delay in milliseconds
- `BACKOFF_MAX_DELAY` - Maximum backoff delay in milliseconds
- `BACKOFF_MULTIPLIER` - Backoff multiplier for exponential backoff

#### Caching Configuration
- `CACHE_TTL` - Cache TTL in seconds
- `MAX_CACHE_SIZE` - Maximum cache size

#### Global Throttling
- `GLOBAL_MAX_REQUESTS_PER_SECOND` - Global RPS limit
- `GLOBAL_MAX_CONCURRENT_REQUESTS` - Maximum concurrent requests

#### Allowlist/Blocklist
- `ALLOWED_DOMAINS` - Comma-separated list of allowed domains
- `BLOCKED_DOMAINS` - Comma-separated list of blocked domains

#### PII Filtering
- `ENABLE_PII_FILTERING` - Enable/disable PII filtering
- `PII_CONFIDENCE_THRESHOLD` - Minimum confidence for PII detection

## Guardrails Behavior

### Robots.txt Compliance

The service automatically fetches and respects robots.txt files for each domain:
- Robots.txt files are cached for 24 hours
- Requests are blocked if disallowed by robots.txt
- Crawl delays specified in robots.txt are honored

### Rate Limiting

- Per-host rate limiting with configurable windows
- Exponential backoff on rate limit violations
- Global request throttling to prevent system overload
- Concurrent request limits

### Caching

- Responses are cached based on TTL configuration
- Cache keys are URL-based with base64 encoding
- Cached responses bypass rate limiting and robots.txt checks
- Cache entries automatically expire

### PII Filtering

The following PII types are automatically detected and redacted:
- Email addresses
- Phone numbers
- Social Security Numbers
- Credit card numbers (with Luhn validation)
- Public IP addresses
- Physical addresses

### Audit Logging

Every request is logged with:
- User and project identifiers
- URL and HTTP method
- Response status and time
- Whether the response was cached
- Rate limiting status
- Robots.txt compliance status
- Error details

## Development

### Running Tests

```bash
npm test
```

### Code Quality

```bash
npm run lint
npm run format
```

### Building

```bash
npm run build
```

## Security Considerations

- All PII is filtered before storage
- Rate limiting prevents abuse
- Robots.txt compliance ensures ethical scraping
- Audit logging provides transparency
- Environment-based configuration for sensitive data

## License

MIT License