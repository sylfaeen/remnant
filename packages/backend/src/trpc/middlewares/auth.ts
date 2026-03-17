import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { ErrorCodes, type Permission } from '@remnant/shared';
import { middleware, publicProcedure, type TRPCUser } from '@remnant/backend/trpc';
import { db } from '@remnant/backend/db';
import { users } from '@remnant/backend/db/schema';

const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: ErrorCodes.AUTH_UNAUTHORIZED,
    });
  }

  const [dbUser] = await db.select({ token_version: users.token_version }).from(users).where(eq(users.id, ctx.user.sub)).limit(1);

  if (!dbUser || dbUser.token_version !== ctx.user.token_version) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: ErrorCodes.AUTH_TOKEN_INVALID,
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user as TRPCUser,
    },
  });
});

export const protectedProcedure = publicProcedure.use(isAuthed);

export function hasPermission(userPermissions: Array<string>, required: Permission): boolean {
  return userPermissions.includes('*') || userPermissions.includes(required);
}

export function requirePermission(...permissions: Array<Permission>) {
  return protectedProcedure.use(
    middleware(async ({ ctx, next }) => {
      const hasAccess = permissions.every((p) => hasPermission(ctx.user.permissions, p));

      if (!hasAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: ErrorCodes.AUTH_FORBIDDEN,
        });
      }

      return next({ ctx });
    })
  );
}
