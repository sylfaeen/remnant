import { useTranslation } from 'react-i18next';
import { PageContent } from '@remnant/frontend/pages/app/features/page_content';

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <PageContent>
      <div className={'space-y-8'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight text-zinc-900'}>{t('dashboard.title')}</h1>
          <p className={'mt-1 text-zinc-600'}>{t('dashboard.welcome')}</p>
        </div>
      </div>
    </PageContent>
  );
}
