import { useTranslation } from 'react-i18next';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useToast } from '@remnant/frontend/features/ui/toast';
import type { CreateSftpAccountRequest, UpdateSftpAccountRequest } from '@remnant/shared';

export function useSftpInfo() {
  return trpc.sftp.getInfo.useQuery();
}

export function useSftpAccounts(serverId: number) {
  return trpc.sftp.list.useQuery({ serverId }, { enabled: !!serverId });
}

export function useCreateSftpAccount(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.sftp.create.useMutation({
    onSuccess: () => {
      utils.sftp.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.sftpAccountCreated') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.sftpAccountCreateError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: Omit<CreateSftpAccountRequest, 'serverId'>) => mutation.mutateAsync({ serverId, ...input }),
  };
}

export function useUpdateSftpAccount(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.sftp.update.useMutation({
    onSuccess: () => {
      utils.sftp.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.sftpAccountUpdated') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.sftpAccountUpdateError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: UpdateSftpAccountRequest) => mutation.mutateAsync(input),
  };
}

export function useDeleteSftpAccount(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.sftp.delete.useMutation({
    onSuccess: () => {
      utils.sftp.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.sftpAccountDeleted') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.sftpAccountDeleteError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}
