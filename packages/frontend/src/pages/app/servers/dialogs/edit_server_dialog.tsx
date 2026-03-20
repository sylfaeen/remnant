import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderOpen, Package, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogError,
} from '@remnant/frontend/features/ui/shadcn/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@remnant/frontend/features/ui/shadcn/form';
import { Input } from '@remnant/frontend/features/ui/shadcn/input';
import { Checkbox } from '@remnant/frontend/features/ui/shadcn/checkbox';
import { Label } from '@remnant/frontend/features/ui/shadcn/label';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import type { ServerResponse } from '@remnant/shared';

const editServerSchema = z.object({
  name: z.string().min(1),
  min_ram: z.string().default('2G'),
  max_ram: z.string().default('4G'),
  jvm_flags: z.string().default(''),
  java_port: z.coerce.number().min(1024).max(65535).default(25565),
  auto_start: z.boolean().default(true),
});

type EditServerFormValues = z.infer<typeof editServerSchema>;

type EditServerDialogProps = {
  server: ServerResponse;
  onSubmit: (data: EditServerFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
};

export function EditServerDialog({ server, onSubmit, onCancel, isLoading, error }: EditServerDialogProps) {
  const { t } = useTranslation();

  const form = useForm<EditServerFormValues>({
    resolver: zodResolver(editServerSchema),
    defaultValues: {
      name: server.name,
      min_ram: server.min_ram,
      max_ram: server.max_ram,
      jvm_flags: server.jvm_flags,
      java_port: server.java_port,
      auto_start: server.auto_start,
    },
  });

  const onFormSubmit = (data: EditServerFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogIcon className={'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'}>
            <Pencil className={'size-4'} strokeWidth={2} />
          </DialogIcon>
          <div>
            <DialogTitle>{t('servers.editServer')}</DialogTitle>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form id={'edit-server'} onSubmit={form.handleSubmit(onFormSubmit)}>
            <DialogBody>
              {error && <DialogError>{error}</DialogError>}
              <FormField
                control={form.control}
                name={'name'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('servers.serverName')} *</FormLabel>
                    <FormControl>
                      <Input type={'text'} placeholder={t('servers.serverNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {server.path && (
                <div>
                  <Label>{t('servers.serverPath')}</Label>
                  <div
                    className={
                      'font-jetbrains flex items-center gap-2 rounded-lg border border-black/10 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400'
                    }
                  >
                    <FolderOpen className={'size-4 shrink-0'} />
                    <span className={'truncate'}>{server.path}</span>
                  </div>
                </div>
              )}
              {server.jar_file && (
                <div>
                  <Label>{t('servers.jarFile')}</Label>
                  <div
                    className={
                      'font-jetbrains flex items-center gap-2 rounded-lg border border-black/10 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400'
                    }
                  >
                    <Package className={'size-4 shrink-0'} />
                    <span className={'truncate'}>{server.jar_file}</span>
                  </div>
                  <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>
                    {t('servers.jarHint', 'Change the active JAR file in server settings')}
                  </p>
                </div>
              )}
              <div className={'grid grid-cols-2 gap-4'}>
                <FormField
                  control={form.control}
                  name={'min_ram'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('servers.minRam')}</FormLabel>
                      <FormControl>
                        <Input type={'text'} placeholder={'2G'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'max_ram'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('servers.maxRam')}</FormLabel>
                      <FormControl>
                        <Input type={'text'} placeholder={'4G'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={'java_port'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('servers.port')}</FormLabel>
                    <FormControl>
                      <Input
                        type={'number'}
                        min={1024}
                        max={65535}
                        className={'w-32'}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'jvm_flags'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('servers.jvmFlagsAdditional')}</FormLabel>
                    <FormControl>
                      <Input type={'text'} placeholder={'-XX:+UseG1GC'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'auto_start'}
                render={({ field }) => (
                  <FormItem className={'flex cursor-pointer items-center gap-2'}>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className={'text-zinc-600 dark:text-zinc-400'}>{t('servers.autoStartDesc')}</FormLabel>
                  </FormItem>
                )}
              />
            </DialogBody>
          </form>
        </Form>
        <DialogFooter>
          <Button type={'button'} variant={'secondary'} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'edit-server'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('servers.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
