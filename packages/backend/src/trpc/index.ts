import { initTRPC } from '@trpc/server';
import type { FastifyRequest, FastifyReply } from 'fastify';
import superjson from 'superjson';

export interface TRPCUser {
  sub: number;
  username: string;
  permissions: Array<string>;
  token_version: number;
}

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
  user: TRPCUser | null;
}


export const createContext = async ({ req, res }: { req: FastifyRequest; res: FastifyReply }): Promise<Context> => {
  let user: TRPCUser | null = null;

  try {
    await req.jwtVerify();
    user = req.user as TRPCUser;
  } catch {
    // No valid token - user stays null
  }

  return { req, res, user };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
