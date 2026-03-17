import type { PropsWithChildren, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';
import { Badge } from '@remnant/frontend/features/ui/badge';

export function ServerSection({ children }: { children: ReactNode }) {
  return <div className={'rounded-xl border border-black/10 bg-white'}>{children}</div>;
}

ServerSection.Header = function ServerSectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className={'flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 sm:px-6 sm:py-4'}>
      {children}
    </div>
  );
};

ServerSection.HeaderGroup = function ServerSectionHeaderGroup({ children }: { children: ReactNode }) {
  return <div className={'flex items-center gap-3'}>{children}</div>;
};

ServerSection.HeaderInfo = function ServerSectionHeaderInfo({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
};

ServerSection.Icon = function ServerSectionIcon({ icon: IconComponent }: { icon: LucideIcon }) {
  return <IconComponent className={'size-5 text-zinc-700'} strokeWidth={1.75} />;
};

ServerSection.Title = function ServerSectionTitle({ children }: { children: ReactNode }) {
  return <h2 className={'text-lg font-semibold text-zinc-900'}>{children}</h2>;
};

ServerSection.Description = function ServerSectionDescription({ children }: { children: ReactNode }) {
  return <p className={'text-sm text-zinc-600'}>{children}</p>;
};

ServerSection.Count = function ServerSectionCount({ children }: { children: ReactNode }) {
  return <Badge size={'md'}>{children}</Badge>;
};

ServerSection.HeaderAction = function ServerSectionHeaderAction({ children }: { children: ReactNode }) {
  return <>{children}</>;
};

ServerSection.Body = function ServerSectionBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>;
};

ServerSection.Empty = function ServerSectionEmpty({ children }: PropsWithChildren) {
  return (
    <div className={'relative overflow-hidden py-12'}>
      <div className={'absolute inset-0 bg-linear-to-b from-green-600/2 to-transparent'} />
      <div className={'relative flex flex-col items-center'}>{children}</div>
    </div>
  );
};

ServerSection.EmptyIcon = function ServerSectionEmptyIcon({ icon: IconComponent }: { icon: LucideIcon }) {
  return (
    <div className={'mb-3 flex size-12 items-center justify-center rounded-2xl bg-zinc-100'}>
      <IconComponent className={'size-6 text-zinc-300'} strokeWidth={1.5} />
    </div>
  );
};

ServerSection.EmptyTitle = function ServerSectionEmptyTitle({ children }: { children: ReactNode }) {
  return <p className={'mt-2 font-medium text-zinc-600'}>{children}</p>;
};

ServerSection.EmptyDescription = function ServerSectionEmptyDescription({ children }: { children: ReactNode }) {
  return <p className={'mt-0.5 text-sm text-zinc-500'}>{children}</p>;
};
