import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Cpu, RotateCcw, Save } from 'lucide-react';
import { Alert } from '@remnant/frontend/features/ui/alert';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { useServer, useUpdateServer } from '@remnant/frontend/hooks/use_servers';
import { useInstalledJava } from '@remnant/frontend/hooks/use_java';
import { Input } from '@remnant/frontend/features/ui/input';
import { Label } from '@remnant/frontend/features/ui/label';
import { Checkbox } from '@remnant/frontend/features/ui/checkbox';
import { Select } from '@remnant/frontend/features/ui/select';
import { Textarea } from '@remnant/frontend/features/ui/textarea';
import { AIKAR_FLAGS_STRING, DEFAULT_JAVA_PORT } from '@remnant/shared';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { Button } from '@remnant/frontend/features/ui/button';

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
        <div className={'space-y-4'}>
          <RestartBanner />
          <FeatureCard.Stack>
            <JvmConfigSection {...{ serverId }} />
          </FeatureCard.Stack>
        </div>
      </PageContent>
    </>
  );
}

type JvmConfigSectionProps = {
  serverId: number;
};

function JvmConfigSection({ serverId }: JvmConfigSectionProps) {
  const { t } = useTranslation();

  const [minRam, setMinRam] = useState('1G');
  const [maxRam, setMaxRam] = useState('2G');
  const [jvmFlags, setJvmFlags] = useState('');
  const [javaPort, setJavaPort] = useState(DEFAULT_JAVA_PORT);
  const [autoStart, setAutoStart] = useState(false);
  const [javaMode, setJavaMode] = useState<'bundled' | 'custom'>('bundled');
  const [javaPath, setJavaPath] = useState('');
  const [customJavaPath, setCustomJavaPath] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const { data: server } = useServer(serverId);
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
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
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
    } catch {}
  }, [serverId, minRam, maxRam, jvmFlags, javaPort, autoStart, javaMode, javaPath, customJavaPath, updateServer]);

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title>{t('settings.jvmConfig')}</FeatureCard.Title>
          <FeatureCard.Description>{t('settings.jvmConfigDescription')}</FeatureCard.Description>
        </FeatureCard.Content>
      </FeatureCard.Header>
      <FeatureCard.Body className={'space-y-6'}>
        <FeatureCard.Row>
          <FeatureCard.Stack>
            <FeatureCard.RowLabel>{t('settings.memorySettings')}</FeatureCard.RowLabel>
            <div className={'grid gap-4 sm:grid-cols-2'}>
              <div>
                <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.minRam')}</Label>
                <Input type={'text'} value={minRam} onChange={(e) => setMinRam(e.target.value)} placeholder={'2G'} />
                <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.ramHint')}</p>
              </div>
              <div>
                <Label className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.maxRam')}</Label>
                <Input type={'text'} value={maxRam} onChange={(e) => setMaxRam(e.target.value)} placeholder={'4G'} />
                <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>{t('settings.ramHint')}</p>
              </div>
            </div>
            <div className={'rounded-lg border border-black/6 bg-zinc-50/50 p-4 dark:border-white/6 dark:bg-zinc-800/50'}>
              <Label className={'flex cursor-pointer items-center gap-3'}>
                <Checkbox checked={hasAikarFlags} onCheckedChange={(checked) => handleToggleAikarFlags(checked === true)} />
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
              <Textarea value={jvmFlags} onChange={(e) => setJvmFlags(e.target.value)} placeholder={'-Dflag=value'} rows={8} />
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
                onChange={(e) => setJavaPort(parseInt(e.target.value) || DEFAULT_JAVA_PORT)}
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
                    setJavaMode('custom');
                    setJavaPath('');
                  } else {
                    setJavaMode('bundled');
                    setJavaPath(val);
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
                  onChange={(e) => setCustomJavaPath(e.target.value)}
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
                <Checkbox checked={autoStart} onCheckedChange={(checked) => setAutoStart(checked === true)} />
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
        <div className={'flex items-center justify-end gap-2'}>
          <Button variant={'ghost'} size={'sm'} onClick={handleDiscard} disabled={saveStatus === 'saving'}>
            <RotateCcw className={'size-4'} />
            {t('settings.cancel')}
          </Button>
          <Button size={'sm'} onClick={handleSave} disabled={saveStatus === 'saving'} loading={saveStatus === 'saving'}>
            <Save className={'size-4'} />
            {saveStatus === 'saving' ? t('files.saving') : t('settings.saveConfig')}
          </Button>
        </div>
      </FeatureCard.Footer>
    </FeatureCard>
  );
}

function RestartBanner() {
  const { t } = useTranslation();

  return (
    <Alert>
      <Alert.Text dangerouslySetInnerHTML={{ __html: t('settings.restartRequired') }} />
    </Alert>
  );
}
