import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Cpu, RotateCcw, Save } from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { useServer, useUpdateServer } from '@remnant/frontend/hooks/use_servers';
import { useInstalledJava } from '@remnant/frontend/hooks/use_java';
import { Button } from '@remnant/frontend/features/ui/button';
import { Input } from '@remnant/frontend/features/ui/input';
import { Label } from '@remnant/frontend/features/ui/label';
import { Checkbox } from '@remnant/frontend/features/ui/checkbox';
import { Select } from '@remnant/frontend/features/ui/select';
import { Textarea } from '@remnant/frontend/features/ui/textarea';
import { ApiError } from '@remnant/frontend/lib/api';
import { AIKAR_FLAGS_STRING, DEFAULT_JAVA_PORT } from '@remnant/shared';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';

type ServerValues = {
  minRam: string;
  maxRam: string;
  jvmFlags: string;
  javaPort: number;
  autoStart: boolean;
  javaMode: 'bundled' | 'custom';
  javaPath: string;
  customJavaPath: string;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ServerSettingsJvmPage() {
  const { t } = useTranslation();
  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const [minRam, setMinRam] = useState('1G');
  const [maxRam, setMaxRam] = useState('2G');
  const [jvmFlags, setJvmFlags] = useState('');
  const [javaPort, setJavaPort] = useState(DEFAULT_JAVA_PORT);
  const [autoStart, setAutoStart] = useState(false);
  const [javaMode, setJavaMode] = useState<'bundled' | 'custom'>('bundled');
  const [javaPath, setJavaPath] = useState('');
  const [customJavaPath, setCustomJavaPath] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: server, isLoading: serverLoading } = useServer(serverId || 0);
  const { data: javaVersions } = useInstalledJava();
  const updateServer = useUpdateServer();

  const hasAikarFlags = jvmFlags.includes('-XX:+UseG1GC') && jvmFlags.includes('-XX:G1NewSizePercent');

  const handleToggleAikarFlags = (checked: boolean) => {
    if (checked) {
      const currentFlags = jvmFlags.trim();
      setJvmFlags(currentFlags ? `${AIKAR_FLAGS_STRING} ${currentFlags}` : AIKAR_FLAGS_STRING);
    } else {
      const aikarParts = AIKAR_FLAGS_STRING.split(' ');
      const remainingFlags = jvmFlags
        .split(' ')
        .filter((f) => f && !aikarParts.includes(f))
        .join(' ');
      setJvmFlags(remainingFlags);
    }
  };

  const serverValuesRef = useRef<ServerValues | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!server || !javaVersions || initializedRef.current) return;
    initializedRef.current = true;

    let resolvedJavaMode: 'bundled' | 'custom' = 'bundled';
    let resolvedJavaPath = '';
    let resolvedCustomJavaPath = '';

    if (server.java_path) {
      const isBundled = javaVersions.some((j) => j.path === server.java_path);
      if (isBundled) {
        resolvedJavaMode = 'bundled';
        resolvedJavaPath = server.java_path;
      } else {
        resolvedJavaMode = 'custom';
        resolvedCustomJavaPath = server.java_path;
      }
    } else {
      const defaultJava = javaVersions.find((j) => j.isDefault);
      if (defaultJava) {
        resolvedJavaMode = 'bundled';
        resolvedJavaPath = defaultJava.path;
      }
    }

    const values: ServerValues = {
      minRam: server.min_ram || '1G',
      maxRam: server.max_ram || '2G',
      jvmFlags: server.jvm_flags || AIKAR_FLAGS_STRING,
      javaPort: server.java_port || DEFAULT_JAVA_PORT,
      autoStart: server.auto_start || false,
      javaMode: resolvedJavaMode,
      javaPath: resolvedJavaPath,
      customJavaPath: resolvedCustomJavaPath,
    };

    serverValuesRef.current = values;
    setMinRam(values.minRam);
    setMaxRam(values.maxRam);
    setJvmFlags(values.jvmFlags);
    setJavaPort(values.javaPort);
    setAutoStart(values.autoStart);
    setJavaMode(values.javaMode);
    setJavaPath(values.javaPath);
    setCustomJavaPath(values.customJavaPath);
  }, [server, javaVersions]);

  const isDirty = useMemo(() => {
    const sv = serverValuesRef.current;
    if (!sv) return false;
    return (
      minRam !== sv.minRam ||
      maxRam !== sv.maxRam ||
      jvmFlags !== sv.jvmFlags ||
      javaPort !== sv.javaPort ||
      autoStart !== sv.autoStart ||
      javaMode !== sv.javaMode ||
      javaPath !== sv.javaPath ||
      customJavaPath !== sv.customJavaPath
    );
  }, [minRam, maxRam, jvmFlags, javaPort, autoStart, javaMode, javaPath, customJavaPath]);

  const handleDiscard = useCallback(() => {
    const sv = serverValuesRef.current;
    if (!sv) return;
    setMinRam(sv.minRam);
    setMaxRam(sv.maxRam);
    setJvmFlags(sv.jvmFlags);
    setJavaPort(sv.javaPort);
    setAutoStart(sv.autoStart);
    setJavaMode(sv.javaMode);
    setJavaPath(sv.javaPath);
    setCustomJavaPath(sv.customJavaPath);
    setSaveStatus('idle');
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!serverId) return;
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await updateServer.mutateAsync({
        id: serverId,
        data: {
          min_ram: minRam,
          max_ram: maxRam,
          jvm_flags: jvmFlags.trim(),
          java_port: javaPort,
          auto_start: autoStart,
          java_path: javaMode === 'custom' ? customJavaPath || null : javaPath || null,
        },
      });
      serverValuesRef.current = { minRam, maxRam, jvmFlags, javaPort, autoStart, javaMode, javaPath, customJavaPath };
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('settings.saveError'));
      setSaveStatus('error');
    }
  }, [serverId, minRam, maxRam, jvmFlags, javaPort, autoStart, javaMode, javaPath, customJavaPath, updateServer, t]);

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
          <ServerPageHeader.Icon icon={Cpu} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('nav.settingsJvm')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/configuration'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('settings.subtitle')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
      </ServerPageHeader>
      <PageContent>
        <FeatureCard.Stack>
          <JvmConfigSection
            onMinRamChange={setMinRam}
            onMaxRamChange={setMaxRam}
            onJvmFlagsChange={setJvmFlags}
            onJavaPortChange={setJavaPort}
            onToggleAikarFlags={handleToggleAikarFlags}
            onModeChange={setJavaMode}
            onPathChange={setJavaPath}
            onCustomPathChange={setCustomJavaPath}
            onAutoStartChange={setAutoStart}
            {...{
              minRam,
              maxRam,
              jvmFlags,
              javaPort,
              hasAikarFlags,
              javaVersions,
              javaMode,
              javaPath,
              customJavaPath,
              autoStart,
            }}
          />
        </FeatureCard.Stack>
      </PageContent>
      <FloatingSaveBar onSave={handleSave} onDiscard={handleDiscard} {...{ isDirty, saveStatus, saveError }} />
    </>
  );
}

type JvmConfigSectionProps = {
  minRam: string;
  maxRam: string;
  jvmFlags: string;
  javaPort: number;
  hasAikarFlags: boolean;
  onMinRamChange: (val: string) => void;
  onMaxRamChange: (val: string) => void;
  onJvmFlagsChange: (val: string) => void;
  onJavaPortChange: (val: number) => void;
  onToggleAikarFlags: (checked: boolean) => void;
  javaVersions: Array<{ name: string; version: string; path: string; isDefault: boolean }> | undefined;
  javaMode: 'bundled' | 'custom';
  javaPath: string;
  customJavaPath: string;
  onModeChange: (mode: 'bundled' | 'custom') => void;
  onPathChange: (path: string) => void;
  onCustomPathChange: (path: string) => void;
  autoStart: boolean;
  onAutoStartChange: (val: boolean) => void;
};

function JvmConfigSection({
  minRam,
  maxRam,
  jvmFlags,
  javaPort,
  hasAikarFlags,
  onMinRamChange,
  onMaxRamChange,
  onJvmFlagsChange,
  onJavaPortChange,
  onToggleAikarFlags,
  javaVersions,
  javaMode,
  javaPath,
  customJavaPath,
  onModeChange,
  onPathChange,
  onCustomPathChange,
  autoStart,
  onAutoStartChange,
}: JvmConfigSectionProps) {
  const { t } = useTranslation();

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Title>{t('settings.jvmConfig')}</FeatureCard.Title>
      </FeatureCard.Header>
      <FeatureCard.Body className={'space-y-6'}>
        <FeatureCard.Row>
          <FeatureCard.Stack>
            <div>
              <h3 className={'mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300'}>{t('settings.memorySettings')}</h3>
              <div className={'grid gap-4 sm:grid-cols-2'}>
                <div>
                  <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.minRam')}</Label>
                  <Input type={'text'} value={minRam} onChange={(e) => onMinRamChange(e.target.value)} placeholder={'2G'} />
                  <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.ramHint')}</p>
                </div>
                <div>
                  <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.maxRam')}</Label>
                  <Input type={'text'} value={maxRam} onChange={(e) => onMaxRamChange(e.target.value)} placeholder={'4G'} />
                  <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.ramHint')}</p>
                </div>
              </div>
            </div>
            <div className={'rounded-lg border border-black/6 bg-zinc-50/50 p-4 dark:border-white/6 dark:bg-zinc-800/50'}>
              <Label className={'flex cursor-pointer items-center gap-3'}>
                <Checkbox checked={hasAikarFlags} onCheckedChange={(checked) => onToggleAikarFlags(checked === true)} />
                <span className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>{t('settings.useAikarFlags')}</span>
              </Label>
              <p className={'pl-8 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.aikarDescription')}</p>
            </div>
            <div>
              <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>
                {t('settings.customJvmFlags')}
                {hasAikarFlags && (
                  <span className={'ml-1 text-zinc-600 dark:text-zinc-400'}>{t('settings.inAdditionToAikar')}</span>
                )}
              </Label>
              <Textarea
                value={jvmFlags}
                onChange={(e) => onJvmFlagsChange(e.target.value)}
                placeholder={'-Dflag=value'}
                rows={8}
              />
            </div>
          </FeatureCard.Stack>
        </FeatureCard.Row>
        <FeatureCard.Row>
          <FeatureCard.Stack>
            <FeatureCard.RowLabel>{t('settings.javaPort')}</FeatureCard.RowLabel>
            <div className={'w-full'}>
              <Input
                type={'number'}
                value={javaPort}
                onChange={(e) => onJavaPortChange(parseInt(e.target.value) || DEFAULT_JAVA_PORT)}
                min={1024}
                max={65535}
                className={'w-full sm:w-48'}
              />
              <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.defaultPort')}</p>
            </div>
          </FeatureCard.Stack>
        </FeatureCard.Row>
        <FeatureCard.Row>
          <FeatureCard.Stack>
            <FeatureCard.RowLabel>{t('settings.javaVersion')}</FeatureCard.RowLabel>
            <div className={'w-full'}>
              <Select
                name={'java-version'}
                value={javaMode === 'bundled' ? javaPath : javaMode}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    onModeChange('custom');
                    onPathChange('');
                  } else {
                    onModeChange('bundled');
                    onPathChange(val);
                  }
                }}
              >
                {javaVersions?.map((java) => (
                  <option key={java.name} value={java.path}>
                    {java.name} (Java {java.version}){java.isDefault ? ` — ${t('appSettings.java.default')}` : ''}
                  </option>
                ))}
                <option value={'custom'}>{t('settings.customJavaPath')}</option>
              </Select>
            </div>
            {javaMode === 'custom' && (
              <div>
                <Input
                  type={'text'}
                  value={customJavaPath}
                  onChange={(e) => onCustomPathChange(e.target.value)}
                  placeholder={t('settings.customJavaPathPlaceholder')}
                />
                <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.customJavaPathHint')}</p>
              </div>
            )}
          </FeatureCard.Stack>
        </FeatureCard.Row>
        <FeatureCard.Row>
          <FeatureCard.Stack>
            <FeatureCard.RowLabel>{t('settings.autoStartSettings')}</FeatureCard.RowLabel>
            <div className={'w-full'}>
              <Label className={'flex cursor-pointer items-center gap-3'}>
                <Checkbox checked={autoStart} onCheckedChange={(checked) => onAutoStartChange(checked === true)} />
                <div>
                  <span className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>{t('settings.enableAutoStart')}</span>
                  <p className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.autoStartDescription')}</p>
                </div>
              </Label>
            </div>
          </FeatureCard.Stack>
        </FeatureCard.Row>
      </FeatureCard.Body>
      <FeatureCard.Footer>
        <div className={'flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3'}>
          <div className={'flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 dark:bg-amber-400/10'}>
            <AlertTriangle className={'size-4 text-amber-600'} strokeWidth={1.75} />
          </div>
          <p className={'text-sm text-amber-700'}>{t('settings.restartRequired')}</p>
        </div>
      </FeatureCard.Footer>
    </FeatureCard>
  );
}

type FloatingSaveBarProps = {
  saveStatus: SaveStatus;
  saveError: string | null;
  onSave: () => void;
  onDiscard: () => void;
};

function FloatingSaveBar({ saveStatus, saveError, onSave, onDiscard }: FloatingSaveBarProps) {
  const { t } = useTranslation();

  return (
    <div className={'fixed inset-x-0 bottom-0 z-50 md:left-68'}>
      <div className={'border-t border-black/6 bg-white/95 backdrop-blur-sm dark:border-white/6 dark:bg-zinc-900/95'}>
        <div className={'flex items-center justify-between p-4 sm:px-6 lg:px-10'}>
          <div className={'flex items-center gap-3'}>
            {saveStatus === 'saved' ? (
              <span className={'flex items-center gap-1.5 text-sm text-emerald-600'}>
                <Check className={'size-4'} />
                {t('settings.configSaved')}
              </span>
            ) : saveStatus === 'error' && saveError ? (
              <span className={'text-sm text-red-600'}>{saveError}</span>
            ) : (
              <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.unsavedChanges')}</span>
            )}
          </div>
          <div className={'flex items-center gap-2'}>
            <Button variant={'ghost'} size={'sm'} onClick={onDiscard} disabled={saveStatus === 'saving'}>
              <RotateCcw className={'size-3.5'} />
              {t('settings.discardChanges')}
            </Button>
            <Button size={'sm'} onClick={onSave} disabled={saveStatus === 'saving'} loading={saveStatus === 'saving'}>
              <Save className={'size-3.5'} />
              {saveStatus === 'saving' ? t('files.saving') : t('settings.saveConfig')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
