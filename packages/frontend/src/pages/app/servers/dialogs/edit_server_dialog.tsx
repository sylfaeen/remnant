import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Package, Pencil } from 'lucide-react';
import { Dialog } from '@remnant/frontend/features/ui/dialog';
import { Input } from '@remnant/frontend/features/ui/input';
import { Checkbox } from '@remnant/frontend/features/ui/checkbox';
import { Label } from '@remnant/frontend/features/ui/label';
import { Button } from '@remnant/frontend/features/ui/button';
import type { ServerResponse } from '@remnant/shared';

type EditServerFormData = {
  name: string;
  min_ram: string;
  max_ram: string;
  jvm_flags: string;
  java_port: number;
  auto_start: boolean;
};

type EditServerDialogProps = {
  server: ServerResponse;
  onSubmit: (data: EditServerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
};

export function EditServerDialog({ server, onSubmit, onCancel, isLoading, error }: EditServerDialogProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(server.name);
  const [minRam, setMinRam] = useState(server.min_ram);
  const [maxRam, setMaxRam] = useState(server.max_ram);
  const [jvmFlags, setJvmFlags] = useState(server.jvm_flags);
  const [javaPort, setJavaPort] = useState(server.java_port);
  const [autoStart, setAutoStart] = useState(server.auto_start);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ name, min_ram: minRam, max_ram: maxRam, jvm_flags: jvmFlags, java_port: javaPort, auto_start: autoStart });
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
          <Dialog.Icon className={'bg-zinc-500/10 text-zinc-600'}>
            <Pencil className={'size-5'} strokeWidth={1.75} />
          </Dialog.Icon>
          <div>
            <Dialog.Title>{t('servers.editServer')}</Dialog.Title>
          </div>
        </Dialog.Header>
        <form id={'edit-server'} onSubmit={handleSubmit}>
          <Dialog.Body>
            {error && <Dialog.Error>{error}</Dialog.Error>}
            <div>
              <Label htmlFor={'name'}>{t('servers.serverName')} *</Label>
              <Input
                type={'text'}
                id={'name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('servers.serverNamePlaceholder')}
                required
              />
            </div>
            {server.path && (
              <div>
                <Label>{t('servers.serverPath')}</Label>
                <div
                  className={
                    'font-jetbrains flex items-center gap-2 rounded-lg border border-black/10 bg-zinc-100 px-3 py-2 text-sm text-zinc-600'
                  }
                >
                  <FolderOpen className={'size-4 shrink-0'} />
                  <span className={'truncate'}>{server.path}</span>
                </div>
              </div>
            )}
            {server.jar_file && (
              <div>
                <Label>{t('servers.jarFile')}</Label>
                <div
                  className={
                    'font-jetbrains flex items-center gap-2 rounded-lg border border-black/10 bg-zinc-100 px-3 py-2 text-sm text-zinc-600'
                  }
                >
                  <Package className={'size-4 shrink-0'} />
                  <span className={'truncate'}>{server.jar_file}</span>
                </div>
                <p className={'mt-1 text-sm text-zinc-600'}>
                  {t('servers.jarHint', 'Change the active JAR file in server settings')}
                </p>
              </div>
            )}
            <div className={'grid grid-cols-2 gap-4'}>
              <div>
                <Label htmlFor={'minRam'}>{t('servers.minRam')}</Label>
                <Input
                  type={'text'}
                  id={'minRam'}
                  value={minRam}
                  onChange={(e) => setMinRam(e.target.value)}
                  placeholder={'2G'}
                />
              </div>
              <div>
                <Label htmlFor={'maxRam'}>{t('servers.maxRam')}</Label>
                <Input
                  type={'text'}
                  id={'maxRam'}
                  value={maxRam}
                  onChange={(e) => setMaxRam(e.target.value)}
                  placeholder={'4G'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={'javaPort'}>{t('servers.port')}</Label>
              <Input
                type={'number'}
                id={'javaPort'}
                value={javaPort}
                onChange={(e) => setJavaPort(parseInt(e.target.value, 10))}
                min={1024}
                max={65535}
                className={'w-32'}
              />
            </div>
            <div>
              <Label htmlFor={'jvmFlags'}>{t('servers.jvmFlagsAdditional')}</Label>
              <Input
                type={'text'}
                id={'jvmFlags'}
                value={jvmFlags}
                onChange={(e) => setJvmFlags(e.target.value)}
                placeholder={'-XX:+UseG1GC'}
              />
            </div>
            <Label className={'flex cursor-pointer items-center gap-2'}>
              <Checkbox checked={autoStart} onCheckedChange={(checked) => setAutoStart(checked === true)} />
              <span className={'text-zinc-600'}>{t('servers.autoStartDesc')}</span>
            </Label>
          </Dialog.Body>
        </form>
        <Dialog.Footer>
          <Button type={'button'} variant={'secondary'} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type={'submit'} form={'edit-server'} disabled={isLoading} loading={isLoading}>
            {isLoading ? t('servers.saving') : t('common.save')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
