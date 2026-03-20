import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { protectedProcedure } from '@remnant/backend/trpc/middlewares/auth';
import { sftpService } from '@remnant/backend/services/sftp_service';
import { createSftpAccountSchema, updateSftpAccountSchema } from '@remnant/shared';

export const sftpRouter = router({
  getInfo: protectedProcedure.query(() => {
    return sftpService.getSftpInfo();
  }),

  list: protectedProcedure.input(z.object({ serverId: z.number() })).query(async ({ input }) => {
    const accounts = await sftpService.listAccounts(input.serverId);
    return { accounts };
  }),

  create: protectedProcedure.input(createSftpAccountSchema).mutation(async ({ input }) => {
    try {
      return await sftpService.createAccount(input);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create SFTP account';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  update: protectedProcedure.input(updateSftpAccountSchema).mutation(async ({ input }) => {
    try {
      return await sftpService.updateAccount(input);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update SFTP account';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    try {
      return await sftpService.deleteAccount(input.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete SFTP account';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),
});
