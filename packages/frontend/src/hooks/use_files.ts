import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';
import { useToast } from '@remnant/frontend/features/ui/toast';

export interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  permissions: string;
}

export function useFiles(serverId: number | null, path: string) {
  return trpc.files.list.useQuery(
    { serverId: serverId!, path },
    {
      enabled: !!serverId,
    }
  );
}

export function useFileContent(serverId: number | null, path: string | null) {
  return trpc.files.read.useQuery(
    { serverId: serverId!, path: path! },
    {
      enabled: !!serverId && !!path,
    }
  );
}

export function useWriteFile(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const mutation = trpc.files.write.useMutation({
    onSuccess: (_, variables) => {
      utils.files.read.invalidate({ serverId, path: variables.path }).then();
      const dirPath = variables.path.substring(0, variables.path.lastIndexOf('/')) || '/';
      utils.files.list.invalidate({ serverId, path: dirPath }).then();
      addToast({ type: 'success', title: t('toast.fileSaved') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.fileSaveError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: { path: string; content: string }) => mutation.mutateAsync({ serverId, ...input }),
  };
}

export function useDeleteFile(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const mutation = trpc.files.delete.useMutation({
    onSuccess: (_, variables) => {
      const dirPath = variables.path.substring(0, variables.path.lastIndexOf('/')) || '/';
      utils.files.list.invalidate({ serverId, path: dirPath }).then();
      addToast({ type: 'success', title: t('toast.fileDeleted') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.fileDeleteError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (path: string) => mutation.mutateAsync({ serverId, path }),
  };
}

export function useCreateDirectory(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const mutation = trpc.files.mkdir.useMutation({
    onSuccess: (_, variables) => {
      const parentPath = variables.path.substring(0, variables.path.lastIndexOf('/')) || '/';
      utils.files.list.invalidate({ serverId, path: parentPath }).then();
      addToast({ type: 'success', title: t('toast.directoryCreated') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.directoryCreateError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (path: string) => mutation.mutateAsync({ serverId, path }),
  };
}

export function useUploadFile(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: async ({ file, targetPath }: { file: File; targetPath: string }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/servers/${serverId}/files/upload?path=${encodeURIComponent(targetPath)}`, {
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

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient
        .invalidateQueries({
          queryKey: [['files', 'list'], { input: { serverId, path: variables.targetPath } }],
        })
        .then();
      addToast({ type: 'success', title: t('toast.fileUploaded') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.fileUploadError') });
    },
  });
}

export function useRenameFile(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const utils = trpc.useUtils();

  const mutation = trpc.files.rename.useMutation({
    onSuccess: (_, variables) => {
      const oldDirPath = variables.oldPath.substring(0, variables.oldPath.lastIndexOf('/')) || '/';
      const newDirPath = variables.newPath.substring(0, variables.newPath.lastIndexOf('/')) || '/';
      utils.files.list.invalidate({ serverId, path: oldDirPath }).then();
      if (oldDirPath !== newDirPath) {
        utils.files.list.invalidate({ serverId, path: newDirPath }).then();
      }
      addToast({ type: 'success', title: t('toast.fileRenamed') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.fileRenameError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: { oldPath: string; newPath: string }) => mutation.mutateAsync({ serverId, ...input }),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filename.substring(lastDot + 1).toLowerCase();
}

export function isEditableFile(filename: string): boolean {
  const editableExtensions = [
    'txt',
    'md',
    'json',
    'yml',
    'yaml',
    'xml',
    'properties',
    'cfg',
    'conf',
    'ini',
    'log',
    'sh',
    'bat',
    'cmd',
    'js',
    'ts',
    'java',
    'py',
    'html',
    'css',
    'toml',
    'env',
  ];
  const ext = getFileExtension(filename);
  return editableExtensions.includes(ext) || filename.startsWith('.');
}
