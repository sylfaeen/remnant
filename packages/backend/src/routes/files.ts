import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ErrorCodes } from '@remnant/shared';
import { fileService } from '@remnant/backend/services/file_service';
import { ServerService } from '@remnant/backend/services/server_service';
import { auditService } from '@remnant/backend/services/audit_service';

const serverService = new ServerService();

export async function fileRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // POST /api/servers/:serverId/files/upload - Upload file (multipart/form-data)
  fastify.post(
    '/:serverId/files/upload',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (
      request: FastifyRequest<{
        Params: { serverId: string };
        Querystring: { path?: string };
      }>,
      reply: FastifyReply
    ) => {
      if (!fastify.assertPermission(request, reply, 'files:write')) return;

      const serverId = parseInt(request.params.serverId, 10);

      if (isNaN(serverId)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid server ID',
          },
        });
      }

      const server = await serverService.getServerById(serverId);
      if (!server) {
        return reply.status(404).send({
          success: false,
          error: {
            code: ErrorCodes.SERVER_NOT_FOUND,
            message: 'Server not found',
          },
        });
      }

      const targetDir = request.query.path || '/';

      try {
        const data = await request.file();

        if (!data) {
          return reply.status(400).send({
            success: false,
            error: {
              code: ErrorCodes.VALIDATION_ERROR,
              message: 'No file uploaded',
            },
          });
        }

        const buffer = await data.toBuffer();
        let filename = data.filename;

        // Add -custom suffix to JAR files uploaded to root (manual imports)
        if (targetDir === '/' && filename.endsWith('.jar')) {
          filename = filename.replace(/\.jar$/, '-custom.jar');
        }

        const filePath = targetDir === '/' ? `/${filename}` : `${targetDir}/${filename}`;

        const result = await fileService.uploadFile(server.path, filePath, buffer);

        if (!result.success) {
          return reply.status(500).send({
            success: false,
            error: {
              code: ErrorCodes.INTERNAL_ERROR,
              message: 'Failed to upload file',
            },
          });
        }

        const user = request.user as { sub: number; username: string } | undefined;
        await auditService.log({
          userId: user?.sub ?? null,
          username: user?.username ?? null,
          action: 'upload',
          resourceType: 'file',
          resourceId: String(serverId),
          details: { path: filePath, size: buffer.length },
          ip: request.ip,
        });

        return reply.status(201).send({
          success: true,
          data: result.data,
        });
      } catch {
        return reply.status(500).send({
          success: false,
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Failed to upload file',
          },
        });
      }
    }
  );
}
