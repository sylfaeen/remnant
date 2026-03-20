import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { Input } from '@remnant/frontend/features/ui/shadcn/input';
import { Checkbox } from '@remnant/frontend/features/ui/shadcn/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@remnant/frontend/features/ui/shadcn/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@remnant/frontend/features/ui/shadcn/form';
import { FileTreeSelector } from '@remnant/frontend/features/ui/file_tree_selector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@remnant/frontend/features/ui/shadcn/dialog';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import {
  CRON_PRESETS,
  getTaskTypes,
  type CreateTaskInput,
  type ScheduledTask,
  type TaskType,
} from '@remnant/frontend/hooks/use_tasks';

const editTaskSchema = z.object({
  name: z.string().min(1),
  cronPreset: z.string(),
  customCron: z.string().optional(),
  command: z.string().optional(),
  warnPlayers: z.boolean().default(true),
  warnMessage: z.string().default('The server will restart in 30 seconds...'),
  warnSeconds: z.coerce.number().min(5).max(300).default(30),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

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
      <DialogContent className={'max-w-2xl'}>
        <DialogHeader>
          <DialogIcon className={'bg-cyan-600/10 text-cyan-600'}>
            <Pencil className={'size-4'} strokeWidth={2} />
          </DialogIcon>
          <div>
            <DialogTitle>{t('tasks.editTask')}</DialogTitle>
            <DialogDescription>{t('tasks.subtitle')}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody>
          <EditTaskForm {...{ serverId, task, onSubmit, isLoading }} />
        </DialogBody>
        <DialogFooter>
          <Button type={'button'} variant={'secondary'} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'edit-task-form'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('tasks.saving') : t('tasks.saveTask')}
          </Button>
        </DialogFooter>
      </DialogContent>
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

  const initialCronPreset = CRON_PRESETS.some((p) => p.value === task.schedule) ? task.schedule : '';

  const inferredType: TaskType =
    task.command === 'restart' ? 'restart' : task.command.startsWith('backup') ? 'backup' : 'command';
  const [taskType, setTaskType] = useState<TaskType>(inferredType);
  const [backupPaths, setBackupPaths] = useState<Set<string>>(() => new Set());

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: task.name,
      cronPreset: initialCronPreset,
      customCron: initialCronPreset === '' ? task.schedule : '',
      command: task.command,
      warnPlayers: true,
      warnMessage: 'The server will restart in 30 seconds...',
      warnSeconds: 30,
    },
  });

  const cronPreset = form.watch('cronPreset');
  const warnPlayers = form.watch('warnPlayers');

  const taskTypes = getTaskTypes(t);

  const handleFormSubmit = (data: EditTaskFormValues) => {
    const cronExpression = data.cronPreset === '' ? (data.customCron ?? '') : data.cronPreset;
    if (!cronExpression) {
      alert(t('tasks.cronRequired'));
      return;
    }

    let command = '';
    if (taskType === 'command') {
      command = data.command ?? '';
    } else if (taskType === 'backup') {
      command = `backup ${Array.from(backupPaths).join(' ')}`;
    } else if (taskType === 'restart') {
      command = 'restart';
    }

    onSubmit({
      name: data.name,
      command,
      schedule: cronExpression,
    }).then();
  };

  return (
    <Form {...form}>
      <form id={'edit-task-form'} className={'space-y-6'} onSubmit={form.handleSubmit(handleFormSubmit)}>
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('tasks.taskName')}</FormLabel>
              <FormControl>
                <Input type={'text'} placeholder={t('tasks.taskNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>{t('tasks.taskType')}</FormLabel>
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
        <FormField
          control={form.control}
          name={'cronPreset'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('tasks.schedule')}</FormLabel>
              <Select
                value={field.value || '__custom__'}
                onValueChange={(val) => field.onChange(val === '__custom__' ? '' : val)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CRON_PRESETS.map((preset) => (
                    <SelectItem key={preset.value || '__custom__'} value={preset.value || '__custom__'}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {cronPreset === '' && (
          <FormField
            control={form.control}
            name={'customCron'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tasks.customCron')}</FormLabel>
                <FormControl>
                  <Input type={'text'} placeholder={'* * * * *'} className={'font-jetbrains'} {...field} />
                </FormControl>
                <p className={'mt-1.5 text-sm text-zinc-600 dark:text-zinc-400'}>{t('tasks.cronFormat')}</p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {taskType === 'command' && (
          <FormField
            control={form.control}
            name={'command'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tasks.commandToExecute')}</FormLabel>
                <FormControl>
                  <Input type={'text'} placeholder={t('tasks.commandPlaceholder')} className={'font-jetbrains'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {taskType === 'backup' && (
          <div>
            <FormLabel className={'mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400'}>
              {t('backups.dialogDescription')}
            </FormLabel>
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
            <FormField
              control={form.control}
              name={'warnPlayers'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={'flex cursor-pointer items-center gap-2'}>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <span className={'text-zinc-600 dark:text-zinc-400'}>{t('tasks.warnPlayers')}</span>
                  </FormLabel>
                </FormItem>
              )}
            />
            {warnPlayers && (
              <>
                <FormField
                  control={form.control}
                  name={'warnMessage'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={'mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400'}>
                        {t('tasks.warnMessage')}
                      </FormLabel>
                      <FormControl>
                        <Input type={'text'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'warnSeconds'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tasks.warnDelay')}</FormLabel>
                      <FormControl>
                        <Input type={'number'} min={5} max={300} className={'w-24'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}
