import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample documents with embeddings
  const sampleDocuments = [
    {
      title: 'Getting Started with Next.js',
      content: 'Next.js is a React framework for building full-stack web applications. You use React Components to build user interfaces.',
      url: 'https://example.com/nextjs-guide',
      embedding: new Array(1536).fill(0).map(() => Math.random()), // Example embedding
      metadata: { category: 'tutorial', difficulty: 'beginner' },
    },
    {
      title: 'Understanding PostgreSQL',
      content: 'PostgreSQL is a powerful, open source object-relational database system with over 35 years of active development.',
      url: 'https://example.com/postgresql-guide',
      embedding: new Array(1536).fill(0).map(() => Math.random()), // Example embedding
      metadata: { category: 'database', difficulty: 'intermediate' },
    },
    {
      title: 'Introduction to TypeScript',
      content: 'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.',
      url: 'https://example.com/typescript-intro',
      embedding: new Array(1536).fill(0).map(() => Math.random()), // Example embedding
      metadata: { category: 'programming', difficulty: 'beginner' },
    },
  ];

  // Insert sample documents
  for (const doc of sampleDocuments) {
    await prisma.document.upsert({
      where: { url: doc.url },
      update: doc,
      create: doc,
    });
  }

  // Create sample search results
  const sampleSearchResults = [
    {
      query: 'next.js tutorial',
      title: 'Next.js Tutorial for Beginners',
      url: 'https://example.com/nextjs-tutorial',
      content: 'Learn Next.js from scratch with this comprehensive tutorial covering all the basics.',
      source: 'documentation',
      relevance: 0.95,
    },
    {
      query: 'postgresql vector search',
      title: 'Vector Similarity Search with PostgreSQL',
      url: 'https://example.com/pgvector-search',
      content: 'How to implement vector similarity search using PostgreSQL and the pgvector extension.',
      source: 'blog',
      relevance: 0.89,
    },
  ];

  // Insert sample search results
  for (const result of sampleSearchResults) {
    await prisma.searchResult.upsert({
      where: { url: result.url },
      update: result,
      create: result,
    });
  }

  // Create sample API usage records
  const sampleApiUsage = [
    {
      service: 'openai',
      endpoint: '/embeddings',
      cost: 0.002,
      tokens: 150,
      status: 'success',
    },
    {
      service: 'tavily',
      endpoint: '/search',
      cost: 0.001,
      status: 'success',
    },
  ];

  // Insert sample API usage records
  for (const usage of sampleApiUsage) {
    await prisma.apiUsage.create({
      data: usage,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created ${sampleDocuments.length} documents`);
  console.log(`🔍 Created ${sampleSearchResults.length} search results`);
  console.log(`📈 Created ${sampleApiUsage.length} API usage records`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
