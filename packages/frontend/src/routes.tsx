import { createRootRoute, createRoute, createRouter, redirect, Outlet, Navigate } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthInitializer } from '@remnant/frontend/features/auth_initializer';
import { AppShell } from '@remnant/frontend/features/layouts/app_shell';
import { MainLayout } from '@remnant/frontend/pages/app/features/layouts/main_layout';
import { ServerLayout } from '@remnant/frontend/pages/app/features/layouts/server_layout';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';
import { trpc, createTRPCClient } from '@remnant/frontend/lib/trpc';
import { ToastProvider } from '@remnant/frontend/features/ui/toast';
import { LoginPage } from '@remnant/frontend/pages/web/login';
import { SetupPage } from '@remnant/frontend/pages/web/setup';
import { DashboardPage } from '@remnant/frontend/pages/app/dashboard';
import { UsersPage } from '@remnant/frontend/pages/app/users/users';
import { ServersPage } from '@remnant/frontend/pages/app/servers/servers';
import { ServerDashboardPage } from '@remnant/frontend/pages/app/servers/id/dashboard';
import { ServerFilesPage } from '@remnant/frontend/pages/app/servers/id/files';
import { ServerFileEditorPage } from '@remnant/frontend/pages/app/servers/id/file_editor';
import { ServerSettingsPage } from '@remnant/frontend/pages/app/servers/id/settings/settings';
import { ServerSettingsJarsPage } from '@remnant/frontend/pages/app/servers/id/settings/jars';
import { ServerSettingsJvmPage } from '@remnant/frontend/pages/app/servers/id/settings/jvm';
import { ServerSettingsFirewallPage } from '@remnant/frontend/pages/app/servers/id/settings/firewall';
import { ServerPluginsPage } from '@remnant/frontend/pages/app/servers/id/plugins';
import { ServerTasksPage } from '@remnant/frontend/pages/app/servers/id/tasks';
import { ServerBackupsPage } from '@remnant/frontend/pages/app/servers/id/backups';
import { NotFoundPage } from '@remnant/frontend/pages/web/not_found';
import { SettingsEnvironmentPage } from '@remnant/frontend/pages/app/settings/environment';
import { AccountPage } from '@remnant/frontend/pages/app/account';
import { AppNotFoundPage } from '@remnant/frontend/pages/app/not_found';
import { DocsLayout } from '@remnant/frontend/pages/app/features/layouts/docs_layout';
import { MarkdownPage } from '@remnant/frontend/pages/app/docs/markdown';
import { DEFAULT_DOC_SLUG } from '@remnant/frontend/pages/app/docs/features/docs_content';
import { SettingsGeneralPage } from '@remnant/frontend/pages/app/settings/general';
import { SettingsPage } from '@remnant/frontend/pages/app/settings/settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const trpcClient = createTRPCClient(() => useAuthStore.getState().accessToken);

// Auth guard: redirect to log in if not authenticated
function requireAuth() {
  const { isAuthenticated, isInitialized } = useAuthStore.getState();

  if (!isInitialized) {
    return;
  }

  if (!isAuthenticated) {
    throw redirect({ to: '/' });
  }
}

// Redirect to /app if already authenticated
function redirectIfAuthenticated() {
  const { isAuthenticated, isInitialized } = useAuthStore.getState();

  if (!isInitialized) {
    return;
  }

  if (isAuthenticated) {
    throw redirect({ to: '/app' });
  }
}

// Protected shell - wraps all authenticated pages with AppShell
function ProtectedShell() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (isInitialized && !isAuthenticated) {
    return <Navigate to={'/'} />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function RootComponent() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthInitializer>
            <Outlet />
          </AuthInitializer>
        </ToastProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: redirectIfAuthenticated,
  component: LoginPage,
});

const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup',
  component: SetupPage,
});

// App shell route - contains header, child layouts provide navigation
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  beforeLoad: requireAuth,
  component: ProtectedShell,
  notFoundComponent: AppNotFoundPage,
});

const mainLayoutRoute = createRoute({
  getParentRoute: () => appRoute,
  id: 'main',
  component: MainLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/',
  component: DashboardPage,
});

const serversRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: 'servers',
  component: ServersPage,
});

const usersRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: 'users',
  component: UsersPage,
});

const appSettingsRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: 'settings',
  component: SettingsPage,
});

const appSettingsGeneralRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: 'settings/general',
  component: SettingsGeneralPage,
});

const appSettingsEnvironmentRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: 'settings/environment',
  component: SettingsEnvironmentPage,
});

const accountRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: 'account',
  component: AccountPage,
});

const docsLayoutRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'docs',
  component: DocsLayout,
});

const docsIndexRoute = createRoute({
  getParentRoute: () => docsLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/app/docs/$slug', params: { slug: DEFAULT_DOC_SLUG } });
  },
});

const docsSlugRoute = createRoute({
  getParentRoute: () => docsLayoutRoute,
  path: '$slug',
  component: MarkdownPage,
});

const serverLayoutRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'servers/$id',
  component: ServerLayout,
});

const serverDashboardRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: '/',
  component: ServerDashboardPage,
});

const serverFilesRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'files',
  component: ServerFilesPage,
  validateSearch: (search: Record<string, unknown>): { path?: string } => {
    return {
      path: typeof search.path === 'string' ? search.path : undefined,
    };
  },
});

const serverFileEditRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'files/edit',
  component: ServerFileEditorPage,
  validateSearch: (search: Record<string, unknown>): { path?: string } => {
    return {
      path: typeof search.path === 'string' ? search.path : undefined,
    };
  },
});

const serverSettingsRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'settings',
  component: ServerSettingsPage,
});

const serverSettingsJarsRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'settings/jars',
  component: ServerSettingsJarsPage,
});

const serverSettingsJvmRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'settings/jvm',
  component: ServerSettingsJvmPage,
});

const serverSettingsFirewallRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'settings/firewall',
  component: ServerSettingsFirewallPage,
});

const serverPluginsRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'plugins',
  component: ServerPluginsPage,
});

const serverTasksRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'tasks',
  component: ServerTasksPage,
});

const serverBackupsRoute = createRoute({
  getParentRoute: () => serverLayoutRoute,
  path: 'backups',
  component: ServerBackupsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  setupRoute,
  appRoute.addChildren([
    mainLayoutRoute.addChildren([
      dashboardRoute,
      serversRoute,
      usersRoute,
      appSettingsRoute,
      appSettingsGeneralRoute,
      appSettingsEnvironmentRoute,
      accountRoute,
    ]),
    docsLayoutRoute.addChildren([docsIndexRoute, docsSlugRoute]),
    serverLayoutRoute.addChildren([
      serverDashboardRoute,
      serverFilesRoute,
      serverFileEditRoute,
      serverSettingsRoute,
      serverSettingsJarsRoute,
      serverSettingsJvmRoute,
      serverSettingsFirewallRoute,
      serverPluginsRoute,
      serverBackupsRoute,
      serverTasksRoute,
    ]),
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
