import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, rateLimitProcedure } from '../trpc';

export const filesRouter = router({
  // Get all files for a project
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
      
      const files = await ctx.prisma.file.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return files;
    }),

  // Get a single file by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.prisma.file.findFirst({
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
      
      if (!file) {
        throw new Error('File not found');
      }
      
      return file;
    }),

  // Upload file metadata
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      size: z.number().positive(),
      type: z.string(),
      path: z.string(),
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
      
      const file = await ctx.prisma.file.create({
        data: input,
      });
      return file;
    }),

  // Update file metadata
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(255).optional(),
      path: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const file = await ctx.prisma.file.updateMany({
        where: {
          id,
          project: {
            userId: ctx.session.user.id,
          },
        },
        data,
      });
      
      if (file.count === 0) {
        throw new Error('File not found or no permission to update');
      }
      
      return { success: true };
    }),

  // Delete file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get file info before deleting to clean up storage
      const file = await ctx.prisma.file.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      });
      
      if (!file) {
        throw new Error('File not found');
      }
      
      // Delete from storage
      await ctx.storage.delete(file.path);
      
      // Delete from database
      await ctx.prisma.file.delete({
        where: { id: input.id },
      });
      
      return { success: true };
    }),

  // Get file content/download URL
  getContent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.prisma.file.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      });
      
      if (!file) {
        throw new Error('File not found');
      }
      
      const content = await ctx.storage.download(file.path);
      return {
        file,
        content,
      };
    }),
});