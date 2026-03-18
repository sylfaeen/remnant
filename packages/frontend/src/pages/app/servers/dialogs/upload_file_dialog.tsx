import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { File, Upload, X } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Button } from '@remnant/frontend/features/ui/button';
import { Input } from '@remnant/frontend/features/ui/input';
import { formatFileSize } from '@remnant/frontend/hooks/use_files';
import { Label } from '@remnant/frontend/features/ui/label';

type UploadFileDialogProps = {
  open: boolean;
  currentPath: string;
  isPending: boolean;
  onUpload: (files: Array<globalThis.File>, targetPath: string) => void;
  onClose: () => void;
};

export function UploadFileDialog({ open, currentPath, isPending, onUpload, onClose }: UploadFileDialogProps) {
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
      <Dialog.Content className={'max-w-md'}>
        <Dialog.Header>
          <Dialog.Icon className={'bg-zinc-100 dark:bg-zinc-800'}>
            <Upload className={'size-5 text-zinc-600 dark:text-zinc-400'} strokeWidth={2} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('files.upload')}</Dialog.Title>
            <Dialog.Description>{t('files.uploadDescription')}</Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Body>
          <div>
            <Label htmlFor={'target-path'}>{t('files.uploadDestination')}</Label>
            <Input
              name={'target-path'}
              type={'text'}
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder={'/'}
            />
          </div>
          <div>
            <Label>{t('files.files')}</Label>
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
                  ? 'border-zinc-400 bg-zinc-50 dark:bg-zinc-800'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              )}
            >
              <Upload className={'size-5 text-zinc-400 dark:text-zinc-500'} strokeWidth={2} />
              <span>{t('files.uploadDropOrBrowse')}</span>
            </button>
          </div>
          {selectedFiles.length > 0 && (
            <div className={'space-y-1.5'}>
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={'flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800'}
                >
                  <div className={'flex min-w-0 items-center gap-2'}>
                    <File className={'size-4 shrink-0 text-zinc-400 dark:text-zinc-500'} strokeWidth={2} />
                    <span className={'truncate text-sm text-zinc-700 dark:text-zinc-300'}>{file.name}</span>
                    <span className={'shrink-0 text-xs text-zinc-400 dark:text-zinc-500'}>{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type={'button'}
                    onClick={() => removeFile(index)}
                    className={
                      'ml-2 shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                    }
                  >
                    <X className={'size-4'} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Dialog.Body>
        <Dialog.Footer>
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
