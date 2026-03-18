import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Input } from '@remnant/frontend/features/ui/input';
import { Label } from '@remnant/frontend/features/ui/label';
import { Button } from '@remnant/frontend/features/ui/button';
import type { DomainType } from '@remnant/shared';

type AddDomainDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (domain: { domain: string; port: number; type: DomainType }) => void;
  serverPort: number;
};

export function AddDomainDialog({ open, onOpenChange, ...rest }: AddDomainDialogProps) {
  const { t } = useTranslation();

  const [domain, setDomain] = useState('');
  const [port, setPort] = useState(String(rest.serverPort));
  const [type, setType] = useState<DomainType>('http');

  const portNum = parseInt(port, 10);
  const isValidPort = !isNaN(portNum) && portNum >= 1024 && portNum <= 65535;
  const isValidDomain =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(domain);
  const canSubmit = isValidDomain && isValidPort;

  return (
    <Dialog {...{ open, onOpenChange }}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon className={'bg-blue-600/10 text-blue-600'}>
            <Globe className={'size-4'} strokeWidth={2} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('settings.domains.addDomain')}</Dialog.Title>
            <Dialog.Description>{t('settings.domains.addDomainDescription')}</Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Body>
          <AddDomainForm
            onAdd={rest.onAdd}
            {...{ domain, setDomain, port, setPort, type, setType, portNum, isValidPort, isValidDomain, canSubmit }}
          />
        </Dialog.Body>
        <Dialog.Footer>
          <Button type={'button'} variant={'secondary'} onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'add-domain'} disabled={!canSubmit}>
            {t('settings.domains.addDomain')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

type AddDomainFormProps = {
  domain: string;
  setDomain: (value: string) => void;
  port: string;
  setPort: (value: string) => void;
  type: DomainType;
  setType: (value: DomainType) => void;
  portNum: number;
  isValidPort: boolean;
  isValidDomain: boolean;
  canSubmit: boolean;
  onAdd: (domain: { domain: string; port: number; type: DomainType }) => void;
};

function AddDomainForm({
  domain,
  setDomain,
  port,
  setPort,
  type,
  setType,
  portNum,
  isValidPort,
  isValidDomain,
  canSubmit,
  onAdd,
}: AddDomainFormProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ domain: domain.trim().toLowerCase(), port: portNum, type });
    setDomain('');
    setPort('');
    setType('http');
  };

  return (
    <form id={'add-domain'} className={'space-y-6'} onSubmit={handleSubmit}>
      <div>
        <Label htmlFor={'domain-name'}>{t('settings.domains.domainName')}</Label>
        <Input
          type={'text'}
          id={'domain-name'}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={'play.example.com'}
        />
        {domain && !isValidDomain && <p className={'mt-1 text-sm text-red-500'}>{t('settings.domains.invalidDomain')}</p>}
      </div>
      <div className={'grid grid-cols-2 gap-4'}>
        <div>
          <Label htmlFor={'domain-port'}>{t('settings.domains.port')}</Label>
          <Input
            type={'number'}
            id={'domain-port'}
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder={'8100'}
            min={1024}
            max={65535}
          />
          {port && !isValidPort && <p className={'mt-1 text-sm text-red-500'}>{t('settings.domains.invalidPort')}</p>}
        </div>
        <div>
          <Label>{t('settings.domains.type')}</Label>
          <div className={'flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800'}>
            {(['http', 'tcp'] as Array<DomainType>).map((dt) => (
              <button
                key={dt}
                type={'button'}
                onClick={() => setType(dt)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium uppercase transition-all',
                  type === dt
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                )}
              >
                {dt === 'http' ? 'HTTP' : 'TCP'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
