import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@remnant/frontend/features/ui/shadcn/dialog';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { FileTreeSelector } from '@remnant/frontend/features/ui/file_tree_selector';

type CreateBackupDialogProps = {
  open: boolean;
  serverId: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (paths: Array<string>) => void;
};

export function CreateBackupDialog({ open, serverId, isPending, onClose, onConfirm }: CreateBackupDialogProps) {
  const { t } = useTranslation();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => new Set());

  const handleConfirm = () => {
    onConfirm(Array.from(selectedPaths));
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      {...{ open }}
    >
      <DialogContent className={'max-w-2xl'}>
        <DialogHeader>
          <DialogIcon className={'bg-zinc-100 dark:bg-zinc-800'}>
            <Archive className={'size-5 text-zinc-700 dark:text-zinc-300'} strokeWidth={2} />
          </DialogIcon>
          <div>
            <DialogTitle>{t('backups.dialogTitle')}</DialogTitle>
            <DialogDescription>{t('backups.dialogDescription')}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody>
          <FileTreeSelector
            enabled={open}
            selectedPaths={selectedPaths}
            onSelectedPathsChange={setSelectedPaths}
            {...{ serverId }}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant={'secondary'} onClick={onClose} disabled={isPending} loading={isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={selectedPaths.size === 0 || isPending} loading={isPending}>
            {isPending ? t('backups.backingUp') : t('backups.startBackup')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
