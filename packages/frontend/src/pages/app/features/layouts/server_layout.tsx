import { useMemo } from 'react';
import { Outlet, useParams } from '@tanstack/react-router';
import { Activity, Archive, BookOpen, Clock, FolderOpen, Puzzle, Settings, SlidersHorizontal } from 'lucide-react';
import { useSidebarItems, type SidebarNavSection } from '@remnant/frontend/pages/app/features/sidebar_context';
import { Sidebar } from '@remnant/frontend/pages/app/features/sidebar';

export function ServerLayout() {
  const { id } = useParams({ strict: false });

  const sections = useMemo(() => getServerNavSections(id || ''), [id]);
  const serverHeader = { backPath: '/app/servers', backLabel: 'servers' };

  useSidebarItems(sections, serverHeader);

  return (
    <main className={'flex min-h-0 flex-1'}>
      <Sidebar />
      <div className={'page layout-panel layout-server'}>
        <div className={'page-wrapper'}>
          <div className={'page-container'}>
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}

function getServerNavSections(serverId: string): Array<SidebarNavSection> {
  const basePath = `/app/servers/${serverId}`;
  return [
    {
      items: [
        { key: 'overview', path: basePath, exact: true, icon: Activity },
        { key: 'files', path: `${basePath}/files`, icon: FolderOpen },
        { key: 'plugins', path: `${basePath}/plugins`, icon: Puzzle },
        { key: 'backups', path: `${basePath}/backups`, icon: Archive },
        { key: 'tasks', path: `${basePath}/tasks`, icon: Clock },
        {
          key: 'settings',
          path: `${basePath}/settings`,
          icon: SlidersHorizontal,
          children: [
            { key: 'settingsJars', path: `${basePath}/settings/jars` },
            { key: 'settingsJvm', path: `${basePath}/settings/jvm` },
            { key: 'settingsFirewall', path: `${basePath}/settings/firewall` },
          ],
        },
        { key: 'docs', path: '/app/docs', icon: BookOpen, bottom: true },
        { key: 'globalSettings', path: '/app/settings', icon: Settings, bottom: true },
      ],
    },
  ];
}
