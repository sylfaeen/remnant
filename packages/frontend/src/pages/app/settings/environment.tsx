import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as monaco from 'monaco-editor';
import { TriangleAlert, Eye, Save } from 'lucide-react';
import { trpc } from '@remnant/frontend/lib/trpc';
import { useToast } from '@remnant/frontend/features/ui/toast';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';
import { Button } from '@remnant/frontend/features/ui/button';
import { PageLoader } from '@remnant/frontend/features/ui/page_loader';
import { useThemeStore } from '@remnant/frontend/stores/theme_store';
import { cn } from '@remnant/frontend/lib/cn';
import {
  registerMonacoThemes,
  SHARED_COLORS_LIGHT,
  SHARED_COLORS_DARK,
  type Monaco,
  MONACO_CONTAINER_CLASS,
} from '@remnant/frontend/lib/monaco';
import { FeatureCard } from '@remnant/frontend/pages/app/features/card';
import Editor from '@monaco-editor/react';

const ENV_LANGUAGE_ID = 'env';
const ENV_THEME_LIGHT = 'env-light';
const ENV_THEME_DARK = 'env-dark';

let envRegistered = false;

export function SettingsEnvironmentPage() {
  return (
    <PageContent>
      <div className={'space-y-4'}>
        <RestartBanner />
        <FeatureCard.Stack>
          <EnvironmentSection />
        </FeatureCard.Stack>
      </div>
    </PageContent>
  );
}

function EnvironmentSection() {
  const { t } = useTranslation();

  const isDark = useThemeStore((s) => s.isDark);
  const { addToast } = useToast();
  const utils = trpc.useUtils();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const { data: initialContent, isLoading } = trpc.env.getContent.useQuery();

  const [content, setContent] = useState<string>('');
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
      setHasChanges(false);
    }
  }, [initialContent]);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setContent(value);
        setHasChanges(value !== initialContent);
        setSaveStatus('idle');
      }
    },
    [initialContent]
  );

  const saveMutation = trpc.env.saveContent.useMutation({
    onSuccess: () => {
      utils.env.getContent.invalidate().then();
      addToast({ type: 'success', title: t('toast.envUpdated') });
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => {
      addToast({ type: 'error', title: t('toast.envUpdateError') });
      setSaveStatus('error');
    },
  });

  const handleSave = useCallback(() => {
    if (!hasChanges) return;
    setSaveStatus('saving');
    saveMutation.mutate({ content });
  }, [hasChanges, content, saveMutation]);

  const handleCancel = useCallback(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
      setHasChanges(false);
      setSaveStatus('idle');
    }
  }, [initialContent]);

  const handleEditorMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: !revealed });
    }
  }, [revealed]);

  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : (
        <FeatureCard>
          <FeatureCard.Header>
            <FeatureCard.Content>
              <FeatureCard.Title>{t('environment.title')}</FeatureCard.Title>
              <FeatureCard.Description dangerouslySetInnerHTML={{ __html: t('environment.subtitle') }} />
            </FeatureCard.Content>
          </FeatureCard.Header>
          <FeatureCard.Body>
            <FeatureCard.Row>
              <FeatureCard.Stack>
                <FeatureCard.RowLabel description={"Your application's environment variables."}>
                  Environment variables
                </FeatureCard.RowLabel>
                <div
                  className={cn(
                    'relative min-h-0 flex-1 overflow-hidden rounded-md border border-black/10 shadow-xs dark:border-white/10',
                    MONACO_CONTAINER_CLASS
                  )}
                >
                  <Editor
                    height={'400px'}
                    language={ENV_LANGUAGE_ID}
                    value={content}
                    onChange={handleEditorChange}
                    theme={isDark ? ENV_THEME_DARK : ENV_THEME_LIGHT}
                    beforeMount={registerEnvLanguageAndThemes}
                    onMount={handleEditorMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      padding: { top: 12, bottom: 12 },
                      readOnly: !revealed,
                      lineHeight: 20,
                      glyphMargin: false,
                      folding: false,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'all',
                      overviewRulerLanes: 0,
                      hideCursorInOverviewRuler: true,
                      overviewRulerBorder: false,
                      scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        verticalScrollbarSize: 14,
                        horizontalScrollbarSize: 12,
                      },
                    }}
                  />
                  {!revealed && <RevealOverlay onReveal={() => setRevealed(true)} />}
                </div>
              </FeatureCard.Stack>
            </FeatureCard.Row>
          </FeatureCard.Body>
          {revealed && (
            <FeatureCard.Footer>
              <div className={'flex items-center justify-end gap-2'}>
                <Button variant={'secondary'} size={'sm'} onClick={handleCancel} disabled={!hasChanges}>
                  {t('common.cancel')}
                </Button>
                <Button size={'sm'} onClick={handleSave} disabled={!hasChanges || saveStatus === 'saving'}>
                  <Save className={'size-4'} />
                  {t('common.save')}
                </Button>
              </div>
            </FeatureCard.Footer>
          )}
        </FeatureCard>
      )}
    </>
  );
}

function RestartBanner() {
  const { t } = useTranslation();

  return (
    <div className={'flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-50 px-4 py-3 dark:bg-amber-950/30'}>
      <TriangleAlert className={'size-4 shrink-0 text-amber-600 dark:text-amber-500'} strokeWidth={2} />
      <p
        className={'text-sm text-amber-800 dark:text-amber-200'}
        dangerouslySetInnerHTML={{ __html: t('environment.restartWarning') }}
      />
    </div>
  );
}

type RevealOverlayProps = {
  onReveal: () => void;
};

function RevealOverlay({ onReveal }: RevealOverlayProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex flex-col items-center justify-center gap-4',
        'bg-white/30 backdrop-blur-md dark:bg-zinc-900/30'
      )}
    >
      <p className={'text-sm font-medium text-zinc-700 dark:text-zinc-300'}>{t('environment.revealDescription')}</p>
      <Button variant={'secondary'} size={'sm'} onClick={onReveal}>
        <Eye className={'size-4'} />
        {t('environment.reveal')}
      </Button>
    </div>
  );
}

function registerEnvLanguageAndThemes(instance: Monaco): void {
  registerMonacoThemes(instance);

  if (envRegistered) return;
  envRegistered = true;

  instance.languages.register({ id: ENV_LANGUAGE_ID });
  instance.languages.setMonarchTokensProvider(ENV_LANGUAGE_ID, {
    tokenizer: {
      root: [
        [/#.*$/, 'comment'],
        [/^[A-Z_][A-Z0-9_]*/, 'variable'],
        [/=/, 'delimiter'],
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
        [/https?:\/\/[^\s]+/, 'link'],
      ],
    },
  });

  instance.editor.defineTheme(ENV_THEME_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'variable', foreground: '8e4ec6' },
      { token: 'comment', foreground: '80838D' },
      { token: 'string', foreground: '1a7f37' },
      { token: 'delimiter', foreground: '1e1e1e' },
      { token: 'link', foreground: '1e1e1e' },
    ],
    colors: SHARED_COLORS_LIGHT,
  });

  instance.editor.defineTheme(ENV_THEME_DARK, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'variable', foreground: 'bf7af0' },
      { token: 'comment', foreground: '6a9955' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'delimiter', foreground: 'd4d4d4' },
      { token: 'link', foreground: 'd4d4d4' },
    ],
    colors: SHARED_COLORS_DARK,
  });
}
