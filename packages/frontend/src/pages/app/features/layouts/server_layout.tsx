import { useMemo } from 'react';
import { Outlet, useParams } from '@tanstack/react-router';
import { Activity, Archive, BookOpen, Clock, FolderOpen, Puzzle, SlidersHorizontal } from 'lucide-react';
import { useSidebarItems, type SidebarNavSection } from '@remnant/frontend/pages/app/features/sidebar_context';
import { Sidebar } from '@remnant/frontend/pages/app/features/sidebar';
import { useServer } from '@remnant/frontend/hooks/use_servers';

export function ServerLayout() {
  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : NaN;

  const { data: server } = useServer(serverId);

  const sections = useMemo(() => getServerNavSections(id || '', server?.name || ''), [id, server?.name]);
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

function getServerNavSections(serverId: string, serverName: string): Array<SidebarNavSection> {
  const basePath = `/app/servers/${serverId}`;
  return [
    {
      section: serverName,
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
            { key: 'settingsFtp', path: `${basePath}/settings/ftp` },
            { key: 'settingsDomains', path: `${basePath}/settings/domains` },
          ],
        },
        { key: 'docs', path: '/app/docs', icon: BookOpen, bottom: true },
      ],
    },
  ];
}
