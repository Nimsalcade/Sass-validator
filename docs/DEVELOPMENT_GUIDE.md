# Development Guide

This guide provides additional information for developers working on this project.

## Development Workflow

### Daily Development

1. **Start the development server:**
   ```bash
   pnpm run dev
   ```

2. **Database operations:**
   ```bash
   # View database in GUI
   pnpm run db:studio
   
   # Reset database (development only)
   pnpm run migrate:reset
   
   # Generate Prisma client after schema changes
   pnpm run generate
   ```

3. **Code quality:**
   ```bash
   # Check for linting issues
   pnpm run lint
   
   # Auto-fix linting issues
   pnpm run lint:fix
   
   # Type checking
   pnpm run type-check
   ```

### Making Changes

1. **Database Schema Changes:**
   - Modify `prisma/schema.prisma`
   - Run `pnpm run migrate:dev` to create migration
   - Run `pnpm run generate` to update client

2. **Environment Variable Changes:**
   - Update `.env.example` for new variables
   - Update `src/lib/env.ts` for validation
   - Document changes in README

3. **New Dependencies:**
   - Add with `pnpm add package-name`
   - For dev dependencies: `pnpm add -D package-name`

## Testing

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Writing Tests

- Place tests in `__tests__` directories
- Use Jest and React Testing Library
- Mock external services and APIs

## Debugging

### Database Debugging

```bash
# View database logs
tail -f /var/log/postgresql/postgresql-14-main.log

# Connect to database directly
psql $DATABASE_URL

# Check pgvector extension
\dx vector
```

### Redis Debugging

```bash
# Connect to Redis CLI
redis-cli

# Monitor Redis commands
redis-cli monitor

# Check memory usage
redis-cli info memory
```

### Application Debugging

- Use browser DevTools for frontend debugging
- Use VS Code debugger for backend debugging
- Check logs in terminal and browser console

## Performance

### Database Performance

1. **Indexing:**
   - Add indexes for frequently queried columns
   - Use `EXPLAIN ANALYZE` to analyze query performance

2. **Connection Pooling:**
   - Configure appropriate pool size in Prisma
   - Monitor connection usage

3. **Vector Search Optimization:**
   - Choose appropriate index type (IVFFlat vs HNSW)
   - Tune index parameters based on data size

### Application Performance

1. **Caching:**
   - Use Redis for frequently accessed data
   - Implement API response caching

2. **Bundle Optimization:**
   - Analyze bundle size with `pnpm run build`
   - Use dynamic imports for large dependencies

## Security

### Environment Variables

- Never commit `.env` files
- Use strong secrets in production
- Rotate secrets regularly

### Database Security

- Use parameterized queries (Prisma handles this)
- Implement proper row-level security
- Regularly update dependencies

### API Security

- Validate all inputs with Zod schemas
- Implement rate limiting
- Use HTTPS in production

## Deployment

### Environment Setup

1. **Production Environment Variables:**
   - Set all required variables
   - Use different secrets than development
   - Enable production-specific features

2. **Database:**
   - Use managed PostgreSQL service
   - Enable pgvector extension
   - Set up backups

3. **Build Process:**
   ```bash
   pnpm run build
   pnpm run start
   ```

### Monitoring

1. **Application Monitoring:**
   - Set up error tracking (Sentry, etc.)
   - Monitor performance metrics
   - Set up alerts for critical issues

2. **Database Monitoring:**
   - Monitor query performance
   - Track connection usage
   - Monitor disk space

## Troubleshooting

### Common Issues

1. **Migration Failures:**
   - Check database connection
   - Verify migration file syntax
   - Check for locked tables

2. **Build Failures:**
   - Clear node_modules: `rm -rf node_modules && pnpm install`
   - Check TypeScript errors
   - Verify environment variables

3. **Performance Issues:**
   - Check database query performance
   - Monitor memory usage
   - Analyze bundle size

### Getting Help

1. **Check documentation:**
   - README.md for setup
   - PGVECTOR_SETUP.md for database issues
   - SCRAPING_GUARDRAILS.md for scraping issues

2. **Check logs:**
   - Application logs
   - Database logs
   - System logs

3. **Ask for help:**
   - Create detailed issue reports
   - Include error messages and logs
   - Provide steps to reproduce

## Best Practices

### Code Organization

- Keep components focused and reusable
- Use TypeScript for type safety
- Follow consistent naming conventions
- Write descriptive commit messages

### Database Design

- Use appropriate data types
- Add necessary indexes
- Consider future scalability
- Document complex queries

### API Design

- Use RESTful conventions
- Provide clear error messages
- Implement proper HTTP status codes
- Version APIs when needed

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

### Tools

- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Redis Insight](https://redis.com/redis-enterprise/redis-insight/) - Redis GUI
- [PostgreSQL Tools](https://www.postgresql.org/download/products/) - Database tools

### Community

- [Next.js GitHub](https://github.com/vercel/next.js)
- [Prisma GitHub](https://github.com/prisma/prisma)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
