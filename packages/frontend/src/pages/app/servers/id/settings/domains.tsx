import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Copy, Globe, Lock, Plus, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { Button } from '@remnant/frontend/features/ui/button';
import { Badge, type BadgeProps } from '@remnant/frontend/features/ui/badge';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import {
  useDomains,
  useAddDomain,
  useRemoveDomain,
  useEnableSsl,
  useRenewSsl,
  useServerIp,
} from '@remnant/frontend/hooks/use_domains';
import { AddDomainDialog } from '@remnant/frontend/pages/app/servers/dialogs/add_domain_dialog';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { Tooltip } from '@remnant/frontend/features/ui/tooltip';
import type { DomainType } from '@remnant/shared';

const TYPE_BADGE_VARIANT: Record<string, BadgeProps['variant']> = {
  http: 'success',
  tcp: 'blue',
};

export function ServerSettingsDomainsPage() {
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
          <ServerPageHeader.Icon icon={Globe} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('settings.domains.title')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/domains'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('settings.domains.description')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
      </ServerPageHeader>
      <PageContent>
        <FeatureCard.Stack>
          <DomainListSection {...{ serverId }} />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

type DomainListSectionProps = {
  serverId: number;
};

function DomainListSection({ serverId }: DomainListSectionProps) {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: server } = useServer(serverId);
  const { data: domainsData } = useDomains(serverId);
  const serverIp = useServerIp();
  const addDomain = useAddDomain(serverId);
  const removeDomain = useRemoveDomain(serverId);
  const enableSsl = useEnableSsl(serverId);
  const renewSsl = useRenewSsl(serverId);

  const domains = domainsData?.domains ?? [];
  const sslCount = domains.filter((d) => d.ssl_enabled).length;
  const hasSsl = sslCount > 0;

  const handleAdd = async (input: { domain: string; port: number; type: DomainType }) => {
    await addDomain.mutateAsync(input);
    setDialogOpen(false);
  };

  return (
    <>
      <FeatureCard>
        <FeatureCard.Header>
          <FeatureCard.Content>
            <FeatureCard.Title count={domains.length > 0 && `${sslCount}/${domains.length} SSL`}>
              {t('settings.domains.title')}
            </FeatureCard.Title>
            <FeatureCard.Description>{t('settings.domains.description')}</FeatureCard.Description>
          </FeatureCard.Content>
          <FeatureCard.Actions>
            {hasSsl && (
              <Button
                variant={'secondary'}
                size={'sm'}
                onClick={() => renewSsl.mutateAsync()}
                disabled={renewSsl.isPending}
                loading={renewSsl.isPending}
              >
                <RotateCcw className={'size-4'} />
                {t('settings.domains.renewSsl')}
              </Button>
            )}
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className={'size-4'} />
              {t('settings.domains.addDomain')}
            </Button>
          </FeatureCard.Actions>
        </FeatureCard.Header>
        <FeatureCard.Body>
          {domains.length === 0 ? (
            <FeatureCard.Empty
              icon={Globe}
              title={t('settings.domains.noDomains')}
              description={t('settings.domains.noDomainsHint')}
            />
          ) : (
            <>
              {domains.map((domain) => (
                <DomainRow key={domain.id} onRemove={removeDomain} onEnableSsl={enableSsl} {...{ domain, serverIp }} />
              ))}
            </>
          )}
        </FeatureCard.Body>
      </FeatureCard>
      <AddDomainDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={handleAdd} serverPort={server?.java_port ?? 25565} />
    </>
  );
}

type DomainData = {
  id: number;
  domain: string;
  port: number;
  type: string;
  ssl_enabled: boolean;
  ssl_expires_at: string | null;
};

type DomainRowProps = {
  domain: DomainData;
  serverIp: string;
  onRemove: { mutateAsync: (id: number) => Promise<unknown>; isPending: boolean };
  onEnableSsl: { mutateAsync: (id: number) => Promise<unknown>; isPending: boolean };
};

function DomainRow({ domain, serverIp, onRemove, onEnableSsl }: DomainRowProps) {
  const { t } = useTranslation();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showDns, setShowDns] = useState(false);

  const isExpiringSoon =
    domain.ssl_expires_at && new Date(domain.ssl_expires_at).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;

  const handleDelete = async () => {
    try {
      await onRemove.mutateAsync(domain.id);
      setDeleteConfirm(false);
    } catch {}
  };

  return (
    <FeatureCard.Stack className={'gap-y-0'}>
      <FeatureCard.Row interactive className={'items-center gap-8 py-3'}>
        <div className={'flex items-center gap-3'}>
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg',
              domain.ssl_enabled ? 'bg-green-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700'
            )}
          >
            {domain.ssl_enabled ? <Lock className={'size-4'} strokeWidth={2} /> : <Globe className={'size-4'} strokeWidth={2} />}
          </div>
          <div className={'min-w-0'}>
            <div className={'flex items-center gap-2'}>
              <span className={'font-jetbrains text-sm font-medium text-zinc-800 dark:text-zinc-200'}>{domain.domain}</span>
              <Badge variant={TYPE_BADGE_VARIANT[domain.type]} size={'xs'} className={'font-semibold uppercase'}>
                {domain.type}
              </Badge>
              {domain.ssl_enabled ? (
                <Badge variant={isExpiringSoon ? 'warning' : 'success'} size={'xs'} className={'font-semibold'}>
                  {isExpiringSoon ? t('settings.domains.sslExpiringSoon') : 'SSL'}
                </Badge>
              ) : (
                <Badge variant={'muted'} size={'xs'} className={'font-semibold'}>
                  {t('settings.domains.noSsl')}
                </Badge>
              )}
            </div>
            <div className={'mt-0.5 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'}>
              <span className={'font-jetbrains tabular-nums'}>:{domain.port}</span>
              {domain.ssl_expires_at && (
                <>
                  <span className={'text-zinc-200 dark:text-zinc-700'}>&middot;</span>
                  <span>{t('settings.domains.expiresAt', { date: new Date(domain.ssl_expires_at).toLocaleDateString() })}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <FeatureCard.RowControl>
          {deleteConfirm ? (
            <div className={'flex items-center gap-1.5'}>
              <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
              <Button
                variant={'danger'}
                size={'xs'}
                onClick={handleDelete}
                disabled={onRemove.isPending}
                loading={onRemove.isPending}
              >
                {t('common.yes')}
              </Button>
              <Button variant={'ghost'} size={'xs'} onClick={() => setDeleteConfirm(false)}>
                {t('common.no')}
              </Button>
            </div>
          ) : (
            <>
              <Tooltip.Provider delayDuration={300}>
                {!domain.ssl_enabled && (
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <Button variant={'success'} size={'xs'} onClick={() => onEnableSsl.mutateAsync(domain.id)}>
                        <Lock className={'size-3.5'} />
                        {t('settings.domains.enableSsl')}
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                      {t('settings.domains.enableSslTooltip')}
                    </Tooltip.Content>
                  </Tooltip>
                )}
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant={'ghost'}
                      size={'icon-sm'}
                      onClick={() => setShowDns(!showDns)}
                      className={'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-400'}
                    >
                      <ShieldAlert className={'size-4'} />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                    {t('settings.domains.showDnsRecords')}
                  </Tooltip.Content>
                </Tooltip>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant={'ghost-danger'} size={'icon-sm'} onClick={() => setDeleteConfirm(true)}>
                      <Trash2 className={'size-4'} />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                    {t('settings.domains.removeDomain')}
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </>
          )}
        </FeatureCard.RowControl>
      </FeatureCard.Row>
      {showDns && <DnsHelper domain={domain.domain} type={domain.type} {...{ serverIp }} />}
    </FeatureCard.Stack>
  );
}

type DnsHelperProps = {
  domain: string;
  type: string;
  serverIp: string;
};

function DnsHelper({ domain, type, serverIp }: DnsHelperProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(serverIp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={'border-t border-black/6 px-5 py-4 dark:border-white/6'}>
      <div className={'text-sm font-medium text-zinc-600 dark:text-zinc-400'}>{t('settings.domains.dnsRecords')}</div>
      <div className={'mt-2 space-y-2'}>
        <div className={'rounded-lg border border-black/6 bg-zinc-50/50 p-3 dark:border-white/6 dark:bg-zinc-800/50'}>
          <div className={'flex items-center justify-between'}>
            <div className={'font-jetbrains text-sm'}>
              <span className={'text-zinc-500'}>A</span>
              <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
              <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{domain}</span>
              <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
              <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{serverIp}</span>
            </div>
            <Button variant={'ghost'} size={'icon-sm'} onClick={handleCopy}>
              {copied ? <CheckCircle2 className={'size-3.5 text-green-600'} /> : <Copy className={'size-3.5'} />}
            </Button>
          </div>
        </div>
        {type === 'tcp' && (
          <div className={'rounded-lg border border-black/6 bg-zinc-50/50 p-3 dark:border-white/6 dark:bg-zinc-800/50'}>
            <div className={'font-jetbrains text-sm'}>
              <span className={'text-zinc-500'}>SRV</span>
              <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
              <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{`_minecraft._tcp.${domain}`}</span>
              <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
              <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{`0 5 25565 ${domain}`}</span>
            </div>
            <p className={'mt-1 text-xs text-zinc-400'}>{t('settings.domains.srvHint')}</p>
          </div>
        )}
      </div>
      <p className={'mt-2 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.domains.dnsHint')}</p>
    </div>
  );
}
