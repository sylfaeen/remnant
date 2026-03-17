import { Outlet } from '@tanstack/react-router';
import {
  BookOpen,
  Download,
  Settings,
  Server,
  Globe,
  Terminal,
  FolderOpen,
  Puzzle,
  Clock,
  Users,
  Shield,
  Container,
  Code,
  Gauge,
} from 'lucide-react';
import { useSidebarItems, type SidebarNavSection } from '@remnant/frontend/pages/app/features/sidebar_context';
import { Sidebar } from '@remnant/frontend/pages/app/features/sidebar';

const docsNavItems: Array<SidebarNavSection> = [
  {
    section: 'Getting Started',
    items: [
      { key: 'docsIntroduction', path: '/app/docs/introduction', icon: BookOpen },
      { key: 'docsInstallation', path: '/app/docs/installation', icon: Download },
      { key: 'docsConfiguration', path: '/app/docs/configuration', icon: Settings },
    ],
  },
  {
    section: 'Features',
    items: [
      { key: 'docsServerManagement', path: '/app/docs/server-management', icon: Server },
      { key: 'docsConsole', path: '/app/docs/console', icon: Terminal },
      { key: 'docsFiles', path: '/app/docs/files', icon: FolderOpen },
      { key: 'docsPlugins', path: '/app/docs/plugins', icon: Puzzle },
      { key: 'docsTasks', path: '/app/docs/tasks', icon: Clock },
    ],
  },
  {
    section: 'Administration',
    items: [
      { key: 'docsUsers', path: '/app/docs/users', icon: Users },
      { key: 'docsSecurity', path: '/app/docs/security', icon: Shield },
      { key: 'docsDomain', path: '/app/docs/domain', icon: Globe },
    ],
  },
  {
    section: 'Reference',
    items: [
      { key: 'docsDocker', path: '/app/docs/docker', icon: Container },
      { key: 'docsApi', path: '/app/docs/api', icon: Code },
      { key: 'docsRateLimits', path: '/app/docs/rate-limits', icon: Gauge },
    ],
  },
];

const docsHeader = { backPath: '/app', backLabel: 'dashboard' };

export function DocsLayout() {
  useSidebarItems(docsNavItems, docsHeader);

  return (
    <main className={'flex min-h-0 flex-1'}>
      <Sidebar />
      <div className={'page layout-doc'}>
        <div className={'page-wrapper'}>
          <div className={'page-container'}>
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
