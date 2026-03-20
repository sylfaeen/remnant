import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { ServerService } from '@remnant/backend/services/server_service';
import { domainService } from '@remnant/backend/services/domain_service';
import { auditService } from '@remnant/backend/services/audit_service';
import { addDomainSchema, domainNameSchema, setPanelDomainSchema } from '@remnant/shared';

const serverService = new ServerService();
const ONE_MINUTE = 60 * 1000;

async function getServerOrThrow(serverId: number) {
  const server = await serverService.getServerById(serverId);
  if (!server) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Server not found' });
  }
  return server;
}

const adminOnly = requirePermission('users:manage');
const adminLimited = rateLimitedPermission(10, ONE_MINUTE, 'users:manage');

export const domainsRouter = router({
  list: adminOnly.input(z.object({ serverId: z.number() })).query(async ({ input }) => {
    await getServerOrThrow(input.serverId);
    const domains = await domainService.listByServer(input.serverId);
    return { domains };
  }),

  add: adminLimited.input(addDomainSchema).mutation(async ({ input, ctx }) => {
    await getServerOrThrow(input.serverId);

    try {
      const domain = await domainService.addDomain(input.serverId, input.domain, input.port, input.type);

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'add',
        resourceType: 'domain',
        resourceId: String(input.serverId),
        details: { domain: input.domain, port: input.port, type: input.type },
        ip: ctx.req.ip,
      });

      return domain;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add domain';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  remove: adminLimited.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    try {
      const result = await domainService.removeDomain(input.id);

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'remove',
        resourceType: 'domain',
        resourceId: String(input.id),
        ip: ctx.req.ip,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove domain';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  enableSsl: adminLimited.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    try {
      const result = await domainService.enableSsl(input.id);

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'enable-ssl',
        resourceType: 'domain',
        resourceId: String(input.id),
        ip: ctx.req.ip,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to enable SSL';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  dnsCheck: adminOnly.input(z.object({ domain: domainNameSchema })).query(async ({ input }) => {
    return domainService.dnsCheck(input.domain);
  }),

  panelDomain: adminOnly.query(async () => {
    const domain = await domainService.getPanelDomain();
    return { domain };
  }),

  setPanelDomain: adminLimited.input(setPanelDomainSchema).mutation(async ({ input, ctx }) => {
    try {
      const domain = await domainService.setPanelDomain(input.domain, 3001);

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'set-panel-domain',
        resourceType: 'domain',
        details: { domain: input.domain },
        ip: ctx.req.ip,
      });

      return domain;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to set panel domain';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  removePanelDomain: adminLimited.mutation(async ({ ctx }) => {
    try {
      const result = await domainService.removePanelDomain();

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'remove-panel-domain',
        resourceType: 'domain',
        ip: ctx.req.ip,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove panel domain';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  renew: adminLimited.mutation(async ({ ctx }) => {
    try {
      const result = await domainService.renewAll();

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'renew-ssl',
        resourceType: 'domain',
        ip: ctx.req.ip,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to renew SSL certificates';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  refreshExpiry: adminOnly.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return domainService.refreshSslExpiry(input.id);
  }),

  ensureTimer: adminOnly.query(async () => {
    return domainService.ensureCertbotTimer();
  }),
});
