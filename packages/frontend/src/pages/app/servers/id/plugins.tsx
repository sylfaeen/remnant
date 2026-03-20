import { useState, type DragEvent, type ChangeEvent } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2, Package, Power, PowerOff, Puzzle, Trash2, UploadCloud } from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { cn } from '@remnant/frontend/lib/cn';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import {
  usePlugins,
  useUploadPlugin,
  useDeletePlugin,
  useTogglePlugin,
  formatPluginSize,
  type PluginInfo,
} from '@remnant/frontend/hooks/use_plugins';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@remnant/frontend/features/ui/shadcn/tooltip';
import { Label } from '@remnant/frontend/features/ui/shadcn/label';

export function ServerPluginsPage() {
  const { t } = useTranslation();
  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const { isLoading: serverLoading } = useServer(serverId || 0);

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
          <ServerPageHeader.Icon icon={Puzzle} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('nav.plugins')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/plugins'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('plugins.subtitle')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
      </ServerPageHeader>
      <PageContent>
        <FeatureCard.Stack>
          <UploadSection {...{ serverId }} />
          <PluginListSection {...{ serverId }} />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

type UploadSectionProps = {
  serverId: number;
};

function UploadSection({ serverId }: UploadSectionProps) {
  const { t } = useTranslation();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadPlugin = useUploadPlugin(serverId);

  const uploadPending = uploadPlugin.isPending;

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith('.jar'));
    if (files.length === 0) {
      setUploadError(t('errors.invalidFileType'));
      return;
    }

    for (const file of files) {
      try {
        await uploadPlugin.mutateAsync(file);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : t('notifications.fileUploadFailed'));
      }
    }
  };

  const onFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const jarFiles = Array.from(files).filter((f) => f.name.endsWith('.jar'));

    if (jarFiles.length === 0) {
      setUploadError(t('errors.invalidFileType'));
      return;
    }

    for (const file of jarFiles) {
      try {
        await uploadPlugin.mutateAsync(file);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : t('notifications.fileUploadFailed'));
      }
    }

    e.target.value = '';
  };

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title>{t('plugins.addPlugin')}</FeatureCard.Title>
          <FeatureCard.Description>{t('plugins.addPluginDescription')}</FeatureCard.Description>
        </FeatureCard.Content>
      </FeatureCard.Header>
      <FeatureCard.Body
        className={cn(
          'rounded-xl border-2 border-dashed shadow-none transition-all',
          isDragging
            ? 'border-zinc-400/40 bg-zinc-100/50 dark:bg-zinc-800/50'
            : 'border-black/10 hover:border-black/12 dark:border-white/10 dark:hover:border-white/12'
        )}
      >
        <div className={'relative overflow-hidden'} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-b from-zinc-600/2 to-transparent transition-opacity',
              isDragging ? 'opacity-100' : 'opacity-0'
            )}
          />
          <div className={'relative flex flex-col items-center py-8'}>
            <div className={'mb-3 flex size-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800'}>
              <UploadCloud className={'size-5 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />
            </div>
            <p className={'font-medium'}>{t('plugins.uploadHint')}</p>
            <p className={'mt-3 text-sm text-zinc-600 dark:text-zinc-400'}>{t('plugins.or')}</p>
            <Label className={'mt-3 mb-0! inline-block cursor-pointer'}>
              <Button variant={'secondary'} disabled={uploadPending} loading={uploadPending} asChild>
                <span>{t('plugins.browseFiles')}</span>
              </Button>
              <input type={'file'} accept={'.jar'} multiple onChange={onFileSelect} className={'hidden'} />
            </Label>
            {uploadPending && (
              <div className={'mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'}>
                <Loader2 className={'size-5 animate-spin text-zinc-400 dark:text-zinc-500'} />
                {t('files.uploadProgress')}
              </div>
            )}
            {uploadError && (
              <div className={'mt-3 flex items-center gap-2 text-sm text-red-600'}>
                <AlertTriangle className={'size-3.5 shrink-0'} />
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </FeatureCard.Body>
    </FeatureCard>
  );
}

type PluginListSectionProps = {
  serverId: number;
};

function PluginListSection({ serverId }: PluginListSectionProps) {
  const { t } = useTranslation();

  const { data: pluginsData, isLoading: pluginsLoading } = usePlugins(serverId);
  const deletePlugin = useDeletePlugin(serverId);
  const togglePlugin = useTogglePlugin(serverId);

  const plugins = pluginsData?.plugins;
  const enabledCount = plugins?.filter((p) => p.enabled).length ?? 0;

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title count={plugins && plugins.length > 0 && `${enabledCount}/${plugins.length}`}>
            {t('plugins.installed')}
          </FeatureCard.Title>
          <FeatureCard.Description>{t('plugins.uploadFirst')}</FeatureCard.Description>
        </FeatureCard.Content>
      </FeatureCard.Header>
      <FeatureCard.Body>
        {pluginsLoading ? (
          <div className={'py-8 text-center'}>
            <div
              className={'mx-auto size-8 animate-spin rounded-full border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400'}
            />
          </div>
        ) : !plugins || plugins.length === 0 ? (
          <FeatureCard.Empty icon={Puzzle} title={t('plugins.noPlugins')} description={t('plugins.uploadFirst')} />
        ) : (
          <>
            {plugins.map((plugin) => (
              <PluginRow key={plugin.filename} {...{ plugin, togglePlugin, deletePlugin }} />
            ))}
          </>
        )}
      </FeatureCard.Body>
    </FeatureCard>
  );
}

type PluginRowProps = {
  plugin: PluginInfo;
  togglePlugin: { mutateAsync: (filename: string) => Promise<unknown>; isPending: boolean };
  deletePlugin: { mutateAsync: (filename: string) => Promise<unknown>; isPending: boolean };
};

function PluginRow({ plugin, togglePlugin, deletePlugin }: PluginRowProps) {
  const { t } = useTranslation();
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleToggle = async () => {
    try {
      await togglePlugin.mutateAsync(plugin.filename);
      setToggleConfirm(false);
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await deletePlugin.mutateAsync(plugin.filename);
      setDeleteConfirm(false);
    } catch {}
  };

  return (
    <FeatureCard.Row interactive className={'w-full items-center gap-8 py-3'}>
      <div className={cn('flex items-center gap-3', !plugin.enabled && 'opacity-50')}>
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-opacity',
            plugin.enabled ? 'bg-green-600 text-white' : 'bg-zinc-300'
          )}
        >
          <Package className={'size-4'} strokeWidth={2} />
        </div>
        <div className={'min-w-0'}>
          <div className={'flex items-center gap-2'}>
            <span className={'font-jetbrains text-sm font-medium text-zinc-800 dark:text-zinc-200'}>{plugin.name}</span>
            {!plugin.enabled && (
              <Badge variant={'secondary'} className={'font-semibold'}>
                {t('plugins.disabled')}
              </Badge>
            )}
          </div>
          <div className={'mt-0.5 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'}>
            <span className={'font-jetbrains tabular-nums'}>{formatPluginSize(plugin.size)}</span>
            <span className={'text-zinc-200 dark:text-zinc-700'}>&middot;</span>
            <span>{new Date(plugin.modified).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <FeatureCard.RowControl>
        {toggleConfirm ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button
              variant={plugin.enabled ? 'secondary' : 'success'}
              size={'xs'}
              onClick={handleToggle}
              disabled={togglePlugin.isPending}
              loading={togglePlugin.isPending}
            >
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setToggleConfirm(false)}>
              {t('common.no')}
            </Button>
          </div>
        ) : deleteConfirm ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button
              variant={'destructive'}
              size={'xs'}
              onClick={handleDelete}
              disabled={deletePlugin.isPending}
              loading={deletePlugin.isPending}
            >
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setDeleteConfirm(false)}>
              {t('common.no')}
            </Button>
          </div>
        ) : (
          <>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={plugin.enabled ? 'ghost' : 'success'}
                    size={plugin.enabled ? 'icon-sm' : 'xs'}
                    onClick={() => setToggleConfirm(true)}
                    className={cn(
                      plugin.enabled && 'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-400'
                    )}
                  >
                    {plugin.enabled ? (
                      <PowerOff className={'size-4'} />
                    ) : (
                      <>
                        <Power className={'size-4'} />
                        {t('plugins.enable')}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                  {plugin.enabled ? t('plugins.tooltipDisable') : t('plugins.tooltipEnable')}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={'ghost-destructive'} size={'icon-sm'} onClick={() => setDeleteConfirm(true)}>
                    <Trash2 className={'size-4'} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('plugins.tooltipDelete')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </FeatureCard.RowControl>
    </FeatureCard.Row>
  );
}
