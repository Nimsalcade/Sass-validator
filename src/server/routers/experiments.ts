import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, rateLimitProcedure } from '../trpc';

export const experimentsRouter = router({
  // Get all experiments for a project
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
      
      const experiments = await ctx.prisma.experiment.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          results: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return experiments;
    }),

  // Get a single experiment by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const experiment = await ctx.prisma.experiment.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          project: true,
          results: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
      
      if (!experiment) {
        throw new Error('Experiment not found');
      }
      
      return experiment;
    }),

  // Create new experiment
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(200),
      description: z.string().optional(),
      hypothesis: z.string().optional(),
      parameters: z.record(z.any()).optional(),
      status: z.enum(['DRAFT', 'RUNNING', 'COMPLETED', 'FAILED']).default('DRAFT'),
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
      
      const experiment = await ctx.prisma.experiment.create({
        data: input,
      });
      return experiment;
    }),

  // Update experiment
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      hypothesis: z.string().optional(),
      parameters: z.record(z.any()).optional(),
      status: z.enum(['DRAFT', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const experiment = await ctx.prisma.experiment.updateMany({
        where: {
          id,
          project: {
            userId: ctx.session.user.id,
          },
        },
        data,
      });
      
      if (experiment.count === 0) {
        throw new Error('Experiment not found or no permission to update');
      }
      
      return { success: true };
    }),

  // Delete experiment
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const experiment = await ctx.prisma.experiment.deleteMany({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      });
      
      if (experiment.count === 0) {
        throw new Error('Experiment not found or no permission to delete');
      }
      
      return { success: true };
    }),

  // Add result to experiment
  addResult: protectedProcedure
    .input(z.object({
      experimentId: z.string(),
      data: z.record(z.any()),
      metrics: z.record(z.number()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify experiment access
      const experiment = await ctx.prisma.experiment.findFirst({
        where: {
          id: input.experimentId,
          project: {
            userId: ctx.session.user.id,
          },
        },
      });
      
      if (!experiment) {
        throw new Error('Experiment not found or no access');
      }
      
      const result = await ctx.prisma.experimentResult.create({
        data: {
          ...input,
          experimentId: input.experimentId,
        },
      });
      return result;
    }),
});