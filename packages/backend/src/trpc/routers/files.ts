import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { auditService } from '@remnant/backend/services/audit_service';
import { fileService } from '@remnant/backend/services/file_service';
import { ServerService } from '@remnant/backend/services/server_service';

const serverService = new ServerService();

const ONE_MINUTE = 60 * 1000;

// Map file service errors to tRPC errors
function throwFileError(errorCode: string): never {
  const errorMap: Record<string, { code: 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR'; message: string }> =
    {
      FILE_PATH_TRAVERSAL: { code: 'FORBIDDEN', message: 'Access denied: invalid path' },
      FILE_NOT_FOUND: { code: 'NOT_FOUND', message: 'File or directory not found' },
      FILE_ACCESS_DENIED: { code: 'FORBIDDEN', message: 'Access denied' },
      NOT_A_DIRECTORY: { code: 'BAD_REQUEST', message: 'Path is not a directory' },
      IS_A_DIRECTORY: { code: 'BAD_REQUEST', message: 'Path is a directory, not a file' },
      FILE_TOO_LARGE: { code: 'BAD_REQUEST', message: 'File is too large to read (max 10MB)' },
      FILE_ALREADY_EXISTS: { code: 'BAD_REQUEST', message: 'File or directory already exists' },
      CANNOT_DELETE_ROOT: { code: 'BAD_REQUEST', message: 'Cannot delete root directory' },
    };

  const err = errorMap[errorCode] || {
    code: 'INTERNAL_SERVER_ERROR' as const,
    message: 'Internal server error',
  };
  throw new TRPCError({ code: err.code, message: err.message });
}

async function getServerOrThrow(serverId: number) {
  const server = await serverService.getServerById(serverId);
  if (!server) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Server not found' });
  }
  return server;
}

const filesRead = requirePermission('files:read');
const filesWrite = rateLimitedPermission(30, ONE_MINUTE, 'files:write');

export const filesRouter = router({
  list: filesRead.input(z.object({ serverId: z.number(), path: z.string().optional().default('/') })).query(async ({ input }) => {
    const server = await getServerOrThrow(input.serverId);
    const result = await fileService.listDirectory(server.path, input.path);

    if (!result.success) {
      throwFileError(result.error);
    }

    return result.data;
  }),

  read: filesRead.input(z.object({ serverId: z.number(), path: z.string() })).query(async ({ input }) => {
    const server = await getServerOrThrow(input.serverId);
    const result = await fileService.readFile(server.path, input.path);

    if (!result.success) {
      throwFileError(result.error);
    }

    return { path: input.path, content: result.data };
  }),

  write: filesWrite
    .input(z.object({ serverId: z.number(), path: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const server = await getServerOrThrow(input.serverId);
      const result = await fileService.writeFile(server.path, input.path, input.content);

      if (!result.success) {
        throwFileError(result.error);
      }

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'write',
        resourceType: 'file',
        resourceId: String(input.serverId),
        details: { path: input.path },
        ip: ctx.req.ip,
      });

      return result.data;
    }),

  delete: filesWrite.input(z.object({ serverId: z.number(), path: z.string() })).mutation(async ({ input, ctx }) => {
    const server = await getServerOrThrow(input.serverId);
    const result = await fileService.deleteFile(server.path, input.path);

    if (!result.success) {
      throwFileError(result.error);
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'delete',
      resourceType: 'file',
      resourceId: String(input.serverId),
      details: { path: input.path },
      ip: ctx.req.ip,
    });

    return result.data;
  }),

  mkdir: filesWrite.input(z.object({ serverId: z.number(), path: z.string() })).mutation(async ({ input, ctx }) => {
    const server = await getServerOrThrow(input.serverId);
    const result = await fileService.createDirectory(server.path, input.path);

    if (!result.success) {
      throwFileError(result.error);
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'mkdir',
      resourceType: 'file',
      resourceId: String(input.serverId),
      details: { path: input.path },
      ip: ctx.req.ip,
    });

    return result.data;
  }),

  rename: filesWrite
    .input(z.object({ serverId: z.number(), oldPath: z.string(), newPath: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const server = await getServerOrThrow(input.serverId);
      const result = await fileService.renameFile(server.path, input.oldPath, input.newPath);

      if (!result.success) {
        throwFileError(result.error);
      }

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'rename',
        resourceType: 'file',
        resourceId: String(input.serverId),
        details: { oldPath: input.oldPath, newPath: input.newPath },
        ip: ctx.req.ip,
      });

      return result.data;
    }),

  info: filesRead.input(z.object({ serverId: z.number(), path: z.string() })).query(async ({ input }) => {
    const server = await getServerOrThrow(input.serverId);
    const result = await fileService.getFileInfo(server.path, input.path);

    if (!result.success) {
      throwFileError(result.error);
    }

    return result.data;
  }),
});
