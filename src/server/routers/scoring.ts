import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, rateLimitProcedure } from '../trpc';

export const scoringRouter = router({
  // Get all scores for an experiment
  getByExperiment: protectedProcedure
    .input(z.object({ experimentId: z.string() }))
    .query(async ({ ctx, input }) => {
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
      
      const scores = await ctx.prisma.score.findMany({
        where: {
          experimentId: input.experimentId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return scores;
    }),

  // Get a single score by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const score = await ctx.prisma.score.findFirst({
        where: {
          id: input.id,
          experiment: {
            project: {
              userId: ctx.session.user.id,
            },
          },
        },
        include: {
          experiment: {
            include: {
              project: true,
            },
          },
        },
      });
      
      if (!score) {
        throw new Error('Score not found');
      }
      
      return score;
    }),

  // Create new score
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(200),
      description: z.string().optional(),
      value: z.number(),
      maxValue: z.number().positive(),
      category: z.string().optional(),
      weights: z.record(z.number()).optional(),
      experimentId: z.string(),
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
      
      const score = await ctx.prisma.score.create({
        data: {
          ...input,
          percentage: (input.value / input.maxValue) * 100,
        },
      });
      return score;
    }),

  // Update score
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      value: z.number().optional(),
      maxValue: z.number().positive().optional(),
      category: z.string().optional(),
      weights: z.record(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, value, maxValue, ...data } = input;
      
      // Calculate percentage if value and maxValue are provided
      const updateData: any = { ...data };
      if (value !== undefined && maxValue !== undefined) {
        updateData.value = value;
        updateData.maxValue = maxValue;
        updateData.percentage = (value / maxValue) * 100;
      } else if (value !== undefined) {
        updateData.value = value;
        // Need to fetch current maxValue to calculate percentage
        const currentScore = await ctx.prisma.score.findFirst({
          where: { id },
          select: { maxValue: true },
        });
        if (currentScore) {
          updateData.percentage = (value / currentScore.maxValue) * 100;
        }
      }
      
      const score = await ctx.prisma.score.updateMany({
        where: {
          id,
          experiment: {
            project: {
              userId: ctx.session.user.id,
            },
          },
        },
        data: updateData,
      });
      
      if (score.count === 0) {
        throw new Error('Score not found or no permission to update');
      }
      
      return { success: true };
    }),

  // Delete score
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const score = await ctx.prisma.score.deleteMany({
        where: {
          id: input.id,
          experiment: {
            project: {
              userId: ctx.session.user.id,
            },
          },
        },
      });
      
      if (score.count === 0) {
        throw new Error('Score not found or no permission to delete');
      }
      
      return { success: true };
    }),

  // Get aggregated scores for an experiment
  getAggregated: protectedProcedure
    .input(z.object({ 
      experimentId: z.string(),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
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
      
      const whereClause: any = {
        experimentId: input.experimentId,
      };
      
      if (input.category) {
        whereClause.category = input.category;
      }
      
      const scores = await ctx.prisma.score.findMany({
        where: whereClause,
      });
      
      const aggregated = {
        total: scores.length,
        average: scores.length > 0 ? scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length : 0,
        max: scores.length > 0 ? Math.max(...scores.map(s => s.percentage)) : 0,
        min: scores.length > 0 ? Math.min(...scores.map(s => s.percentage)) : 0,
        byCategory: scores.reduce((acc, score) => {
          const category = score.category || 'uncategorized';
          if (!acc[category]) {
            acc[category] = { count: 0, total: 0, average: 0 };
          }
          acc[category].count++;
          acc[category].total += score.percentage;
          acc[category].average = acc[category].total / acc[category].count;
          return acc;
        }, {} as Record<string, { count: number; total: number; average: number }>),
      };
      
      return aggregated;
    }),
});