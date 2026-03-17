import { useTranslation } from 'react-i18next';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useToast } from '@remnant/frontend/features/ui/toast';
import type { FirewallProtocol } from '@remnant/shared';

export function useFirewallRules(serverId: number | null) {
  return trpc.firewall.list.useQuery(
    { serverId: serverId! },
    {
      enabled: !!serverId,
    }
  );
}

export function useAddFirewallRule(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.firewall.add.useMutation({
    onSuccess: () => {
      utils.firewall.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.firewallRuleAdded') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.firewallRuleAddError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: { port: number; protocol: FirewallProtocol; label: string }) =>
      mutation.mutateAsync({ serverId, ...input }),
  };
}

export function useRemoveFirewallRule(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.firewall.remove.useMutation({
    onSuccess: () => {
      utils.firewall.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.firewallRuleRemoved') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.firewallRuleRemoveError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (ruleId: number) => mutation.mutateAsync({ ruleId }),
  };
}

export function useToggleFirewallRule(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.firewall.toggle.useMutation({
    onSuccess: () => {
      utils.firewall.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.firewallRuleToggled') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.firewallRuleToggleError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (ruleId: number) => mutation.mutateAsync({ ruleId }),
  };
}
