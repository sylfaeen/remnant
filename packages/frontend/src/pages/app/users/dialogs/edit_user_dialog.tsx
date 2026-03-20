import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AVAILABLE_PERMISSIONS, type UserResponse } from '@remnant/shared';
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
import { Input } from '@remnant/frontend/features/ui/shadcn/input';
import { Checkbox } from '@remnant/frontend/features/ui/shadcn/checkbox';
import { Label } from '@remnant/frontend/features/ui/shadcn/label';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@remnant/frontend/features/ui/shadcn/form';

type EditUserFormData = {
  username: string;
  password?: string;
  permissions: Array<string>;
};

type EditUserDialogProps = {
  user: UserResponse;
  onSubmit: (data: EditUserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
};

const editUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z
    .string()
    .max(128)
    .optional()
    .refine((val) => !val || val.length >= 8, { message: 'Minimum 8 characters' })
    .or(z.literal('')),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export function EditUserDialog({ user, onSubmit, onCancel, isLoading, error }: EditUserDialogProps) {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<Array<string>>(user.permissions);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      password: '',
    },
  });

  const togglePermission = (permission: string) => {
    if (permission === '*') {
      setPermissions(permissions.includes('*') ? [] : ['*']);
    } else {
      const newPermissions = permissions.filter((p) => p !== '*');
      if (newPermissions.includes(permission)) {
        setPermissions(newPermissions.filter((p) => p !== permission));
      } else {
        setPermissions([...newPermissions, permission]);
      }
    }
  };

  const handleSubmit = (data: EditUserFormValues) => {
    const formData: EditUserFormData = { username: data.username, permissions };
    if (data.password) {
      formData.password = data.password;
    }
    onSubmit(formData).then();
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
            <DialogTitle>{t('users.editUser')}</DialogTitle>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form id={'edit-user'} onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogBody>
              {error && <DialogError>{error}</DialogError>}
              <FormField
                control={form.control}
                name={'username'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.username')} *</FormLabel>
                    <FormControl>
                      <Input type={'text'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'password'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('users.password')} {t('users.passwordHint')}
                    </FormLabel>
                    <FormControl>
                      <Input type={'password'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <span className={'mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400'}>
                  {t('users.permissions')}
                </span>
                <div className={'space-y-2'}>
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <Label key={permission} className={'flex cursor-pointer items-center gap-2'}>
                      <Checkbox checked={permissions.includes(permission)} onCheckedChange={() => togglePermission(permission)} />
                      <span className={'text-zinc-600 dark:text-zinc-400'}>
                        {permission === '*' ? t('users.allPermissions') : permission}
                      </span>
                    </Label>
                  ))}
                </div>
              </div>
            </DialogBody>
          </form>
        </Form>
        <DialogFooter>
          <Button type={'button'} variant={'secondary'} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'edit-user'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('users.saving') : t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
