import { initServer } from '@ts-rest/fastify';
import { contract } from '@remnant/shared';
import { sftpService } from '@remnant/backend/services/sftp_service';
import { authenticate, isMiddlewareError } from './middleware';

const s = initServer();

export const sftpRoutes = s.router(contract.sftp, {
  getInfo: async ({ request }) => {
    try {
      await authenticate(request);
      const result = sftpService.getSftpInfo();
      return {
        status: 200 as const,
        body: {
          host: result.host,
          port: result.port,
          remnantUser: result.username,
        },
      };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },

  list: async ({ request, query }) => {
    try {
      await authenticate(request);
      const accounts = await sftpService.listAccounts(query.serverId);
      return { status: 200 as const, body: { accounts } };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },

  create: async ({ request, body }) => {
    try {
      await authenticate(request);
      const result = await sftpService.createAccount(body);
      return { status: 201 as const, body: result };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },

  update: async ({ request, body }) => {
    try {
      await authenticate(request);
      const result = await sftpService.updateAccount(body);
      return { status: 200 as const, body: result };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },

  delete: async ({ request, params }) => {
    try {
      await authenticate(request);
      await sftpService.deleteAccount(Number(params.id));
      return { status: 200 as const, body: { message: 'SFTP account deleted' } };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      const message = error instanceof Error ? error.message : 'Failed to delete SFTP account';
      return { status: 200 as const, body: { message } };
    }
  },
});
