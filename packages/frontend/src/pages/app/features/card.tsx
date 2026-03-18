import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { cn } from '@remnant/frontend/lib/cn';
import { Badge } from '@remnant/frontend/features/ui/badge';

type FeatureCardProps = ComponentProps<'div'>;

export function FeatureCard({ className, ...rest }: FeatureCardProps) {
  return <div className={cn('overflow-hidden rounded-xl bg-zinc-50 p-1 shadow-inner dark:bg-zinc-800', className)} {...rest} />;
}

type FeatureCardHeaderProps = ComponentProps<'div'>;

FeatureCard.Header = function FeatureCardHeader({ className, ...rest }: FeatureCardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col items-start justify-between gap-x-6 gap-y-3 px-5 py-4 sm:flex-row sm:items-center', className)}
      {...rest}
    />
  );
};

type FeatureCardContentProps = ComponentProps<'div'>;

FeatureCard.Content = function FeatureCardContent({ className, ...rest }: FeatureCardContentProps) {
  return <div className={cn('space-y-1', className)} {...rest} />;
};

type FeatureCardTitleProps = ComponentProps<'h3'> & {
  count?: ReactNode;
};

FeatureCard.Title = function FeatureCardTitle({ count, className, children, ...rest }: FeatureCardTitleProps) {
  return (
    <h3 className={cn('text-strong flex items-center gap-2 font-medium', className)} {...rest}>
      {children}
      {count !== undefined && <Badge size={'md'}>{count}</Badge>}
    </h3>
  );
};

type FeatureCardDescriptionProps = ComponentProps<'p'>;

FeatureCard.Description = function FeatureCardDescription({ className, ...rest }: FeatureCardDescriptionProps) {
  return <p className={cn('text-sm text-zinc-600 dark:text-zinc-400', className)} {...rest} />;
};

type FeatureCardActionsProps = ComponentProps<'div'>;

FeatureCard.Actions = function FeatureCardActions({ className, ...rest }: FeatureCardActionsProps) {
  return <div className={cn('flex items-center justify-end gap-2', className)} {...rest} />;
};

type FeatureCardBodyProps = ComponentProps<'div'>;

FeatureCard.Body = function FeatureCardBody({ className, ...rest }: FeatureCardBodyProps) {
  return (
    <div className={cn('shadow-inner-xs rounded-lg bg-white dark:bg-zinc-900', className)}>
      <div className={'divide-y divide-black/10 *:first:rounded-t-lg *:last:rounded-b-lg dark:divide-white/10'} {...rest} />
    </div>
  );
};

type FeatureCardRowLayout = 'row' | 'column';

type FeatureCardRowProps = ComponentProps<'div'> & {
  layout?: FeatureCardRowLayout;
  interactive?: boolean;
};

FeatureCard.Row = function FeatureCardRow({ layout = 'row', interactive = false, className, ...rest }: FeatureCardRowProps) {
  return (
    <div
      className={cn(
        'flex w-full justify-between gap-4 px-5 py-4',
        layout === 'row' && 'flex-col items-start sm:flex-row sm:items-center sm:gap-8',
        layout === 'column' && 'flex-col items-start',
        interactive && 'hover:bg-card-hover',
        className
      )}
      {...rest}
    />
  );
};

type FeatureCardRowLabelProps = ComponentProps<'div'> & {
  description?: ReactNode;
};

FeatureCard.RowLabel = function FeatureCardRowLabel({ description, className, children, ...rest }: FeatureCardRowLabelProps) {
  return (
    <div className={cn('text-strong shrink text-sm font-medium', className)} data-slot={'label'} {...rest}>
      {children}
      {description && <p className={'text-weak mt-1 text-sm font-normal sm:text-pretty'}>{description}</p>}
    </div>
  );
};

type FeatureCardRowControlProps = ComponentProps<'div'>;

FeatureCard.RowControl = function FeatureCardRowControl({ className, ...rest }: FeatureCardRowControlProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-start gap-1 sm:justify-end', className)}
      data-slot={'control'}
      {...rest}
    />
  );
};

type FeatureCardFooterProps = ComponentProps<'div'>;

FeatureCard.Footer = function FeatureCardFooter({ className, ...rest }: FeatureCardFooterProps) {
  return <div className={cn('p-4', className)} {...rest} />;
};

type FeatureCardStackProps = PropsWithChildren<ComponentProps<'div'>>;

FeatureCard.Stack = function FeatureCardStack({ className, ...rest }: FeatureCardStackProps) {
  return <div className={cn('flex w-full flex-col gap-y-4', className)} {...rest} />;
};
