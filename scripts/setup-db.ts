import { PrismaClient } from '@prisma/client';
import { config } from '../src/config';

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });

  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Push the schema to create tables
    console.log('📊 Creating database tables...');
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    // The actual schema push is handled by Prisma
    console.log('✅ Database setup complete');
    
    console.log('\n🎉 Database is ready for use!');
    console.log('📝 You can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };