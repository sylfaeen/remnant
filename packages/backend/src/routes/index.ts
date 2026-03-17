import type { FastifyInstance } from 'fastify';
import { fileRoutes } from '@remnant/backend/routes/files';
import { pluginRoutes } from '@remnant/backend/routes/plugins';
import { backupRoutes } from '@remnant/backend/routes/backups';

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(fileRoutes, { prefix: '/api/servers' });
  await fastify.register(pluginRoutes, { prefix: '/api/servers' });
  await fastify.register(backupRoutes, { prefix: '/api/servers' });
}
