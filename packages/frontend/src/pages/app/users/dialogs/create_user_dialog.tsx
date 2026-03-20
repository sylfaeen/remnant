import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AVAILABLE_PERMISSIONS } from '@remnant/shared';
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

type CreateUserFormData = {
  username: string;
  password: string;
  permissions: Array<string>;
};

type CreateUserDialogProps = {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
};

const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(128),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function CreateUserDialog({ onSubmit, onCancel, isLoading, error }: CreateUserDialogProps) {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<Array<string>>([]);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
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

  const handleSubmit = (data: CreateUserFormValues) => {
    onSubmit({ ...data, permissions }).then();
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
          <DialogIcon className={'bg-green-600/10 text-green-600'}>
            <UserPlus className={'size-4'} strokeWidth={2} />
          </DialogIcon>
          <div>
            <DialogTitle>{t('users.addUser')}</DialogTitle>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form id={'create-user'} onSubmit={form.handleSubmit(handleSubmit)}>
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
                    <FormLabel>{t('users.password')} *</FormLabel>
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
          <Button type={'submit'} form={'create-user'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('users.creating', 'Creating...') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
