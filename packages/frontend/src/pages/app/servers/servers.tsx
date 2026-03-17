import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Server, Plus } from 'lucide-react';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { Skeleton } from '@remnant/frontend/features/ui/skeleton';
import { useServers, useCreateServer } from '@remnant/frontend/hooks/use_servers';
import { CreateServerDialog } from '@remnant/frontend/pages/app/servers/dialogs/create_server_dialog';
import { Button } from '@remnant/frontend/features/ui/button';
import { ApiError } from '@remnant/frontend/lib/api';
import { DocsLink } from '@remnant/frontend/pages/app/features/docs_link';
import { ServerStatusIcon } from '@remnant/frontend/pages/app/servers/features/server_status_badge';
import { formatUptime } from '@remnant/frontend/lib/uptime';
import { trpc } from '@remnant/frontend/lib/trpc';
import type { ServerResponse } from '@remnant/shared';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';

type ServerListItem = ServerResponse & {
  cpu: number | null;
  player_count: number;
};

export function ServersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: servers, isLoading, error } = useServers();
  const { data: versionInfo } = trpc.settings.getVersionInfo.useQuery();

  const createServer = useCreateServer();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    setFormError(null);
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = async (data: {
    name: string;
    min_ram: string;
    max_ram: string;
    jvm_flags: string;
    java_port: number;
    auto_start: boolean;
  }) => {
    setFormError(null);
    try {
      const server = await createServer.mutateAsync(data);
      setShowCreateDialog(false);
      navigate({ to: '/app/servers/$id', params: { id: String(server.id) } }).then();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(t('errors.generic'));
      }
    }
  };

  if (error) {
    return <PageError message={t('errors.generic')} />;
  }

  return (
    <PageContent>
      <div className={'space-y-6'}>
        <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
          <div>
            <div className={'flex items-center gap-2'}>
              <h1 className={'text-2xl font-bold tracking-tight text-zinc-900'}>{t('servers.title')}</h1>
              <DocsLink path={'/guide/server-management'} />
            </div>
            <p className={'mt-1 text-zinc-600'}>{t('servers.subtitle', 'Manage your Minecraft servers')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className={'size-4'} />
            {t('servers.addServer')}
          </Button>
        </div>
        <div className={'space-y-4'}>
          {isLoading && <ServerCardSkeletons />}
          {servers?.map((server: ServerListItem) => (
            <ServerCard key={server.id} ipAddress={versionInfo?.ipAddress ?? null} {...{ server }} />
          ))}
          {!isLoading && servers?.length === 0 && <EmptyState onCreate={handleCreate} />}
        </div>
        {showCreateDialog && (
          <CreateServerDialog
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createServer.isPending}
            error={formError}
          />
        )}
      </div>
    </PageContent>
  );
}

type ServerCardProps = {
  server: ServerListItem;
  ipAddress: string | null;
};

function ServerCard({ server, ipAddress }: ServerCardProps) {
  const { t } = useTranslation();
  const isRunning = server.status === 'running';
  const address = ipAddress ? `${ipAddress}:${server.java_port}` : `:${server.java_port}`;

  return (
    <div className={'overflow-hidden rounded-xl border border-black/10 bg-white transition-colors hover:bg-black/2'}>
      <div className={'px-4 py-3'}>
        <Link to={'/app/servers/$id'} params={{ id: String(server.id) }} className={'group flex items-start gap-3 sm:gap-4'}>
          <ServerStatusIcon status={server.status} />
          <div>
            <h3 className={'font-semibold'}>{server.name}</h3>
            <div className={'flex flex-wrap gap-x-2 text-sm text-zinc-600'}>
              <span>{address}</span>
              {isRunning && (
                <>
                  <span>·</span>
                  <span>CPU: {server.cpu !== null ? `${server.cpu.toFixed(1)}%` : '-'}</span>
                  <span>·</span>
                  <span>
                    {t('dashboard.players')}: {server.player_count}
                  </span>
                </>
              )}
              {server.uptime && (
                <>
                  <span>·</span>
                  <span>
                    {t('dashboard.uptime')}: {formatUptime(server.uptime)}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function ServerCardSkeletons() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`skeleton-${i}`} className={'overflow-hidden rounded-xl border border-black/10 bg-white'}>
          <div className={'px-4 py-3'}>
            <div className={'flex items-start gap-3 sm:gap-4'}>
              <Skeleton variant={'circular'} className={'size-5 shrink-0'} />
              <div className={'space-y-2'}>
                <Skeleton variant={'text'} className={'h-5 w-32'} />
                <Skeleton variant={'text'} className={'h-4 w-56'} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

type EmptyStateProps = {
  onCreate: () => void;
};

function EmptyState({ onCreate }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className={'rounded-xl border border-black/10 bg-white p-12 text-center'}>
      <div className={'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/10'}>
        <Server className={'size-8 text-emerald-600'} strokeWidth={1.5} />
      </div>
      <h3 className={'mb-2 font-semibold text-zinc-900'}>{t('servers.noServers')}</h3>
      <p className={'mb-6 text-zinc-600'}>{t('servers.noServersDescription', 'Get started by adding your first server')}</p>
      <Button onClick={onCreate}>
        <Plus className={'size-4'} />
        {t('servers.addServer')}
      </Button>
    </div>
  );
}
