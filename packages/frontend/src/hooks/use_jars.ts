import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';
import { useToast } from '@remnant/frontend/features/ui/toast';

export type JarSource = 'papermc' | 'spigot' | 'purpur' | 'fabric' | 'forge' | 'vanilla' | 'custom';

export interface JarInfo {
  name: string;
  size: number;
  modified: string;
  isActive: boolean;
  source: JarSource;
}

export function usePaperVersions() {
  return trpc.jars.getVersions.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaperBuilds(version: string | null) {
  return trpc.jars.getBuilds.useQuery(
    { version: version! },
    {
      enabled: !!version,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useServerJars(serverId: number | null) {
  return trpc.jars.list.useQuery(
    { serverId: serverId! },
    {
      enabled: !!serverId,
    }
  );
}

export function useDownloadJar(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const mutation = trpc.jars.download.useMutation({
    onSuccess: () => {
      utils.jars.list.invalidate({ serverId }).then();
      utils.servers.byId.invalidate({ id: serverId }).then();
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.jarDownloaded') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.jarDownloadError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: { version: string; build?: number }) => mutation.mutateAsync({ serverId, ...input }),
  };
}

export function useDownloadProgress(serverId: number | null, isDownloading: boolean) {
  return trpc.jars.progress.useQuery(
    { serverId: serverId! },
    {
      enabled: !!serverId && isDownloading,
      refetchInterval: isDownloading ? 500 : false,
    }
  );
}

export function useSetActiveJar(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const mutation = trpc.jars.setActive.useMutation({
    onSuccess: () => {
      utils.jars.list.invalidate({ serverId }).then();
      utils.servers.byId.invalidate({ id: serverId }).then();
      utils.servers.list.invalidate().then();
      addToast({ type: 'success', title: t('toast.jarActivated') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.jarActivateError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (jarFile: string) => mutation.mutateAsync({ serverId, jarFile }),
  };
}

export function useDeleteJar(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const mutation = trpc.jars.delete.useMutation({
    onSuccess: () => {
      utils.jars.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.jarDeleted') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.jarDeleteError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (jarFile: string) => mutation.mutateAsync({ serverId, jarFile }),
  };
}

export function useUploadJar(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: async ({ file, setAsActive }: { file: File; setAsActive?: boolean }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/servers/${serverId}/files/upload?path=/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Upload failed');
      }

      const result = await response.json();

      // Optionally set as active JAR
      if (setAsActive && result.data?.path) {
        const filename = result.data.path.split('/').pop();
        if (filename) {
          await utils.client.jars.setActive.mutate({ serverId, jarFile: filename });
        }
      }

      return result;
    },
    onSuccess: () => {
      utils.jars.list.invalidate({ serverId }).then();
      utils.servers.byId.invalidate({ id: serverId }).then();
      addToast({ type: 'success', title: t('toast.jarUploaded') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.jarUploadError') });
    },
  });
}

export function formatJarSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
