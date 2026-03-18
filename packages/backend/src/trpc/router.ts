import { router } from '@remnant/backend/trpc';
import { authRouter } from '@remnant/backend/trpc/routers/auth';
import { usersRouter } from '@remnant/backend/trpc/routers/users';
import { serversRouter } from '@remnant/backend/trpc/routers/servers';
import { filesRouter } from '@remnant/backend/trpc/routers/files';
import { jarsRouter } from '@remnant/backend/trpc/routers/jars';
import { pluginsRouter } from '@remnant/backend/trpc/routers/plugins';
import { tasksRouter } from '@remnant/backend/trpc/routers/tasks';
import { settingsRouter } from '@remnant/backend/trpc/routers/settings';
import { javaRouter } from '@remnant/backend/trpc/routers/java';
import { firewallRouter } from '@remnant/backend/trpc/routers/firewall';
import { onboardingRouter } from '@remnant/backend/trpc/routers/onboarding';
import { totpRouter } from '@remnant/backend/trpc/routers/totp';
import { auditRouter } from '@remnant/backend/trpc/routers/audit';
import { envRouter } from '@remnant/backend/trpc/routers/env';
import { domainsRouter } from '@remnant/backend/trpc/routers/domains';

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  servers: serversRouter,
  files: filesRouter,
  jars: jarsRouter,
  plugins: pluginsRouter,
  tasks: tasksRouter,
  settings: settingsRouter,
  java: javaRouter,
  firewall: firewallRouter,
  onboarding: onboardingRouter,
  totp: totpRouter,
  audit: auditRouter,
  env: envRouter,
  domains: domainsRouter,
});

export type AppRouter = typeof appRouter;
