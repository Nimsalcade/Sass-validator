# Scraping Guardrails Implementation

This document provides a detailed overview of the scraping guardrails implementation, including architecture, features, and how each acceptance criterion is met.

## Architecture Overview

The system is built with a microservices architecture in mind, using:

- **Node.js/TypeScript** for type-safe server-side implementation
- **Express.js** for REST API endpoints
- **Redis** for rate limiting, caching, and backoff management
- **PostgreSQL** with Prisma ORM for audit logging
- **Axios** for HTTP requests with proper error handling

## Core Components

### 1. Scraping Service (`src/services/scraping.service.ts`)

The main orchestrator that coordinates all guardrails:

- **Robots.txt Compliance**: Checks robots.txt before making requests
- **Rate Limiting**: Enforces per-host and global rate limits
- **Caching**: Serves cached responses when available
- **PII Filtering**: Removes personally identifiable information
- **Audit Logging**: Records all scraping activities

### 2. Redis Service (`src/services/redis.service.ts`)

Manages all Redis-based functionality:

- **Rate Limiting**: Per-host request counting with sliding windows
- **Global Throttling**: System-wide request limits
- **Caching**: URL-based response caching with TTL
- **Backoff Management**: Exponential backoff for failed hosts
- **Concurrent Request Tracking**: Limits simultaneous requests

### 3. Robots Service (`src/services/robots.service.ts`)

Handles robots.txt compliance:

- **Fetching**: Retrieves robots.txt files with caching
- **Parsing**: Uses robots-parser library for rule evaluation
- **Caching**: Stores robots.txt for 24 hours
- **Crawl Delays**: Respects delay specifications

### 4. PII Service (`src/services/pii.service.ts`)

Implements PII detection and filtering:

- **Email Detection**: Regex-based email identification
- **Phone Detection**: Multiple phone format patterns
- **SSN Detection**: Social Security Number patterns
- **Credit Card Detection**: Luhn algorithm validation
- **IP Filtering**: Public vs private IP distinction
- **Address Detection**: Street address pattern matching

### 5. Audit Service (`src/services/audit.service.ts`)

Comprehensive logging system:

- **Request Logging**: All scrape attempts with metadata
- **User/Project Tracking**: Multi-tenant support
- **Performance Metrics**: Response times and success rates
- **Filtering**: Queryable log system
- **Cleanup**: Automatic old log removal

## API Endpoints

### POST /scrape

Main scraping endpoint with full guardrails:

```json
{
  "url": "https://example.com",
  "user": "user-id",
  "project": "project-id",
  "userAgent": "CustomBot/1.0",
  "timeout": 30000,
  "maxRedirects": 5
}
```

Response includes all guardrail states:
- Success/failure status
- Content (PII-filtered)
- Cache hit status
- Rate limiting status
- Robots.txt compliance

### GET /audit/logs

Retrieve audit logs with filtering:
- User and project filtering
- Date range filtering
- Pagination support
- URL-based filtering

### GET /audit/stats

Get scraping statistics:
- Total requests
- Success rates
- Cache hit ratios
- Rate limiting statistics
- Performance metrics

## Acceptance Criteria Implementation

### 1. ✅ Scraping respects robots.txt

**Implementation**: 
- RobotsService fetches and caches robots.txt files
- Each request is checked against robots.txt rules
- Requests blocked by robots.txt return appropriate error
- Crawl delays are respected when specified

**Verification**:
- Requests to disallowed paths are blocked
- Audit logs show robots.txt compliance status
- Cache includes robots.txt for 24 hours

### 2. ✅ Hitting the same URL leverages cache

**Implementation**:
- Redis-based caching with URL keys
- Configurable TTL (default 1 hour)
- Cached responses bypass all guardrails
- Cache entries include full response data

**Verification**:
- First request sets cache, second uses cache
- Audit logs show cache hit status
- Cached responses return identical content
- Cache respects TTL configuration

### 3. ✅ Audit log entries appear for tool calls with rate limiting enforced

**Implementation**:
- Every request logged to PostgreSQL via Prisma
- Comprehensive metadata (user, project, URL, outcome)
- Rate limiting status tracked in logs
- Queryable log system with filtering

**Verification**:
- All requests create audit entries
- Rate limit violations are logged
- Statistics endpoint shows rate limiting metrics
- Logs survive server restarts

## Configuration

### Environment Variables

All major features are configurable via environment variables:

```bash
# Rate Limiting
DEFAULT_RATE_LIMIT_REQUESTS=10
DEFAULT_RATE_LIMIT_WINDOW=60000
BACKOFF_INITIAL_DELAY=1000
BACKOFF_MAX_DELAY=60000

# Global Throttling
GLOBAL_MAX_REQUESTS_PER_SECOND=100
GLOBAL_MAX_CONCURRENT_REQUESTS=50

# Caching
CACHE_TTL=3600
MAX_CACHE_SIZE=10000

# PII Filtering
ENABLE_PII_FILTERING=true
PII_CONFIDENCE_THRESHOLD=0.7

# Allowlist/Blocklist
ALLOWED_DOMAINS=example.com,test.com
BLOCKED_DOMAINS=spam.com,malicious.com
```

## Rate Limiting Strategy

### Per-Host Rate Limiting
- Sliding window implementation using Redis
- Configurable requests per window
- Automatic backoff on violations
- Exponential backoff with jitter

### Global Throttling
- System-wide RPS limits
- Concurrent request limits
- Redis-based counters
- Graceful degradation

### Backoff Strategy
- Exponential backoff: delay * multiplier^attempt
- Configurable maximum delay
- Random jitter to prevent thundering herd
- Per-host backoff tracking

## Caching Strategy

### Cache Keys
- Base64-encoded URLs to handle special characters
- Separate cache namespace per environment
- Automatic expiration based on TTL

### Cache Invalidation
- TTL-based expiration
- Manual invalidation on errors
- Size-based eviction (LRU)

## PII Filtering Implementation

### Detection Methods
- **Email**: RFC 5322 compliant regex
- **Phone**: Multiple format patterns
- **SSN**: Standard XXX-XX-XXXX format
- **Credit Card**: Luhn algorithm validation
- **IP**: Public IP identification
- **Address**: Street address patterns

### Filtering Process
1. Content scanned for all PII types
2. Confidence scores calculated
3. High-confidence PII redacted
4. Metadata preserved for audit

## Security Considerations

### Input Validation
- URL format validation
- Parameter type checking
- SQL injection prevention via Prisma
- Request size limits

### Data Protection
- PII filtering before storage
- Encrypted Redis connections
- Database connection encryption
- Audit log retention policies

### Access Control
- Domain allowlist/blocklist
- User-based rate limiting
- Project-based isolation
- API key support (extensible)

## Performance Optimizations

### Connection Pooling
- Redis connection reuse
- Database connection pooling
- HTTP keep-alive
- Request pipelining

### Caching Layers
- Memory cache for robots.txt
- Redis cache for responses
- Database query optimization
- Index-based log queries

### Resource Management
- Concurrent request limits
- Timeout enforcement
- Memory usage monitoring
- Graceful degradation

## Monitoring and Observability

### Metrics Collection
- Request success/failure rates
- Cache hit ratios
- Rate limiting statistics
- Response time distributions

### Logging Strategy
- Structured logging with Winston
- Request tracing IDs
- Error categorization
- Performance metrics

### Health Checks
- Database connectivity
- Redis availability
- External service health
- Resource utilization

## Deployment Considerations

### Docker Support
- Multi-stage builds
- Alpine Linux base
- Non-root user execution
- Health check endpoints

### Scaling
- Horizontal scaling support
- Stateless service design
- External dependency management
- Load balancing ready

### Configuration Management
- Environment-based config
- Secret management
- Feature flags
- Runtime reconfiguration

## Testing Strategy

### Unit Tests
- Individual service testing
- PII filtering validation
- Configuration validation
- Error handling verification

### Integration Tests
- End-to-end workflows
- API endpoint testing
- Database integration
- Redis integration

### Acceptance Tests
- Robots.txt compliance
- Caching behavior
- Rate limiting enforcement
- Audit log verification

## Future Enhancements

### Planned Features
- Distributed caching
- Machine learning PII detection
- Advanced rate limiting algorithms
- Real-time monitoring dashboard

### Extensibility
- Plugin architecture
- Custom PII filters
- Additional guardrail types
- Third-party integrations

This implementation provides a comprehensive, production-ready scraping guardrails system that meets all acceptance criteria while being highly configurable, scalable, and maintainable.