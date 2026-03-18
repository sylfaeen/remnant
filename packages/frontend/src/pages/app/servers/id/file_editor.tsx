import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { FileCode, Save, Check, AlertCircle, ArrowLeft } from 'lucide-react';

loader.config({ monaco });
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { PageError } from '@remnant/frontend/features/ui/page_error';
import { useServer } from '@remnant/frontend/hooks/use_servers';
import { useFileContent, useWriteFile, getFileExtension } from '@remnant/frontend/hooks/use_files';
import { Button } from '@remnant/frontend/features/ui/button';
import { Badge } from '@remnant/frontend/features/ui/badge';
import { ServerPageHeader } from '@remnant/frontend/pages/app/servers/features/server_page_header';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { ApiError } from '@remnant/frontend/lib/api';
import { useThemeStore } from '@remnant/frontend/stores/theme_store';

export function ServerFileEditorPage() {
  const { t } = useTranslation();
  const isDark = useThemeStore((s) => s.isDark);

  const { id } = useParams({ strict: false });
  const serverId = id ? parseInt(id, 10) : null;

  const search: { path?: string } = useSearch({ strict: false });
  const filePath = search.path ?? null;

  const { isLoading: serverLoading } = useServer(serverId || 0);
  const { data: fileData, isLoading: fileLoading, error: fileError } = useFileContent(serverId, filePath);
  const writeFile = useWriteFile(serverId || 0);

  const [content, setContent] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize content when a file loads
  useEffect(() => {
    if (fileData?.content !== undefined) {
      setContent(fileData.content);
      setHasChanges(false);
    }
  }, [fileData?.content]);

  // Handle content changes
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setContent(value);
        setHasChanges(value !== fileData?.content);
        setSaveStatus('idle');
      }
    },
    [fileData?.content]
  );

  const handleSave = useCallback(async () => {
    if (!filePath || !hasChanges) return;

    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      await writeFile.mutateAsync({ path: filePath, content });
      setSaveStatus('saved');
      setHasChanges(false);
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t('files.saveError'));
      }
    }
  }, [filePath, content, hasChanges, writeFile, t]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave().then();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const filename = filePath ? filePath.split('/').pop() || '' : '';
  const parentDir = filePath ? filePath.substring(0, filePath.lastIndexOf('/')) || '/' : '/';
  const language = getLanguageFromExtension(filename);

  if (!serverId || isNaN(serverId)) {
    return <PageError message={t('files.invalidServerId')} />;
  }

  if (!filePath) {
    return <PageError message={t('files.missingFilePath')} />;
  }

  if (serverLoading || fileLoading) {
    return <PageLoader />;
  }

  if (fileError) {
    return (
      <div className={'flex items-center justify-center py-20'}>
        <div className={'text-center'}>
          <AlertCircle className={'mx-auto mb-4 size-12 text-red-600'} strokeWidth={1.5} />
          <div className={'mb-4 text-red-600'}>{t('files.fileLoadError')}</div>
          <Link to={'/app/servers/$id/files'} params={{ id: String(serverId) }} search={{ path: parentDir }}>
            <Button variant={'secondary'}>
              <ArrowLeft className={'size-4'} />
              {t('files.backToFiles')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ServerPageHeader>
        <ServerPageHeader.Left>
          <ServerPageHeader.Icon icon={FileCode} />
          <ServerPageHeader.Info>
            <ServerPageHeader.Heading>
              <ServerPageHeader.ServerName />
              <ServerPageHeader.PageName>{t('nav.files')}</ServerPageHeader.PageName>
            </ServerPageHeader.Heading>
            <div className={'font-jetbrains mt-0.5 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400'}>
              <span className={'truncate'}>{filePath}</span>
              {hasChanges && <span className={'text-amber-500'}>*</span>}
            </div>
          </ServerPageHeader.Info>
        </ServerPageHeader.Left>
        <ServerPageHeader.Actions>
          <div className={'flex items-center gap-3'}>
            <SaveStatus status={saveStatus} errorMessage={errorMessage} />
            <Button size={'sm'} onClick={handleSave} disabled={!hasChanges || saveStatus === 'saving'}>
              <Save className={'size-4'} />
              {t('common.save')}
            </Button>
            <Link to={'/app/servers/$id/files'} params={{ id: String(serverId) }} search={{ path: parentDir }}>
              <Button variant={'secondary'} size={'sm'}>
                <ArrowLeft className={'size-4'} />
                {t('files.backToFiles')}
              </Button>
            </Link>
          </div>
        </ServerPageHeader.Actions>
      </ServerPageHeader>
      <PageContent>
        <div className={'min-h-0 flex-1 overflow-hidden rounded-xl border border-black/10 dark:border-white/10'}>
          <Editor
            height={'100%'}
            language={language}
            value={content}
            onChange={handleEditorChange}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>
        <div className={'flex shrink-0 items-center justify-between text-sm text-zinc-600 dark:text-zinc-400'}>
          <div className={'flex items-center gap-3'}>
            <Badge variant={'muted'} size={'sm'}>
              {language}
            </Badge>
            <span className={'font-jetbrains text-xs'}>{filename}</span>
          </div>
          <span className={'text-xs text-zinc-400 dark:text-zinc-500'}>{t('files.ctrlS')}</span>
        </div>
      </PageContent>
    </>
  );
}

type SaveStatusProps = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage: string | null;
};

function SaveStatus({ status, errorMessage }: SaveStatusProps) {
  const { t } = useTranslation();

  if (status === 'saving') {
    return (
      <span className={'flex items-center gap-1.5 text-sm text-emerald-600'}>
        <div className={'size-3 animate-spin rounded-full border-t-2 border-b-2 border-emerald-600'} />
        {t('files.saving')}
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className={'flex items-center gap-1.5 text-sm text-emerald-600'}>
        <Check className={'size-4'} />
        {t('files.saved')}
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className={'flex items-center gap-1.5 text-sm text-red-600'} title={errorMessage || undefined}>
        <AlertCircle className={'size-4'} />
        {t('common.error')}
      </span>
    );
  }

  return null;
}

// Map file extensions to Monaco language identifiers
function getLanguageFromExtension(filename: string): string {
  const ext = getFileExtension(filename);
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    html: 'html',
    css: 'css',
    md: 'markdown',
    py: 'python',
    java: 'java',
    sh: 'shell',
    bat: 'bat',
    cmd: 'bat',
    properties: 'ini',
    cfg: 'ini',
    conf: 'ini',
    ini: 'ini',
    toml: 'ini',
    txt: 'plaintext',
    log: 'plaintext',
    env: 'shell',
  };
  return languageMap[ext] || 'plaintext';
}
