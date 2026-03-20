import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Pencil, Trash2, Shield, Crown, Check, X } from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { cn } from '@remnant/frontend/lib/cn';
import { AVAILABLE_PERMISSIONS } from '@remnant/shared';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@remnant/frontend/hooks/use_users';
import { CreateUserDialog } from '@remnant/frontend/pages/app/users/dialogs/create_user_dialog';
import { EditUserDialog } from '@remnant/frontend/pages/app/users/dialogs/edit_user_dialog';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { ApiError } from '@remnant/frontend/lib/api';
import { DocsLink } from '@remnant/frontend/pages/app/features/docs_link';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';
import type { UserResponse } from '@remnant/shared';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';

export function UsersPage() {
  const { t } = useTranslation();

  const { data: users, isLoading, error } = useUsers();

  const currentUser = useAuthStore((state) => state.user);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    setFormError(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (user: UserResponse) => {
    setFormError(null);
    setEditingUser(user);
  };

  const handleCreateSubmit = async (data: { username: string; password: string; permissions: Array<string> }) => {
    setFormError(null);
    try {
      await createUser.mutateAsync(data);
      setShowCreateDialog(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(t('errors.generic'));
      }
    }
  };

  const handleEditSubmit = async (data: { username: string; password?: string; permissions: Array<string> }) => {
    if (!editingUser) return;
    setFormError(null);
    try {
      await updateUser.mutateAsync({ id: editingUser.id, data });
      setEditingUser(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(t('errors.generic'));
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id);
      setDeleteConfirm(null);
    } catch {}
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return <PageError message={t('errors.generic')} />;
  }

  return (
    <PageContent>
      <div className={'space-y-6'}>
        <div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
          <div>
            <div className={'flex items-center gap-2'}>
              <h1 className={'text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'}>{t('users.title')}</h1>
              <DocsLink path={'/guide/users'} />
            </div>
            <p className={'mt-1 text-zinc-600 dark:text-zinc-400'}>{t('users.subtitle')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className={'size-4'} />
            {t('users.addUser')}
          </Button>
        </div>
        <div className={'overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900'}>
          <div className={'divide-y divide-black/4 dark:divide-white/6'}>
            {users?.map((user) => (
              <UserRow
                key={user.id}
                currentUserId={currentUser?.id}
                deleteIsPending={deleteUser.isPending}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeleteConfirm={setDeleteConfirm}
                onDeleteCancel={() => setDeleteConfirm(null)}
                {...{ user, deleteConfirm }}
              />
            ))}

            {users?.length === 0 && <EmptyState onCreate={handleCreate} />}
          </div>
        </div>
        {showCreateDialog && (
          <CreateUserDialog
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createUser.isPending}
            error={formError}
          />
        )}
        {editingUser && (
          <EditUserDialog
            user={editingUser}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingUser(null)}
            isLoading={updateUser.isPending}
            error={formError}
          />
        )}
      </div>
    </PageContent>
  );
}

type UserRowProps = {
  user: UserResponse;
  currentUserId: number | undefined;
  deleteConfirm: number | null;
  deleteIsPending: boolean;
  onEdit: (user: UserResponse) => void;
  onDelete: (id: number) => void;
  onDeleteConfirm: (id: number) => void;
  onDeleteCancel: () => void;
};

function UserRow({
  user,
  currentUserId,
  deleteConfirm,
  deleteIsPending,
  onEdit,
  onDelete,
  onDeleteConfirm,
  onDeleteCancel,
}: UserRowProps) {
  const { t } = useTranslation();
  const isAdmin = user.permissions.includes('*');
  const specificPermissions = AVAILABLE_PERMISSIONS.filter((p) => p !== '*');

  return (
    <div className={'p-4 transition-colors hover:bg-zinc-100 sm:p-5 dark:hover:bg-zinc-800'}>
      <div className={'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'}>
        <div className={'flex items-start gap-3 sm:gap-4'}>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full',
              isAdmin ? 'bg-amber-500/10' : 'bg-green-600/10'
            )}
          >
            {isAdmin ? (
              <Crown className={'size-5 text-amber-500'} strokeWidth={2} />
            ) : (
              <Shield className={'size-5 text-green-600'} strokeWidth={2} />
            )}
          </div>
          <div>
            <div className={'flex items-center gap-2'}>
              <span className={'font-semibold text-zinc-900 dark:text-zinc-100'}>{user.username}</span>
              {isAdmin && <Badge variant={'outline'}>{t('users.admin')}</Badge>}
              {user.id === currentUserId && <Badge variant={'secondary'}>{t('users.you')}</Badge>}
            </div>
            <div className={'mt-2 flex flex-wrap gap-1.5'}>
              {specificPermissions.map((permission) => (
                <PermissionBadge
                  key={permission}
                  granted={isAdmin || user.permissions.includes(permission)}
                  {...{ permission }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={'flex shrink-0 items-center gap-2'}>
          <Button variant={'ghost'} size={'sm'} onClick={() => onEdit(user)}>
            <Pencil className={'size-4'} />
          </Button>
          {user.id !== currentUserId && (
            <>
              {deleteConfirm === user.id ? (
                <div className={'flex gap-2'}>
                  <Button
                    variant={'destructive'}
                    size={'sm'}
                    onClick={() => onDelete(user.id)}
                    disabled={deleteIsPending}
                    loading={deleteIsPending}
                  >
                    {t('common.confirm')}
                  </Button>
                  <Button variant={'secondary'} size={'sm'} onClick={onDeleteCancel}>
                    {t('common.cancel')}
                  </Button>
                </div>
              ) : (
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  onClick={() => onDeleteConfirm(user.id)}
                  className={'text-red-600 hover:bg-red-600/10'}
                >
                  <Trash2 className={'size-4'} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type PermissionBadgeProps = {
  permission: string;
  granted: boolean;
};

function PermissionBadge({ permission, granted }: PermissionBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium',
        granted ? 'bg-green-600/10 text-green-600' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
      )}
    >
      {granted ? <Check className={'size-3'} strokeWidth={2.5} /> : <X className={'size-3'} strokeWidth={2.5} />}
      {t(`users.permissionNames.${permission}`)}
    </span>
  );
}

type EmptyStateProps = {
  onCreate: () => void;
};

function EmptyState({ onCreate }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className={'p-12 text-center'}>
      <div className={'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600/10'}>
        <Users className={'size-8 text-green-600'} strokeWidth={1.5} />
      </div>
      <h3 className={'mb-2 font-semibold text-zinc-900 dark:text-zinc-100'}>{t('users.noUsers')}</h3>
      <p className={'mb-6 text-zinc-600 dark:text-zinc-400'}>{t('users.noUsersDescription')}</p>
      <Button onClick={onCreate}>
        <Plus className={'size-4'} />
        {t('users.addUser')}
      </Button>
    </div>
  );
}
