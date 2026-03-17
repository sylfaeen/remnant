import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { protectedProcedure, requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { UserService } from '@remnant/backend/services/user_service';
import { auditService } from '@remnant/backend/services/audit_service';
import { createUserSchema, updateUserSchema, ErrorCodes } from '@remnant/shared';

const userService = new UserService();

const ONE_MINUTE = 60 * 1000;
const usersManage = requirePermission('users:manage');
const usersManageLimited = rateLimitedPermission(10, ONE_MINUTE, 'users:manage');

export const usersRouter = router({
  list: usersManage.query(async () => {
    return userService.getAllUsers();
  }),

  byId: usersManage.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const user = await userService.getUserById(input.id);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: ErrorCodes.USER_NOT_FOUND,
      });
    }

    return user;
  }),

  create: usersManageLimited.input(createUserSchema).mutation(async ({ input, ctx }) => {
    const result = await userService.createUser(input);

    if (!result.success) {
      if (result.error === ErrorCodes.USER_ALREADY_EXISTS) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ErrorCodes.USER_ALREADY_EXISTS,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: ErrorCodes.INTERNAL_ERROR,
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'create',
      resourceType: 'user',
      resourceId: String(result.user!.id),
      details: { username: input.username },
      ip: ctx.req.ip,
    });

    return result.user;
  }),

  update: usersManageLimited.input(z.object({ id: z.number(), data: updateUserSchema })).mutation(async ({ input, ctx }) => {
    const result = await userService.updateUser(input.id, input.data);

    if (!result.success) {
      if (result.error === ErrorCodes.USER_NOT_FOUND) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ErrorCodes.USER_NOT_FOUND,
        });
      }
      if (result.error === ErrorCodes.USER_ALREADY_EXISTS) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ErrorCodes.USER_ALREADY_EXISTS,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: ErrorCodes.INTERNAL_ERROR,
      });
    }

    const fields = Object.keys(input.data).filter((k) => input.data[k as keyof typeof input.data] !== undefined);
    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'update',
      resourceType: 'user',
      resourceId: String(input.id),
      details: { fields },
      ip: ctx.req.ip,
    });

    return result.user;
  }),

  updateLocale: protectedProcedure.input(z.object({ locale: z.string().nullable() })).mutation(async ({ input, ctx }) => {
    const result = await userService.updateUser(ctx.user.sub, { locale: input.locale });

    if (!result.success) {
      if (result.error === ErrorCodes.USER_NOT_FOUND) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ErrorCodes.USER_NOT_FOUND,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: ErrorCodes.INTERNAL_ERROR,
      });
    }

    return result.user;
  }),

  delete: usersManageLimited.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const result = await userService.deleteUser(input.id, ctx.user.sub);

    if (!result.success) {
      if (result.error === ErrorCodes.USER_NOT_FOUND) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ErrorCodes.USER_NOT_FOUND,
        });
      }
      if (result.error === ErrorCodes.USER_CANNOT_DELETE_SELF) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: ErrorCodes.USER_CANNOT_DELETE_SELF,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: ErrorCodes.INTERNAL_ERROR,
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'delete',
      resourceType: 'user',
      resourceId: String(input.id),
      ip: ctx.req.ip,
    });

    return { message: 'User deleted successfully' };
  }),
});
