import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { Input } from '@remnant/frontend/features/ui/input';
import { Checkbox } from '@remnant/frontend/features/ui/checkbox';
import { Label } from '@remnant/frontend/features/ui/label';
import { Select } from '@remnant/frontend/features/ui/select';
import { FileTreeSelector } from '@remnant/frontend/features/ui/file_tree_selector';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Button } from '@remnant/frontend/features/ui/button';
import {
  CRON_PRESETS,
  getTaskTypes,
  type CreateTaskInput,
  type ScheduledTask,
  type TaskConfig,
  type TaskType,
} from '@remnant/frontend/hooks/use_tasks';

type EditTaskDialogProps = {
  serverId: number;
  task: ScheduledTask;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
};

export function EditTaskDialog({ serverId, task, onSubmit, onCancel, isLoading }: EditTaskDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <Dialog.Content className={'max-w-2xl'}>
        <Dialog.Header>
          <Dialog.Icon className={'bg-cyan-600/10 text-cyan-600'}>
            <Pencil className={'size-4'} strokeWidth={2} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('tasks.editTask')}</Dialog.Title>
            <Dialog.Description>{t('tasks.subtitle')}</Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Body>
          <EditTaskForm {...{ serverId, task, onSubmit, isLoading }} />
        </Dialog.Body>
        <Dialog.Footer>
          <Button type={'button'} variant={'secondary'} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'edit-task-form'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('tasks.saving') : t('tasks.saveTask')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

type EditTaskFormProps = {
  serverId: number;
  task: ScheduledTask;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  isLoading: boolean;
};

function EditTaskForm({ serverId, task, onSubmit }: EditTaskFormProps) {
  const { t } = useTranslation();

  const initialCronPreset = CRON_PRESETS.some((p) => p.value === task.cron_expression) ? task.cron_expression : '';

  const [taskName, setTaskName] = useState(task.name);
  const [taskType, setTaskType] = useState<TaskType>(task.type as TaskType);
  const [cronPreset, setCronPreset] = useState(initialCronPreset);
  const [customCron, setCustomCron] = useState(initialCronPreset === '' ? task.cron_expression : '');
  const [command, setCommand] = useState(task.config?.command ?? '');
  const [backupPaths, setBackupPaths] = useState<Set<string>>(() => new Set(task.config?.backup_paths ?? []));
  const [warnPlayers, setWarnPlayers] = useState(task.config?.warn_players ?? true);
  const [warnMessage, setWarnMessage] = useState(task.config?.warn_message ?? 'The server will restart in 30 seconds...');
  const [warnSeconds, setWarnSeconds] = useState(task.config?.warn_seconds ?? 30);

  const taskTypes = getTaskTypes(t);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cronExpression = cronPreset === '' ? customCron : cronPreset;
    if (!cronExpression) {
      alert(t('tasks.cronRequired'));
      return;
    }

    const config: TaskConfig = {};
    if (taskType === 'command') {
      config.command = command;
    } else if (taskType === 'backup') {
      config.backup_paths = Array.from(backupPaths);
    } else if (taskType === 'restart') {
      if (warnPlayers) {
        config.warn_players = true;
        config.warn_message = warnMessage;
        config.warn_seconds = warnSeconds;
      }
    }

    onSubmit({
      name: taskName,
      type: taskType,
      cron_expression: cronExpression,
      enabled: task.enabled,
      config,
    }).then();
  };

  return (
    <form id={'edit-task-form'} onSubmit={handleSubmit}>
      <div className={'space-y-5'}>
        <div>
          <Label htmlFor={'task-name'}>{t('tasks.taskName')}</Label>
          <Input
            name={'task-name'}
            type={'text'}
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            placeholder={t('tasks.taskNamePlaceholder')}
          />
        </div>
        <div>
          <label className={'mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400'}>{t('tasks.taskType')}</label>
          <div className={'grid grid-cols-3 gap-2'}>
            {taskTypes.map((type) => {
              const Icon = type.icon;
              const isActive = taskType === type.value;
              return (
                <button
                  key={type.value}
                  type={'button'}
                  onClick={() => setTaskType(type.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all',
                    isActive
                      ? type.activeClass
                      : 'border-black/6 bg-zinc-50/50 text-zinc-600 hover:border-black/12 hover:bg-zinc-50 dark:border-white/6 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-white/12 dark:hover:bg-zinc-800'
                  )}
                >
                  <Icon
                    className={cn(
                      'mb-2 size-4 transition-colors',
                      isActive ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'
                    )}
                    strokeWidth={2}
                  />
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-400'
                    )}
                  >
                    {type.label}
                  </div>
                  <div className={'mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400'}>{type.description}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label htmlFor={'cron-preset'}>{t('tasks.schedule')}</Label>
          <Select name={'cron-preset'} value={cronPreset} onChange={(e) => setCronPreset(e.target.value)}>
            {CRON_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </Select>
        </div>
        {cronPreset === '' && (
          <div>
            <Label htmlFor={'custom-cron'}>{t('tasks.customCron')}</Label>
            <Input
              name={'custom-cron'}
              type={'text'}
              value={customCron}
              onChange={(e) => setCustomCron(e.target.value)}
              placeholder={'* * * * *'}
              className={'font-jetbrains'}
            />
            <p className={'mt-1.5 text-sm text-zinc-600 dark:text-zinc-400'}>{t('tasks.cronFormat')}</p>
          </div>
        )}
        {taskType === 'command' && (
          <div>
            <Label htmlFor={'command'}>{t('tasks.commandToExecute')}</Label>
            <Input
              name={'command'}
              type={'text'}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              required
              placeholder={t('tasks.commandPlaceholder')}
              className={'font-jetbrains'}
            />
          </div>
        )}
        {taskType === 'backup' && (
          <div>
            <Label htmlFor={'backup-paths'} className={'mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400'}>
              {t('backups.dialogDescription')}
            </Label>
            <FileTreeSelector
              enabled={true}
              selectedPaths={backupPaths}
              onSelectedPathsChange={setBackupPaths}
              {...{ serverId }}
            />
          </div>
        )}
        {taskType === 'restart' && (
          <div className={'space-y-3'}>
            <Label htmlFor={'warn-players'} className={'flex cursor-pointer items-center gap-2'}>
              <Checkbox
                name={'warn-players'}
                checked={warnPlayers}
                onCheckedChange={(checked) => setWarnPlayers(checked === true)}
              />
              <span className={'text-zinc-600 dark:text-zinc-400'}>{t('tasks.warnPlayers')}</span>
            </Label>
            {warnPlayers && (
              <>
                <div>
                  <Label htmlFor={'warn-message'} className={'mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400'}>
                    {t('tasks.warnMessage')}
                  </Label>
                  <Input
                    name={'warn-message'}
                    type={'text'}
                    value={warnMessage}
                    onChange={(e) => setWarnMessage(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={'warn-delay'}>{t('tasks.warnDelay')}</Label>
                  <Input
                    name={'warn-delay'}
                    type={'number'}
                    value={warnSeconds}
                    onChange={(e) => setWarnSeconds(parseInt(e.target.value) || 30)}
                    min={5}
                    max={300}
                    className={'w-24'}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
