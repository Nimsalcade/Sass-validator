# Project Setup Guide

This guide will help you set up the development environment for this project locally.

## Overview

This is a full-stack web application built with modern technologies including Next.js, TypeScript, PostgreSQL with pgvector extension, and various third-party integrations for AI, authentication, and analytics.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **pnpm** (latest version) - Install with: `npm install -g pnpm`
- **PostgreSQL** (v14 or higher) with pgvector extension
- **Redis** (v6 or higher)
- **Git** - For version control

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Quick Setup (Recommended)

Run the automated setup script:

```bash
./scripts/setup.sh
```

This script will:
- Check for required tools (Node.js, pnpm, PostgreSQL, Redis)
- Create `.env` file from `.env.example`
- Install dependencies
- Guide you through database setup

### 3. Manual Setup

If you prefer manual setup, follow these steps:

#### Install Dependencies

```bash
pnpm install
```

### 4. Database Setup

#### Install PostgreSQL with pgvector

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew install pgvector
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
# Install pgvector (follow instructions at https://github.com/pgvector/pgvector)
```

**Windows:**
- Download and install PostgreSQL from the official site
- Follow pgvector installation instructions for Windows

#### Enable pgvector Extension

Connect to your PostgreSQL database and run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE your_project_db;

# Create user (optional)
CREATE USER your_project_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_project_db TO your_project_user;
```

### 4. Redis Setup

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
- Download Redis for Windows or use WSL

### 5. Environment Configuration

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Fill in the required environment variables (see `.env.example` for details)

### 6. Database Migrations

Run database migrations to create the necessary tables:

```bash
pnpm run migrate
```

### 7. Database Seeding

Seed the database with initial data:

```bash
pnpm run seed
```

### 8. Start Development

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## Development

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix linting issues
- `pnpm run test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run migrate` - Run database migrations
- `pnpm run migrate:dev` - Run migrations in development
- `pnpm run seed` - Seed the database
- `pnpm run type-check` - Run TypeScript type checking

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── lib/              # Utility functions and configurations
│   │   ├── prisma.ts     # Prisma client setup
│   │   ├── redis.ts      # Redis client setup
│   │   └── env.ts        # Environment validation
│   └── types/            # TypeScript type definitions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── public/               # Static assets
├── scripts/
│   └── setup.sh          # Automated setup script
├── docs/                 # Additional documentation
│   ├── PGVECTOR_SETUP.md # pgvector installation and configuration
│   ├── SCRAPING_GUARDRAILS.md # Web scraping best practices
│   └── DEVELOPMENT_GUIDE.md # Development workflows and best practices
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
└── README.md            # This file
```

## Third-Party Integrations

### Authentication (NextAuth)

The application uses NextAuth.js for authentication with Google OAuth provider.

### AI Integration (OpenAI)

OpenAI API is integrated for AI-powered features. Ensure you have a valid API key.

### Search Integration (Tavily/SerpAPI)

Search functionality is powered by either Tavily or SerpAPI. Configure your preferred service.

### Analytics (Google Analytics & PostHog)

Both Google Analytics and PostHog are configured for analytics and user tracking.

### File Storage (S3)

Amazon S3 is used for file storage. Configure your S3 credentials in the environment.

### Web Scraping (Browserless)

Browserless.io is used for web scraping capabilities.

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Check if pgvector extension is enabled

### Redis Connection Issues

1. Ensure Redis server is running
2. Verify REDIS_URL is correct
3. Check firewall settings

### Migration Issues

1. Ensure database exists
2. Check database permissions
3. Verify migration files are correct

### Build Issues

1. Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
2. Check for type errors: `pnpm run type-check`
3. Fix linting issues: `pnpm run lint:fix`

## Deployment Notes

### Environment Variables

Ensure all required environment variables are set in your production environment.

### Database

- Use a managed PostgreSQL service that supports pgvector
- Run migrations: `pnpm run migrate`
- Consider database backups

### Build Process

```bash
pnpm run build
pnpm run start
```

### Monitoring

- Set up monitoring for application health
- Configure error tracking
- Monitor database performance

## Additional Documentation

For detailed setup information on specific components, see:

- [pgvector Setup Guide](docs/PGVECTOR_SETUP.md) - Complete PostgreSQL with pgvector extension setup
- [Scraping Guardrails](docs/SCRAPING_GUARDRAILS.md) - Web scraping best practices and policies
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Additional development workflows and best practices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Security Considerations

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Regularly update dependencies
- Follow security best practices for your tech stack

## Support

If you encounter any issues during setup, please:

1. Check this documentation thoroughly
2. Review error messages carefully
3. Search existing issues or create a new one
4. Contact the development team for assistance
