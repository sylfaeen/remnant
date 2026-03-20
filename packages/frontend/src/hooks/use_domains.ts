import { useTranslation } from 'react-i18next';
import { useToast } from '@remnant/frontend/features/ui/toast';
import { trpc } from '@remnant/frontend/lib/trpc';
import type { DomainType } from '@remnant/shared';

export function useDomains(serverId: number | null) {
  return trpc.domains.list.useQuery({ serverId: serverId! }, { enabled: !!serverId });
}

export function useAddDomain(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.domains.add.useMutation({
    onSuccess: () => {
      utils.domains.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.domainAdded') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.domainAddError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: { domain: string; port: number; type: DomainType }) => mutation.mutateAsync({ serverId, ...input }),
  };
}

export function useRemoveDomain(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.domains.remove.useMutation({
    onSuccess: () => {
      utils.domains.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.domainRemoved') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.domainRemoveError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}

export function useEnableSsl(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.domains.enableSsl.useMutation({
    onSuccess: () => {
      utils.domains.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.sslEnabled') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.sslEnableError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}

export function useServerIp(): string {
  const { data } = trpc.settings.getVersionInfo.useQuery();
  return data?.ipAddress ?? '';
}

export function useRenewSsl(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.domains.renew.useMutation({
    onSuccess: () => {
      utils.domains.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.sslRenewed') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.sslRenewError'), description: error.message });
    },
  });

  return mutation;
}

export function usePanelDomain() {
  return trpc.domains.panelDomain.useQuery();
}

export function useSetPanelDomain() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.domains.setPanelDomain.useMutation({
    onSuccess: () => {
      utils.domains.panelDomain.invalidate().then();
      addToast({ type: 'success', title: t('toast.panelDomainSet') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.panelDomainSetError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (domain: string) => mutation.mutateAsync({ domain }),
  };
}

export function useRemovePanelDomain() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.domains.removePanelDomain.useMutation({
    onSuccess: () => {
      utils.domains.panelDomain.invalidate().then();
      addToast({ type: 'success', title: t('toast.panelDomainRemoved') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.panelDomainRemoveError'), description: error.message });
    },
  });

  return mutation;
}

export function useEnablePanelSsl() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.domains.enableSsl.useMutation({
    onSuccess: () => {
      utils.domains.panelDomain.invalidate().then();
      addToast({ type: 'success', title: t('toast.sslEnabled') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.sslEnableError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ id }),
  };
}
