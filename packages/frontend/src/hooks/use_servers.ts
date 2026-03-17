import { useTranslation } from 'react-i18next';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useToast } from '@remnant/frontend/features/ui/toast';

function useErrorDescription() {
  const { t } = useTranslation();

  return (error: { message: string }) => {
    const key = `errors.${error.message}`;
    const translated = t(key);
    return translated !== key ? translated : undefined;
  };
}

export function useServers() {
  return trpc.servers.list.useQuery(undefined, {
    refetchInterval: 5000,
  });
}

export function useServer(id: number) {
  return trpc.servers.byId.useQuery(
    { id },
    {
      enabled: !!id,
      refetchInterval: 3000,
    }
  );
}

export function useCreateServer() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const getDescription = useErrorDescription();

  const utils = trpc.useUtils();

  return trpc.servers.create.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.serverCreated') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.serverCreateError'), description: getDescription(error) });
    },
  });
}

export function useUpdateServer() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const getDescription = useErrorDescription();

  const utils = trpc.useUtils();

  return trpc.servers.update.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.serverUpdated') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.serverUpdateError'), description: getDescription(error) });
    },
  });
}

export function useDeleteServer() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const getDescription = useErrorDescription();

  const utils = trpc.useUtils();

  const mutation = trpc.servers.delete.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.serverDeleted') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.serverDeleteError'), description: getDescription(error) });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number, createBackup?: boolean) => mutation.mutateAsync({ id, createBackup: createBackup ?? false }),
  };
}

export function useBackupServer() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const getDescription = useErrorDescription();

  const mutation = trpc.servers.backup.useMutation({
    onSuccess: () => {
      addToast({ type: 'success', title: t('toast.backupCreated') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.backupCreateError'), description: getDescription(error) });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number, paths?: Array<string>) => mutation.mutateAsync({ id, paths }),
  };
}

export function useStartServer() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const getDescription = useErrorDescription();

  const utils = trpc.useUtils();

  const mutation = trpc.servers.start.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.serverStarted') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.serverStartError'), description: getDescription(error) });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}

export function useStopServer() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const getDescription = useErrorDescription();

  const utils = trpc.useUtils();

  const mutation = trpc.servers.stop.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.serverStopped') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.serverStopError'), description: getDescription(error) });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}

export function useRestartServer() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const getDescription = useErrorDescription();

  const utils = trpc.useUtils();

  const mutation = trpc.servers.restart.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.serverRestarted') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.serverRestartError'), description: getDescription(error) });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}
