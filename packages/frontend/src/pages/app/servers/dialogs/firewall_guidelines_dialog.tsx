import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Button } from '@remnant/frontend/features/ui/button';
import { Badge } from '@remnant/frontend/features/ui/badge';

type FirewallGuidelinesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FirewallGuidelinesDialog({ open, onOpenChange }: FirewallGuidelinesDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog {...{ open, onOpenChange }}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon className={'bg-blue-600/10 text-blue-600'}>
            <Info className={'size-4'} strokeWidth={2} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('settings.firewall.infoTitle')}</Dialog.Title>
          </div>
        </Dialog.Header>
        <Dialog.Body>
          <div className={'divide-y divide-black/4 dark:divide-white/6'}>
            <div className={'pb-3'}>
              <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>
                {t('settings.firewall.infoPortRangeLabel')}
              </p>
              <p className={'mt-0.5 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.firewall.infoPortRangeDesc')}</p>
            </div>
            <div className={'py-3'}>
              <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>
                {t('settings.firewall.infoReservedPortsLabel')}
              </p>
              <div className={'mt-1.5 flex flex-wrap gap-1.5'}>
                {[22, 80, 443, 3000, 3001].map((port) => (
                  <Badge key={port} variant={'muted'} className={'font-jetbrains'}>
                    {port}
                  </Badge>
                ))}
              </div>
            </div>
            <div className={'py-3'}>
              <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>{t('settings.firewall.infoProtocolLabel')}</p>
              <p className={'mt-0.5 text-sm text-zinc-500 dark:text-zinc-400'}>{t('settings.firewall.infoProtocolDesc')}</p>
            </div>
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant={'secondary'}>{t('common.close')}</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
