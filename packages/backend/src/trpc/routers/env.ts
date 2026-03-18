import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { auditService } from '@remnant/backend/services/audit_service';
import { readEnvContent, writeEnvContent } from '@remnant/backend/services/env_service';

const adminOnly = requirePermission('users:manage');

export const envRouter = router({
  getContent: adminOnly.query((): string => {
    return readEnvContent();
  }),

  saveContent: adminOnly.input(z.object({ content: z.string() })).mutation(async ({ input, ctx }) => {
    writeEnvContent(input.content);

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'update',
      resourceType: 'env',
      details: { action: 'save' },
    });

    return { success: true };
  }),
});
