import { router } from '@remnant/backend/trpc';
import { protectedProcedure } from '@remnant/backend/trpc/middlewares/auth';
import { javaService } from '@remnant/backend/services/java_service';

export const javaRouter = router({
  getInstalledVersions: protectedProcedure.query(() => {
    return javaService.getInstalledVersions();
  }),
});
