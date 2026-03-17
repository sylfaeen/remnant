import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { ServerService } from '@remnant/backend/services/server_service';
import { auditService } from '@remnant/backend/services/audit_service';
import { createServerSchema, ErrorCodes, updateServerSchema } from '@remnant/shared';

const serverService = new ServerService();

const ONE_MINUTE = 60 * 1000;
const serverControl = requirePermission('server:control');
const serverControlLimited = rateLimitedPermission(10, ONE_MINUTE, 'server:control');
const backupLimited = rateLimitedPermission(5, ONE_MINUTE, 'server:control');

export const serversRouter = router({
  list: serverControl.query(async () => {
    return serverService.getAllServers();
  }),

  byId: serverControl.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const server = await serverService.getServerById(input.id);

    if (!server) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Server not found',
      });
    }

    return server;
  }),

  create: serverControlLimited.input(createServerSchema).mutation(async ({ input, ctx }) => {
    try {
      const server = await serverService.createServer(input);
      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'create',
        resourceType: 'server',
        resourceId: String(server.id),
        details: { name: input.name },
        ip: ctx.req.ip,
      });
      return server;
    } catch (error: unknown) {
      if (error instanceof Error && error.message === ErrorCodes.SERVER_PORT_ALREADY_IN_USE) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ErrorCodes.SERVER_PORT_ALREADY_IN_USE,
        });
      }
      throw error;
    }
  }),

  update: serverControlLimited.input(z.object({ id: z.number(), data: updateServerSchema })).mutation(async ({ input, ctx }) => {
    const result = await serverService.updateServer(input.id, input.data);

    if (!result.success) {
      if (result.error === ErrorCodes.SERVER_PORT_ALREADY_IN_USE) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: ErrorCodes.SERVER_PORT_ALREADY_IN_USE,
        });
      }
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Server not found',
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'update',
      resourceType: 'server',
      resourceId: String(input.id),
      ip: ctx.req.ip,
    });

    return result.server;
  }),

  delete: serverControlLimited
    .input(
      z.object({
        id: z.number(),
        createBackup: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await serverService.deleteServer(input.id, {
        createBackup: input.createBackup,
      });

      if (!result.success) {
        if (result.error === 'SERVER_NOT_FOUND') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Server not found',
          });
        }
        if (result.error === 'SERVER_MUST_BE_STOPPED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Server must be stopped before deletion',
          });
        }
        if (result.error?.startsWith('BACKUP_FAILED')) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create backup before deletion',
          });
        }
        if (result.error?.startsWith('DELETE_DIRECTORY_FAILED')) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete server directory',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete server',
        });
      }

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'delete',
        resourceType: 'server',
        resourceId: String(input.id),
        ip: ctx.req.ip,
      });

      return {
        message: 'Server deleted successfully',
        backup: result.backup
          ? {
              filename: result.backup.filename,
              path: result.backup.path,
              size: result.backup.size,
            }
          : undefined,
      };
    }),

  listBackups: serverControl.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const result = await serverService.listBackups(input.id);

    if (!result.success) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Server not found',
      });
    }

    return result.backups;
  }),

  deleteBackup: backupLimited.input(z.object({ filename: z.string() })).mutation(async ({ input, ctx }) => {
    const result = await serverService.deleteBackup(input.filename);

    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error || 'Failed to delete backup',
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'delete_backup',
      resourceType: 'backup',
      details: { filename: input.filename },
      ip: ctx.req.ip,
    });

    return { message: 'Backup deleted successfully' };
  }),

  backup: backupLimited
    .input(z.object({ id: z.number(), paths: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const result = await serverService.backupServer(input.id, input.paths);

      if (!result.success) {
        if (result.error === 'SERVER_NOT_FOUND') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Server not found',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error || 'Backup failed',
        });
      }

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'create_backup',
        resourceType: 'backup',
        resourceId: String(input.id),
        details: { filename: result.backup?.filename },
        ip: ctx.req.ip,
      });

      return {
        message: 'Backup created successfully',
        backup: result.backup
          ? {
              filename: result.backup.filename,
              path: result.backup.path,
              size: result.backup.size,
            }
          : undefined,
      };
    }),

  start: serverControlLimited.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const result = await serverService.startServer(input.id);

    if (!result.success) {
      const errorMap: Record<string, { code: 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR'; message: string }> = {
        [ErrorCodes.SERVER_NOT_FOUND]: { code: 'NOT_FOUND', message: ErrorCodes.SERVER_NOT_FOUND },
        [ErrorCodes.SERVER_ALREADY_RUNNING]: { code: 'BAD_REQUEST', message: ErrorCodes.SERVER_ALREADY_RUNNING },
        [ErrorCodes.SERVER_DIR_NOT_FOUND]: { code: 'BAD_REQUEST', message: ErrorCodes.SERVER_DIR_NOT_FOUND },
        [ErrorCodes.SERVER_JAR_NOT_FOUND]: { code: 'BAD_REQUEST', message: ErrorCodes.SERVER_JAR_NOT_FOUND },
        [ErrorCodes.SERVER_JAVA_NOT_FOUND]: { code: 'BAD_REQUEST', message: ErrorCodes.SERVER_JAVA_NOT_FOUND },
        [ErrorCodes.SERVER_START_FAILED]: { code: 'INTERNAL_SERVER_ERROR', message: ErrorCodes.SERVER_START_FAILED },
      };

      const err = errorMap[result.error || ErrorCodes.SERVER_START_FAILED];
      throw new TRPCError({
        code: err.code,
        message: err.message,
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'start',
      resourceType: 'server',
      resourceId: String(input.id),
      ip: ctx.req.ip,
    });

    return { message: 'Server started successfully' };
  }),

  stop: serverControlLimited.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const result = await serverService.stopServer(input.id);

    if (!result.success) {
      const errorMap: Record<string, { code: 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR'; message: string }> = {
        [ErrorCodes.SERVER_NOT_FOUND]: { code: 'NOT_FOUND', message: ErrorCodes.SERVER_NOT_FOUND },
        [ErrorCodes.SERVER_NOT_RUNNING]: { code: 'BAD_REQUEST', message: ErrorCodes.SERVER_NOT_RUNNING },
        [ErrorCodes.SERVER_ALREADY_STOPPING]: { code: 'BAD_REQUEST', message: ErrorCodes.SERVER_ALREADY_STOPPING },
      };

      const err = errorMap[result.error || ErrorCodes.SERVER_STOP_FAILED] || {
        code: 'INTERNAL_SERVER_ERROR' as const,
        message: ErrorCodes.SERVER_STOP_FAILED,
      };
      throw new TRPCError({
        code: err.code,
        message: err.message,
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'stop',
      resourceType: 'server',
      resourceId: String(input.id),
      ip: ctx.req.ip,
    });

    return { message: 'Server stopped successfully' };
  }),

  restart: serverControlLimited.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const result = await serverService.restartServer(input.id);

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error || 'Failed to restart server',
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'restart',
      resourceType: 'server',
      resourceId: String(input.id),
      ip: ctx.req.ip,
    });

    return { message: 'Server restarted successfully' };
  }),
});
