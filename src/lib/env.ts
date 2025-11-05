import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().min(1, 'NEXTAUTH_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  
  // Redis
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  
  // S3
  S3_ACCESS_KEY_ID: z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
  S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required'),
  S3_REGION: z.string().min(1, 'S3_REGION is required'),
  
  // Browserless
  BROWSERLESS_URL: z.string().min(1, 'BROWSERLESS_URL is required'),
  
  // Search APIs (at least one required)
  TAVILY_API_KEY: z.string().optional(),
  SERPAPI_KEY: z.string().optional(),
  
  // Analytics
  GA_ID: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional().default('https://app.posthog.com'),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional().default('3000'),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables. Check your .env file.');
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type inference for environment variables
export type Env = z.infer<typeof envSchema>;
