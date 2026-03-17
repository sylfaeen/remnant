import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { ServerService } from '@remnant/backend/services/server_service';
import { firewallService } from '@remnant/backend/services/firewall_service';
import { auditService } from '@remnant/backend/services/audit_service';
import { createFirewallRuleSchema, firewallProtocolSchema } from '@remnant/shared';

const serverService = new ServerService();
const ONE_MINUTE = 60 * 1000;

async function getServerOrThrow(serverId: number) {
  const server = await serverService.getServerById(serverId);
  if (!server) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Server not found' });
  }
  return server;
}

const serverControl = requirePermission('server:control');
const serverControlLimited = rateLimitedPermission(10, ONE_MINUTE, 'server:control');

export const firewallRouter = router({
  list: serverControl.input(z.object({ serverId: z.number() })).query(async ({ input }) => {
    await getServerOrThrow(input.serverId);
    const rules = await firewallService.listRules(input.serverId);
    return { rules };
  }),

  add: serverControlLimited.input(createFirewallRuleSchema).mutation(async ({ input, ctx }) => {
    await getServerOrThrow(input.serverId);

    try {
      const rule = await firewallService.addRule(input.serverId, input.port, input.protocol, input.label);

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'add',
        resourceType: 'firewall',
        resourceId: String(input.serverId),
        details: { port: input.port, protocol: input.protocol, label: input.label },
        ip: ctx.req.ip,
      });

      return rule;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add firewall rule';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  remove: serverControlLimited.input(z.object({ ruleId: z.number() })).mutation(async ({ input, ctx }) => {
    try {
      const result = await firewallService.removeRule(input.ruleId);

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'remove',
        resourceType: 'firewall',
        resourceId: String(input.ruleId),
        ip: ctx.req.ip,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove firewall rule';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  toggle: serverControlLimited.input(z.object({ ruleId: z.number() })).mutation(async ({ input, ctx }) => {
    try {
      const result = await firewallService.toggleRule(input.ruleId);

      await auditService.log({
        userId: ctx.user.sub,
        username: ctx.user.username,
        action: 'toggle',
        resourceType: 'firewall',
        resourceId: String(input.ruleId),
        ip: ctx.req.ip,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to toggle firewall rule';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  check: serverControl
    .input(z.object({ port: z.number().int().min(1024).max(65535), protocol: firewallProtocolSchema }))
    .query(async ({ input }) => {
      const open = await firewallService.checkPort(input.port, input.protocol);
      return { open };
    }),
});
