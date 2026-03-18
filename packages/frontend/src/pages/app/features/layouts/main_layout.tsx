import { Outlet } from '@tanstack/react-router';
import { BookOpen, LayoutDashboard, Server, Settings, Users } from 'lucide-react';
import { useSidebarItems, type SidebarNavSection } from '@remnant/frontend/pages/app/features/sidebar_context';
import { Sidebar } from '@remnant/frontend/pages/app/features/sidebar';

const mainNavItems: Array<SidebarNavSection> = [
  {
    items: [
      { key: 'dashboard', path: '/app', exact: true, icon: LayoutDashboard },
      { key: 'servers', path: '/app/servers', icon: Server },
      { key: 'users', path: '/app/users', icon: Users },
      {
        key: 'settings',
        path: '/app/settings',
        icon: Settings,
        children: [
          { key: 'settingsGeneral', path: '/app/settings/general' },
          { key: 'settingsEnvironment', path: '/app/settings/environment' },
        ],
      },
      { key: 'docs', path: '/app/docs', icon: BookOpen, bottom: true },
    ],
  },
];

export function MainLayout() {
  useSidebarItems(mainNavItems);
  return <MainLayoutContent />;
}

export function MainLayoutContent() {
  return (
    <main className={'flex min-h-0 flex-1'}>
      <Sidebar />
      <div className={'page layout-panel layout-main'}>
        <div className={'page-wrapper'}>
          <div className={'page-container'}>
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
