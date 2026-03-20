import { useCallback, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Upload } from 'lucide-react';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Input } from '@remnant/frontend/features/ui/input';
import { Label } from '@remnant/frontend/features/ui/label';
import { Select } from '@remnant/frontend/features/ui/select';
import { Button } from '@remnant/frontend/features/ui/button';
import { FileTreeSelector } from '@remnant/frontend/features/ui/file_tree_selector';
import { Tooltip } from '@remnant/frontend/features/ui/tooltip';
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
      <Dialog.Content className={'max-w-2xl'}>
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
          <SftpAccountForm enabled={open} onClose={onOpenChange} {...{ serverId, account, isEditing }} />
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
  enabled: boolean;
  onClose: () => void;
};

function SftpAccountForm({ serverId, account, isEditing, enabled, onClose }: SftpAccountFormProps) {
  const { t } = useTranslation();

  const createSftpAccount = useCreateSftpAccount(serverId);
  const updateSftpAccount = useUpdateSftpAccount(serverId);

  const [username, setUsername] = useState(account?.username ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<SftpPermissions>(account?.permissions ?? 'read-write');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => new Set());

  const generateUsername = useCallback(() => {
    const adjectives = ['fast', 'cool', 'slim', 'bold', 'dark', 'wild', 'keen', 'warm', 'soft', 'safe'];
    const nouns = ['fox', 'owl', 'elk', 'ram', 'bee', 'ant', 'cat', 'bat', 'jay', 'yak'];
    const array = new Uint8Array(3);
    crypto.getRandomValues(array);
    const adj = adjectives[array[0] % adjectives.length];
    const noun = nouns[array[1] % nouns.length];
    const num = String(array[2] % 100).padStart(2, '0');
    setUsername(`${adj}-${noun}-${num}`);
  }, []);

  const generatePassword = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_=+';
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const generated = Array.from(array, (byte) => chars[byte % chars.length]).join('');
    setPassword(generated);
    setShowPassword(true);
  }, []);

  const usernameValid = /^[a-z_][a-z0-9_-]*$/.test(username) && username.length >= 1 && username.length <= 32;
  const passwordValid = isEditing ? password === '' || password.length >= 8 : password.length >= 8;
  const canSubmit = usernameValid && passwordValid && !(createSftpAccount.isPending || updateSftpAccount.isPending);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const allowedPaths = Array.from(selectedPaths);

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
        <div className={'flex gap-2'}>
          <Input
            type={'text'}
            id={'sftp-username'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('settings.ftp.dialog.usernamePlaceholder')}
          />
          <Tooltip.Provider delayDuration={300}>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button type={'button'} variant={'secondary'} size={'icon-lg'} onClick={generateUsername}>
                  <RefreshCw className={'size-3.5'} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                {t('settings.ftp.dialog.generate')}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        </div>
        <p className={'mt-1 text-xs text-zinc-400 dark:text-zinc-500'}>{t('settings.ftp.dialog.usernameHint')}</p>
        {username && !usernameValid && <p className={'mt-1 text-sm text-red-500'}>{t('settings.ftp.dialog.usernameHint')}</p>}
      </div>
      <div>
        <Label htmlFor={'sftp-password'}>{t('settings.ftp.dialog.password')}</Label>
        <div className={'flex gap-2'}>
          <Input
            type={showPassword ? 'text' : 'password'}
            id={'sftp-password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (showPassword) setShowPassword(false);
            }}
            placeholder={
              isEditing ? t('settings.ftp.dialog.passwordEditPlaceholder') : t('settings.ftp.dialog.passwordPlaceholder')
            }
          />
          <Tooltip.Provider delayDuration={300}>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button type={'button'} variant={'secondary'} size={'icon-lg'} onClick={generatePassword}>
                  <RefreshCw className={'size-3.5'} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>
                {t('settings.ftp.dialog.generate')}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        </div>
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
        <FileTreeSelector
          selectedPaths={selectedPaths}
          onSelectedPathsChange={setSelectedPaths}
          directoriesOnly
          {...{ serverId, enabled }}
        />
      </div>
    </form>
  );
}
