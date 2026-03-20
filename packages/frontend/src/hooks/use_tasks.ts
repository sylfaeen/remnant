import { useTranslation } from 'react-i18next';
import { Archive, RotateCcw, Terminal } from 'lucide-react';
import { useToast } from '@remnant/frontend/features/ui/toast';
import { trpc } from '@remnant/frontend/lib/trpc';

export type TaskExecution = {
  id: number;
  task_id: number;
  status: 'success' | 'error';
  duration_ms: number;
  error: string | null;
  created_at: string;
};

export interface TaskConfig {
  command?: string;
  backup_paths?: Array<string>;
  warn_players?: boolean;
  warn_message?: string;
  warn_seconds?: number;
}

export type TaskType = 'restart' | 'backup' | 'command';

export interface ScheduledTask {
  id: number;
  server_id: number;
  name: string;
  type: TaskType;
  cron_expression: string;
  enabled: boolean;
  config: TaskConfig | null;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
  updated_at: string;
}

export function useTasks(serverId: number | null) {
  return trpc.tasks.list.useQuery(
    { serverId: serverId! },
    {
      enabled: !!serverId,
    }
  );
}

export function useTaskHistory(serverId: number, taskId: number | null, enabled: boolean) {
  return trpc.tasks.history.useQuery({ serverId, taskId: taskId! }, { enabled: !!taskId && enabled, refetchInterval: 1000 });
}

export interface CreateTaskInput {
  name: string;
  type: TaskType;
  cron_expression: string;
  enabled?: boolean;
  config?: TaskConfig;
}

export function useCreateTask(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.taskCreated') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.taskCreateError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (input: CreateTaskInput) => mutation.mutateAsync({ serverId, ...input }),
  };
}

export interface UpdateTaskInput {
  name?: string;
  cron_expression?: string;
  enabled?: boolean;
  config?: TaskConfig;
}

export function useUpdateTask(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();
  const mutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.taskUpdated') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.taskUpdateError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: ({ taskId, input }: { taskId: number; input: UpdateTaskInput }) =>
      mutation.mutateAsync({ serverId, taskId, ...input }),
  };
}

export function useDeleteTask(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.taskDeleted') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.taskDeleteError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (taskId: number) => mutation.mutateAsync({ serverId, taskId }),
  };
}

export function useToggleTask(serverId: number) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.tasks.toggle.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate({ serverId }).then();
      addToast({ type: 'success', title: t('toast.taskToggled') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.taskToggleError') });
    },
  });

  return {
    ...mutation,
    mutateAsync: (taskId: number) => mutation.mutateAsync({ serverId, taskId }),
  };
}

export function formatCronExpression(cron: string): string {
  const parts = cron.trim().split(/\s+/);

  let second: string;
  let minute: string;
  let hour: string;
  let day: string;
  let month: string;
  let weekday: string;

  if (parts.length === 6) {
    [second, minute, hour, day, month, weekday] = parts;
  } else if (parts.length === 5) {
    second = '0';
    [minute, hour, day, month, weekday] = parts;
  } else {
    return cron;
  }

  const isStandardDate = day === '*' && month === '*' && weekday === '*';

  // 6-field: second-level patterns
  if (parts.length === 6 && isStandardDate) {
    if (second === '*' && minute === '*' && hour === '*') {
      return 'Every second';
    }
    if (second.startsWith('*/') && minute === '*' && hour === '*') {
      return `Every ${second.slice(2)} seconds`;
    }
    if (second === '0' && minute === '*' && hour === '*') {
      return 'Every minute';
    }
    if (second === '0' && minute.startsWith('*/') && hour === '*') {
      return `Every ${minute.slice(2)} minutes`;
    }
    if (second === '0' && minute === '0' && hour === '*') {
      return 'Every hour';
    }
    if (second === '0' && minute === '0' && hour.startsWith('*/')) {
      return `Every ${hour.slice(2)} hours`;
    }
  }

  // 6-field: daily/weekly patterns
  if (parts.length === 6 && second === '0') {
    if (minute === '0' && hour === '0' && day === '*' && month === '*' && weekday === '*') {
      return 'Daily at midnight';
    }
    if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
      return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    if (minute === '0' && hour === '0' && day === '*' && month === '*' && weekday === '0') {
      return 'Weekly (Sunday midnight)';
    }
  }

  // 5-field standard patterns
  if (minute === '*' && hour === '*' && isStandardDate) {
    return 'Every minute';
  }
  if (minute === '0' && hour === '*' && isStandardDate) {
    return 'Every hour';
  }
  if (minute === '0' && hour === '0' && isStandardDate) {
    return 'Daily at midnight';
  }
  if (minute.startsWith('*/') && hour === '*' && isStandardDate) {
    return `Every ${minute.slice(2)} minutes`;
  }
  if (hour.startsWith('*/') && isStandardDate) {
    return `Every ${hour.slice(2)} hours`;
  }
  if (minute !== '*' && hour !== '*' && isStandardDate) {
    return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }

  return cron;
}

export const CRON_PRESETS = [
  { label: 'Every second', value: '* * * * * *' },
  { label: 'Every 30 seconds', value: '*/30 * * * * *' },
  { label: 'Every minute', value: '0 * * * * *' },
  { label: 'Every hour', value: '0 0 * * * *' },
  { label: 'Every 6 hours', value: '0 0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 0 */12 * * *' },
  { label: 'Daily at midnight', value: '0 0 0 * * *' },
  { label: 'Daily at 4 AM', value: '0 0 4 * * *' },
  { label: 'Weekly (Sunday midnight)', value: '0 0 0 * * 0' },
  { label: 'Custom', value: '' },
] as const;

export type TaskTypeOption = {
  value: TaskType;
  label: string;
  description: string;
  icon: typeof RotateCcw;
  activeClass: string;
};

export function getTaskTypes(t: ReturnType<typeof useTranslation>['t']): Array<TaskTypeOption> {
  return [
    {
      value: 'restart',
      label: t('tasks.types.restart'),
      description: t('tasks.types.restartDesc'),
      icon: RotateCcw,
      activeClass: 'border-amber-500/40 bg-amber-500/5',
    },
    {
      value: 'backup',
      label: t('tasks.types.backup'),
      description: t('tasks.types.backupDesc'),
      icon: Archive,
      activeClass: 'border-green-600/40 bg-green-600/5',
    },
    {
      value: 'command',
      label: t('tasks.types.command'),
      description: t('tasks.types.commandDesc'),
      icon: Terminal,
      activeClass: 'border-purple-500/40 bg-purple-500/5',
    },
  ];
}
