import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { AVAILABLE_PERMISSIONS, type UserResponse } from '@remnant/shared';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Input } from '@remnant/frontend/features/ui/input';
import { Checkbox } from '@remnant/frontend/features/ui/checkbox';
import { Label } from '@remnant/frontend/features/ui/label';
import { Button } from '@remnant/frontend/features/ui/button';

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

export function EditUserDialog({ user, onSubmit, onCancel, isLoading, error }: EditUserDialogProps) {
  const { t } = useTranslation();

  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Array<string>>(user.permissions);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: EditUserFormData = { username, permissions };
    if (password) {
      data.password = password;
    }
    onSubmit(data).then();
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon className={'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'}>
            <Pencil className={'size-5'} strokeWidth={1.75} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('users.editUser')}</Dialog.Title>
          </div>
        </Dialog.Header>
        <form id={'edit-user'} onSubmit={handleSubmit}>
          <Dialog.Body>
            {error && <Dialog.Error>{error}</Dialog.Error>}
            <div>
              <Label htmlFor={'username'}>{t('users.username')} *</Label>
              <Input
                type={'text'}
                id={'username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                pattern={'^[a-zA-Z0-9_-]+$'}
              />
            </div>
            <div>
              <Label htmlFor={'password'}>
                {t('users.password')} {t('users.passwordHint')}
              </Label>
              <Input
                type={'password'}
                id={'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={128}
              />
            </div>
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
          </Dialog.Body>
        </form>
        <Dialog.Footer>
          <Button type={'button'} variant={'secondary'} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'edit-user'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('users.saving') : t('common.save', 'Save')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
