# tRPC Next.js Scaffold

This project provides a complete tRPC API scaffold with Next.js, including:

## Features

- **tRPC API** with end-to-end type safety
- **Next.js 14** with App Router
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and rate limiting
- **Zod** for runtime validation
- **NextAuth.js** for authentication
- **React Query** for client-side state management

## API Routers

### Projects (`/api/trpc/projects`)
- `getAll` - Get all user projects
- `getById` - Get project by ID
- `create` - Create new project
- `update` - Update project
- `delete` - Delete project

### Research (`/api/trpc/research`)
- `getByProject` - Get research for a project
- `getById` - Get research by ID
- `create` - Create research
- `update` - Update research
- `delete` - Delete research

### Files (`/api/trpc/files`)
- `getByProject` - Get files for a project
- `getById` - Get file by ID
- `create` - Upload file metadata
- `update` - Update file
- `delete` - Delete file
- `getContent` - Get file content

### Experiments (`/api/trpc/experiments`)
- `getByProject` - Get experiments for a project
- `getById` - Get experiment by ID
- `create` - Create experiment
- `update` - Update experiment
- `delete` - Delete experiment
- `addResult` - Add result to experiment

### Scoring (`/api/trpc/scoring`)
- `getByExperiment` - Get scores for an experiment
- `getById` - Get score by ID
- `create` - Create score
- `update` - Update score
- `delete` - Delete score
- `getAggregated` - Get aggregated scores

### Assets (`/api/trpc/assets`)
- `getByProject` - Get assets for a project
- `getById` - Get asset by ID
- `create` - Create asset
- `update` - Update asset
- `delete` - Delete asset
- `generate` - Generate AI asset (with rate limiting)
- `search` - Search assets

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your database URL, Redis URL, and other secrets.

3. **Set up database**:
   ```bash
   npm run db:push  # or npm run db:migrate for production
   npm run db:generate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Testing

Visit `http://localhost:3000/test` to test the tRPC API endpoints.

## Rate Limiting

The API includes rate limiting using Redis:
- General API: 100 requests per minute per user/IP
- AI Generation: 10 requests per hour per user

## Error Handling

All tRPC procedures include proper error handling with:
- Validation errors using Zod
- Authorization checks
- Database error handling
- User-friendly error messages

## File Storage

The scaffold includes a storage abstraction layer that can be integrated with:
- AWS S3
- Google Cloud Storage
- Local filesystem
- Redis (for development)

## Authentication

Uses NextAuth.js with Prisma adapter. Configure your preferred providers in `src/pages/api/auth/[...nextauth].ts`.

## Usage Examples

### Client-side with React Query

```tsx
import { trpc } from '@/client/trpc-provider';

function MyComponent() {
  const { data: projects, isLoading } = trpc.projects.getAll.useQuery();
  
  const createProject = trpc.projects.create.useMutation();
  
  const handleCreate = async () => {
    await createProject.mutateAsync({
      name: 'New Project',
      description: 'Description',
      status: 'ACTIVE',
    });
  };
  
  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  );
}
```

### Server-side

```tsx
import { getServerSession } from 'next-auth';
import { trpc } from '@/server/trpc';

export default async function ServerComponent() {
  const session = await getServerSession();
  
  if (!session) {
    return <div>Please sign in</div>;
  }
  
  const projects = await trpc.projects.getAll({ 
    ctx: { session, user: session.user } 
  });
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/trpc/          # tRPC API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── test/              # Test pages
├── client/                # Client-side utilities
│   ├── components/        # React components
│   ├── trpc-provider.tsx  # tRPC client setup
│   └── auth-provider.tsx  # NextAuth provider
├── server/                # Server-side utilities
│   ├── trpc.ts           # tRPC server setup
│   ├── context.ts        # tRPC context
│   ├── db.ts             # Database and Redis clients
│   └── routers/          # tRPC routers
│       ├── _app.ts       # Main router
│       ├── projects.ts   # Projects router
│       ├── research.ts   # Research router
│       ├── files.ts      # Files router
│       ├── experiments.ts # Experiments router
│       ├── scoring.ts    # Scoring router
│       └── assets.ts     # Assets router
└── shared/               # Shared types and utilities
```