import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Terminal, ChevronDown, ChevronRight, Coffee } from 'lucide-react';
import { DocsLink } from '@remnant/frontend/pages/app/features/docs_link';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useInstalledJava } from '@remnant/frontend/hooks/use_java';
import { Button } from '@remnant/frontend/features/ui/button';
import { Badge } from '@remnant/frontend/features/ui/badge';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <PageContent>
      <div className={'space-y-6'}>
        <div>
          <div className={'flex items-center gap-2'}>
            <h1 className={'text-2xl font-bold tracking-tight text-zinc-900'}>{t('appSettings.title')}</h1>
            <DocsLink path={'/guide/configuration'} />
          </div>
          <p className={'mt-1 text-zinc-600'}>{t('appSettings.subtitle')}</p>
        </div>
        <FeatureCard.Stack>
          <JavaSection />
          <SystemdSection />
        </FeatureCard.Stack>
      </div>
    </PageContent>
  );
}

function JavaSection() {
  const { t } = useTranslation();
  const { data: javaVersions, isLoading } = useInstalledJava();

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Title count={javaVersions && javaVersions.length > 0 && javaVersions.length}>
          {t('appSettings.java.title')}
        </FeatureCard.Title>
        <FeatureCard.Description>{t('appSettings.java.description')}</FeatureCard.Description>
      </FeatureCard.Header>
      <FeatureCard.Body>
        {isLoading ? (
          <div className={'py-8 text-center'}>
            <div className={'mx-auto size-8 animate-spin rounded-full border-t-2 border-b-2 border-amber-600'} />
          </div>
        ) : !javaVersions?.length ? (
          <FeatureCard.Row>
            <p className={'w-full py-2 text-center text-sm text-zinc-500'}>{t('appSettings.java.noVersions')}</p>
          </FeatureCard.Row>
        ) : (
          javaVersions.map((java) => (
            <FeatureCard.Row key={java.name}>
              <FeatureCard.RowLabel description={<span className={'font-jetbrains'}>{java.path}</span>}>
                <div className={'flex items-center gap-2'}>
                  <Coffee className={'size-4 text-zinc-600'} strokeWidth={1.75} />
                  <span>{java.name}</span>
                  {java.isDefault && (
                    <Badge variant={'warning'} size={'xs'}>
                      {t('appSettings.java.default')}
                    </Badge>
                  )}
                </div>
              </FeatureCard.RowLabel>
              <FeatureCard.RowControl>
                <span className={'text-sm text-zinc-500'}>Java {java.version}</span>
              </FeatureCard.RowControl>
            </FeatureCard.Row>
          ))
        )}
      </FeatureCard.Body>
    </FeatureCard>
  );
}

function SystemdSection() {
  const { t } = useTranslation();

  const commands = [
    { label: 'Status', cmd: 'remnant status' },
    { label: 'Logs', cmd: 'remnant logs' },
    { label: 'Restart', cmd: 'remnant restart' },
    { label: 'Stop', cmd: 'remnant stop' },
    { label: 'Start', cmd: 'remnant start' },
  ];

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Title>{t('appSettings.systemd.title')}</FeatureCard.Title>
        <FeatureCard.Description>{t('appSettings.systemd.description')}</FeatureCard.Description>
      </FeatureCard.Header>
      <FeatureCard.Body>
        <FeatureCard.Row layout={'column'}>
          <FeatureCard.RowLabel>
            <div className={'flex items-center gap-2'}>
              <Terminal className={'size-4 text-zinc-500'} />
              <span>{t('appSettings.systemd.commands')}</span>
            </div>
          </FeatureCard.RowLabel>
          <div className={'mt-2 space-y-1.5'}>
            {commands.map(({ label, cmd }) => (
              <div key={cmd} className={'flex items-center gap-3'}>
                <span className={'w-14 text-sm text-zinc-500'}>{label}</span>
                <code className={'font-jetbrains rounded border border-black/10 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700'}>
                  {cmd}
                </code>
              </div>
            ))}
          </div>
        </FeatureCard.Row>
        <FeatureCard.Row>
          <ServiceFileBlock />
        </FeatureCard.Row>
      </FeatureCard.Body>
    </FeatureCard>
  );
}

function ServiceFileBlock() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data } = trpc.settings.getSystemdUnit.useQuery(undefined, {
    enabled: expanded,
  });

  const handleCopy = async () => {
    if (!data?.content) return;
    await navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        type={'button'}
        onClick={() => setExpanded(!expanded)}
        className={'flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-700'}
      >
        {expanded ? <ChevronDown className={'size-4'} /> : <ChevronRight className={'size-4'} />}
        {t('appSettings.systemd.viewServiceFile')}
      </button>
      {expanded && data?.content && (
        <div className={'relative mt-3'}>
          <pre className={'font-jetbrains overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-100'}>
            {data.content}
          </pre>
          <Button
            variant={'ghost'}
            size={'icon-sm'}
            className={'absolute top-2 right-2 text-zinc-600 hover:bg-zinc-700 hover:text-white'}
            onClick={handleCopy}
          >
            {copied ? <Check className={'size-4 text-emerald-400'} /> : <Copy className={'size-4'} />}
          </Button>
        </div>
      )}
    </div>
  );
}
