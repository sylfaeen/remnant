import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Activity, Cpu, HardDrive, Loader2, Play, RotateCcw, Square, Users } from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { cn } from '@remnant/frontend/lib/cn';
import { useServer, useStartServer, useStopServer, useRestartServer } from '@remnant/frontend/hooks/use_servers';
import { useConsoleWebSocket } from '@remnant/frontend/hooks/use_console';
import { Button } from '@remnant/frontend/features/ui/button';
import { Tooltip } from '@remnant/frontend/features/ui/tooltip';
import { Badge, type BadgeProps } from '@remnant/frontend/features/ui/badge';
import { ServerConsole } from '@remnant/frontend/pages/app/servers/features/server_console';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { formatUptime } from '@remnant/frontend/lib/uptime';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import type { ServerMetrics } from '@remnant/shared';

type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping';

export function ServerDashboardPage() {
  const { t } = useTranslation();

  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : NaN;

  const { data: server, isLoading, error } = useServer(serverId);
  const startServer = useStartServer();
  const stopServer = useStopServer();
  const restartServer = useRestartServer();

  const [isActionPending, setIsActionPending] = useState(false);

  const {
    messages,
    isConnected,
    isConnecting,
    error: wsError,
    sendCommand,
    clearMessages,
    metrics,
    players,
  } = useConsoleWebSocket(isNaN(serverId) ? null : serverId);

  const handleStart = async () => {
    setIsActionPending(true);
    try {
      await startServer.mutateAsync(serverId);
    } catch {
    } finally {
      setIsActionPending(false);
    }
  };

  const handleStop = async () => {
    setIsActionPending(true);
    try {
      await stopServer.mutateAsync(serverId);
    } catch {
    } finally {
      setIsActionPending(false);
    }
  };

  const handleRestart = async () => {
    setIsActionPending(true);
    try {
      await restartServer.mutateAsync(serverId);
    } catch {
    } finally {
      setIsActionPending(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !server) {
    return <PageError message={t('errors.generic')} />;
  }

  const isRunning = server.status === 'running';
  const isStopped = server.status === 'stopped';
  const isTransitioning = server.status === 'starting' || server.status === 'stopping';

  return (
    <>
      <ServerPageHeader>
        <ServerPageHeader.Left>
          <ServerPageHeader.Icon icon={Activity} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.Title>{server.name}</ServerPageHeader.Title>
              <ServerPageHeader.PageName>{t('nav.dashboard')}</ServerPageHeader.PageName>
              <StatusBadge status={server.status} />
            </ServerPageHeader.Heading>
            <p className={'font-jetbrains mt-0.5 truncate text-sm text-zinc-600'}>{server.path}</p>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
        <ServerPageHeader.Actions>
          <ServerActions
            status={server.status}
            startPending={startServer.isPending}
            stopPending={stopServer.isPending}
            restartPending={restartServer.isPending}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
            {...{ isStopped, isRunning, isTransitioning, isActionPending }}
          />
        </ServerPageHeader.Actions>
      </ServerPageHeader>
      <PageContent>
        <div className={'flex h-full min-h-0 flex-1 flex-col space-y-4'}>
          <ServerConsole
            error={wsError}
            className={'min-h-0 flex-1'}
            {...{ messages, isConnected, isConnecting, sendCommand, clearMessages }}
          />
          <MetricsBar
            uptime={metrics?.uptime ?? server.uptime}
            playerCount={players.length}
            {...{ isRunning, metrics, players }}
          />
        </div>
      </PageContent>
    </>
  );
}

const STATUS_BADGE: Record<ServerStatus, { variant: BadgeProps['variant']; labelKey: string; className?: string }> = {
  stopped: { variant: 'muted', labelKey: 'servers.status.offline' },
  starting: { variant: 'warning', labelKey: 'servers.status.starting', className: 'animate-pulse' },
  running: { variant: 'success', labelKey: 'servers.status.online' },
  stopping: { variant: 'warning', labelKey: 'servers.status.stopping', className: 'animate-pulse' },
};

type StatusBadgeProps = {
  status: ServerStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = STATUS_BADGE[status];

  return (
    <Badge variant={config.variant} size={'md'} className={cn('font-semibold tracking-wider uppercase', config.className)}>
      {t(config.labelKey)}
    </Badge>
  );
}

type ServerActionsProps = {
  isStopped: boolean;
  isRunning: boolean;
  isTransitioning: boolean;
  status: ServerStatus;
  isActionPending: boolean;
  startPending: boolean;
  stopPending: boolean;
  restartPending: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
};

function ServerActions({
  isStopped,
  isRunning,
  isTransitioning,
  status,
  isActionPending,
  startPending,
  stopPending,
  restartPending,
  onStart,
  onStop,
  onRestart,
}: ServerActionsProps) {
  const { t } = useTranslation();

  if (isTransitioning) {
    return (
      <Badge variant={'warning'} size={'md'} className={'animate-pulse rounded-lg px-4 py-2'}>
        {status === 'starting' ? t('servers.status.starting') : t('servers.status.stopping')}...
      </Badge>
    );
  }

  return (
    <div className={'flex gap-2'}>
      {isStopped && (
        <Button variant={'success'} onClick={onStart} disabled={isActionPending} loading={startPending}>
          {startPending ? <Loader2 className={'size-4 animate-spin'} /> : <Play className={'size-4'} />}
          {t('servers.actions.start')}
        </Button>
      )}
      {isRunning && (
        <>
          <Button variant={'danger'} onClick={onStop} disabled={isActionPending} loading={stopPending}>
            {stopPending ? <Loader2 className={'size-4 animate-spin'} /> : <Square className={'size-4'} />}
            {t('servers.actions.stop')}
          </Button>
          <Button
            className={'bg-amber-500 text-white hover:bg-amber-600'}
            onClick={onRestart}
            disabled={isActionPending}
            loading={restartPending}
          >
            {restartPending ? <Loader2 className={'size-4 animate-spin'} /> : <RotateCcw className={'size-4'} />}
            {t('servers.actions.restart')}
          </Button>
        </>
      )}
    </div>
  );
}

type MetricsBarProps = {
  isRunning: boolean;
  metrics: ServerMetrics | null;
  playerCount: number;
  players: Array<string>;
  uptime: number | null | undefined;
};

function MetricsBar({ isRunning, metrics, playerCount, players, uptime }: MetricsBarProps) {
  const { t } = useTranslation();

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const cpuTooltip = metrics
    ? `${t('dashboard.cpuCores')}: ${metrics.cpu_cores}\n${t('dashboard.cpuRaw')}: ${metrics.cpu_raw.toFixed(1)}% / ${metrics.cpu_cores * 100}%\n${t('dashboard.cpuNormalized')}: ${metrics.cpu.toFixed(1)}% / 100%`
    : undefined;

  return (
    <div className={'flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6'}>
      <MetricItem
        icon={Cpu}
        iconColor={'text-zinc-600'}
        label={t('dashboard.cpu')}
        value={isRunning && metrics ? `${metrics.cpu.toFixed(1)}%` : '-'}
        tooltip={cpuTooltip}
      />
      <div className={'hidden h-4 w-px bg-black/6 sm:block'} />
      <MetricItem
        icon={HardDrive}
        iconColor={'text-zinc-600'}
        label={t('dashboard.memory')}
        value={isRunning && metrics ? formatMemory(metrics.memory) : '-'}
        detail={isRunning && metrics ? `${metrics.memory_percent.toFixed(0)}%` : undefined}
      />
      <div className={'hidden h-4 w-px bg-black/6 sm:block'} />
      <Tooltip.Provider delayDuration={200}>
        <Tooltip>
          <Tooltip.Trigger>
            <MetricItem
              icon={Users}
              iconColor={'text-zinc-600'}
              label={t('dashboard.players')}
              value={isRunning ? `${playerCount}` : '-'}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>
            {isRunning && players.length > 0
              ? players.slice(0, 3).join(', ') + (players.length > 3 ? ` +${players.length - 3}` : '')
              : 'No players online'}
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
      <div className={'hidden h-4 w-px bg-black/6 sm:block'} />
      <MetricItem
        icon={Activity}
        iconColor={'text-zinc-600'}
        label={t('dashboard.uptime')}
        value={isRunning && uptime ? formatUptime(uptime) : '-'}
      />
    </div>
  );
}

type MetricItemProps = {
  icon: typeof Cpu;
  iconColor: string;
  label: string;
  value: string;
  detail?: string;
  tooltip?: string;
};

function MetricItem({ icon: Icon, iconColor, label, value, detail, tooltip }: MetricItemProps) {
  const content = (
    <div className={'flex items-center gap-2'}>
      <Icon className={cn('size-3.5', iconColor)} strokeWidth={1.75} />
      <span className={'text-sm text-zinc-600'}>{label}</span>
      <span className={'text-sm font-medium text-zinc-900 tabular-nums'}>{value}</span>
      {detail && <span className={'text-sm text-zinc-600'}>{detail}</span>}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip.Provider delayDuration={300}>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <div className={'cursor-default'}>{content}</div>
          </Tooltip.Trigger>
          <Tooltip.Content className={'max-w-xs rounded-lg px-3 py-2 text-sm whitespace-pre-line'}>{tooltip}</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  return content;
}
