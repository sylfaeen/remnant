import { useState, type DragEvent, type ChangeEvent } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Download, Package, Trash2, Upload, UploadCloud } from 'lucide-react';
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
import { Button } from '@remnant/frontend/features/ui/button';
import { Label } from '@remnant/frontend/features/ui/label';
import { Select } from '@remnant/frontend/features/ui/select';
import { ApiError } from '@remnant/frontend/lib/api';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { Badge } from '@remnant/frontend/features/ui/badge';

export function ServerSettingsJarsPage() {
  const { t } = useTranslation();
  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const [jarSourceTab, setJarSourceTab] = useState<'upload' | 'papermc'>('upload');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: server, isLoading: serverLoading } = useServer(serverId || 0);
  const { data: versions, isLoading: versionsLoading } = usePaperVersions();
  const { data: builds, isLoading: buildsLoading } = usePaperBuilds(selectedVersion);
  const { data: jarsData, isLoading: jarsLoading } = useServerJars(serverId);
  const downloadJar = useDownloadJar(serverId || 0);
  const setActiveJar = useSetActiveJar(serverId || 0);
  const deleteJar = useDeleteJar(serverId || 0);
  const uploadJar = useUploadJar(serverId || 0);

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
          <AddJarSection
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onDownload={handleDownload}
            onVersionChange={(v) => {
              setSelectedVersion(v);
              setSelectedBuild(null);
            }}
            onBuildChange={setSelectedBuild}
            {...{
              jarSourceTab,
              isDragging,
              uploadError,
              uploadPending: uploadJar.isPending,
              versions,
              versionsLoading,
              builds,
              buildsLoading,
              selectedVersion,
              selectedBuild,
              isDownloading,
              downloadError,
            }}
            onTabChange={setJarSourceTab}
          />
          <JarListSection
            jars={jarsData?.jars}
            activeJarFile={server?.jar_file}
            setActiveJar={setActiveJar}
            {...{ jarsLoading, deleteJar }}
          />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

type AddJarSectionProps = {
  jarSourceTab: 'upload' | 'papermc';
  isDragging: boolean;
  uploadError: string | null;
  uploadPending: boolean;
  versions: Array<string> | undefined;
  versionsLoading: boolean;
  builds: Array<number> | undefined;
  buildsLoading: boolean;
  selectedVersion: string | null;
  selectedBuild: number | null;
  isDownloading: boolean;
  downloadError: string | null;
  onTabChange: (tab: 'upload' | 'papermc') => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
  onVersionChange: (v: string | null) => void;
  onBuildChange: (b: number | null) => void;
};

function AddJarSection({
  jarSourceTab,
  isDragging,
  uploadError,
  uploadPending,
  versions,
  versionsLoading,
  builds,
  buildsLoading,
  selectedVersion,
  selectedBuild,
  isDownloading,
  downloadError,
  onTabChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onDownload,
  onVersionChange,
  onBuildChange,
}: AddJarSectionProps) {
  const { t } = useTranslation();

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title>{t('settings.addJar')}</FeatureCard.Title>
        </FeatureCard.Content>
        <FeatureCard.Actions>
          <button
            onClick={() => onTabChange('upload')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              jarSourceTab === 'upload'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300'
            )}
          >
            <Upload className={'mr-1.5 inline-block size-3.5'} />
            {t('settings.jarUpload.tab')}
          </button>
          <button
            onClick={() => onTabChange('papermc')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              jarSourceTab === 'papermc'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300'
            )}
          >
            <Download className={'mr-1.5 inline-block size-3.5'} />
            PaperMC
          </button>
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
          <div className={'relative overflow-hidden'} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <div
              className={cn(
                'absolute inset-0 bg-linear-to-b from-zinc-600/2 to-transparent transition-opacity',
                isDragging ? 'opacity-100' : 'opacity-0'
              )}
            />
            <div className={'relative flex flex-col items-center py-8'}>
              <div
                className={
                  'mb-3 flex size-12 items-center justify-center rounded-2xl bg-zinc-100 transition-colors dark:bg-zinc-800'
                }
              >
                <UploadCloud
                  className={cn(
                    'size-6 transition-colors',
                    isDragging ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-500'
                  )}
                  strokeWidth={1.5}
                />
              </div>
              <p className={'font-medium'}>{t('settings.jarUpload.dragDrop')}</p>
              <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.jarUpload.or')}</p>
              <label className={'mt-3 inline-block cursor-pointer'}>
                <Button asChild variant={'secondary'} size={'sm'}>
                  <span>{t('settings.jarUpload.browse')}</span>
                </Button>
                <input type={'file'} accept={'.jar'} multiple onChange={onFileSelect} className={'hidden'} />
              </label>
              {uploadPending && (
                <div className={'mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'}>
                  <div
                    className={'size-3.5 animate-spin rounded-full border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400'}
                  />
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
                  value={selectedVersion || ''}
                  onChange={(e) => onVersionChange(e.target.value || null)}
                  disabled={versionsLoading || isDownloading}
                >
                  <option value={''}>{t('settings.papermc.selectVersion')}</option>
                  {versions?.map((version) => (
                    <option key={version} value={version}>
                      {version}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.buildOptional')}</Label>
                <Select
                  value={selectedBuild || ''}
                  onChange={(e) => onBuildChange(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={!selectedVersion || buildsLoading || isDownloading}
                >
                  <option value={''}>{t('settings.latestBuild')}</option>
                  {builds?.map((build) => (
                    <option key={build} value={build}>
                      Build #{build}
                    </option>
                  ))}
                </Select>
              </div>
              <div className={'flex items-end'}>
                <Button
                  onClick={onDownload}
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
  jarsLoading: boolean;
  jars: Array<JarInfo> | undefined;
  activeJarFile: string | undefined;
  setActiveJar: { mutateAsync: (jar: string) => Promise<unknown>; isPending: boolean };
  deleteJar: { mutateAsync: (jar: string) => Promise<unknown>; isPending: boolean };
};

function JarListSection({ jarsLoading, jars, activeJarFile, setActiveJar, deleteJar }: JarListSectionProps) {
  const { t } = useTranslation();

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title count={jars && jars.length > 0 && jars.length}>{t('settings.availableJars')}</FeatureCard.Title>
        </FeatureCard.Content>
        {activeJarFile && (
          <FeatureCard.Actions>
            <div className={'flex items-center gap-2'}>
              <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.currentJar')}:</span>
              <Badge size={'md'} className={'font-jetbrains'}>
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
            <div className={'mb-3 flex size-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800'}>
              <Package className={'size-6 text-zinc-300 dark:text-zinc-500'} strokeWidth={1.5} />
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
            {jar.isActive && (
              <Badge variant={'success'} size={'xs'} className={'font-semibold'}>
                {t('settings.active')}
              </Badge>
            )}
            {jar.source === 'custom' && (
              <Badge size={'xs'} className={'font-semibold'}>
                {t('settings.customJar')}
              </Badge>
            )}
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
              variant={'danger'}
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
              <Check className={'size-3.5'} />
              {t('settings.activate')}
            </Button>
            <Button variant={'ghost-danger'} size={'icon-sm'} onClick={() => setDeleteConfirm(true)}>
              <Trash2 className={'size-3.5'} />
            </Button>
          </>
        ) : null}
      </div>
    </FeatureCard.Row>
  );
}
