import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma, redis, storage } from './db';

export type Context = {
  req: NextApiRequest;
  res: NextApiResponse;
  session: Awaited<ReturnType<typeof getServerSession>> | null;
  prisma: typeof prisma;
  redis: typeof redis;
  storage: typeof storage;
};

export const createContext = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<Context> => {
  const session = await getServerSession(req, res, authOptions);
  
  return {
    req,
    res,
    session,
    prisma,
    redis,
    storage,
  };
};