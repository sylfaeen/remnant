import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Plus, Power, PowerOff, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@remnant/frontend/features/ui/shadcn/dialog';
import { ServerSection } from '@remnant/frontend/pages/app/servers/features/server_section';
import { AddFirewallRuleDialog } from '@remnant/frontend/pages/app/servers/dialogs/add_firewall_rule_dialog';

export type Protocol = 'tcp' | 'udp' | 'both';

type FirewallRule = {
  id: number;
  port: number;
  protocol: Protocol;
  label: string;
  enabled: boolean;
};

const PROTOCOL_BADGE_VARIANT: Record<Protocol, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  tcp: 'default',
  udp: 'secondary',
  both: 'secondary',
};

const PROTOCOL_LABELS: Record<Protocol, string> = {
  tcp: 'TCP',
  udp: 'UDP',
  both: 'TCP+UDP',
};

export const PROTOCOL_STYLES: Record<Protocol, { label: string; text: string }> = {
  tcp: { label: 'TCP', text: 'text-green-600' },
  udp: { label: 'UDP', text: 'text-blue-600' },
  both: { label: 'TCP+UDP', text: 'text-violet-600' },
};

export const PRESET_STYLES: Record<Protocol, { active: string; icon: string }> = {
  tcp: {
    active: 'border-emerald-600/30 bg-emerald-600/5 text-emerald-700 dark:text-emerald-400',
    icon: 'group-hover/preset:text-emerald-600',
  },
  udp: {
    active: 'border-blue-600/30 bg-blue-600/5 text-blue-700 dark:text-blue-400',
    icon: 'group-hover/preset:text-blue-600',
  },
  both: {
    active: 'border-violet-600/30 bg-violet-600/5 text-violet-700 dark:text-violet-400',
    icon: 'group-hover/preset:text-violet-600',
  },
};

export const FIREWALL_PRESETS: Array<{ label: string; port: number; protocol: Protocol; description: string }> = [
  { label: 'GeyserMC', port: 19132, protocol: 'udp', description: 'Bedrock' },
  { label: 'BlueMap', port: 8100, protocol: 'tcp', description: 'Web Map' },
  { label: 'Dynmap', port: 8123, protocol: 'tcp', description: 'Web Map' },
  { label: 'Votifier', port: 8192, protocol: 'tcp', description: 'Vote Listener' },
];

type FirewallCardProps = {
  rules: Array<FirewallRule>;
  onAddRule: (rule: { port: number; protocol: Protocol; label: string }) => void | Promise<unknown>;
  onToggleRule: (id: number) => void | Promise<unknown>;
  onDeleteRule: (id: number) => void | Promise<unknown>;
};

export function FirewallCard({ rules, onAddRule, onToggleRule, onDeleteRule }: FirewallCardProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [toggleConfirm, setToggleConfirm] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <ServerSection>
      <ServerSection.Header>
        <ServerSection.HeaderGroup>
          <ServerSection.Icon icon={Shield} />
          <ServerSection.HeaderInfo>
            <div className={'flex items-center gap-2.5'}>
              <ServerSection.Title>{t('settings.firewall.title')}</ServerSection.Title>
              {rules.length > 0 && (
                <ServerSection.Count>
                  {activeCount}/{rules.length}
                </ServerSection.Count>
              )}
            </div>
            <ServerSection.Description>{t('settings.firewall.description')}</ServerSection.Description>
          </ServerSection.HeaderInfo>
        </ServerSection.HeaderGroup>
        <ServerSection.HeaderAction>
          <div className={'flex items-center gap-1.5'}>
            <Button variant={'ghost'} size={'icon-sm'} onClick={() => setGuidelinesOpen(true)}>
              <Info className={'size-4'} />
            </Button>
            <Button variant={'secondary'} size={'sm'} onClick={() => setDialogOpen(true)}>
              <Plus className={'size-4'} />
              {t('settings.firewall.addRule')}
            </Button>
          </div>
        </ServerSection.HeaderAction>
      </ServerSection.Header>
      <ServerSection.Body className={'p-0'}>
        {rules.length === 0 ? (
          <FirewallCard.EmptyState onAdd={() => setDialogOpen(true)} />
        ) : (
          <FirewallCard.RuleList
            {...{ rules, toggleConfirm, deleteConfirm, onToggleRule, onDeleteRule }}
            onToggleConfirm={setToggleConfirm}
            onDeleteConfirm={setDeleteConfirm}
          />
        )}
      </ServerSection.Body>
      <AddFirewallRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={(rule) => {
          onAddRule(rule);
          setDialogOpen(false);
        }}
      />
      <FirewallGuidelinesDialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen} />
    </ServerSection>
  );
}

FirewallCard.EmptyState = function FirewallCardEmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();

  return (
    <ServerSection.Empty>
      <ServerSection.EmptyIcon icon={ShieldOff} />
      <ServerSection.EmptyTitle>{t('settings.firewall.noRules')}</ServerSection.EmptyTitle>
      <ServerSection.EmptyDescription>{t('settings.firewall.noRulesHint')}</ServerSection.EmptyDescription>
      <Button variant={'secondary'} size={'sm'} className={'mt-4'} onClick={onAdd}>
        <Plus className={'size-4'} />
        {t('settings.firewall.addRule')}
      </Button>
    </ServerSection.Empty>
  );
};

type RuleListProps = {
  rules: Array<FirewallRule>;
  toggleConfirm: number | null;
  deleteConfirm: number | null;
  onToggleRule: (id: number) => void | Promise<unknown>;
  onDeleteRule: (id: number) => void | Promise<unknown>;
  onToggleConfirm: (id: number | null) => void;
  onDeleteConfirm: (id: number | null) => void;
};

FirewallCard.RuleList = function FirewallCardRuleList({
  rules,
  toggleConfirm,
  deleteConfirm,
  onToggleRule,
  onDeleteRule,
  onToggleConfirm,
  onDeleteConfirm,
}: RuleListProps) {
  return (
    <div className={'space-y-2 p-4'}>
      {rules.map((rule) => (
        <FirewallCard.RuleRow
          key={rule.id}
          rule={rule}
          onToggle={onToggleRule}
          onDelete={onDeleteRule}
          {...{ toggleConfirm, deleteConfirm, onToggleConfirm, onDeleteConfirm }}
        />
      ))}
    </div>
  );
};

type RuleRowProps = {
  rule: FirewallRule;
  toggleConfirm: number | null;
  deleteConfirm: number | null;
  onToggle: (id: number) => void | Promise<unknown>;
  onDelete: (id: number) => void | Promise<unknown>;
  onToggleConfirm: (id: number | null) => void;
  onDeleteConfirm: (id: number | null) => void;
};

FirewallCard.RuleRow = function FirewallCardRuleRow({
  rule,
  toggleConfirm,
  deleteConfirm,
  onToggle,
  onDelete,
  onToggleConfirm,
  onDeleteConfirm,
}: RuleRowProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'group flex min-h-14 items-center justify-between rounded-lg border px-4 py-2 transition-all',
        rule.enabled ? 'border-black/6 bg-zinc-50/50 hover:border-black/10 hover:bg-zinc-50' : 'border-black/10 bg-zinc-50/30'
      )}
    >
      <div className={cn('flex items-center gap-2.5', !rule.enabled && 'opacity-50')}>
        <span className={'font-jetbrains text-sm font-semibold text-zinc-800 tabular-nums dark:text-zinc-200'}>{rule.port}</span>
        <Badge variant={PROTOCOL_BADGE_VARIANT[rule.protocol]} className={'font-semibold'}>
          {PROTOCOL_LABELS[rule.protocol]}
        </Badge>
        <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{rule.label}</span>
        {!rule.enabled && <Badge variant={'secondary'}>{t('settings.firewall.disabled')}</Badge>}
      </div>
      <div className={'flex shrink-0 items-center gap-1.5'}>
        {toggleConfirm === rule.id ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button
              variant={rule.enabled ? 'secondary' : 'success'}
              size={'xs'}
              onClick={() => {
                onToggle(rule.id);
                onToggleConfirm(null);
              }}
            >
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => onToggleConfirm(null)}>
              {t('common.no')}
            </Button>
          </div>
        ) : deleteConfirm === rule.id ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button variant={'destructive'} size={'xs'} onClick={() => onDelete(rule.id)}>
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => onDeleteConfirm(null)}>
              {t('common.no')}
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant={rule.enabled ? 'ghost' : 'success'}
              size={rule.enabled ? 'icon-sm' : 'sm'}
              onClick={() => onToggleConfirm(rule.id)}
              className={cn(rule.enabled && 'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300')}
            >
              {rule.enabled ? (
                <PowerOff className={'size-4'} />
              ) : (
                <>
                  <Power className={'size-4'} />
                  {t('settings.firewall.enable')}
                </>
              )}
            </Button>
            <Button variant={'ghost-destructive'} size={'icon-sm'} onClick={() => onDeleteConfirm(rule.id)}>
              <Trash2 className={'size-4'} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

type FirewallGuidelinesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function FirewallGuidelinesDialog({ open, onOpenChange }: FirewallGuidelinesDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog {...{ open, onOpenChange }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.firewall.infoTitle')}</DialogTitle>
        </DialogHeader>
        <div className={'mt-4 divide-y divide-black/4'}>
          <div className={'pb-3'}>
            <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>{t('settings.firewall.infoPortRangeLabel')}</p>
            <p className={'mt-0.5 text-sm text-zinc-500'}>{t('settings.firewall.infoPortRangeDesc')}</p>
          </div>
          <div className={'py-3'}>
            <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>
              {t('settings.firewall.infoReservedPortsLabel')}
            </p>
            <div className={'mt-1.5 flex flex-wrap gap-1.5'}>
              {[22, 80, 443, 3000, 3001].map((port) => (
                <Badge key={port} variant={'secondary'} className={'font-jetbrains'}>
                  {port}
                </Badge>
              ))}
            </div>
          </div>
          <div className={'py-3'}>
            <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>{t('settings.firewall.infoProtocolLabel')}</p>
            <p className={'mt-0.5 text-sm text-zinc-500'}>{t('settings.firewall.infoProtocolDesc')}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'ghost'} size={'sm'}>
              {t('common.close')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
