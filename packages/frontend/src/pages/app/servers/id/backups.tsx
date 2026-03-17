import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Archive, Download, HardDrive, Loader2, Trash2 } from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { useServer, useBackupServer } from '@remnant/frontend/hooks/use_servers';
import { useBackups, useDeleteBackup } from '@remnant/frontend/hooks/use_backups';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';
import { trpc } from '@remnant/frontend/lib/trpc';
import { cn } from '@remnant/frontend/lib/cn';
import { Button } from '@remnant/frontend/features/ui/button';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { FileTreeSelector } from '@remnant/frontend/features/ui/file_tree_selector';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { Badge } from '@remnant/frontend/features/ui/badge';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { Tooltip } from '@remnant/frontend/features/ui/tooltip';

export function ServerBackupsPage() {
  const { t } = useTranslation();

  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { isLoading: serverLoading } = useServer(serverId || 0);
  const { data: backups, isLoading: backupsLoading } = useBackups(serverId);
  const backupServer = useBackupServer();
  const deleteBackup = useDeleteBackup(serverId || 0);

  const utils = trpc.useUtils();

  const handleBackupConfirm = async (paths: Array<string>) => {
    if (!serverId) return;
    try {
      await backupServer.mutateAsync(serverId, paths);
      setDialogOpen(false);
      utils.servers.listBackups.invalidate({ id: serverId }).then();
    } catch {}
  };

  const handleDownload = async (filename: string) => {
    const token = useAuthStore.getState().accessToken;
    const url = `/api/servers/backups/${encodeURIComponent(filename)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });

    if (!response.ok) return;

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const handleDelete = async (filename: string) => {
    try {
      await deleteBackup.mutateAsync({ filename });
      setDeleteConfirm(null);
    } catch {}
  };

  if (!serverId || isNaN(serverId)) {
    return <PageError message={t('errors.generic')} />;
  }

  if (serverLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <ServerPageHeader>
        <ServerPageHeader.Left>
          <ServerPageHeader.Icon icon={Archive} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('backups.title')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/tasks'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('backups.subtitle')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
        <ServerPageHeader.Actions>
          <Button onClick={() => setDialogOpen(true)}>
            <Archive className={'size-4'} />
            {t('backups.backupNow')}
          </Button>
        </ServerPageHeader.Actions>
      </ServerPageHeader>
      <PageContent>
        <div className={'space-y-6'}>
          <BackupsSection
            deletePending={deleteBackup.isPending}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onDeleteConfirm={setDeleteConfirm}
            {...{ backups, backupsLoading, deleteConfirm }}
          />
          <BackupDialog
            open={dialogOpen}
            isPending={backupServer.isPending}
            onClose={() => setDialogOpen(false)}
            onConfirm={handleBackupConfirm}
            {...{ serverId }}
          />
        </div>
      </PageContent>
    </>
  );
}

type BackupsSectionProps = {
  backupsLoading: boolean;
  backups: Array<{ name: string; size: number; date: string }> | undefined;
  deleteConfirm: string | null;
  deletePending: boolean;
  onDownload: (filename: string) => void;
  onDelete: (filename: string) => void;
  onDeleteConfirm: (filename: string | null) => void;
};

function BackupsSection({
  backupsLoading,
  backups,
  deleteConfirm,
  deletePending,
  onDownload,
  onDelete,
  onDeleteConfirm,
}: BackupsSectionProps) {
  const { t } = useTranslation();

  const totalSize = backups?.reduce((acc, b) => acc + b.size, 0) ?? 0;

  return (
    <FeatureCard>
      <FeatureCard.Header
        actions={
          backups &&
          backups.length > 0 && (
            <div className={'flex items-center gap-1.5 text-sm text-zinc-600'}>
              <HardDrive className={'size-3'} strokeWidth={2} />
              <span>{formatFileSize(totalSize)}</span>
            </div>
          )
        }
      >
        <FeatureCard.Title count={backups && backups.length > 0 && backups.length}>{t('backups.title')}</FeatureCard.Title>
        <FeatureCard.Description>{t('backups.subtitle')}</FeatureCard.Description>
      </FeatureCard.Header>
      <FeatureCard.Body>
        {backupsLoading ? (
          <div className={'py-8 text-center'}>
            <div className={'mx-auto size-8 animate-spin rounded-full border-t-2 border-b-2 border-zinc-600'} />
          </div>
        ) : !backups || backups.length === 0 ? (
          <Empty />
        ) : (
          <>
            {backups.map((backup, index) => (
              <BackupRow
                key={backup.name}
                {...{ backup, index, deleteConfirm, deletePending, onDownload, onDelete, onDeleteConfirm }}
              />
            ))}
          </>
        )}
      </FeatureCard.Body>
    </FeatureCard>
  );
}

function Empty() {
  const { t } = useTranslation();

  return (
    <FeatureCard.Row className={'relative overflow-hidden'}>
      <div className={'absolute inset-0 bg-linear-to-b from-gray-400/10 to-transparent'} />
      <FeatureCard.Stack className={'items-center gap-y-0 py-10'}>
        <div className={'flex size-12 items-center justify-center rounded-2xl bg-zinc-100'}>
          <Archive className={'size-6 text-zinc-600'} strokeWidth={1.5} />
        </div>
        <p className={'mt-6 font-medium'}>{t('backups.noBackups')}</p>
        <p className={'mt-0.5 text-sm text-zinc-600'}>{t('backups.createFirst')}</p>
      </FeatureCard.Stack>
    </FeatureCard.Row>
  );
}

type BackupDialogProps = {
  open: boolean;
  serverId: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (paths: Array<string>) => void;
};

function BackupDialog({ open, serverId, isPending, onClose, onConfirm }: BackupDialogProps) {
  const { t } = useTranslation();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => new Set());

  const handleConfirm = () => {
    onConfirm(Array.from(selectedPaths));
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      {...{ open }}
    >
      <Dialog.Content className={'max-w-2xl overflow-hidden p-0'}>
        <div className={'relative border-b border-black/10 bg-linear-to-b from-zinc-600/3 to-transparent px-6 pt-6 pb-5'}>
          <div className={'flex items-start gap-4'}>
            <div className={'flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100'}>
              <Archive className={'size-5 text-zinc-700'} strokeWidth={1.75} />
            </div>
            <div className={'min-w-0 flex-1'}>
              <h2 className={'text-lg font-semibold tracking-tight text-zinc-900'}>{t('backups.dialogTitle')}</h2>
              <p className={'mt-0.5 text-sm text-zinc-500'}>{t('backups.dialogDescription')}</p>
            </div>
          </div>
        </div>
        <div className={'px-6 pt-3 pb-4'}>
          <FileTreeSelector
            enabled={open}
            selectedPaths={selectedPaths}
            onSelectedPathsChange={setSelectedPaths}
            {...{ serverId }}
          />
        </div>
        <Dialog.Footer className={'border-t border-black/10 bg-zinc-50/50 px-6 py-4'}>
          <Button variant={'secondary'} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={selectedPaths.size === 0 || isPending} loading={isPending}>
            {isPending ? (
              <>
                <Loader2 className={'size-4 animate-spin'} />
                {t('backups.backingUp')}
              </>
            ) : (
              <>
                <Archive className={'size-4'} />
                {t('backups.startBackup')}
              </>
            )}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

type BackupRowProps = {
  backup: { name: string; size: number; date: string };
  index: number;
  deleteConfirm: string | null;
  deletePending: boolean;
  onDownload: (filename: string) => void;
  onDelete: (filename: string) => void;
  onDeleteConfirm: (filename: string | null) => void;
};

function getBackupSource(filename: string): 'manual' | 'auto' | null {
  if (filename.includes('-manual-')) return 'manual';
  if (filename.includes('-auto-')) return 'auto';
  return null;
}

function BackupRow({ backup, index, deleteConfirm, deletePending, onDownload, onDelete, onDeleteConfirm }: BackupRowProps) {
  const { t } = useTranslation();
  const isNewest = index === 0;
  const source = getBackupSource(backup.name);

  return (
    <FeatureCard.Row interactive className={'items-center gap-8 py-3'}>
      <div className={'flex items-center gap-3'}>
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            isNewest ? 'bg-zinc-200/70' : 'bg-zinc-100'
          )}
        >
          <Archive className={cn('size-4', isNewest ? 'text-zinc-700' : 'text-zinc-600')} strokeWidth={2} />
        </div>
        <div>
          <div className={'flex items-center gap-2'}>
            <span className={'font-jetbrains truncate text-sm font-medium text-zinc-800'}>{backup.name}</span>
            {isNewest && (
              <Badge size={'xs'} className={'font-semibold'}>
                latest
              </Badge>
            )}
            {source && (
              <Badge variant={source === 'auto' ? 'cyan' : 'muted'} size={'xs'} className={'font-semibold'}>
                {t(`backups.source${source === 'auto' ? 'Auto' : 'Manual'}`)}
              </Badge>
            )}
          </div>
          <div className={'mt-0.5 flex items-center gap-2 text-sm text-zinc-600'}>
            <span className={'font-jetbrains tabular-nums'}>{formatFileSize(backup.size)}</span>
            <span className={'text-zinc-200'}>·</span>
            <span>{formatRelativeDate(backup.date)}</span>
          </div>
        </div>
      </div>
      <div className={'flex shrink-0 items-center gap-1.5'}>
        {deleteConfirm === backup.name ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600'}>{t('common.confirm')}?</span>
            <Button
              variant={'danger'}
              size={'xs'}
              onClick={() => onDelete(backup.name)}
              disabled={deletePending}
              loading={deletePending}
            >
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => onDeleteConfirm(null)}>
              {t('common.no')}
            </Button>
          </div>
        ) : (
          <>
            <Tooltip.Provider delayDuration={300}>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant={'ghost'}
                    size={'icon-sm'}
                    onClick={() => onDownload(backup.name)}
                    className={'text-zinc-600 hover:text-zinc-600'}
                  >
                    <Download className={'size-4'} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('backups.tooltipDownload')}</Tooltip.Content>
              </Tooltip>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button variant={'ghost-danger'} size={'icon-sm'} onClick={() => onDeleteConfirm(backup.name)}>
                    <Trash2 className={'size-3.5'} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('backups.tooltipDelete')}</Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          </>
        )}
      </div>
    </FeatureCard.Row>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
