# Prisma + PostgreSQL Starter

This repository defines the initial Prisma ORM schema for the product research platform. It targets PostgreSQL and requires the [`pgvector`](https://github.com/pgvector/pgvector) extension for vector similarity columns.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the database connection by copying `.env.example` to `.env` and setting `DATABASE_URL` to a PostgreSQL instance with the `pgvector` extension installed:

   ```bash
   cp .env.example .env
   # edit .env and provide a connection string, e.g.
   # DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cto_prisma?schema=public"
   ```

   > **Note:** The initial migration contains guards that attempt to enable the `uuid-ossp` and `pgvector` extensions. The database user running migrations must have permission to create extensions or the extensions must be enabled beforehand.

3. Apply the Prisma migration:

   ```bash
   npx prisma migrate dev
   ```

4. Populate demo data:

   ```bash
   npx prisma db seed
   ```

   The seed script creates a demo project, research run, competitors, demand signal entries, and vector embeddings so downstream tooling can run similarity queries immediately.

## Included models

The Prisma schema provides models for:

- Authentication primitives (`User`, `Account`, `Session`, `VerificationToken`) compatible with NextAuth.js
- Workspace constructs (`Project`, `ProjectMember`)
- Research workflow (`ResearchRun`, `Source`, `Experiment`, `Asset`, `File`)
- Market context (`Competitor`, `Pricing`, `DemandSignal`)
- Operational telemetry (`ToolCallAudit`)

Vector-enabled columns are available on the research run, demand signal, and asset records. These rely on the `pgvector` extension and are defined using Prisma's `@db.Vector(3)` attribute.
