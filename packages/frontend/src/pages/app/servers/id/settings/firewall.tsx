import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Clock, Info, Plus, Shield, Trash2 } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';
import { Switch } from '@remnant/frontend/features/ui/shadcn/switch';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import {
  useFirewallRules,
  useAddFirewallRule,
  useRemoveFirewallRule,
  useToggleFirewallRule,
} from '@remnant/frontend/hooks/use_firewall';
import { AddFirewallRuleDialog } from '@remnant/frontend/pages/app/servers/dialogs/add_firewall_rule_dialog';
import { FirewallGuidelinesDialog } from '@remnant/frontend/pages/app/servers/dialogs/firewall_guidelines_dialog';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import type { Protocol } from '@remnant/frontend/pages/app/servers/features/firewall_card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@remnant/frontend/features/ui/shadcn/tooltip';

const PROTOCOL_LABELS: Record<Protocol, string> = {
  tcp: 'TCP',
  udp: 'UDP',
  both: 'TCP+UDP',
};

type FirewallRule = {
  id: number;
  port: number;
  protocol: Protocol;
  label: string;
  enabled: boolean;
};

export function ServerSettingsFirewallPage() {
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
          <ServerPageHeader.Icon icon={Shield} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('settings.firewall.title')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/configuration'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('settings.firewall.description')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
      </ServerPageHeader>
      <PageContent>
        <FeatureCard.Stack>
          <FirewallListSection {...{ serverId }} />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

type FirewallListSectionProps = {
  serverId: number;
};

function FirewallListSection({ serverId }: FirewallListSectionProps) {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  const { data: firewallData } = useFirewallRules(serverId);
  const addFirewallRule = useAddFirewallRule(serverId);
  const removeFirewallRule = useRemoveFirewallRule(serverId);
  const toggleFirewallRule = useToggleFirewallRule(serverId);

  const rules: Array<FirewallRule> = firewallData?.rules ?? [];
  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <>
      <FeatureCard>
        <FeatureCard.Header>
          <FeatureCard.Content>
            <div className={'flex items-center justify-start gap-2'}>
              <FeatureCard.Title count={rules.length > 0 && `${activeCount}/${rules.length}`}>
                {t('settings.firewall.title')}
              </FeatureCard.Title>
              <Button variant={'ghost'} size={'icon-xs'} onClick={() => setGuidelinesOpen(true)}>
                <Info className={'size-3'} />
              </Button>
            </div>
            <FeatureCard.Description>{t('settings.firewall.description')}</FeatureCard.Description>
          </FeatureCard.Content>
          <FeatureCard.Actions>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className={'size-4'} />
              {t('settings.firewall.addRule')}
            </Button>
          </FeatureCard.Actions>
        </FeatureCard.Header>
        <FeatureCard.Body>
          {rules.length === 0 ? (
            <FeatureCard.Empty
              icon={Clock}
              title={t('settings.firewall.noRules')}
              description={t('settings.firewall.noRulesHint')}
            />
          ) : (
            <>
              {rules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  onToggle={(ruleId) => toggleFirewallRule.mutateAsync(ruleId)}
                  onDelete={(ruleId) => removeFirewallRule.mutateAsync(ruleId)}
                  {...{ rule }}
                />
              ))}
            </>
          )}
        </FeatureCard.Body>
      </FeatureCard>
      <AddFirewallRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={(rule) => {
          addFirewallRule.mutateAsync(rule);
          setDialogOpen(false);
        }}
      />
      <FirewallGuidelinesDialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen} />
    </>
  );
}

type RuleRowProps = {
  rule: FirewallRule;
  onToggle: (id: number) => void | Promise<unknown>;
  onDelete: (id: number) => void | Promise<unknown>;
};

function RuleRow({ rule, onToggle, onDelete }: RuleRowProps) {
  const { t } = useTranslation();
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function handleToggleChange() {
    if (toggleConfirm) return;
    setToggleConfirm(true);
  }

  function handleToggleConfirm() {
    onToggle(rule.id);
    setToggleConfirm(false);
  }

  return (
    <FeatureCard.Row interactive className={'items-center gap-8 py-3'}>
      <div className={cn('flex items-center gap-3', !rule.enabled && 'opacity-50')}>
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-opacity',
            rule.enabled ? 'bg-blue-600 text-white' : 'bg-zinc-300'
          )}
        >
          <Shield className={'size-4'} strokeWidth={2} />
        </div>
        <div className={'min-w-0'}>
          <div className={'flex items-center gap-2'}>
            <span className={'font-jetbrains text-sm font-semibold text-zinc-800 tabular-nums dark:text-zinc-200'}>
              {rule.port}
            </span>
            <Badge>{PROTOCOL_LABELS[rule.protocol]}</Badge>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{rule.label}</span>
            {!rule.enabled && <Badge variant={'secondary'}>{t('settings.firewall.disabled')}</Badge>}
          </div>
        </div>
      </div>
      <FeatureCard.RowControl>
        {toggleConfirm ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button variant={rule.enabled ? 'secondary' : 'success'} size={'xs'} onClick={handleToggleConfirm}>
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setToggleConfirm(false)}>
              {t('common.no')}
            </Button>
          </div>
        ) : deleteConfirm ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button variant={'destructive'} size={'xs'} onClick={() => onDelete(rule.id)}>
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
                  <div className={'flex items-center'}>
                    <Switch checked={rule.enabled} onCheckedChange={handleToggleChange} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                  {rule.enabled ? t('rules.tooltipDisable') : t('rules.tooltipEnable')}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={'ghost-destructive'} size={'icon-sm'} onClick={() => setDeleteConfirm(true)}>
                    <Trash2 className={'size-4'} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('rules.tooltipDelete')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </FeatureCard.RowControl>
    </FeatureCard.Row>
  );
}
