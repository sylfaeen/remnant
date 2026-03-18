import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FileQuestion } from 'lucide-react';
import { MarkdownRenderer } from '@remnant/frontend/pages/app/docs/features/markdown_renderer';
import { TableOfContents } from '@remnant/frontend/pages/app/docs/features/table_of_contents';
import { docsContent } from '@remnant/frontend/pages/app/docs/features/docs_content';

export function MarkdownPage() {
  const { slug } = useParams({ strict: false });
  const content = slug ? docsContent[slug] : undefined;

  if (!content) {
    return <DocsNotFound />;
  }

  return (
    <>
      <div className={'content'}>
        <div className={'content-container'}>
          <MarkdownRenderer {...{ content }} />
        </div>
      </div>
      <div className={'aside'}>
        <div className={'aside-curtain'} />
        <div className={'aside-container'}>
          <div className={'aside-content'}>
            <TableOfContents {...{ content }} />
          </div>
        </div>
      </div>
    </>
  );
}

function DocsNotFound() {
  const { t } = useTranslation();

  return (
    <div className={'flex flex-col items-center justify-center py-20'}>
      <div className={'flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800'}>
        <FileQuestion className={'size-7 text-zinc-400 dark:text-zinc-500'} strokeWidth={1.5} />
      </div>
      <h2 className={'mt-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100'}>{t('docs.notFound')}</h2>
      <p className={'mt-1 text-sm text-zinc-500 dark:text-zinc-400'}>{t('docs.notFoundDescription')}</p>
    </div>
  );
}
