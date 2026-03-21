import { useState, type DragEvent } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowUp,
  File,
  FileArchive,
  FileCode,
  FileTerminal,
  FileText,
  FolderOpen,
  FolderPlus,
  LoaderCircle,
  Pencil,
  TextCursorInput,
  Trash2,
  Upload,
} from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { Badge } from '@remnant/frontend/features/ui/shadcn/badge';
import { cn } from '@remnant/frontend/lib/cn';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import {
  useFiles,
  useDeleteFile,
  useCreateDirectory,
  useRenameFile,
  useUploadFile,
  formatFileSize,
  isEditableFile,
  type FileInfo,
} from '@remnant/frontend/hooks/use_files';
import { Button } from '@remnant/frontend/features/ui/shadcn/button';
import { Input } from '@remnant/frontend/features/ui/shadcn/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@remnant/frontend/features/ui/shadcn/tooltip';
import { UploadFileDialog } from '@remnant/frontend/pages/app/servers/dialogs/upload_file_dialog';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';

export function ServerFilesPage() {
  const { t } = useTranslation();

  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const search: { path?: string } = useSearch({ strict: false });
  const [currentPath, setCurrentPath] = useState(search.path || '/');

  const { isLoading: serverLoading } = useServer(serverId || 0);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  if (!serverId || isNaN(serverId)) {
    return <PageError message={t('files.invalidServerId')} />;
  }

  if (serverLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <ServerPageHeader>
        <ServerPageHeader.Left>
          <ServerPageHeader.Icon icon={FolderOpen} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('nav.files')}</ServerPageHeader.PageName>
              <ServerPageHeader.Docs path={'/guide/files'} />
            </ServerPageHeader.Heading>
            <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
      </ServerPageHeader>
      <PageContent>
        <FilesSection onNavigate={handleNavigate} {...{ serverId, currentPath }} />
      </PageContent>
    </>
  );
}

type FilesSectionProps = {
  serverId: number;
  currentPath: string;
  onNavigate: (path: string) => void;
};

function FilesSection({ serverId, currentPath, onNavigate }: FilesSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: files, isLoading: filesLoading, error } = useFiles(serverId, currentPath);
  const deleteFileMutation = useDeleteFile(serverId);
  const createDirMutation = useCreateDirectory(serverId);
  const renameMutation = useRenameFile(serverId);
  const uploadMutation = useUploadFile(serverId);

  const dirCount = files?.filter((f) => f.type === 'directory').length ?? 0;
  const fileCount = files?.filter((f) => f.type === 'file').length ?? 0;

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    onNavigate(parentPath);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const path = currentPath === '/' ? `/${newFolderName}` : `${currentPath}/${newFolderName}`;
      await createDirMutation.mutateAsync(path);
      setNewFolderName('');
      setShowNewFolderInput(false);
    } catch {}
  };

  const handleDelete = async (file: FileInfo) => {
    try {
      await deleteFileMutation.mutateAsync(file.path);
    } catch {}
  };

  const handleRename = async (oldPath: string, newName: string) => {
    if (!newName.trim()) return;
    try {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
      const newPath = parentPath ? `${parentPath}/${newName}` : `/${newName}`;
      await renameMutation.mutateAsync({ oldPath, newPath });
    } catch {}
  };

  const handleEdit = (file: FileInfo) => {
    navigate({
      to: '/app/servers/$id/files/edit',
      params: { id: String(serverId) },
      search: { path: file.path },
    }).then();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;
    for (const file of droppedFiles) {
      try {
        await uploadMutation.mutateAsync({ file, targetPath: currentPath });
      } catch {}
    }
  };

  const handleUpload = (uploadFiles: Array<File>, targetPath: string) => {
    const uploadAll = async () => {
      for (const file of uploadFiles) {
        await uploadMutation.mutateAsync({ file, targetPath });
      }
      setShowUploadDialog(false);
    };
    uploadAll().catch(() => {});
  };

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border bg-white transition-colors dark:bg-zinc-900',
          isDragging ? 'border-zinc-400/40 ring-2 ring-zinc-400/10' : 'border-black/10 dark:border-white/10'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div
            className={
              'pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/90 dark:bg-zinc-900/90'
            }
          >
            <div className={'flex flex-col items-center'}>
              <div className={'mb-3 flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800'}>
                <Upload className={'size-7 text-zinc-600 dark:text-zinc-400'} strokeWidth={1.5} />
              </div>
              <p className={'font-medium text-zinc-700 dark:text-zinc-300'}>{t('files.dropFilesHere')}</p>
            </div>
          </div>
        )}
        <div
          className={
            'flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 sm:px-6 sm:py-4 dark:border-white/10'
          }
        >
          <div className={'flex items-center gap-2 sm:gap-3'}>
            <Button variant={'secondary'} size={'sm'} onClick={handleGoUp} disabled={currentPath === '/'}>
              <ArrowUp className={'size-4'} />
              {t('files.parentFolder')}
            </Button>
            {files && files.length > 0 && (
              <div className={'flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400'}>
                {dirCount > 0 && (
                  <Badge>
                    {dirCount} {dirCount === 1 ? t('files.folder', 'folder') : t('files.folders', 'folders')}
                  </Badge>
                )}
                {fileCount > 0 && (
                  <Badge variant={'secondary'}>
                    {fileCount} {fileCount === 1 ? t('files.file', 'file') : t('files.files', 'files')}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className={'flex items-center gap-2'}>
            <Button variant={'secondary'} size={'sm'} onClick={() => setShowUploadDialog(true)}>
              <Upload className={'size-4'} />
              {t('files.upload')}
            </Button>
            {showNewFolderInput ? (
              <div className={'flex items-center gap-2'}>
                <Input
                  type={'text'}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                    if (e.key === 'Escape') {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }
                  }}
                  placeholder={t('files.folderName')}
                  className={'w-48'}
                  autoFocus
                />
                <Button
                  size={'sm'}
                  onClick={handleCreateFolder}
                  disabled={createDirMutation.isPending}
                  loading={createDirMutation.isPending}
                >
                  {t('common.create')}
                </Button>
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            ) : (
              <Button variant={'secondary'} size={'sm'} onClick={() => setShowNewFolderInput(true)}>
                <FolderPlus className={'size-4'} />
                {t('files.newFolder')}
              </Button>
            )}
          </div>
        </div>
        <div>
          {filesLoading ? (
            <div className={'flex items-center justify-center py-12 text-center'}>
              <LoaderCircle className={'size-4 animate-spin text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />
            </div>
          ) : error ? (
            <div className={'py-12 text-center text-sm text-red-600'}>{t('files.loadError')}</div>
          ) : files && files.length > 0 ? (
            <div>
              {files.map((file) => (
                <FileRow
                  key={file.path}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  {...{ file, onNavigate }}
                />
              ))}
            </div>
          ) : (
            <div className={'relative overflow-hidden py-14'}>
              <div className={'absolute inset-0 bg-linear-to-b from-zinc-600/2 to-transparent'} />
              <div className={'relative flex flex-col items-center'}>
                <div className={'mb-4 flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800'}>
                  <FolderOpen className={'size-7 text-zinc-300 dark:text-zinc-500'} strokeWidth={1.5} />
                </div>
                <p className={'font-medium text-zinc-600 dark:text-zinc-400'}>{t('files.emptyFolder')}</p>
                <p className={'mt-1 text-sm text-zinc-600 dark:text-zinc-400'}>
                  {t('files.dropOrCreate', 'Drop files here or create a new folder')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <UploadFileDialog
        open={showUploadDialog}
        isPending={uploadMutation.isPending}
        onUpload={handleUpload}
        onClose={() => setShowUploadDialog(false)}
        {...{ currentPath }}
      />
    </>
  );
}

type BreadcrumbProps = {
  path: string;
  onNavigate: (path: string) => void;
};

function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path.split('/').filter(Boolean);
  const paths = parts.map((_, index) => '/' + parts.slice(0, index + 1).join('/'));

  return (
    <div className={'mt-0.5 flex items-center gap-0.5 text-sm'}>
      <button
        onClick={() => onNavigate('/')}
        className={cn(
          'rounded px-1.5 py-0.5 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
          parts.length === 0 ? 'font-medium text-zinc-700 dark:text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'
        )}
      >
        root
      </button>
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        return (
          <span key={paths[index]} className={'flex items-center'}>
            <span className={'text-zinc-300 dark:text-zinc-600'}>/</span>
            <button
              onClick={() => onNavigate(paths[index])}
              className={cn(
                'rounded px-1.5 py-0.5 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                isLast ? 'font-medium text-zinc-700 dark:text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'
              )}
            >
              {part}
            </button>
          </span>
        );
      })}
    </div>
  );
}

type FileRowAction = 'idle' | 'rename' | 'delete';

type FileRowProps = {
  file: FileInfo;
  onNavigate: (path: string) => void;
  onEdit: (file: FileInfo) => void;
  onDelete: (file: FileInfo) => void;
  onRename: (oldPath: string, newName: string) => void;
};

function FileRow({ file, onNavigate, onEdit, onDelete, onRename }: FileRowProps) {
  const { t } = useTranslation();
  const [action, setAction] = useState<FileRowAction>('idle');
  const [renameName, setRenameName] = useState('');

  const isDirectory = file.type === 'directory';
  const isEditable = !isDirectory && isEditableFile(file.name);

  const handleClick = () => {
    if (isDirectory) {
      onNavigate(file.path);
    } else if (isEditable) {
      onEdit(file);
    }
  };

  const handleStartRename = () => {
    setRenameName(file.name);
    setAction('rename');
  };

  const handleRenameSubmit = () => {
    if (renameName.trim() && renameName !== file.name) {
      onRename(file.path, renameName.trim());
    }
    setAction('idle');
  };

  return (
    <div
      className={cn(
        'group flex min-h-11 items-center justify-between border-b border-black/10 px-4 py-2 transition-colors last:border-b-0 sm:px-6 dark:border-white/10',
        (isDirectory || isEditable) && action === 'idle' && 'cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/80'
      )}
    >
      <div className={'flex min-w-0 flex-1 items-center gap-3'} onClick={action === 'idle' ? handleClick : undefined}>
        <div className={'flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800'}>
          {isDirectory ? <FolderIcon /> : <FileIcon filename={file.name} />}
        </div>
        <div className={'min-w-0 flex-1'}>
          <span
            className={cn(
              'truncate text-sm',
              isDirectory ? 'font-medium text-zinc-800 dark:text-zinc-200' : 'text-zinc-700 dark:text-zinc-300'
            )}
          >
            {file.name}
          </span>
        </div>
        <div className={cn('hidden shrink-0 items-center gap-6 sm:flex', action !== 'idle' && 'invisible')}>
          <span className={'font-jetbrains w-20 text-right text-sm text-zinc-600 tabular-nums dark:text-zinc-400'}>
            {file.type === 'file' ? formatFileSize(file.size) : ''}
          </span>
          <span className={'w-36 text-right text-sm text-zinc-600 dark:text-zinc-400'}>
            {new Date(file.modified).toLocaleString()}
          </span>
        </div>
      </div>
      <div className={'ml-4 flex shrink-0 items-center gap-1'}>
        {action === 'rename' ? (
          <div className={'flex items-center gap-1.5'}>
            <Input
              type={'text'}
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setAction('idle');
              }}
              className={'h-7 w-48 text-sm'}
              autoFocus
            />
            <Button size={'xs'} onClick={handleRenameSubmit} disabled={!renameName.trim()}>
              {t('common.save')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setAction('idle')}>
              {t('common.cancel')}
            </Button>
          </div>
        ) : action === 'delete' ? (
          <div className={'flex items-center gap-1.5'}>
            <span className={'text-sm text-zinc-600 dark:text-zinc-400'}>{t('common.confirm')}?</span>
            <Button variant={'destructive'} size={'xs'} onClick={() => onDelete(file)}>
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setAction('idle')}>
              {t('common.no')}
            </Button>
          </div>
        ) : (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={'ghost'}
                  size={'icon-sm'}
                  onClick={() => onEdit(file)}
                  disabled={!isEditable}
                  className={cn(
                    'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
                    !isEditable && 'pointer-events-none invisible'
                  )}
                >
                  <Pencil className={'size-4'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('files.edit')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={'ghost'}
                  size={'icon-sm'}
                  onClick={handleStartRename}
                  className={'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}
                >
                  <TextCursorInput className={'size-4'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('files.rename')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={'ghost-destructive'} size={'icon-sm'} onClick={() => setAction('delete')}>
                  <Trash2 className={'size-4'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('common.delete')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

function FolderIcon() {
  return <FolderOpen className={'size-4 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />;
}

type FileIconProps = {
  filename: string;
};

function FileIcon({ filename }: FileIconProps) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['jar', 'zip', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className={'size-4 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />;
  }
  if (['yml', 'yaml', 'json', 'xml', 'properties'].includes(ext)) {
    return <FileCode className={'size-4 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />;
  }
  if (['sh', 'bat', 'cmd'].includes(ext)) {
    return <FileTerminal className={'size-4 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />;
  }
  if (['log', 'txt'].includes(ext)) {
    return <FileText className={'size-4 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />;
  }

  return <File className={'size-4 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />;
}
