import { initServer } from '@ts-rest/fastify';
import { contract } from '@remnant/shared';
import { javaService } from '@remnant/backend/services/java_service';
import { authenticate, isMiddlewareError } from './middleware';

const s = initServer();

export const javaRoutes = s.router(contract.java, {
  getInstalledVersions: async ({ request }) => {
    try {
      await authenticate(request);
      const result = await javaService.getInstalledVersions();
      return { status: 200 as const, body: result };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },
});
