import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, Upload } from 'lucide-react';
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
import { Input } from '@remnant/frontend/features/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@remnant/frontend/features/ui/shadcn/select';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@remnant/frontend/features/ui/shadcn/form';
import { FileTreeSelector } from '@remnant/frontend/features/ui/file_tree_selector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@remnant/frontend/features/ui/shadcn/tooltip';
import { useCreateSftpAccount, useUpdateSftpAccount } from '@remnant/frontend/hooks/use_sftp';
import type { SftpAccountResponse } from '@remnant/shared';

const sftpAccountSchema = (isEditing: boolean) =>
  z.object({
    username: z
      .string()
      .min(1)
      .max(32)
      .regex(/^[a-z_][a-z0-9_-]*$/),
    password: isEditing
      ? z.string().refine((val) => val === '' || val.length >= 8, { message: 'Minimum 8 characters' })
      : z.string().min(8),
    permissions: z.enum(['read-only', 'read-write']).default('read-only'),
  });

type SftpAccountFormValues = z.infer<ReturnType<typeof sftpAccountSchema>>;

type SftpAccountDialogProps = {
  open: boolean;
  onOpenChange: () => void;
  serverId: number;
  account: SftpAccountResponse | null;
};

export function SftpAccountDialog({ open, onOpenChange, serverId, account }: SftpAccountDialogProps) {
  const { t } = useTranslation();
  const isEditing = account !== null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange()}>
      <DialogContent className={'max-w-2xl'}>
        <DialogHeader>
          <DialogIcon className={'bg-blue-600/10 text-blue-600'}>
            <Upload className={'size-4'} strokeWidth={2} />
          </DialogIcon>
          <div>
            <DialogTitle>{isEditing ? t('settings.ftp.dialog.editTitle') : t('settings.ftp.dialog.createTitle')}</DialogTitle>
            <DialogDescription>
              {isEditing ? t('settings.ftp.dialog.editDescription') : t('settings.ftp.dialog.createDescription')}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody>
          <SftpAccountForm enabled={open} onClose={onOpenChange} {...{ serverId, account, isEditing }} />
        </DialogBody>
        <DialogFooter>
          <Button type={'button'} variant={'secondary'} onClick={onOpenChange}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'sftp-account-form'}>
            {isEditing ? t('settings.ftp.dialog.save') : t('settings.ftp.dialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type SftpAccountFormProps = {
  serverId: number;
  account: SftpAccountResponse | null;
  isEditing: boolean;
  enabled: boolean;
  onClose: () => void;
};

function SftpAccountForm({ serverId, account, isEditing, enabled, onClose }: SftpAccountFormProps) {
  const { t } = useTranslation();

  const createSftpAccount = useCreateSftpAccount(serverId);
  const updateSftpAccount = useUpdateSftpAccount(serverId);

  const form = useForm<SftpAccountFormValues>({
    resolver: zodResolver(sftpAccountSchema(isEditing)),
    defaultValues: {
      username: account?.username ?? '',
      password: '',
      permissions: account?.permissions ?? 'read-write',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => new Set());

  const generateUsername = useCallback(() => {
    const adjectives = ['fast', 'cool', 'slim', 'bold', 'dark', 'wild', 'keen', 'warm', 'soft', 'safe'];
    const nouns = ['fox', 'owl', 'elk', 'ram', 'bee', 'ant', 'cat', 'bat', 'jay', 'yak'];
    const array = new Uint8Array(3);
    crypto.getRandomValues(array);
    const adj = adjectives[array[0] % adjectives.length];
    const noun = nouns[array[1] % nouns.length];
    const num = String(array[2] % 100).padStart(2, '0');
    form.setValue('username', `${adj}-${noun}-${num}`, { shouldValidate: true });
  }, [form]);

  const generatePassword = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_=+';
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const generated = Array.from(array, (byte) => chars[byte % chars.length]).join('');
    form.setValue('password', generated, { shouldValidate: true });
    setShowPassword(true);
  }, [form]);

  const handleFormSubmit = async (data: SftpAccountFormValues) => {
    const allowedPaths = Array.from(selectedPaths);

    if (isEditing && account) {
      await updateSftpAccount.mutateAsync({
        id: account.id,
        username: data.username !== account.username ? data.username : undefined,
        password: data.password.length > 0 ? data.password : undefined,
        permissions: data.permissions,
        allowedPaths,
      });
    } else {
      await createSftpAccount.mutateAsync({
        username: data.username,
        password: data.password,
        permissions: data.permissions,
        allowedPaths,
      });
    }

    onClose();
  };

  return (
    <Form {...form}>
      <form id={'sftp-account-form'} className={'space-y-4'} onSubmit={form.handleSubmit(handleFormSubmit)}>
        <FormField
          control={form.control}
          name={'username'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.ftp.dialog.username')}</FormLabel>
              <div className={'flex gap-2'}>
                <FormControl>
                  <Input type={'text'} placeholder={t('settings.ftp.dialog.usernamePlaceholder')} {...field} />
                </FormControl>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type={'button'} variant={'secondary'} size={'icon-lg'} onClick={generateUsername}>
                        <RefreshCw className={'size-3.5'} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                      {t('settings.ftp.dialog.generate')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormDescription className={'text-xs text-zinc-400 dark:text-zinc-500'}>
                {t('settings.ftp.dialog.usernameHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'password'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.ftp.dialog.password')}</FormLabel>
              <div className={'flex gap-2'}>
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={
                      isEditing ? t('settings.ftp.dialog.passwordEditPlaceholder') : t('settings.ftp.dialog.passwordPlaceholder')
                    }
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (showPassword) setShowPassword(false);
                    }}
                  />
                </FormControl>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type={'button'} variant={'secondary'} size={'icon-lg'} onClick={generatePassword}>
                        <RefreshCw className={'size-3.5'} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                      {t('settings.ftp.dialog.generate')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'permissions'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.ftp.dialog.permissions')}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={'read-only'}>{t('settings.ftp.dialog.permissionReadOnly')}</SelectItem>
                  <SelectItem value={'read-write'}>{t('settings.ftp.dialog.permissionReadWrite')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>{t('settings.ftp.dialog.allowedPaths')}</FormLabel>
          <p className={'mb-2 text-xs text-zinc-400 dark:text-zinc-500'}>{t('settings.ftp.dialog.allowedPathsHint')}</p>
          <FileTreeSelector
            selectedPaths={selectedPaths}
            onSelectedPathsChange={setSelectedPaths}
            directoriesOnly
            {...{ serverId, enabled }}
          />
        </div>
      </form>
    </Form>
  );
}
