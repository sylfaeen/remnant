import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Upload, X } from 'lucide-react';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Input } from '@remnant/frontend/features/ui/input';
import { Label } from '@remnant/frontend/features/ui/label';
import { Select } from '@remnant/frontend/features/ui/select';
import { Button } from '@remnant/frontend/features/ui/button';
import { useCreateSftpAccount, useUpdateSftpAccount } from '@remnant/frontend/hooks/use_sftp';
import type { SftpAccountResponse, SftpPermissions } from '@remnant/shared';

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
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon className={'bg-blue-600/10 text-blue-600'}>
            <Upload className={'size-4'} strokeWidth={2} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{isEditing ? t('settings.ftp.dialog.editTitle') : t('settings.ftp.dialog.createTitle')}</Dialog.Title>
            <Dialog.Description>
              {isEditing ? t('settings.ftp.dialog.editDescription') : t('settings.ftp.dialog.createDescription')}
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Body>
          <SftpAccountForm onClose={onOpenChange} {...{ serverId, account, isEditing }} />
        </Dialog.Body>
        <Dialog.Footer>
          <Button type={'button'} variant={'secondary'} onClick={onOpenChange}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'sftp-account-form'}>
            {isEditing ? t('settings.ftp.dialog.save') : t('settings.ftp.dialog.create')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

type SftpAccountFormProps = {
  serverId: number;
  account: SftpAccountResponse | null;
  isEditing: boolean;
  onClose: () => void;
};

function SftpAccountForm({ serverId, account, isEditing, onClose }: SftpAccountFormProps) {
  const { t } = useTranslation();

  const createSftpAccount = useCreateSftpAccount(serverId);
  const updateSftpAccount = useUpdateSftpAccount(serverId);

  const [username, setUsername] = useState(account?.username ?? '');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<SftpPermissions>(account?.permissions ?? 'read-write');
  const [allowedPaths, setAllowedPaths] = useState<Array<string>>(account?.allowedPaths ?? []);
  const [newPath, setNewPath] = useState('');

  const usernameValid = /^[a-z_][a-z0-9_-]*$/.test(username) && username.length >= 1 && username.length <= 32;
  const passwordValid = isEditing ? password === '' || password.length >= 8 : password.length >= 8;
  const canSubmit = usernameValid && passwordValid && !(createSftpAccount.isPending || updateSftpAccount.isPending);

  const handleAddPath = () => {
    const trimmed = newPath.trim();
    if (trimmed && !allowedPaths.includes(trimmed)) {
      setAllowedPaths([...allowedPaths, trimmed]);
      setNewPath('');
    }
  };

  const handleRemovePath = (index: number) => {
    setAllowedPaths(allowedPaths.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (isEditing && account) {
      await updateSftpAccount.mutateAsync({
        id: account.id,
        username: username !== account.username ? username : undefined,
        password: password.length > 0 ? password : undefined,
        permissions,
        allowedPaths,
      });
    } else {
      await createSftpAccount.mutateAsync({
        username,
        password,
        permissions,
        allowedPaths,
      });
    }

    onClose();
  };

  return (
    <form id={'sftp-account-form'} className={'space-y-4'} onSubmit={handleSubmit}>
      <div>
        <Label htmlFor={'sftp-username'}>{t('settings.ftp.dialog.username')}</Label>
        <Input
          type={'text'}
          id={'sftp-username'}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('settings.ftp.dialog.usernamePlaceholder')}
        />
        <p className={'mt-1 text-xs text-zinc-400 dark:text-zinc-500'}>{t('settings.ftp.dialog.usernameHint')}</p>
        {username && !usernameValid && <p className={'mt-1 text-sm text-red-500'}>{t('settings.ftp.dialog.usernameHint')}</p>}
      </div>
      <div>
        <Label htmlFor={'sftp-password'}>{t('settings.ftp.dialog.password')}</Label>
        <Input
          type={'password'}
          id={'sftp-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            isEditing ? t('settings.ftp.dialog.passwordEditPlaceholder') : t('settings.ftp.dialog.passwordPlaceholder')
          }
        />
        {password && password.length < 8 && (
          <p className={'mt-1 text-sm text-red-500'}>{t('settings.ftp.dialog.passwordPlaceholder')}</p>
        )}
      </div>
      <div>
        <Label htmlFor={'sftp-permissions'}>{t('settings.ftp.dialog.permissions')}</Label>
        <Select id={'sftp-permissions'} value={permissions} onChange={(e) => setPermissions(e.target.value as SftpPermissions)}>
          <option value={'read-only'}>{t('settings.ftp.dialog.permissionReadOnly')}</option>
          <option value={'read-write'}>{t('settings.ftp.dialog.permissionReadWrite')}</option>
        </Select>
      </div>
      <div>
        <Label>{t('settings.ftp.dialog.allowedPaths')}</Label>
        <p className={'mb-2 text-xs text-zinc-400 dark:text-zinc-500'}>{t('settings.ftp.dialog.allowedPathsHint')}</p>
        {allowedPaths.length > 0 && (
          <div className={'mb-2 flex flex-wrap gap-1.5'}>
            {allowedPaths.map((path, index) => (
              <span
                key={path}
                className={'inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800'}
              >
                <span className={'font-jetbrains text-zinc-700 dark:text-zinc-300'}>{path}</span>
                <button
                  type={'button'}
                  onClick={() => handleRemovePath(index)}
                  className={'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}
                >
                  <X className={'size-3'} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={'flex gap-2'}>
          <Input
            type={'text'}
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder={t('settings.ftp.dialog.pathPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddPath();
              }
            }}
          />
          <Button type={'button'} variant={'secondary'} size={'lg'} onClick={handleAddPath} disabled={!newPath.trim()}>
            <Plus className={'size-3.5'} />
            {t('settings.ftp.dialog.addPath')}
          </Button>
        </div>
      </div>
    </form>
  );
}
