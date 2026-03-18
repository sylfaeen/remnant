import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Terminal,
  Trash2,
  XCircle,
} from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { cn } from '@remnant/frontend/lib/cn';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTask,
  useTaskHistory,
  formatCronExpression,
  type CreateTaskInput,
  type ScheduledTask,
  type TaskExecution,
} from '@remnant/frontend/hooks/use_tasks';
import { Button } from '@remnant/frontend/features/ui/button';
import { CreateTaskDialog } from '@remnant/frontend/pages/app/servers/dialogs/create_task_dialog';
import { EditTaskDialog } from '@remnant/frontend/pages/app/servers/dialogs/edit_task_dialog';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { Badge, type BadgeProps } from '@remnant/frontend/features/ui/badge';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { Tooltip } from '@remnant/frontend/features/ui/tooltip';

export function ServerTasksPage() {
  const { t } = useTranslation();

  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { isLoading: serverLoading } = useServer(serverId || 0);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(serverId);
  const createTask = useCreateTask(serverId || 0);
  const updateTask = useUpdateTask(serverId || 0);
  const deleteTask = useDeleteTask(serverId || 0);
  const toggleTask = useToggleTask(serverId || 0);

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      await createTask.mutateAsync(input);
      setShowForm(false);
    } catch {}
  };

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return;
    try {
      await updateTask.mutateAsync({ taskId: editingTask.id, input });
      setEditingTask(null);
    } catch {}
  };

  const handleDelete = async (taskId: number) => {
    try {
      await deleteTask.mutateAsync(taskId);
      setDeleteConfirm(null);
    } catch {}
  };

  const handleToggle = async (taskId: number) => {
    try {
      await toggleTask.mutateAsync(taskId);
    } catch {}
  };

  if (!serverId || isNaN(serverId)) {
    return <PageError message={t('errors.generic')} />;
  }

  if (serverLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <ServerPageHeader>
        <ServerPageHeader.Left>
          <ServerPageHeader.Icon icon={Clock} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('tasks.title')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/tasks'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('tasks.subtitle')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
        <ServerPageHeader.Actions>
          <Button onClick={() => setShowForm(true)}>
            <Plus className={'size-5'} />
            {t('tasks.addTask')}
          </Button>
          {showForm && (
            <CreateTaskDialog
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
              isLoading={createTask.isPending}
              {...{ serverId }}
            />
          )}
          {editingTask && (
            <EditTaskDialog
              task={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
              isLoading={updateTask.isPending}
              {...{ serverId }}
            />
          )}
        </ServerPageHeader.Actions>
      </ServerPageHeader>
      <PageContent>
        <div className={'space-y-6'}>
          <TasksSection
            tasks={tasksData?.tasks}
            deletePending={deleteTask.isPending}
            togglePending={toggleTask.isPending}
            onToggle={handleToggle}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onToggleConfirm={setToggleConfirm}
            onDeleteConfirm={setDeleteConfirm}
            {...{ serverId, tasksLoading, toggleConfirm, deleteConfirm }}
          />
        </div>
      </PageContent>
    </>
  );
}

type TasksSectionProps = {
  serverId: number;
  tasksLoading: boolean;
  tasks: Array<ScheduledTask> | undefined;
  toggleConfirm: number | null;
  deleteConfirm: number | null;
  deletePending: boolean;
  togglePending: boolean;
  onToggle: (taskId: number) => void;
  onEdit: (task: ScheduledTask) => void;
  onDelete: (taskId: number) => void;
  onToggleConfirm: (taskId: number | null) => void;
  onDeleteConfirm: (taskId: number | null) => void;
};

function TasksSection({
  serverId,
  tasksLoading,
  tasks,
  toggleConfirm,
  deleteConfirm,
  deletePending,
  togglePending,
  onToggle,
  onEdit,
  onDelete,
  onToggleConfirm,
  onDeleteConfirm,
}: TasksSectionProps) {
  const { t } = useTranslation();

  const enabledCount = tasks?.filter((t) => t.enabled).length ?? 0;

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title count={tasks && tasks.length > 0 && `${enabledCount}/${tasks.length}`}>
            {t('tasks.title')}
          </FeatureCard.Title>
          <FeatureCard.Description>{t('tasks.subtitle')}</FeatureCard.Description>
        </FeatureCard.Content>
      </FeatureCard.Header>
      <FeatureCard.Body>
        {tasksLoading ? (
          <div className={'py-8 text-center'}>
            <div
              className={'mx-auto size-8 animate-spin rounded-full border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400'}
            />
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <FeatureCard.Empty icon={Clock} title={t('tasks.noTasks')} description={t('tasks.createFirst')} />
        ) : (
          <>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                {...{
                  serverId,
                  task,
                  toggleConfirm,
                  deleteConfirm,
                  deletePending,
                  togglePending,
                  onToggle,
                  onEdit,
                  onDelete,
                  onToggleConfirm,
                  onDeleteConfirm,
                }}
              />
            ))}
          </>
        )}
      </FeatureCard.Body>
    </FeatureCard>
  );
}

type TaskRowProps = {
  serverId: number;
  task: ScheduledTask;
  toggleConfirm: number | null;
  deleteConfirm: number | null;
  deletePending: boolean;
  togglePending: boolean;
  onToggle: (taskId: number) => void;
  onEdit: (task: ScheduledTask) => void;
  onDelete: (taskId: number) => void;
  onToggleConfirm: (taskId: number | null) => void;
  onDeleteConfirm: (taskId: number | null) => void;
};

function TaskRow({
  serverId,
  task,
  toggleConfirm,
  deleteConfirm,
  deletePending,
  onToggle,
  onEdit,
  onDelete,
  onToggleConfirm,
  onDeleteConfirm,
}: TaskRowProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const typeConfig = getTaskTypeConfig(task.type);

  return (
    <FeatureCard.Stack className={'gap-y-0'}>
      <FeatureCard.Row>
        <button type={'button'} className={'flex items-start gap-3 text-left'} onClick={() => setExpanded(!expanded)}>
          <div
            className={cn(
              'mt-2 flex size-8 shrink-0 items-center justify-center rounded-lg transition-opacity',
              task.enabled
                ? 'bg-green-600 text-white'
                : 'bg-zinc-100 text-zinc-600 opacity-40 dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            <typeConfig.icon className={'size-4'} strokeWidth={2} />
          </div>
          <div className={cn('min-w-0', !task.enabled && 'opacity-50')}>
            <div className={'flex items-center gap-2'}>
              <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{task.name}</span>
              <Badge variant={typeConfig.badgeVariant} size={'xs'} className={'font-semibold'}>
                {t(`tasks.types.${task.type}`)}
              </Badge>
              {!task.enabled && (
                <Badge variant={'muted'} size={'xs'}>
                  {t('tasks.disabled')}
                </Badge>
              )}
              <ChevronDown
                className={cn('size-3.5 text-zinc-400 transition-transform dark:text-zinc-500', expanded && 'rotate-180')}
              />
            </div>
            <div className={'flex items-center gap-2 text-sm'}>
              <span className={'text-zinc-600 dark:text-zinc-400'}>{formatCronExpression(task.cron_expression)}</span>
              <span className={'font-jetbrains text-sm text-zinc-600 dark:text-zinc-400'}>({task.cron_expression})</span>
            </div>
            {task.last_run && (
              <div className={'flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400'}>
                <Clock className={'size-3'} strokeWidth={2} />
                <span>
                  {t('tasks.lastRun')}: {new Date(task.last_run).toLocaleString()}
                </span>
              </div>
            )}
            {task.type === 'command' && task.config?.command && (
              <div
                className={
                  'font-jetbrains mt-2 inline-block rounded-md border border-black/10 bg-zinc-100/80 px-2.5 py-1 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-400'
                }
              >
                <span className={'mr-1.5 text-zinc-600 dark:text-zinc-400'}>$</span>
                {task.config.command}
              </div>
            )}
          </div>
        </button>
        <FeatureCard.RowControl>
          {toggleConfirm === task.id ? (
            <div className={'flex items-center gap-1.5'}>
              <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
              <Button
                variant={task.enabled ? 'secondary' : 'success'}
                size={'xs'}
                onClick={() => {
                  onToggle(task.id);
                  onToggleConfirm(null);
                }}
              >
                {t('common.yes')}
              </Button>
              <Button variant={'ghost'} size={'xs'} onClick={() => onToggleConfirm(null)}>
                {t('common.no')}
              </Button>
            </div>
          ) : deleteConfirm === task.id ? (
            <div className={'flex items-center gap-1.5'}>
              <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
              <Button
                variant={'danger'}
                size={'xs'}
                onClick={() => onDelete(task.id)}
                disabled={deletePending}
                loading={deletePending}
              >
                {t('common.yes')}
              </Button>
              <Button variant={'ghost'} size={'xs'} onClick={() => onDeleteConfirm(null)}>
                {t('common.no')}
              </Button>
            </div>
          ) : (
            <>
              <Tooltip.Provider delayDuration={300}>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant={task.enabled ? 'ghost' : 'success'}
                      size={task.enabled ? 'icon-sm' : 'sm'}
                      onClick={() => onToggleConfirm(task.id)}
                      className={cn(
                        task.enabled && 'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-400'
                      )}
                    >
                      {task.enabled ? (
                        <PowerOff className={'size-4'} />
                      ) : (
                        <>
                          <Power className={'size-4'} />
                          {t('tasks.enable')}
                        </>
                      )}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                    {task.enabled ? t('tasks.tooltipDisable') : t('tasks.tooltipEnable')}
                  </Tooltip.Content>
                </Tooltip>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant={'ghost'}
                      size={'icon-sm'}
                      onClick={() => onEdit(task)}
                      className={'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-400'}
                    >
                      <Pencil className={'size-3.5'} />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('tasks.tooltipEdit')}</Tooltip.Content>
                </Tooltip>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant={'ghost-danger'} size={'icon-sm'} onClick={() => onDeleteConfirm(task.id)}>
                      <Trash2 className={'size-3.5'} />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('tasks.tooltipDelete')}</Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </>
          )}
        </FeatureCard.RowControl>
      </FeatureCard.Row>
      {expanded && <TaskHistory {...{ serverId }} taskId={task.id} />}
    </FeatureCard.Stack>
  );
}

type TaskHistoryProps = {
  serverId: number;
  taskId: number;
};

function TaskHistory({ serverId, taskId }: TaskHistoryProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useTaskHistory(serverId, taskId, true);

  return (
    <div className={'border-t border-black/6 px-5 pt-3 pb-4'}>
      <div className={'text-sm font-medium text-zinc-600 dark:text-zinc-400'}>{t('tasks.history')}</div>
      {isLoading ? (
        <div className={'flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500'}>
          <Loader2 className={'size-3.5 animate-spin'} />
          {t('common.loading')}
        </div>
      ) : !data || data.executions.length === 0 ? (
        <div className={'text-sm text-zinc-400 dark:text-zinc-500'}>{t('tasks.noHistory')}</div>
      ) : (
        <div className={'max-h-64 overflow-y-auto'}>
          {data.executions.map((exec: TaskExecution) => (
            <div
              key={exec.id}
              className={
                'flex h-5 items-center justify-between gap-2 rounded-md px-2 text-sm hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'
              }
            >
              <div className={'flex items-center justify-start gap-2'}>
                {exec.status === 'success' ? (
                  <CheckCircle2 className={'size-3 shrink-0 text-green-600'} />
                ) : (
                  <XCircle className={'size-3.5 shrink-0 text-red-500'} />
                )}
                <span className={'font-jetbrains text-[11px] text-zinc-600 tabular-nums dark:text-zinc-400'}>
                  {new Date(exec.created_at).toLocaleString()}
                </span>
              </div>
              <div className={'space-x-2'}>
                {exec.error && <span className={'truncate text-[11px] text-red-400'}>{exec.error}</span>}
                <span className={'font-jetbrains text-[11px] text-zinc-600 tabular-nums dark:text-zinc-400'}>
                  {t('tasks.duration', { ms: exec.duration_ms })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getTaskTypeConfig(type: string) {
  const neutral = { badgeVariant: 'default' as BadgeProps['variant'] };
  switch (type) {
    case 'restart':
      return { icon: RotateCcw, ...neutral };
    case 'backup':
      return { icon: Archive, ...neutral };
    case 'command':
      return { icon: Terminal, ...neutral };
    default:
      return { icon: Clock, ...neutral };
  }
}
