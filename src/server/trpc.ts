import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';
import { ZodError } from 'zod';

export interface Meta {
  // Add any metadata you want to pass to procedures
}

const t = initTRPC.context<Context>().meta<Meta>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Rate limiting middleware
export const rateLimitProcedure = t.procedure.use(async ({ ctx, next }) => {
  const key = `rate-limit:${ctx.session?.user?.id ?? ctx.req.ip}`;
  const current = await ctx.redis.incr(key);
  
  if (current === 1) {
    await ctx.redis.expire(key, 60); // 1 minute window
  }
  
  if (current > 100) { // 100 requests per minute
    throw new TRPCError({ 
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  return next();
});