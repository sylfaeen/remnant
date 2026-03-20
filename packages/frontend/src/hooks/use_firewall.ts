import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiClient, raise } from '@remnant/frontend/lib/api';
import { useToast } from '@remnant/frontend/features/ui/toast';
import type { FirewallProtocol } from '@remnant/shared';

export function useFirewallRules(serverId: number | null) {
  return useQuery({
    queryKey: ['firewall', 'list', serverId],
    queryFn: async () => {
      const result = await apiClient.firewall.list({ params: { serverId: String(serverId!) } });
      if (result.status !== 200) raise(result.body, result.status);
      return result.body;
    },
    enabled: !!serverId,
  });
}

export function useAddFirewallRule(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: { port: number; protocol: FirewallProtocol; label: string }) => {
      const result = await apiClient.firewall.add({ params: { serverId: String(serverId) }, body: { serverId, ...input } });
      if (result.status !== 201) raise(result.body, result.status);
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firewall', 'list', serverId] }).then();
      addToast({ type: 'success', title: t('toast.firewallRuleAdded') });
    },
    onError: (error) => {
      addToast({ type: 'error', title: t('toast.firewallRuleAddError'), description: error.message });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: { port: number; protocol: FirewallProtocol; label: string }) => mutation.mutateAsync(input),
  };
}

export function useRemoveFirewallRule(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ ruleId }: { ruleId: number }) => {
      const result = await apiClient.firewall.remove({ params: { ruleId: String(ruleId) } });
      if (result.status !== 200) raise(result.body, result.status);
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firewall', 'list', serverId] }).then();
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
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ ruleId }: { ruleId: number }) => {
      const result = await apiClient.firewall.toggle({ params: { ruleId: String(ruleId) } });
      if (result.status !== 200) raise(result.body, result.status);
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firewall', 'list', serverId] }).then();
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
