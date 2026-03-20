import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
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
  type ScheduledTask,
  type TaskExecution,
  type CreateTaskInput,
} from '@remnant/frontend/hooks/use_tasks';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { CreateTaskDialog } from '@remnant/frontend/pages/app/servers/dialogs/create_task_dialog';
import { EditTaskDialog } from '@remnant/frontend/pages/app/servers/dialogs/edit_task_dialog';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@remnant/frontend/features/ui/shadcn/tooltip';

export function ServerTasksPage() {
  const { t } = useTranslation();

  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const { isLoading: serverLoading } = useServer(serverId || 0);

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
      </ServerPageHeader>
      <PageContent>
        <FeatureCard.Stack>
          <TasksSection {...{ serverId }} />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

type TasksSectionProps = {
  serverId: number;
};

function TasksSection({ serverId }: TasksSectionProps) {
  const { t } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: tasksData, isLoading: tasksLoading } = useTasks(serverId);
  const createTask = useCreateTask(serverId);
  const updateTask = useUpdateTask(serverId);
  const deleteTask = useDeleteTask(serverId);
  const toggleTask = useToggleTask(serverId);

  const tasks = tasksData?.tasks;
  const enabledCount = tasks?.filter((task) => task.enabled).length ?? 0;

  const handleCreateTask = async (input: CreateTaskInput) => {
    await createTask.mutateAsync(input);
    setShowForm(false);
  };

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return;
    await updateTask.mutateAsync({ taskId: editingTask.id, input });
    setEditingTask(null);
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

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title count={tasks && tasks.length > 0 && `${enabledCount}/${tasks.length}`}>
            {t('tasks.title')}
          </FeatureCard.Title>
          <FeatureCard.Description>{t('tasks.subtitle')}</FeatureCard.Description>
        </FeatureCard.Content>
        <FeatureCard.Actions>
          <Button onClick={() => setShowForm(true)}>
            <Plus className={'size-4'} />
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
        </FeatureCard.Actions>
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
                deletePending={deleteTask.isPending}
                onToggle={handleToggle}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                onToggleConfirm={setToggleConfirm}
                onDeleteConfirm={setDeleteConfirm}
                {...{ serverId, task, toggleConfirm, deleteConfirm }}
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
            <Terminal className={'size-4'} strokeWidth={2} />
          </div>
          <div className={cn('min-w-0', !task.enabled && 'opacity-50')}>
            <div className={'flex items-center gap-2'}>
              <span className={'font-medium text-zinc-800 dark:text-zinc-200'}>{task.name}</span>
              <Badge variant={'outline'} className={'font-semibold'}>
                {t(`tasks.types.${task.type}`)}
              </Badge>
              {!task.enabled && <Badge variant={'secondary'}>{t('tasks.disabled')}</Badge>}
              <ChevronDown
                className={cn('size-3.5 text-zinc-400 transition-transform dark:text-zinc-500', expanded && 'rotate-180')}
              />
            </div>
            <div className={'flex items-center gap-2 text-sm'}>
              <span className={'text-zinc-600 dark:text-zinc-400'}>{formatCronExpression(task.schedule)}</span>
              <span className={'font-jetbrains text-sm text-zinc-600 dark:text-zinc-400'}>({task.schedule})</span>
            </div>
            {task.lastRun && (
              <div className={'flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400'}>
                <Clock className={'size-3'} strokeWidth={2} />
                <span>
                  {t('tasks.lastRun')}: {new Date(task.lastRun).toLocaleString()}
                </span>
              </div>
            )}
            {task.command && (
              <div
                className={
                  'font-jetbrains mt-2 inline-block rounded-md border border-black/10 bg-zinc-100/80 px-2.5 py-1 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-400'
                }
              >
                <span className={'mr-1.5 text-zinc-600 dark:text-zinc-400'}>$</span>
                {task.command}
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
                variant={'destructive'}
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
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                    {task.enabled ? t('tasks.tooltipDisable') : t('tasks.tooltipEnable')}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={'ghost'}
                      size={'icon-sm'}
                      onClick={() => onEdit(task)}
                      className={'text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-400'}
                    >
                      <Pencil className={'size-4'} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('tasks.tooltipEdit')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={'ghost-destructive'} size={'icon-sm'} onClick={() => onDeleteConfirm(task.id)}>
                      <Trash2 className={'size-4'} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('tasks.tooltipDelete')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                  {new Date(exec.executedAt).toLocaleString()}
                </span>
              </div>
              <div className={'space-x-2'}>
                {exec.output && exec.status === 'failure' && (
                  <span className={'truncate text-[11px] text-red-400'}>{exec.output}</span>
                )}
                <span className={'font-jetbrains text-[11px] text-zinc-600 tabular-nums dark:text-zinc-400'}>
                  {t('tasks.duration', { ms: exec.duration })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
