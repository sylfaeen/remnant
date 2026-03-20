import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@remnant/frontend/features/ui/toast';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';

export type PluginInfo = {
  name: string;
  filename: string;
  size: number;
  modified: string;
  enabled: boolean;
};

export function usePlugins(serverId: number | null) {
  return trpc.plugins.list.useQuery(
    { serverId: serverId! },
    {
      enabled: !!serverId,
    }
  );
}

export function useUploadPlugin(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/servers/${serverId}/plugins`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to upload plugin');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: [['plugins', 'list'], { input: { serverId } }],
        })
        .then();
      addToast({ type: 'success', title: t('toast.pluginUploaded') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.pluginUploadError') });
    },
  });
}

export function useTogglePlugin(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.plugins.toggle.useMutation({
    onSuccess: () => {
      utils.plugins.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.pluginToggled') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.pluginToggleError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (filename: string) => mutation.mutateAsync({ serverId, filename }),
  };
}

export function useDeletePlugin(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.plugins.delete.useMutation({
    onSuccess: () => {
      utils.plugins.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.pluginDeleted') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.pluginDeleteError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (filename: string) => mutation.mutateAsync({ serverId, filename }),
  };
}

export function formatPluginSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
