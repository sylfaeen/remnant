import { z } from 'zod';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { auditService } from '@remnant/backend/services/audit_service';

const adminOnly = requirePermission('users:manage');

export const auditRouter = router({
  list: adminOnly
    .input(
      z.object({
        userId: z.number().optional(),
        resourceType: z.string().optional(),
        resourceId: z.string().optional(),
        limit: z.number().int().min(1).max(500).optional().default(100),
        offset: z.number().int().min(0).optional().default(0),
      })
    )
    .query(async ({ input }) => {
      return auditService.query(input);
    }),
});
