import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, rateLimitProcedure } from '../trpc';

export const researchRouter = router({
  // Get all research for a project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First verify user has access to the project
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });
      
      if (!project) {
        throw new Error('Project not found or no access');
      }
      
      const research = await ctx.prisma.research.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return research;
    }),

  // Get a single research by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const research = await ctx.prisma.research.findFirst({
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
      
      if (!research) {
        throw new Error('Research not found');
      }
      
      return research;
    }),

  // Create new research
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string(),
      summary: z.string().optional(),
      sources: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
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
      
      const research = await ctx.prisma.research.create({
        data: input,
      });
      return research;
    }),

  // Update research
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      content: z.string().optional(),
      summary: z.string().optional(),
      sources: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const research = await ctx.prisma.research.updateMany({
        where: {
          id,
          project: {
            userId: ctx.session.user.id,
          },
        },
        data,
      });
      
      if (research.count === 0) {
        throw new Error('Research not found or no permission to update');
      }
      
      return { success: true };
    }),

  // Delete research
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const research = await ctx.prisma.research.deleteMany({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      });
      
      if (research.count === 0) {
        throw new Error('Research not found or no permission to delete');
      }
      
      return { success: true };
    }),
});