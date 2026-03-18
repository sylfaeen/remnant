import type { ServerResponse } from '@remnant/shared';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Archive, Loader2, Trash2 } from 'lucide-react';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Button } from '@remnant/frontend/features/ui/button';

type DeleteServerDialogProps = {
  server: ServerResponse;
  isDeleting: boolean;
  onConfirm: (createBackup: boolean) => void;
  onCancel: () => void;
};

export function DeleteServerDialog({ server, isDeleting, onConfirm, onCancel }: DeleteServerDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <Dialog.Content className={'max-w-md'}>
        <Dialog.Header>
          <Dialog.Icon className={'bg-red-600/10 text-red-600'}>
            <AlertTriangle className={'size-4'} strokeWidth={2} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('servers.deleteServer')}</Dialog.Title>
          </div>
        </Dialog.Header>
        <Dialog.Body>
          <p className={'text-zinc-600 dark:text-zinc-400'}>{t('servers.deleteConfirmMessage', { name: server.name })}</p>
          <p className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('servers.deleteWarningFolder')}</p>
          <div className={'rounded-lg border border-black/10 bg-white p-3'}>
            <p className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('servers.backupQuestion')}</p>
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <div className={'flex w-full flex-col gap-2'}>
            <Button onClick={() => onConfirm(true)} disabled={isDeleting} loading={isDeleting} className={'w-full'}>
              {isDeleting ? <Loader2 className={'size-4 animate-spin'} /> : <Archive className={'size-4'} />}
              {t('servers.deleteWithBackup')}
            </Button>
            <Button
              variant={'danger'}
              onClick={() => onConfirm(false)}
              disabled={isDeleting}
              loading={isDeleting}
              className={'w-full'}
            >
              {isDeleting ? <Loader2 className={'size-4 animate-spin'} /> : <Trash2 className={'size-4'} />}
              {t('servers.deleteWithoutBackup')}
            </Button>
            <Button variant={'secondary'} onClick={onCancel} disabled={isDeleting} className={'w-full'}>
              {t('common.cancel')}
            </Button>
          </div>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
