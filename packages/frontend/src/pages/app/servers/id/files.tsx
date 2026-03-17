import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react';
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
  Pencil,
  TextCursorInput,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { Badge } from '@remnant/frontend/features/ui/badge';
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
import { Button } from '@remnant/frontend/features/ui/button';
import { Input } from '@remnant/frontend/features/ui/input';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Tooltip } from '@remnant/frontend/features/ui/tooltip';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';

export function ServerFilesPage() {
  const { t } = useTranslation();

  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const search: { path?: string } = useSearch({ strict: false });
  const [currentPath, setCurrentPath] = useState(search.path || '/');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const navigate = useNavigate();

  const { isLoading: serverLoading } = useServer(serverId || 0);
  const { data: files, isLoading: filesLoading, error } = useFiles(serverId, currentPath);
  const deleteFileMutation = useDeleteFile(serverId || 0);
  const createDirMutation = useCreateDirectory(serverId || 0);
  const renameMutation = useRenameFile(serverId || 0);
  const uploadMutation = useUploadFile(serverId || 0);

  const [isDragging, setIsDragging] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    setCurrentPath(parentPath);
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
        <div className={'space-y-6'}>
          <FilesSection
            createDirPending={createDirMutation.isPending}
            uploadPending={uploadMutation.isPending}
            onNavigate={handleNavigate}
            onGoUp={handleGoUp}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRename={handleRename}
            onNewFolderNameChange={setNewFolderName}
            onCreateFolder={handleCreateFolder}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onShowUploadDialog={() => setShowUploadDialog(true)}
            onShowNewFolderInput={setShowNewFolderInput}
            {...{ files, error, currentPath, newFolderName, filesLoading, isDragging, showNewFolderInput }}
          />
          <UploadDialog
            open={showUploadDialog}
            isPending={uploadMutation.isPending}
            onUpload={(files, targetPath) => {
              const uploadAll = async () => {
                for (const file of files) {
                  await uploadMutation.mutateAsync({ file, targetPath });
                }
                setShowUploadDialog(false);
              };
              uploadAll().catch(() => {});
            }}
            onClose={() => setShowUploadDialog(false)}
            {...{ currentPath }}
          />
        </div>
      </PageContent>
    </>
  );
}

type FilesSectionProps = {
  filesLoading: boolean;
  files: Array<FileInfo> | undefined;
  error: unknown;
  currentPath: string;
  isDragging: boolean;
  showNewFolderInput: boolean;
  newFolderName: string;
  createDirPending: boolean;
  uploadPending: boolean;
  onNavigate: (path: string) => void;
  onGoUp: () => void;
  onEdit: (file: FileInfo) => void;
  onDelete: (file: FileInfo) => void;
  onRename: (oldPath: string, newName: string) => void;
  onNewFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onShowNewFolderInput: (show: boolean) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onShowUploadDialog: () => void;
};

function FilesSection({
  filesLoading,
  files,
  error,
  currentPath,
  isDragging,
  showNewFolderInput,
  newFolderName,
  createDirPending,
  onNavigate,
  onGoUp,
  onEdit,
  onDelete,
  onRename,
  onNewFolderNameChange,
  onCreateFolder,
  onShowNewFolderInput,
  onDragOver,
  onDragLeave,
  onDrop,
  onShowUploadDialog,
}: FilesSectionProps) {
  const { t } = useTranslation();

  const dirCount = files?.filter((f) => f.type === 'directory').length ?? 0;
  const fileCount = files?.filter((f) => f.type === 'file').length ?? 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-white transition-colors',
        isDragging ? 'border-zinc-400/40 ring-2 ring-zinc-400/10' : 'border-black/10'
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDragging && (
        <div className={'pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/90'}>
          <div className={'flex flex-col items-center'}>
            <div className={'mb-3 flex size-14 items-center justify-center rounded-2xl bg-zinc-100'}>
              <Upload className={'size-7 text-zinc-600'} strokeWidth={1.5} />
            </div>
            <p className={'font-medium text-zinc-700'}>{t('files.dropFilesHere')}</p>
          </div>
        </div>
      )}
      <div className={'flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 sm:px-6 sm:py-4'}>
        <div className={'flex items-center gap-2 sm:gap-3'}>
          <Button variant={'secondary'} size={'sm'} onClick={onGoUp} disabled={currentPath === '/'}>
            <ArrowUp className={'size-4'} />
            {t('files.parentFolder')}
          </Button>
          {files && files.length > 0 && (
            <div className={'flex items-center gap-1.5 text-sm text-zinc-600'}>
              {dirCount > 0 && (
                <Badge size={'md'}>
                  {dirCount} {dirCount === 1 ? t('files.folder', 'folder') : t('files.folders', 'folders')}
                </Badge>
              )}
              {fileCount > 0 && (
                <Badge variant={'muted'} size={'md'}>
                  {fileCount} {fileCount === 1 ? t('files.file', 'file') : t('files.files', 'files')}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className={'flex items-center gap-2'}>
          <Button variant={'secondary'} size={'sm'} onClick={onShowUploadDialog}>
            <Upload className={'size-4'} />
            {t('files.upload')}
          </Button>
          {showNewFolderInput ? (
            <div className={'flex items-center gap-2'}>
              <Input
                type={'text'}
                value={newFolderName}
                onChange={(e) => onNewFolderNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onCreateFolder();
                  if (e.key === 'Escape') {
                    onShowNewFolderInput(false);
                    onNewFolderNameChange('');
                  }
                }}
                placeholder={t('files.folderName')}
                className={'w-48'}
                autoFocus
              />
              <Button size={'sm'} onClick={onCreateFolder} disabled={createDirPending} loading={createDirPending}>
                {t('common.create')}
              </Button>
              <Button
                variant={'ghost'}
                size={'sm'}
                onClick={() => {
                  onShowNewFolderInput(false);
                  onNewFolderNameChange('');
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          ) : (
            <Button variant={'secondary'} size={'sm'} onClick={() => onShowNewFolderInput(true)}>
              <FolderPlus className={'size-4'} />
              {t('files.newFolder')}
            </Button>
          )}
        </div>
      </div>
      <div>
        {filesLoading ? (
          <div className={'py-12 text-center'}>
            <div className={'mx-auto size-8 animate-spin rounded-full border-t-2 border-b-2 border-zinc-600'} />
          </div>
        ) : error ? (
          <div className={'py-12 text-center text-sm text-red-600'}>{t('files.loadError')}</div>
        ) : files && files.length > 0 ? (
          <div>
            {files.map((file) => (
              <FileRow key={file.path} {...{ file, onNavigate, onEdit, onDelete, onRename }} />
            ))}
          </div>
        ) : (
          <div className={'relative overflow-hidden py-14'}>
            <div className={'absolute inset-0 bg-linear-to-b from-zinc-600/2 to-transparent'} />
            <div className={'relative flex flex-col items-center'}>
              <div className={'mb-4 flex size-14 items-center justify-center rounded-2xl bg-zinc-100'}>
                <FolderOpen className={'size-7 text-zinc-300'} strokeWidth={1.5} />
              </div>
              <p className={'font-medium text-zinc-600'}>{t('files.emptyFolder')}</p>
              <p className={'mt-1 text-sm text-zinc-600'}>{t('files.dropOrCreate', 'Drop files here or create a new folder')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type UploadDialogProps = {
  open: boolean;
  currentPath: string;
  isPending: boolean;
  onUpload: (files: Array<globalThis.File>, targetPath: string) => void;
  onClose: () => void;
};

function UploadDialog({ open, currentPath, isPending, onUpload, onClose }: UploadDialogProps) {
  const { t } = useTranslation();
  const [targetPath, setTargetPath] = useState(currentPath);
  const [selectedFiles, setSelectedFiles] = useState<Array<globalThis.File>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTargetPath(currentPath);
      setSelectedFiles([]);
    }
  }, [open, currentPath]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = '';
    }
  };

  const handleDropZone = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      setSelectedFiles((prev) => [...prev, ...dropped]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog onOpenChange={handleOpenChange} {...{ open }}>
      <Dialog.Content className={'max-w-md overflow-hidden p-0'}>
        <div className={'relative border-b border-black/10 bg-linear-to-b from-zinc-600/3 to-transparent px-6 pt-6 pb-5'}>
          <div className={'flex items-start gap-4'}>
            <div className={'flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100'}>
              <Upload className={'size-5 text-zinc-600'} strokeWidth={1.75} />
            </div>
            <div className={'min-w-0 flex-1'}>
              <h2 className={'text-lg font-semibold tracking-tight text-zinc-900'}>{t('files.upload')}</h2>
              <p className={'mt-0.5 text-sm text-zinc-600'}>{t('files.uploadDescription')}</p>
            </div>
          </div>
        </div>
        <div className={'space-y-4 px-6 py-5'}>
          <div>
            <label className={'mb-1.5 block text-sm font-medium text-zinc-700'}>{t('files.uploadDestination')}</label>
            <Input type={'text'} value={targetPath} onChange={(e) => setTargetPath(e.target.value)} placeholder={'/'} />
          </div>
          <div>
            <label className={'mb-1.5 block text-sm font-medium text-zinc-700'}>{t('files.files')}</label>
            <input ref={fileInputRef} type={'file'} multiple onChange={handleFileSelect} className={'hidden'} />
            <button
              type={'button'}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={handleDropZone}
              className={cn(
                'flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition-colors',
                isDragOver
                  ? 'border-zinc-400 bg-zinc-50'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50/50'
              )}
            >
              <Upload className={'size-5 text-zinc-400'} strokeWidth={1.75} />
              <span>{t('files.uploadDropOrBrowse')}</span>
            </button>
          </div>
          {selectedFiles.length > 0 && (
            <div className={'space-y-1.5'}>
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={'flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2'}
                >
                  <div className={'flex min-w-0 items-center gap-2'}>
                    <File className={'size-4 shrink-0 text-zinc-400'} strokeWidth={1.75} />
                    <span className={'truncate text-sm text-zinc-700'}>{file.name}</span>
                    <span className={'shrink-0 text-xs text-zinc-400'}>{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type={'button'}
                    onClick={() => removeFile(index)}
                    className={'ml-2 shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-600'}
                  >
                    <X className={'size-3.5'} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Dialog.Footer className={'border-t border-black/10 bg-zinc-50/50 px-6 py-4'}>
          <Button type={'button'} variant={'secondary'} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => onUpload(selectedFiles, targetPath)}
            disabled={isPending || selectedFiles.length === 0}
            loading={isPending}
          >
            <Upload className={'size-4'} />
            {t('files.uploadCount', { count: selectedFiles.length })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
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
          'rounded px-1.5 py-0.5 transition-colors hover:bg-zinc-100 hover:text-zinc-900',
          parts.length === 0 ? 'font-medium text-zinc-700' : 'text-zinc-600'
        )}
      >
        root
      </button>
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        return (
          <span key={paths[index]} className={'flex items-center'}>
            <span className={'text-zinc-300'}>/</span>
            <button
              onClick={() => onNavigate(paths[index])}
              className={cn(
                'rounded px-1.5 py-0.5 transition-colors hover:bg-zinc-100 hover:text-zinc-900',
                isLast ? 'font-medium text-zinc-700' : 'text-zinc-600'
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
        'group flex min-h-11 items-center justify-between border-b border-black/10 px-4 py-2 transition-colors last:border-b-0 sm:px-6',
        (isDirectory || isEditable) && action === 'idle' && 'cursor-pointer hover:bg-zinc-50/80'
      )}
    >
      <div className={'flex min-w-0 flex-1 items-center gap-3'} onClick={action === 'idle' ? handleClick : undefined}>
        <div className={'flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100'}>
          {isDirectory ? <FolderIcon /> : <FileIcon filename={file.name} />}
        </div>
        <div className={'min-w-0 flex-1'}>
          <span className={cn('truncate text-sm', isDirectory ? 'font-medium text-zinc-800' : 'text-zinc-700')}>{file.name}</span>
        </div>
        <div className={cn('hidden shrink-0 items-center gap-6 sm:flex', action !== 'idle' && 'invisible')}>
          <span className={'font-jetbrains w-20 text-right text-sm text-zinc-600 tabular-nums'}>
            {file.type === 'file' ? formatFileSize(file.size) : ''}
          </span>
          <span className={'w-36 text-right text-sm text-zinc-600'}>{new Date(file.modified).toLocaleString()}</span>
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
            <span className={'text-sm text-zinc-600'}>{t('common.confirm')}?</span>
            <Button variant={'danger'} size={'xs'} onClick={() => onDelete(file)}>
              {t('common.yes')}
            </Button>
            <Button variant={'ghost'} size={'xs'} onClick={() => setAction('idle')}>
              {t('common.no')}
            </Button>
          </div>
        ) : (
          <Tooltip.Provider delayDuration={300}>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant={'ghost'}
                  size={'icon-sm'}
                  onClick={() => onEdit(file)}
                  disabled={!isEditable}
                  className={cn('text-zinc-600 hover:text-zinc-700', !isEditable && 'pointer-events-none invisible')}
                >
                  <Pencil className={'size-3.5'} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('files.edit')}</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant={'ghost'}
                  size={'icon-sm'}
                  onClick={handleStartRename}
                  className={'text-zinc-600 hover:text-zinc-700'}
                >
                  <TextCursorInput className={'size-3.5'} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('files.rename')}</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button variant={'ghost-danger'} size={'icon-sm'} onClick={() => setAction('delete')}>
                  <Trash2 className={'size-3.5'} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content className={'rounded-lg px-2.5 py-1.5 text-sm'}>{t('common.delete')}</Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        )}
      </div>
    </div>
  );
}

function FolderIcon() {
  return <FolderOpen className={'size-4 text-zinc-600'} strokeWidth={1.75} />;
}

type FileIconProps = {
  filename: string;
};

function FileIcon({ filename }: FileIconProps) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['jar', 'zip', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className={'size-4 text-zinc-600'} strokeWidth={1.75} />;
  }
  if (['yml', 'yaml', 'json', 'xml', 'properties'].includes(ext)) {
    return <FileCode className={'size-4 text-zinc-600'} strokeWidth={1.75} />;
  }
  if (['sh', 'bat', 'cmd'].includes(ext)) {
    return <FileTerminal className={'size-4 text-zinc-600'} strokeWidth={1.75} />;
  }
  if (['log', 'txt'].includes(ext)) {
    return <FileText className={'size-4 text-zinc-600'} strokeWidth={1.75} />;
  }

  return <File className={'size-4 text-zinc-600'} strokeWidth={1.75} />;
}
