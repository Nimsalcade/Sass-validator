import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getPresignedUrl, registerFile, parsePDF, getAllFiles } from './services/fileService';

export interface Context {
  userId?: string;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  getPresignedUrl: publicProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
    }))
    .mutation(async ({ input }) => {
      return getPresignedUrl(input.fileName, input.fileType, input.fileSize);
    }),

  registerFile: publicProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
      s3Key: z.string(),
    }))
    .mutation(async ({ input }) => {
      return registerFile(input);
    }),

  parsePDF: publicProcedure
    .input(z.object({
      fileId: z.string(),
    }))
    .mutation(async ({ input }) => {
      return parsePDF(input.fileId);
    }),

  getFiles: publicProcedure
    .query(async () => {
      return getAllFiles();
    }),
});

export type AppRouter = typeof appRouter;