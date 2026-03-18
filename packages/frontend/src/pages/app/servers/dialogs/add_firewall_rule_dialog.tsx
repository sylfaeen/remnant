import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Zap } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Input } from '@remnant/frontend/features/ui/input';
import { Label } from '@remnant/frontend/features/ui/label';
import { Button } from '@remnant/frontend/features/ui/button';
import {
  FIREWALL_PRESETS,
  PRESET_STYLES,
  PROTOCOL_STYLES,
  type Protocol,
} from '@remnant/frontend/pages/app/servers/features/firewall_card';

type AddFirewallRuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (rule: { port: number; protocol: Protocol; label: string }) => void;
};

export function AddFirewallRuleDialog({ open, onOpenChange, ...rest }: AddFirewallRuleDialogProps) {
  const { t } = useTranslation();

  const [port, setPort] = useState('');
  const [label, setLabel] = useState('');

  const portNum = parseInt(port, 10);
  const isValidPort = !isNaN(portNum) && portNum >= 1024 && portNum <= 65535;
  const canSubmit = isValidPort && label.trim().length > 0;

  return (
    <Dialog {...{ open, onOpenChange }}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon className={'bg-green-600/10 text-green-600'}>
            <Shield className={'size-4'} strokeWidth={2} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('settings.firewall.addRule')}</Dialog.Title>
            <Dialog.Description>{t('settings.firewall.addRuleDescription')}</Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Body>
          <CreateFirewallForm {...{ port, setPort, label, setLabel, portNum, isValidPort, canSubmit, ...rest }} />
        </Dialog.Body>
        <Dialog.Footer>
          <Button type={'button'} variant={'secondary'} onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'add-firewall-rule'} disabled={!canSubmit}>
            <Shield className={'size-4'} />
            {t('settings.firewall.addRule')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

type CreateFirewallFormProps = Pick<AddFirewallRuleDialogProps, 'onAdd'> & {
  port: string;
  setPort: (port: string) => void;
  label: string;
  setLabel: (label: string) => void;
  portNum: number;
  isValidPort: boolean;
  canSubmit: boolean;
};

function CreateFirewallForm({ port, setPort, label, setLabel, portNum, isValidPort, canSubmit, onAdd }: CreateFirewallFormProps) {
  const { t } = useTranslation();

  const [protocol, setProtocol] = useState<Protocol>('tcp');

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ port: portNum, protocol, label: label.trim() });
    setPort('');
    setProtocol('tcp');
    setLabel('');
  };

  const handlePreset = (preset: (typeof FIREWALL_PRESETS)[number]) => {
    setPort(String(preset.port));
    setProtocol(preset.protocol);
    setLabel(`${preset.label} (${preset.description})`);
  };

  return (
    <form id={'add-firewall-rule'} className={'space-y-6'} onSubmit={handleSubmit}>
      <div>
        <Label className={'mb-2 block text-xs font-medium tracking-wider text-zinc-500 uppercase'}>
          {t('settings.firewall.presets')}
        </Label>
        <div className={'flex flex-wrap gap-2'}>
          {FIREWALL_PRESETS.map((preset) => {
            const presetStyle = PRESET_STYLES[preset.protocol];
            const isActive = port === String(preset.port) && protocol === preset.protocol;
            return (
              <button
                key={`${preset.port}-${preset.protocol}`}
                type={'button'}
                onClick={() => handlePreset(preset)}
                className={cn(
                  'group/preset flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all',
                  isActive
                    ? presetStyle.active
                    : 'border-black/10 text-zinc-600 hover:border-black/10 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/10 dark:hover:bg-zinc-800'
                )}
              >
                <Zap className={cn('size-3 text-zinc-400 transition-colors', presetStyle.icon)} />
                <span className={'font-medium'}>{preset.label}</span>
                <span className={'font-jetbrains text-xs text-zinc-400'}>
                  :{preset.port}/{preset.protocol}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={'grid grid-cols-2 gap-4'}>
        <div>
          <Label htmlFor={'firewall-port'}>{t('settings.firewall.port')}</Label>
          <Input
            type={'number'}
            id={'firewall-port'}
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder={'19132'}
            min={1024}
            max={65535}
          />
          {port && !isValidPort && <p className={'mt-1 text-sm text-red-500'}>{t('settings.firewall.invalidPort')}</p>}
        </div>
        <div>
          <Label>{t('settings.firewall.protocol')}</Label>
          <div className={'flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800'}>
            {(['tcp', 'udp', 'both'] as Array<Protocol>).map((p) => {
              const style = PROTOCOL_STYLES[p];
              return (
                <button
                  key={p}
                  type={'button'}
                  onClick={() => setProtocol(p)}
                  className={cn(
                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    protocol === p
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                  )}
                >
                  <span className={cn(protocol === p && style.text)}>{style.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor={'firewall-label'}>{t('settings.firewall.label')}</Label>
        <Input
          type={'text'}
          id={'firewall-label'}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('settings.firewall.labelPlaceholder')}
        />
      </div>
    </form>
  );
}
