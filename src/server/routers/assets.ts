import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, rateLimitProcedure } from '../trpc';

export const assetsRouter = router({
  // Get all assets for a project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify project access
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });
      
      if (!project) {
        throw new Error('Project not found or no access');
      }
      
      const assets = await ctx.prisma.asset.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return assets;
    }),

  // Get a single asset by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          project: true,
        },
      });
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      return asset;
    }),

  // Create new asset
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(200),
      type: z.enum(['LANDING_PAGE', 'EMAIL_SEQUENCE', 'SOCIAL_MEDIA', 'BLOG_POST', 'OTHER']),
      content: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
      projectId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify project access
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });
      
      if (!project) {
        throw new Error('Project not found or no access');
      }
      
      const asset = await ctx.prisma.asset.create({
        data: input,
      });
      return asset;
    }),

  // Update asset
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(200).optional(),
      type: z.enum(['LANDING_PAGE', 'EMAIL_SEQUENCE', 'SOCIAL_MEDIA', 'BLOG_POST', 'OTHER']).optional(),
      content: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const asset = await ctx.prisma.asset.updateMany({
        where: {
          id,
          project: {
            userId: ctx.session.user.id,
          },
        },
        data,
      });
      
      if (asset.count === 0) {
        throw new Error('Asset not found or no permission to update');
      }
      
      return { success: true };
    }),

  // Delete asset
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.deleteMany({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      });
      
      if (asset.count === 0) {
        throw new Error('Asset not found or no permission to delete');
      }
      
      return { success: true };
    }),

  // Generate asset using AI
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string().min(10),
      type: z.enum(['LANDING_PAGE', 'EMAIL_SEQUENCE', 'SOCIAL_MEDIA', 'BLOG_POST', 'OTHER']),
      projectId: z.string(),
      options: z.object({
        tone: z.string().optional(),
        audience: z.string().optional(),
        length: z.enum(['short', 'medium', 'long']).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify project access
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });
      
      if (!project) {
        throw new Error('Project not found or no access');
      }

      // Check rate limit for AI generation
      const rateLimitKey = `ai-generate:${ctx.session.user.id}`;
      const current = await ctx.redis.incr(rateLimitKey);
      
      if (current === 1) {
        await ctx.redis.expire(rateLimitKey, 3600); // 1 hour window
      }
      
      if (current > 10) { // 10 generations per hour
        throw new Error('Rate limit exceeded for AI generation. Please try again later.');
      }

      // Simulate AI generation (replace with actual OpenAI integration)
      const generatedContent = await simulateAIGeneration(input.prompt, input.type, input.options);
      
      const asset = await ctx.prisma.asset.create({
        data: {
          name: `Generated ${input.type.toLowerCase()}`,
          type: input.type,
          content: generatedContent.content,
          metadata: {
            generated: true,
            prompt: input.prompt,
            options: input.options,
            ...generatedContent.metadata,
          },
          status: 'DRAFT',
          projectId: input.projectId,
        },
      });
      
      return asset;
    }),

  // Search assets
  search: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      query: z.string().min(1),
      type: z.enum(['LANDING_PAGE', 'EMAIL_SEQUENCE', 'SOCIAL_MEDIA', 'BLOG_POST', 'OTHER']).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify project access
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });
      
      if (!project) {
        throw new Error('Project not found or no access');
      }
      
      const whereClause: any = {
        projectId: input.projectId,
        OR: [
          { name: { contains: input.query, mode: 'insensitive' } },
          { content: { contains: input.query, mode: 'insensitive' } },
        ],
      };
      
      if (input.type) {
        whereClause.type = input.type;
      }
      
      if (input.status) {
        whereClause.status = input.status;
      }
      
      const assets = await ctx.prisma.asset.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return assets;
    }),
});

// Helper function to simulate AI generation
async function simulateAIGeneration(prompt: string, type: string, options?: any) {
  // This would normally call OpenAI API
  const content = `Generated ${type.toLowerCase()} based on: "${prompt}"${options ? ` with options: ${JSON.stringify(options)}` : ''}`;
  
  return {
    content,
    metadata: {
      model: 'gpt-4',
      tokens: content.length,
      generatedAt: new Date().toISOString(),
    },
  };
}