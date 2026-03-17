import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { paperMCService } from '@remnant/backend/services/papermc_service';
import { ServerService } from '@remnant/backend/services/server_service';
import { fileService } from '@remnant/backend/services/file_service';

const serverService = new ServerService();
const ONE_MINUTE = 60 * 1000;

const downloadProgress = new Map<number, { percentage: number; filename: string }>();

async function getServerOrThrow(serverId: number) {
  const server = await serverService.getServerById(serverId);
  if (!server) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Server not found' });
  }
  return server;
}

type JarSource = 'papermc' | 'spigot' | 'purpur' | 'fabric' | 'forge' | 'vanilla' | 'custom';

function detectJarSource(filename: string): JarSource {
  // Custom: any JAR with -custom suffix (manually uploaded via Import)
  if (/-custom\.jar$/i.test(filename)) {
    return 'custom';
  }
  // PaperMC: paper-1.20.4-497.jar
  if (/^paper-[\d.]+-\d+\.jar$/i.test(filename)) {
    return 'papermc';
  }
  // Spigot: spigot-1.20.4.jar
  if (/^spigot-[\d.]+\.jar$/i.test(filename)) {
    return 'spigot';
  }
  // Purpur: purpur-1.20.4-2000.jar
  if (/^purpur-[\d.]+-\d+\.jar$/i.test(filename)) {
    return 'purpur';
  }
  // Fabric: fabric-server-mc.1.20.4-loader.0.15.0-launcher.1.0.0.jar
  if (/^fabric-server/i.test(filename)) {
    return 'fabric';
  }
  // Forge: forge-1.20.4-49.0.0-installer.jar or forge-1.20.4-49.0.0.jar
  if (/^forge-[\d.]+-[\d.]+/i.test(filename)) {
    return 'forge';
  }
  // Vanilla: server.jar or minecraft_server.1.20.4.jar
  if (/^(server|minecraft_server)[\d.]*\.jar$/i.test(filename)) {
    return 'vanilla';
  }
  // Unknown JAR files are also considered custom
  return 'custom';
}

const serverControl = requirePermission('server:control');
const downloadLimited = rateLimitedPermission(5, ONE_MINUTE, 'server:control');
const serverControlLimited = rateLimitedPermission(10, ONE_MINUTE, 'server:control');

export const jarsRouter = router({
  getVersions: requirePermission('files:read').query(async () => {
    try {
      return paperMCService.getVersions();
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch PaperMC versions',
      });
    }
  }),

  getBuilds: requirePermission('files:read')
    .input(z.object({ version: z.string() }))
    .query(async ({ input }) => {
      try {
        return paperMCService.getBuilds(input.version);
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch builds',
        });
      }
    }),

  download: downloadLimited
    .input(z.object({ serverId: z.number(), version: z.string(), build: z.number().optional() }))
    .mutation(async ({ input }) => {
      const server = await getServerOrThrow(input.serverId);

      try {
        const targetBuild = input.build || 0;

        downloadProgress.set(input.serverId, { percentage: 0, filename: '' });

        const result = await paperMCService.downloadJar(input.version, targetBuild, server.path, (progress) => {
          downloadProgress.set(input.serverId, {
            percentage: progress.percentage,
            filename: downloadProgress.get(input.serverId)?.filename || '',
          });
        });

        downloadProgress.delete(input.serverId);

        await serverService.updateServer(input.serverId, {
          jar_file: result.filename,
        });

        return {
          filename: result.filename,
          version: input.version,
          build: targetBuild,
        };
      } catch (err) {
        downloadProgress.delete(input.serverId);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'Failed to download JAR',
        });
      }
    }),

  progress: serverControl.input(z.object({ serverId: z.number() })).query(({ input }) => {
    return downloadProgress.get(input.serverId) || null;
  }),

  list: serverControl.input(z.object({ serverId: z.number() })).query(async ({ input }) => {
    const server = await getServerOrThrow(input.serverId);

    const result = await fileService.listDirectory(server.path, '/');

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list directory',
      });
    }

    const jars = result.data
      .filter((file) => file.type === 'file' && file.name.endsWith('.jar'))
      .map((file) => ({
        name: file.name,
        size: file.size,
        modified: file.modified,
        isActive: file.name === server.jar_file,
        source: detectJarSource(file.name),
      }));

    return {
      jars,
      activeJar: server.jar_file,
    };
  }),

  setActive: serverControlLimited.input(z.object({ serverId: z.number(), jarFile: z.string() })).mutation(async ({ input }) => {
    const server = await getServerOrThrow(input.serverId);

    const fileInfo = await fileService.getFileInfo(server.path, input.jarFile);
    if (!fileInfo.success) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'JAR file not found',
      });
    }

    await serverService.updateServer(input.serverId, {
      jar_file: input.jarFile,
    });

    return { jarFile: input.jarFile };
  }),

  delete: serverControlLimited.input(z.object({ serverId: z.number(), jarFile: z.string() })).mutation(async ({ input }) => {
    const server = await getServerOrThrow(input.serverId);

    if (server.jar_file === input.jarFile) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot delete the active JAR file',
      });
    }

    const fileInfo = await fileService.getFileInfo(server.path, input.jarFile);
    if (!fileInfo.success) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'JAR file not found',
      });
    }

    const result = await fileService.deleteFile(server.path, input.jarFile);
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete JAR file',
      });
    }

    return { deleted: input.jarFile };
  }),
});
