import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { AVAILABLE_PERMISSIONS } from '@remnant/shared';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Input } from '@remnant/frontend/features/ui/input';
import { Checkbox } from '@remnant/frontend/features/ui/checkbox';
import { Label } from '@remnant/frontend/features/ui/label';
import { Button } from '@remnant/frontend/features/ui/button';

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

export function CreateUserDialog({ onSubmit, onCancel, isLoading, error }: CreateUserDialogProps) {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Array<string>>([]);

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
    onSubmit({ username, password, permissions }).then();
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
          <Dialog.Icon className={'bg-emerald-600/10 text-emerald-600'}>
            <UserPlus className={'size-5'} strokeWidth={1.75} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('users.addUser')}</Dialog.Title>
          </div>
        </Dialog.Header>
        <form id={'create-user'} onSubmit={handleSubmit}>
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
              <Label htmlFor={'password'}>{t('users.password')} *</Label>
              <Input
                type={'password'}
                id={'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
            </div>
            <div>
              <span className={'mb-1.5 block text-sm font-medium text-zinc-600'}>{t('users.permissions')}</span>
              <div className={'space-y-2'}>
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <Label key={permission} className={'flex cursor-pointer items-center gap-2'}>
                    <Checkbox checked={permissions.includes(permission)} onCheckedChange={() => togglePermission(permission)} />
                    <span className={'text-zinc-600'}>{permission === '*' ? t('users.allPermissions') : permission}</span>
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
          <Button type={'submit'} form={'create-user'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('users.creating', 'Creating...') : t('common.create')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
