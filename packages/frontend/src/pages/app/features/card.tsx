import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { cn } from '@remnant/frontend/lib/cn';
import { Badge } from '@remnant/frontend/features/ui/badge';

type FeatureCardProps = HTMLAttributes<HTMLDivElement>;

export function FeatureCard({ className, ...props }: FeatureCardProps) {
  return <div className={cn('overflow-hidden rounded-xl bg-zinc-50 p-1 shadow-inner', className)} {...props} />;
}

type FeatureCardHeaderProps = {
  actions?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

FeatureCard.Header = function FeatureCardHeader({ actions, className, children, ...props }: FeatureCardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col items-start justify-between gap-x-6 gap-y-3 px-5 py-4 sm:flex-row sm:items-center', className)}
      {...props}
    >
      <div className={'space-y-1'}>{children}</div>
      {actions}
    </div>
  );
};

type FeatureCardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  count?: ReactNode;
};

FeatureCard.Title = function FeatureCardTitle({ count, className, children, ...props }: FeatureCardTitleProps) {
  return (
    <h3 className={cn('text-strong flex items-center gap-2 font-medium', className)} {...props}>
      {children}
      {count !== undefined && <Badge size={'md'}>{count}</Badge>}
    </h3>
  );
};

type FeatureCardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

FeatureCard.Description = function FeatureCardDescription({ className, ...props }: FeatureCardDescriptionProps) {
  return <p className={cn('text-sm text-zinc-600', className)} {...props} />;
};

type FeatureCardBodyProps = HTMLAttributes<HTMLDivElement>;

FeatureCard.Body = function FeatureCardBody({ className, ...props }: FeatureCardBodyProps) {
  return (
    <div className={cn('shadow-inner-xs rounded-lg bg-white', className)}>
      <div className={'divide-y divide-black/10 *:first:rounded-t-lg *:last:rounded-b-lg'} {...props} />
    </div>
  );
};

type FeatureCardRowLayout = 'row' | 'column';

type FeatureCardRowProps = {
  layout?: FeatureCardRowLayout;
  interactive?: boolean;
} & HTMLAttributes<HTMLDivElement>;

FeatureCard.Row = function FeatureCardRow({ layout = 'row', interactive = false, className, ...props }: FeatureCardRowProps) {
  return (
    <div
      className={cn(
        'flex w-full justify-between gap-4 px-5 py-4',
        layout === 'row' && 'flex-col items-start sm:flex-row sm:items-center sm:gap-8',
        layout === 'column' && 'flex-col items-start',
        interactive && 'hover:bg-card-hover',
        className
      )}
      {...props}
    />
  );
};

type FeatureCardRowLabelProps = {
  description?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

FeatureCard.RowLabel = function FeatureCardRowLabel({ description, className, children, ...props }: FeatureCardRowLabelProps) {
  return (
    <div className={cn('text-strong shrink text-sm font-medium', className)} data-slot={'label'} {...props}>
      {children}
      {description && <p className={'text-weak mt-1 text-sm font-normal sm:text-pretty'}>{description}</p>}
    </div>
  );
};

type FeatureCardRowControlProps = HTMLAttributes<HTMLDivElement>;

FeatureCard.RowControl = function FeatureCardRowControl({ className, ...props }: FeatureCardRowControlProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-start gap-1 sm:justify-end', className)}
      data-slot={'control'}
      {...props}
    />
  );
};

type FeatureCardFooterProps = HTMLAttributes<HTMLDivElement>;

FeatureCard.Footer = function FeatureCardFooter({ className, ...props }: FeatureCardFooterProps) {
  return <div className={cn('p-4', className)} {...props} />;
};

type FeatureCardStackProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

FeatureCard.Stack = function FeatureCardStack({ className, ...props }: FeatureCardStackProps) {
  return <div className={cn('flex w-full flex-col gap-y-4', className)} {...props} />;
};
