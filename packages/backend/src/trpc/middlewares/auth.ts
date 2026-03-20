import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { ErrorCodes, type Permission } from '@remnant/shared';
import { publicProcedure } from '@remnant/backend/trpc';
import { db } from '@remnant/backend/db';
import { users } from '@remnant/backend/db/schema';

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: ErrorCodes.AUTH_UNAUTHORIZED,
    });
  }

  const user = ctx.user;

  const [dbUser] = await db.select({ token_version: users.token_version }).from(users).where(eq(users.id, user.sub)).limit(1);

  if (!dbUser || dbUser.token_version !== user.token_version) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: ErrorCodes.AUTH_TOKEN_INVALID,
    });
  }

  return next({
    ctx: { user },
  });
});

export function hasPermission(userPermissions: Array<string>, required: Permission): boolean {
  return userPermissions.includes('*') || userPermissions.includes(required);
}

export function requirePermission(...permissions: Array<Permission>) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const hasAccess = permissions.every((p) => hasPermission(ctx.user.permissions, p));

    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: ErrorCodes.AUTH_FORBIDDEN,
      });
    }

    return next({ ctx });
  });
}
