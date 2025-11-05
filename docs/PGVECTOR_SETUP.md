# pgvector Setup Guide

This guide provides detailed instructions for setting up PostgreSQL with the pgvector extension for vector similarity search.

## What is pgvector?

pgvector is a PostgreSQL extension for vector similarity search. It enables you to:

- Store and query vector embeddings
- Perform similarity searches using different distance metrics
- Index vectors for fast approximate nearest neighbor search

## Installation

### Prerequisites

- PostgreSQL 12 or higher
- Development tools (gcc, make, etc.)
- PostgreSQL development headers

### macOS (Homebrew)

```bash
# Install PostgreSQL if not already installed
brew install postgresql@14

# Install pgvector
brew install pgvector

# Start PostgreSQL service
brew services start postgresql@14
```

### Ubuntu/Debian

```bash
# Install PostgreSQL and development headers
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-server-dev-all

# Install build tools
sudo apt install build-essential git

# Clone and compile pgvector
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
# sudo make install PG_CONFIG=/usr/bin/pg_config
```

### CentOS/RHEL/Fedora

```bash
# Install PostgreSQL and development tools
sudo yum install postgresql-server postgresql-contrib postgresql-devel
sudo yum install gcc make git

# Clone and compile pgvector
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### Windows

1. Install PostgreSQL from the official installer
2. Download and install Visual Studio Build Tools
3. Use WSL or follow the Linux instructions in WSL environment

## Database Setup

### 1. Create Database

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE your_project_db;

-- Create user (optional but recommended)
CREATE USER your_project_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE your_project_db TO your_project_user;
```

### 2. Enable pgvector Extension

```sql
-- Connect to your database
\c your_project_db

-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
\dx vector
```

### 3. Create Vector Tables

Example table structure for embeddings:

```sql
-- Create a table for document embeddings
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(1536),  -- OpenAI embeddings are 1536 dimensions
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create an index for faster similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## Index Types

pgvector supports several index types:

### IVFFlat (Approximate)

Good for medium to large datasets:

```sql
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### HNSW (Approximate)

Better for high-dimensional data:

```sql
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
```

### Exact Search

No index needed for small datasets:

```sql
-- This will use exact search
SELECT * FROM documents ORDER BY embedding <=> '[0.1,0.2,0.3]' LIMIT 5;
```

## Distance Operators

- `<=>` - L2 distance (Euclidean)
- `<#>` - Negative inner product
- `<=>` with `vector_cosine_ops` - Cosine distance
- `<+>` - L1 distance (Manhattan)

## Example Queries

### Similarity Search

```sql
-- Find most similar documents
SELECT 
    id, 
    content,
    1 - (embedding <=> '[0.1,0.2,0.3]') as similarity
FROM documents 
ORDER BY embedding <=> '[0.1,0.2,0.3]' 
LIMIT 10;
```

### Hybrid Search (with text search)

```sql
-- Combine vector similarity with text search
SELECT 
    id,
    content,
    ts_rank_cd(to_tsvector('english', content), query) as text_rank,
    1 - (embedding <=> query_embedding) as vector_rank,
    (ts_rank_cd(to_tsvector('english', content), query) * 0.3 + 
     (1 - (embedding <=> query_embedding)) * 0.7) as combined_rank
FROM documents,
     plainto_tsquery('english', 'search terms') query,
     '[0.1,0.2,0.3]'::vector as query_embedding
WHERE to_tsvector('english', content) @@ query
ORDER BY combined_rank DESC
LIMIT 10;
```

## Performance Tips

### Index Parameters

- **IVFFlat**: `lists` parameter should be `rows / 1000`
- **HNSW**: `m` (16-64) and `ef_construction` (64-512) for build
- **HNSW**: `ef_search` (40-200) for query time

### Memory Usage

- Vectors use 4 bytes per dimension (float4)
- 1536-dimensional vector = ~6KB
- Consider partitioning large tables

### Connection Pooling

Use connection pooling for better performance:
- PgBouncer
- Built-in pooling in your application framework

## Migration Considerations

### Adding pgvector to Existing Database

```sql
-- Enable extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to existing table
ALTER TABLE existing_table ADD COLUMN embedding vector(1536);

-- Create index
CREATE INDEX ON existing_table USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Backup and Restore

```bash
# Backup
pg_dump -h localhost -U username -d database_name > backup.sql

# Restore
psql -h localhost -U username -d database_name < backup.sql
```

## Troubleshooting

### Common Issues

1. **Extension not found**: Make sure pgvector is installed and PostgreSQL is restarted
2. **Permission denied**: Use superuser to install extension
3. **Slow queries**: Check if indexes are being used with `EXPLAIN ANALYZE`
4. **Memory issues**: Reduce `work_mem` or use smaller batches

### Verification Commands

```sql
-- Check extension installation
\dx vector

-- Check table structure
\d documents

-- Check index usage
EXPLAIN ANALYZE SELECT * FROM documents ORDER BY embedding <=> '[0.1,0.2,0.3]' LIMIT 5;
```

## Best Practices

1. **Dimension consistency**: All vectors in a column must have same dimensions
2. **Index maintenance**: Rebuild indexes periodically for optimal performance
3. **Monitoring**: Monitor query performance and index usage
4. **Testing**: Test with realistic data volumes before production
5. **Backups**: Regular backups of vector data are essential

## Integration with Application Frameworks

Most modern frameworks have pgvector support:

- **Prisma**: Add `vector` type to schema
- **TypeORM**: Use custom column types
- **Sequelize**: Custom data types
- **Raw SQL**: Direct PostgreSQL client usage

Example with Prisma:

```prisma
model Document {
  id        Int      @id @default(autoincrement())
  content   String
  embedding Float[]  // Vector stored as array
  metadata  Json?
  createdAt DateTime @default(now())
}
```
