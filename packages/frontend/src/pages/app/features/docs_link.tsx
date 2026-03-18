import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Tooltip } from '@remnant/frontend/features/ui/tooltip';

type DocsLinkProps = {
  path: string;
};

export function DocsLink({ path }: DocsLinkProps) {
  const { t } = useTranslation();
  const slug = path.replace(/^\/guide\//, '').replace(/^\//, '');

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Link
            to={'/app/docs/$slug'}
            params={{ slug }}
            className={
              'inline-flex items-center rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300'
            }
          >
            <BookOpen className={'size-4'} strokeWidth={2} />
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{t('common.documentation')}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}
