import { useTranslation } from 'react-i18next';
import { useToast } from '@remnant/frontend/features/ui/toast';
import { trpc } from '@remnant/frontend/lib/trpc';

export function useUsers() {
  return trpc.users.list.useQuery();
}

export function useUser(id: number) {
  return trpc.users.byId.useQuery({ id }, { enabled: !!id });
}

export function useCreateUser() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  return trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.userCreated') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.userCreateError') });
    },
  });
}

export function useUpdateUser() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  return trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.userUpdated') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.userUpdateError') });
    },
  });
}

export function useDeleteUser() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.userDeleted') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.userDeleteError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}
