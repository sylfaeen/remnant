import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@remnant/frontend/pages/app/features/sidebar_context';
import { trpc } from '@remnant/frontend/lib/trpc';
import { cn } from '@remnant/frontend/lib/cn';
import { ArrowRight, Download, Menu } from 'lucide-react';
import { Button } from '@remnant/frontend/features/ui/button';
import { useTranslation } from 'react-i18next';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { data } = trpc.settings.getVersionInfo.useQuery(undefined, {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const hasNewVersion = data?.latestVersion && isNewerVersion(data.latestVersion, data.currentVersion);

  return (
    <SidebarProvider>
      <div className={cn('remnant', hasNewVersion && 'new-version')}>
        {hasNewVersion ? <UpdateBanner {...{ data }} /> : null}
        <SidebarToggle />
        <div className={'flex min-h-0 flex-1 flex-col'}>{children}</div>
      </div>
    </SidebarProvider>
  );
}

type UpdateBannerProps = {
  data: { currentVersion: string; latestVersion: string | null; ipAddress: string | null };
};

function UpdateBanner({ data }: UpdateBannerProps) {
  const { t } = useTranslation();

  return (
    <div className={'h-10 shrink-0 border-b border-purple-200 bg-purple-100'}>
      <div className={'flex'}>
        <div className={'hidden w-[max(0px,calc(50%-400px-13rem))] shrink-0 lg:block'} />
        <div className={'flex max-w-325 flex-1 items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:pl-5 xl:pr-0'}>
          <div className={'flex items-center gap-2.5'}>
            <Download className={'size-4 shrink-0 text-purple-600'} strokeWidth={2} />
            <p className={'text-sm font-medium text-purple-800'}>{t('update.available', { version: data.latestVersion })}</p>
          </div>
          <a
            href={'/docs/guide/configuration'}
            target={'_blank'}
            rel={'noopener noreferrer'}
            className={
              'flex shrink-0 items-center gap-1 text-sm font-medium text-purple-700 transition-colors hover:text-purple-900'
            }
          >
            {t('update.howToUpdate')}
            <ArrowRight className={'size-4'} strokeWidth={2} />
          </a>
        </div>
      </div>
    </div>
  );
}

function SidebarToggle() {
  const { setMobileOpen } = useSidebar();

  return (
    <div className={'flex items-center justify-end border-b border-black/10 px-4 py-3 min-[960px]:hidden'}>
      <Button type={'button'} variant={'secondary'} size={'icon-sm'} onClick={() => setMobileOpen(true)}>
        <Menu className={'size-4'} strokeWidth={2} />
      </Button>
    </div>
  );
}

function isNewerVersion(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }

  return false;
}
