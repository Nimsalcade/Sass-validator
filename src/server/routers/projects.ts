import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, rateLimitProcedure } from '../trpc';

export const projectsRouter = router({
  // Get all projects for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return projects;
  }),

  // Get a single project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
    }),

  // Create a new project
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
      return project;
    }),

  // Update a project
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const project = await ctx.prisma.project.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      });
      
      if (project.count === 0) {
        throw new Error('Project not found or no permission to update');
      }
      
      return { success: true };
    }),

  // Delete a project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
      
      if (project.count === 0) {
        throw new Error('Project not found or no permission to delete');
      }
      
      return { success: true };
    }),
});