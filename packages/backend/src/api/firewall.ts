import { initServer } from '@ts-rest/fastify';
import { contract } from '@remnant/shared';
import { ServerService } from '@remnant/backend/services/server_service';
import { firewallService } from '@remnant/backend/services/firewall_service';
import { auditService } from '@remnant/backend/services/audit_service';
import { authenticate, assertPermissions, checkRateLimit, isMiddlewareError } from './middleware';

const s = initServer();
const serverService = new ServerService();
const ONE_MINUTE = 60_000;

async function getServerOrThrow(serverId: number) {
  const server = await serverService.getServerById(serverId);
  if (!server) throw { status: 200, body: { message: 'Server not found' } };
  return server;
}

export const firewallRoutes = s.router(contract.firewall, {
  list: async ({ request, params }) => {
    try {
      const user = await authenticate(request);
      assertPermissions(user, 'server:control');

      await getServerOrThrow(Number(params.serverId));
      const rules = await firewallService.listRules(Number(params.serverId));
      return { status: 200 as const, body: { rules } };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },

  add: async ({ request, params, body }) => {
    try {
      const user = await authenticate(request);
      assertPermissions(user, 'server:control');
      checkRateLimit(`user:${user.sub}:firewall.add`, 10, ONE_MINUTE);

      const serverId = Number(params.serverId);
      await getServerOrThrow(serverId);

      const rule = await firewallService.addRule(body.serverId, body.port, body.protocol, body.label);

      await auditService.log({
        userId: user.sub,
        username: user.username,
        action: 'add',
        resourceType: 'firewall',
        resourceId: String(serverId),
        details: { port: body.port, protocol: body.protocol, label: body.label },
        ip: request.ip,
      });

      return { status: 201 as const, body: rule };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },

  remove: async ({ request, params }) => {
    try {
      const user = await authenticate(request);
      assertPermissions(user, 'server:control');
      checkRateLimit(`user:${user.sub}:firewall.remove`, 10, ONE_MINUTE);

      const ruleId = Number(params.ruleId);
      await firewallService.removeRule(ruleId);

      await auditService.log({
        userId: user.sub,
        username: user.username,
        action: 'remove',
        resourceType: 'firewall',
        resourceId: String(ruleId),
        ip: request.ip,
      });

      return { status: 200 as const, body: { message: 'Rule removed' } };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      const message = error instanceof Error ? error.message : 'Failed to remove firewall rule';
      return { status: 200 as const, body: { message } };
    }
  },

  toggle: async ({ request, params }) => {
    try {
      const user = await authenticate(request);
      assertPermissions(user, 'server:control');
      checkRateLimit(`user:${user.sub}:firewall.toggle`, 10, ONE_MINUTE);

      const ruleId = Number(params.ruleId);
      const result = await firewallService.toggleRule(ruleId);

      await auditService.log({
        userId: user.sub,
        username: user.username,
        action: 'toggle',
        resourceType: 'firewall',
        resourceId: String(ruleId),
        ip: request.ip,
      });

      return { status: 200 as const, body: result };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },

  check: async ({ request, query }) => {
    try {
      const user = await authenticate(request);
      assertPermissions(user, 'server:control');

      const open = await firewallService.checkPort(query.port, query.protocol);
      return { status: 200 as const, body: { open } };
    } catch (error: unknown) {
      if (isMiddlewareError(error)) return error;
      throw error;
    }
  },
});
