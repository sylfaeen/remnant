import { useState, useCallback } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Check, Copy, FolderOpen, HardDrive, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import { useSftpInfo, useSftpAccounts, useDeleteSftpAccount } from '@remnant/frontend/hooks/use_sftp';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { SftpAccountDialog } from '@remnant/frontend/pages/app/servers/dialogs/sftp_account_dialog';
import type { SftpAccountResponse } from '@remnant/shared';

export function ServerSettingsFtpPage() {
  const { t } = useTranslation();
  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const { isLoading: serverLoading } = useServer(serverId || 0);

  if (!serverId || isNaN(serverId)) {
    return <PageError message={t('errors.generic')} />;
  }

  if (serverLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <ServerPageHeader>
        <ServerPageHeader.Left>
          <ServerPageHeader.Icon icon={HardDrive} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('settings.ftp.title')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/configuration'} />
            </ServerPageHeader.Heading>
            <ServerPageHeader.Description>{t('settings.ftp.description')}</ServerPageHeader.Description>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
      </ServerPageHeader>
      <PageContent>
        <FeatureCard.Stack>
          <ConnectionInfoSection />
          <AccountsSection {...{ serverId }} />
        </FeatureCard.Stack>
      </PageContent>
    </>
  );
}

function ConnectionInfoSection() {
  const { t } = useTranslation();
  const { data: sftpInfo } = useSftpInfo();

  const fields = [
    { label: t('settings.ftp.connectionInfo.host'), value: sftpInfo?.host ?? '—' },
    { label: t('settings.ftp.connectionInfo.sftpPort'), value: String(sftpInfo?.port ?? '—') },
  ];

  return (
    <FeatureCard>
      <FeatureCard.Header>
        <FeatureCard.Content>
          <FeatureCard.Title>{t('settings.ftp.connectionInfo.title')}</FeatureCard.Title>
          <FeatureCard.Description>{t('settings.ftp.connectionInfo.description')}</FeatureCard.Description>
        </FeatureCard.Content>
      </FeatureCard.Header>
      <FeatureCard.Body>
        <div className={'grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-black/5 dark:bg-white/5'}>
          {fields.map((field) => (
            <ConnectionInfoCell key={field.label} {...field} />
          ))}
        </div>
      </FeatureCard.Body>
    </FeatureCard>
  );
}

type ConnectionInfoCellProps = {
  label: string;
  value: string;
};

function ConnectionInfoCell({ label, value }: ConnectionInfoCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <button
      type={'button'}
      onClick={handleCopy}
      className={
        'group flex flex-col gap-1 bg-white px-5 py-3.5 text-left transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80'
      }
    >
      <span className={'text-xs font-medium text-zinc-400 dark:text-zinc-500'}>{label}</span>
      <span className={'flex items-center gap-2'}>
        <span className={'font-jetbrains text-sm font-semibold text-zinc-800 dark:text-zinc-200'}>{value}</span>
        {copied ? (
          <Check className={'size-3 text-green-500'} strokeWidth={3} />
        ) : (
          <Copy
            className={
              'size-3 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400'
            }
          />
        )}
      </span>
    </button>
  );
}

type AccountsSectionProps = {
  serverId: number;
};

function AccountsSection({ serverId }: AccountsSectionProps) {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SftpAccountResponse | null>(null);

  const { data: accountsData } = useSftpAccounts(serverId);
  const deleteSftpAccount = useDeleteSftpAccount(serverId);

  const accounts: Array<SftpAccountResponse> = accountsData?.accounts ?? [];

  const handleEdit = (account: SftpAccountResponse) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingAccount(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAccount(null);
  };

  return (
    <>
      <FeatureCard>
        <FeatureCard.Header>
          <FeatureCard.Content>
            <FeatureCard.Title count={accounts.length > 0 && accounts.length}>
              {t('settings.ftp.accounts.title')}
            </FeatureCard.Title>
            <FeatureCard.Description>{t('settings.ftp.accounts.description')}</FeatureCard.Description>
          </FeatureCard.Content>
          <FeatureCard.Actions>
            <Button onClick={handleCreate}>
              <Plus className={'size-4'} />
              {t('settings.ftp.accounts.addAccount')}
            </Button>
          </FeatureCard.Actions>
        </FeatureCard.Header>
        <FeatureCard.Body>
          {accounts.length === 0 ? (
            <FeatureCard.Empty
              icon={Upload}
              title={t('settings.ftp.accounts.noAccounts')}
              description={t('settings.ftp.accounts.noAccountsHint')}
            />
          ) : (
            <>
              {accounts.map((account) => (
                <AccountRow
                  key={account.id}
                  onEdit={() => handleEdit(account)}
                  onDelete={() => deleteSftpAccount.mutateAsync(account.id)}
                  {...{ account }}
                />
              ))}
            </>
          )}
        </FeatureCard.Body>
      </FeatureCard>
      <SftpAccountDialog open={dialogOpen} onOpenChange={handleDialogClose} account={editingAccount} {...{ serverId }} />
    </>
  );
}

type AccountRowProps = {
  account: SftpAccountResponse;
  onEdit: () => void;
  onDelete: () => void | Promise<unknown>;
};

function AccountRow({ account, onEdit, onDelete }: AccountRowProps) {
  const { t } = useTranslation();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const isReadOnly = account.permissions === 'read-only';
  const pathsLabel = account.allowedPaths.length === 0 ? t('settings.ftp.accounts.allFolders') : account.allowedPaths.join(', ');

  return (
    <FeatureCard.Row interactive className={'items-center gap-8 py-3'}>
      <div className={'flex items-center gap-3'}>
        <div className={'flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white'}>
          <FolderOpen className={'size-4'} strokeWidth={2} />
        </div>
        <div className={'min-w-0'}>
          <div className={'flex items-center gap-2'}>
            <span className={'font-jetbrains text-sm font-semibold text-zinc-800 dark:text-zinc-200'}>{account.username}</span>
            <Badge variant={isReadOnly ? 'secondary' : 'default'} className={'font-semibold'}>
              {isReadOnly ? t('settings.ftp.accounts.readOnly') : t('settings.ftp.accounts.readWrite')}
            </Badge>
          </div>
          <div className={'mt-0.5 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'}>
            <span>{pathsLabel}</span>
            <span className={'text-zinc-200 dark:text-zinc-700'}>&middot;</span>
            <span>{t('settings.ftp.accounts.createdAt', { date: new Date(account.createdAt).toLocaleDateString() })}</span>
          </div>
        </div>
      </div>
      <FeatureCard.RowControl>
        {deleteConfirm ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button
              variant={'destructive'}
              size={'xs'}
              onClick={() => {
                onDelete();
                setDeleteConfirm(false);
              }}
            >
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setDeleteConfirm(false)}>
              {t('common.no')}
            </Button>
          </div>
        ) : (
          <>
            <Button variant={'ghost'} size={'icon-sm'} onClick={onEdit}>
              <Pencil className={'size-4'} />
            </Button>
            <Button variant={'ghost-destructive'} size={'icon-sm'} onClick={() => setDeleteConfirm(true)}>
              <Trash2 className={'size-4'} />
            </Button>
          </>
        )}
      </FeatureCard.RowControl>
    </FeatureCard.Row>
  );
}
