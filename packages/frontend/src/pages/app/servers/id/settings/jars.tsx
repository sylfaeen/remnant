import { useState, type DragEvent, type ChangeEvent } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Download, Loader2, Package, Trash2, Upload, UploadCloud } from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { cn } from '@remnant/frontend/lib/cn';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import {
  usePaperVersions,
  usePaperBuilds,
  useServerJars,
  useDownloadJar,
  useSetActiveJar,
  useDeleteJar,
  useUploadJar,
  formatJarSize,
} from '@remnant/frontend/hooks/use_jars';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { Label } from '@remnant/frontend/features/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@remnant/frontend/features/ui/shadcn/select';
import { ApiError } from '@remnant/frontend/lib/api';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';

export function ServerSettingsJarsPage() {
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
          <ServerPageHeader.Icon icon={Package} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('settings.jarManagement')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/configuration'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('settings.subtitle')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
      </ServerPageHeader>
      <PageContent>
        <FeatureCard.Stack>
          <AddJarSection {...{ serverId }} />
          <JarListSection {...{ serverId }} />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

type AddJarSectionProps = {
  serverId: number;
};

function AddJarSection({ serverId }: AddJarSectionProps) {
  const { t } = useTranslation();

  const [jarSourceTab, setJarSourceTab] = useState<'upload' | 'papermc'>('upload');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: versions, isLoading: versionsLoading } = usePaperVersions();
  const { data: builds, isLoading: buildsLoading } = usePaperBuilds(selectedVersion);
  const downloadJar = useDownloadJar(serverId);
  const uploadJar = useUploadJar(serverId);

  const handleDownload = async () => {
    if (!selectedVersion) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadJar.mutateAsync({
        version: selectedVersion,
        build: selectedBuild || undefined,
      });
      setSelectedVersion(null);
      setSelectedBuild(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setDownloadError(err.message);
      } else {
        setDownloadError(t('settings.downloadError'));
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith('.jar'));
    if (files.length === 0) {
      setUploadError(t('settings.jarUpload.invalidFile'));
      return;
    }
    for (const file of files) {
      try {
        await uploadJar.mutateAsync({ file });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : t('settings.jarUpload.error'));
      }
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);
    const jarFiles = Array.from(files).filter((f) => f.name.endsWith('.jar'));
    if (jarFiles.length === 0) {
      setUploadError(t('settings.jarUpload.invalidFile'));
      return;
    }
    for (const file of jarFiles) {
      try {
        await uploadJar.mutateAsync({ file });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : t('settings.jarUpload.error'));
      }
    }
    e.target.value = '';
  };

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title>{t('settings.addJar')}</FeatureCard.Title>
          <FeatureCard.Description>{t('settings.addJarDescription')}</FeatureCard.Description>
        </FeatureCard.Content>
        <FeatureCard.Actions>
          <Button onClick={() => setJarSourceTab('upload')} variant={jarSourceTab === 'upload' ? 'tab' : 'ghost'}>
            <Upload className={'size-4'} />
            {t('settings.jarUpload.tab')}
          </Button>
          <Button onClick={() => setJarSourceTab('papermc')} variant={jarSourceTab === 'papermc' ? 'tab' : 'ghost'}>
            <Download className={'size-4'} />
            PaperMC
          </Button>
        </FeatureCard.Actions>
      </FeatureCard.Header>
      <FeatureCard.Body
        className={cn(
          'rounded-xl border-2 border-dashed shadow-none transition-all',
          isDragging
            ? 'border-zinc-400/40 bg-zinc-100/50 dark:bg-zinc-800/50'
            : 'border-black/10 hover:border-black/12 dark:border-white/10 dark:hover:border-white/12'
        )}
      >
        {jarSourceTab === 'upload' && (
          <div
            className={'relative overflow-hidden'}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
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
              <p className={'font-medium'}>{t('settings.jarUpload.dragDrop')}</p>
              <p className={'mt-3 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.jarUpload.or')}</p>
              <Label className={'mt-3 mb-0! inline-block cursor-pointer'}>
                <Button variant={'secondary'} asChild>
                  <span>{t('settings.jarUpload.browse')}</span>
                </Button>
                <input type={'file'} accept={'.jar'} multiple onChange={handleFileSelect} className={'hidden'} />
              </Label>
              {uploadJar.isPending && (
                <div className={'mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'}>
                  <Loader2 className={'size-5 animate-spin text-zinc-400 dark:text-zinc-500'} />
                  {t('settings.jarUpload.uploading')}
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
        )}
        {jarSourceTab === 'papermc' && (
          <div className={'rounded-xl border border-black/6 bg-zinc-50/50 p-4 dark:border-white/6 dark:bg-zinc-800/50'}>
            <div className={'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
              <div>
                <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>
                  {t('settings.minecraftVersion')}
                </Label>
                <Select
                  value={selectedVersion || undefined}
                  onValueChange={(value) => {
                    setSelectedVersion(value || null);
                    setSelectedBuild(null);
                  }}
                  disabled={versionsLoading || isDownloading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.papermc.selectVersion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {versions?.map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.buildOptional')}</Label>
                <Select
                  value={selectedBuild?.toString() || undefined}
                  onValueChange={(value) => setSelectedBuild(value ? parseInt(value) : null)}
                  disabled={!selectedVersion || buildsLoading || isDownloading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.latestBuild')} />
                  </SelectTrigger>
                  <SelectContent>
                    {builds?.map((build) => (
                      <SelectItem key={build} value={build.toString()}>
                        Build #{build}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={'flex items-end'}>
                <Button
                  onClick={handleDownload}
                  disabled={!selectedVersion || isDownloading}
                  loading={isDownloading}
                  className={'w-full'}
                  size={'sm'}
                >
                  <Download className={'size-4'} />
                  {isDownloading ? t('settings.papermc.downloading') : t('settings.papermc.download')}
                </Button>
              </div>
            </div>
            {downloadError && (
              <div className={'mt-3 flex items-center gap-2 text-sm text-red-600'}>
                <AlertTriangle className={'size-3.5 shrink-0'} />
                {downloadError}
              </div>
            )}
          </div>
        )}
      </FeatureCard.Body>
    </FeatureCard>
  );
}

type JarInfo = {
  name: string;
  size: number;
  modified: string;
  isActive: boolean;
  source: string;
};

type JarListSectionProps = {
  serverId: number;
};

function JarListSection({ serverId }: JarListSectionProps) {
  const { t } = useTranslation();

  const { data: server } = useServer(serverId);
  const { data: jarsData, isLoading: jarsLoading } = useServerJars(serverId);
  const setActiveJar = useSetActiveJar(serverId);
  const deleteJar = useDeleteJar(serverId);

  const jars = jarsData?.jars;
  const activeJarFile = server?.jar_file;

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title count={jars && jars.length > 0 && jars.length}>{t('settings.availableJars')}</FeatureCard.Title>
          <FeatureCard.Description>{t('settings.availableJarsDescription')}</FeatureCard.Description>
        </FeatureCard.Content>
        {activeJarFile && (
          <FeatureCard.Actions className={'hidden md:flex'}>
            <div className={'flex items-center gap-2'}>
              <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.currentJar')}:</span>
              <Badge variant={'secondary'} className={'font-jetbrains'}>
                {activeJarFile}
              </Badge>
            </div>
          </FeatureCard.Actions>
        )}
      </FeatureCard.Header>
      {jarsLoading ? (
        <div className={'py-8 text-center'}>
          <div
            className={'mx-auto size-8 animate-spin rounded-full border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400'}
          />
        </div>
      ) : !jars || jars.length === 0 ? (
        <div className={'bg-default shadow-xs-with-border relative overflow-hidden rounded-lg py-12'}>
          <div className={'absolute inset-0 bg-linear-to-b from-zinc-600/2 to-transparent'} />
          <div className={'relative flex flex-col items-center'}>
            <div className={'mb-3 flex size-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800'}>
              <Package className={'size-5 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />
            </div>
            <p className={'mt-2 font-medium text-zinc-600 dark:text-zinc-400'}>{t('settings.noJarsFound')}</p>
          </div>
        </div>
      ) : (
        <FeatureCard.Body>
          {jars.map((jar) => (
            <JarRow key={jar.name} {...{ jar, setActiveJar, deleteJar }} />
          ))}
        </FeatureCard.Body>
      )}
    </FeatureCard>
  );
}

type JarRowProps = {
  jar: JarInfo;
  setActiveJar: { mutateAsync: (jar: string) => Promise<unknown>; isPending: boolean };
  deleteJar: { mutateAsync: (jar: string) => Promise<unknown>; isPending: boolean };
};

function JarRow({ jar, setActiveJar, deleteJar }: JarRowProps) {
  const { t } = useTranslation();
  const [activateConfirm, setActivateConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSetActive = async () => {
    try {
      await setActiveJar.mutateAsync(jar.name);
      setActivateConfirm(false);
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await deleteJar.mutateAsync(jar.name);
      setDeleteConfirm(false);
    } catch {}
  };

  return (
    <FeatureCard.Row className={'items-center gap-8 py-3'}>
      <div className={'flex items-center gap-3'}>
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-opacity',
            jar.isActive ? 'bg-green-600 text-white' : 'bg-zinc-300 opacity-40'
          )}
        >
          <Package className={'size-4'} strokeWidth={2} />
        </div>
        <div>
          <div className={'flex items-center gap-2'}>
            <span className={'font-jetbrains text-sm font-medium text-zinc-800 dark:text-zinc-200'}>{jar.name}</span>
            {jar.isActive && <Badge variant={'success'}>{t('settings.active')}</Badge>}
            {jar.source === 'custom' && <Badge variant={'secondary'}>{t('settings.customJar')}</Badge>}
          </div>
          <div className={'mt-0.5 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'}>
            <span className={'font-jetbrains tabular-nums'}>{formatJarSize(jar.size)}</span>
            <span className={'text-zinc-200 dark:text-zinc-700'}>&middot;</span>
            <span>{new Date(jar.modified).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className={'flex shrink-0 items-center gap-1.5'}>
        {activateConfirm ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button
              variant={'success'}
              size={'xs'}
              onClick={handleSetActive}
              disabled={setActiveJar.isPending}
              loading={setActiveJar.isPending}
            >
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setActivateConfirm(false)}>
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
              disabled={deleteJar.isPending}
              loading={deleteJar.isPending}
            >
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setDeleteConfirm(false)}>
              {t('common.no')}
            </Button>
          </div>
        ) : !jar.isActive ? (
          <>
            <Button variant={'secondary'} size={'xs'} onClick={() => setActivateConfirm(true)}>
              <Check className={'size-4'} />
              {t('settings.activate')}
            </Button>
            <Button variant={'ghost-destructive'} size={'icon-sm'} onClick={() => setDeleteConfirm(true)}>
              <Trash2 className={'size-4'} />
            </Button>
          </>
        ) : null}
      </div>
    </FeatureCard.Row>
  );
}
