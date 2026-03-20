import { useTranslation } from 'react-i18next';
import { useToast } from '@remnant/frontend/features/ui/toast';
import { trpc } from '@remnant/frontend/lib/trpc';

export function useBackups(serverId: number | null) {
  return trpc.servers.listBackups.useQuery(
    { id: serverId! },
    {
      enabled: !!serverId,
      refetchInterval: 10000,
    }
  );
}

export function useDeleteBackup(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  return trpc.servers.deleteBackup.useMutation({
    onSuccess: () => {
      utils.servers.listBackups.invalidate({ id: serverId }).then();
      addToast({ type: 'success', title: t('toast.backupDeleted') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.backupDeleteError') });
    },
  });
}
