import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ErrorCodes } from '@remnant/shared';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { fileService } from '@remnant/backend/services/file_service';
import { ServerService } from '@remnant/backend/services/server_service';

const serverService = new ServerService();
const PLUGINS_FOLDER = 'plugins';
const ONE_MINUTE = 60 * 1000;
const filesWriteLimited = rateLimitedPermission(30, ONE_MINUTE, 'files:write');

async function getServerOrThrow(serverId: number) {
  const server = await serverService.getServerById(serverId);
  if (!server) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Server not found' });
  }
  return server;
}

export const pluginsRouter = router({
  list: requirePermission('files:read')
    .input(z.object({ serverId: z.number() }))
    .query(async ({ input }) => {
      const server = await getServerOrThrow(input.serverId);

      const result = await fileService.listDirectory(server.path, PLUGINS_FOLDER);

      if (!result.success) {
        if (result.error === ErrorCodes.FILE_NOT_FOUND) {
          return { plugins: [] };
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list plugins',
        });
      }

      const plugins = result.data
        .filter((file) => file.type === 'file' && (file.name.endsWith('.jar') || file.name.endsWith('.jar_')))
        .map((file) => {
          const enabled = file.name.endsWith('.jar');
          return {
            name: enabled ? file.name : file.name.slice(0, -1),
            filename: file.name,
            size: file.size,
            modified: file.modified,
            enabled,
          };
        });

      return { plugins };
    }),

  toggle: filesWriteLimited.input(z.object({ serverId: z.number(), filename: z.string() })).mutation(async ({ input }) => {
    const server = await getServerOrThrow(input.serverId);

    const isDisabled = input.filename.endsWith('.jar_');
    const oldPath = `${PLUGINS_FOLDER}/${input.filename}`;
    const newFilename = isDisabled ? input.filename.slice(0, -1) : `${input.filename}_`;
    const newPath = `${PLUGINS_FOLDER}/${newFilename}`;

    const result = await fileService.renameFile(server.path, oldPath, newPath);

    if (!result.success) {
      if (result.error === ErrorCodes.FILE_NOT_FOUND) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plugin not found' });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to toggle plugin',
      });
    }

    return {
      name: newFilename,
      enabled: !isDisabled,
      message: 'Plugin toggled. Server restart may be required.',
    };
  }),

  delete: filesWriteLimited.input(z.object({ serverId: z.number(), filename: z.string() })).mutation(async ({ input }) => {
    if (!input.filename.endsWith('.jar') && !input.filename.endsWith('.jar_')) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid plugin filename',
      });
    }

    const server = await getServerOrThrow(input.serverId);

    const filePath = `${PLUGINS_FOLDER}/${input.filename}`;
    const result = await fileService.deleteFile(server.path, filePath);

    if (!result.success) {
      if (result.error === ErrorCodes.FILE_NOT_FOUND) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin not found',
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete plugin',
      });
    }

    return {
      name: input.filename,
      message: 'Plugin deleted. Server restart may be required.',
    };
  }),
});
