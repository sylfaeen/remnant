import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Copy, Globe, Gamepad2, Lock, Plus, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { Button } from '@remnant/frontend/features/ui/button';
import { Badge, type BadgeProps } from '@remnant/frontend/features/ui/badge';
import { Input } from '@remnant/frontend/features/ui/input';
import { Label } from '@remnant/frontend/features/ui/label';
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

const DOMAIN_REGEX =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

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
          <PlayerDomainSection {...{ serverId }} />
          <HttpDomainListSection {...{ serverId }} />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

type PlayerDomainSectionProps = {
  serverId: number;
};

function PlayerDomainSection({ serverId }: PlayerDomainSectionProps) {
  const { t } = useTranslation();

  const [domainInput, setDomainInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: server } = useServer(serverId);
  const { data: domainsData } = useDomains(serverId);
  const serverIp = useServerIp();
  const addDomain = useAddDomain(serverId);
  const removeDomain = useRemoveDomain(serverId);
  const enableSsl = useEnableSsl(serverId);

  const tcpDomain = domainsData?.domains?.find((d) => d.type === 'tcp') ?? null;
  const serverPort = server?.java_port ?? 25565;
  const isValidDomain = DOMAIN_REGEX.test(domainInput);

  const isExpiringSoon =
    tcpDomain?.ssl_expires_at && new Date(tcpDomain.ssl_expires_at).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;

  const handleSet = async () => {
    if (!isValidDomain) return;
    await addDomain.mutateAsync({ domain: domainInput.trim().toLowerCase(), port: serverPort, type: 'tcp' });
    setDomainInput('');
  };

  const handleRemove = async () => {
    if (!tcpDomain) return;
    try {
      await removeDomain.mutateAsync(tcpDomain.id);
      setDeleteConfirm(false);
    } catch {}
  };

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title>{t('settings.domains.playerDomain.title')}</FeatureCard.Title>
          <FeatureCard.Description>{t('settings.domains.playerDomain.description')}</FeatureCard.Description>
        </FeatureCard.Content>
      </FeatureCard.Header>
      <FeatureCard.Body>
        {tcpDomain ? (
          <>
            <FeatureCard.Row className={'items-center gap-8 py-3'}>
              <div className={'flex items-center gap-3'}>
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    tcpDomain.ssl_enabled ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                  )}
                >
                  <Gamepad2 className={'size-4'} strokeWidth={2} />
                </div>
                <div className={'min-w-0'}>
                  <div className={'flex items-center gap-2'}>
                    <span className={'font-jetbrains text-sm font-medium text-zinc-800 dark:text-zinc-200'}>
                      {tcpDomain.domain}
                    </span>
                    <Badge variant={'blue'} size={'xs'} className={'font-semibold uppercase'}>
                      TCP
                    </Badge>
                    {tcpDomain.ssl_enabled ? (
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
                    <span className={'font-jetbrains tabular-nums'}>:{tcpDomain.port}</span>
                    {tcpDomain.ssl_expires_at && (
                      <>
                        <span className={'text-zinc-200 dark:text-zinc-700'}>&middot;</span>
                        <span>
                          {t('settings.domains.expiresAt', {
                            date: new Date(tcpDomain.ssl_expires_at).toLocaleDateString(),
                          })}
                        </span>
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
                      onClick={handleRemove}
                      disabled={removeDomain.isPending}
                      loading={removeDomain.isPending}
                    >
                      {t('common.yes')}
                    </Button>
                    <Button variant={'ghost'} size={'xs'} onClick={() => setDeleteConfirm(false)}>
                      {t('common.no')}
                    </Button>
                  </div>
                ) : (
                  <>
                    {!tcpDomain.ssl_enabled && (
                      <Button
                        variant={'success'}
                        size={'xs'}
                        disabled={enableSsl.isPending}
                        loading={enableSsl.isPending}
                        onClick={async () => await enableSsl.mutateAsync(tcpDomain.id)}
                      >
                        <Lock className={'size-3.5'} />
                        {t('settings.domains.enableSsl')}
                      </Button>
                    )}
                    <Button variant={'ghost-danger'} size={'icon-sm'} onClick={() => setDeleteConfirm(true)}>
                      <Trash2 className={'size-4'} />
                    </Button>
                  </>
                )}
              </FeatureCard.RowControl>
            </FeatureCard.Row>
            <ConfiguredDomainInfo domain={tcpDomain.domain} port={tcpDomain.port} {...{ serverIp }} />
          </>
        ) : (
          <div className={'space-y-0 divide-y divide-black/4 dark:divide-white/6'}>
            <PlayerDomainSetupSteps port={serverPort} {...{ serverIp }} />
            <div className={'px-5 py-4'}>
              <div className={'flex items-end gap-2'}>
                <div className={'flex-1'}>
                  <Label htmlFor={'player-domain'} className={'mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400'}>
                    {t('settings.domains.playerDomain.step2Label')}
                  </Label>
                  <Input
                    type={'text'}
                    id={'player-domain'}
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder={'play.example.com'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isValidDomain) handleSet();
                    }}
                  />
                </div>
                <Button onClick={handleSet} disabled={!isValidDomain || addDomain.isPending} loading={addDomain.isPending}>
                  <Gamepad2 className={'size-4'} />
                  {t('settings.domains.playerDomain.configure')}
                </Button>
              </div>
              {domainInput && !isValidDomain && (
                <p className={'mt-1 text-sm text-red-500'}>{t('settings.domains.invalidDomain')}</p>
              )}
            </div>
          </div>
        )}
      </FeatureCard.Body>
    </FeatureCard>
  );
}

type PlayerDomainSetupStepsProps = {
  serverIp: string;
  port: number;
};

function PlayerDomainSetupSteps({ serverIp, port }: PlayerDomainSetupStepsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(serverIp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={'px-5 py-4'}>
      <div className={'space-y-4'}>
        <div className={'flex gap-3'}>
          <div
            className={
              'flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }
          >
            1
          </div>
          <div className={'flex-1'}>
            <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>
              {t('settings.domains.playerDomain.step1Title')}
            </p>
            <p className={'mt-0.5 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.domains.playerDomain.step1Desc')}</p>
            <div className={'mt-2 rounded-lg border border-black/6 bg-zinc-50/50 p-3 dark:border-white/6 dark:bg-zinc-800/50'}>
              <div className={'flex items-center justify-between'}>
                <div className={'font-jetbrains text-sm'}>
                  <span className={'text-zinc-500'}>A</span>
                  <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
                  <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>play.yourdomain.com</span>
                  <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
                  <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{serverIp}</span>
                </div>
                <Button variant={'ghost'} size={'icon-sm'} onClick={handleCopy}>
                  {copied ? <CheckCircle2 className={'size-3.5 text-green-600'} /> : <Copy className={'size-3.5'} />}
                </Button>
              </div>
            </div>
            <p className={'mt-1.5 text-xs text-zinc-400 dark:text-zinc-500'}>{t('settings.domains.playerDomain.step1Hint')}</p>
          </div>
        </div>
        <div className={'flex gap-3'}>
          <div
            className={
              'flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }
          >
            3
          </div>
          <div className={'flex-1'}>
            <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>
              {t('settings.domains.playerDomain.step2Title')}
            </p>
            <p className={'mt-0.5 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.domains.playerDomain.step2Desc')}</p>
            <div className={'mt-2 rounded-lg border border-black/6 bg-zinc-50/50 p-3 dark:border-white/6 dark:bg-zinc-800/50'}>
              <div className={'font-jetbrains text-sm'}>
                <span className={'text-zinc-500'}>SRV</span>
                <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
                <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{'_minecraft._tcp.yourdomain.com'}</span>
                <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
                <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{`0 5 ${port} play.yourdomain.com`}</span>
              </div>
            </div>
            <p className={'mt-1.5 text-xs text-zinc-400 dark:text-zinc-500'}>{t('settings.domains.playerDomain.step2Hint')}</p>
          </div>
        </div>
        <div className={'flex gap-3'}>
          <div
            className={
              'flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }
          >
            2
          </div>
          <div className={'flex-1'}>
            <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>
              {t('settings.domains.playerDomain.step3Title')}
            </p>
            <p className={'mt-0.5 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.domains.playerDomain.step3Desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type ConfiguredDomainInfoProps = {
  domain: string;
  port: number;
  serverIp: string;
};

function ConfiguredDomainInfo({ domain, port, serverIp }: ConfiguredDomainInfoProps) {
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
      <div className={'space-y-2'}>
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
        <div className={'rounded-lg border border-black/6 bg-zinc-50/50 p-3 dark:border-white/6 dark:bg-zinc-800/50'}>
          <div className={'font-jetbrains text-sm'}>
            <span className={'text-zinc-500'}>SRV</span>
            <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
            <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{`_minecraft._tcp.${domain}`}</span>
            <span className={'mx-3 text-zinc-300 dark:text-zinc-600'}>&rarr;</span>
            <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{`0 5 ${port} ${domain}`}</span>
          </div>
          <p className={'mt-1 text-xs text-zinc-400'}>{t('settings.domains.srvHint')}</p>
        </div>
      </div>
      <div className={'mt-3 rounded-lg border border-blue-500/20 bg-blue-50/50 p-3 dark:bg-blue-950/20'}>
        <p className={'text-sm font-medium text-blue-800 dark:text-blue-200'}>
          {t('settings.domains.playerDomain.connectionInfo')}
        </p>
        <div className={'mt-2 space-y-1'}>
          <div className={'flex items-center gap-2'}>
            <CheckCircle2 className={'size-3.5 shrink-0 text-blue-600 dark:text-blue-400'} strokeWidth={2} />
            <span className={'font-jetbrains text-sm text-blue-700 dark:text-blue-300'}>{domain}</span>
            <span className={'text-xs text-blue-500 dark:text-blue-400'}>{t('settings.domains.playerDomain.withSrv')}</span>
          </div>
          <div className={'flex items-center gap-2'}>
            <CheckCircle2 className={'size-3.5 shrink-0 text-blue-600 dark:text-blue-400'} strokeWidth={2} />
            <span className={'font-jetbrains text-sm text-blue-700 dark:text-blue-300'}>{`${domain}:${port}`}</span>
            <span className={'text-xs text-blue-500 dark:text-blue-400'}>{t('settings.domains.playerDomain.withoutSrv')}</span>
          </div>
        </div>
      </div>
      <p className={'mt-2 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.domains.dnsHint')}</p>
    </div>
  );
}

type HttpDomainListSectionProps = {
  serverId: number;
};

function HttpDomainListSection({ serverId }: HttpDomainListSectionProps) {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: server } = useServer(serverId);
  const { data: domainsData } = useDomains(serverId);
  const serverIp = useServerIp();
  const addDomain = useAddDomain(serverId);
  const removeDomain = useRemoveDomain(serverId);
  const enableSsl = useEnableSsl(serverId);
  const renewSsl = useRenewSsl(serverId);

  const httpDomains = domainsData?.domains?.filter((d) => d.type !== 'tcp') ?? [];
  const sslCount = httpDomains.filter((d) => d.ssl_enabled).length;
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
            <FeatureCard.Title count={httpDomains.length > 0 && `${sslCount}/${httpDomains.length} SSL`}>
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
          {httpDomains.length === 0 ? (
            <FeatureCard.Empty
              icon={Globe}
              title={t('settings.domains.noDomains')}
              description={t('settings.domains.noDomainsHint')}
            />
          ) : (
            <>
              {httpDomains.map((domain) => (
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
      {showDns && <DnsHelper domain={domain.domain} {...{ serverIp }} />}
    </FeatureCard.Stack>
  );
}

type DnsHelperProps = {
  domain: string;
  serverIp: string;
};

function DnsHelper({ domain, serverIp }: DnsHelperProps) {
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
      </div>
      <p className={'mt-2 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.domains.dnsHint')}</p>
    </div>
  );
}
