import { TRPCError } from '@trpc/server';
import { router } from '@remnant/backend/trpc';
import { protectedProcedure } from '@remnant/backend/trpc/middlewares/auth';
import { totpService } from '@remnant/backend/services/totp_service';
import { auditService } from '@remnant/backend/services/audit_service';
import { totpVerifyRequestSchema, totpDisableRequestSchema, ErrorCodes } from '@remnant/shared';

export const totpRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const enabled = await totpService.isTotpEnabled(ctx.user.sub);
    return { enabled };
  }),

  setup: protectedProcedure.mutation(async ({ ctx }) => {
    const isEnabled = await totpService.isTotpEnabled(ctx.user.sub);
    if (isEnabled) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ErrorCodes.TOTP_ALREADY_ENABLED,
      });
    }

    return totpService.generateTotpSetup(ctx.user.sub);
  }),

  verify: protectedProcedure.input(totpVerifyRequestSchema).mutation(async ({ ctx, input }) => {
    const activated = await totpService.activateTotp(ctx.user.sub, input.code);
    if (!activated) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ErrorCodes.TOTP_INVALID_CODE,
      });
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'totp_enabled',
      resourceType: 'totp',
      ip: ctx.req.ip,
    });

    return { success: true };
  }),

  disable: protectedProcedure.input(totpDisableRequestSchema).mutation(async ({ ctx, input }) => {
    const isEnabled = await totpService.isTotpEnabled(ctx.user.sub);
    if (!isEnabled) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ErrorCodes.TOTP_NOT_ENABLED,
      });
    }

    const isValid = await totpService.verifyTotpCode(ctx.user.sub, input.code);
    if (!isValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ErrorCodes.TOTP_INVALID_CODE,
      });
    }

    await totpService.disableTotp(ctx.user.sub);

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'totp_disabled',
      resourceType: 'totp',
      ip: ctx.req.ip,
    });

    return { success: true };
  }),
});
