import type { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import { useScrolled } from '@remnant/frontend/hooks/use_scrolled';
import { DocsLink } from '@remnant/frontend/pages/app/features/docs_link';

export function ServerPageHeader({ children }: { children: ReactNode }) {
  const { ref, isScrolled } = useScrolled<HTMLDivElement>();

  return (
    <div className={cn('header', isScrolled && 'scrolled')} ref={ref}>
      <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>{children}</div>
    </div>
  );
}

ServerPageHeader.Left = function ServerPageHeaderLeft({ children }: { children: ReactNode }) {
  return <div className={'flex min-w-0 items-start gap-3'}>{children}</div>;
};

ServerPageHeader.Icon = function ServerPageHeaderIcon({ icon: IconComponent }: { icon: LucideIcon }) {
  return (
    <div className={'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800'}>
      <IconComponent className={'size-5 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />
    </div>
  );
};

ServerPageHeader.Info = function ServerPageHeaderInfo({ children }: { children: ReactNode }) {
  return <div className={'min-w-0'}>{children}</div>;
};

ServerPageHeader.Heading = function ServerPageHeaderHeading({ children }: { children: ReactNode }) {
  return <div className={'flex flex-wrap items-center gap-2'}>{children}</div>;
};

ServerPageHeader.Title = function ServerPageHeaderTitle({ children }: { children: ReactNode }) {
  return <h1 className={'font-medium tracking-tight'}>{children}</h1>;
};

ServerPageHeader.ServerName = function ServerPageHeaderServerName() {
  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : 0;
  const { data: server } = useServer(serverId);
  return <ServerPageHeader.Title>{server?.name || `Server #${serverId}`}</ServerPageHeader.Title>;
};

ServerPageHeader.PageName = function ServerPageHeaderPageName({ children }: { children: ReactNode }) {
  return (
    <>
      <span className={'text-[8px] text-zinc-400 dark:text-zinc-500'}>&bull;</span>
      {children}
    </>
  );
};

ServerPageHeader.Docs = function ServerPageHeaderDocs({ path }: { path: string }) {
  return <DocsLink {...{ path }} />;
};

ServerPageHeader.Description = function ServerPageHeaderDescription({ children }: { children: ReactNode }) {
  return <p className={'mt-0.5 text-sm text-zinc-600 dark:text-zinc-400'}>{children}</p>;
};

ServerPageHeader.Actions = function ServerPageHeaderActions({ children }: { children: ReactNode }) {
  return <div className={'flex items-center justify-end gap-2'}>{children}</div>;
};
