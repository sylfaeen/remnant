import { cn } from '@remnant/frontend/lib/cn';

type SkeletonProps = {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
};

export function Skeleton({ className, variant = 'text', width, height, animate = true }: SkeletonProps) {
  const variantStyles = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn('bg-zinc-100 dark:bg-zinc-800', variantStyles[variant], animate && 'animate-skeleton', className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

Skeleton.Text = function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={`line-${i}`} variant={'text'} className={cn('h-4', i === lines - 1 && 'w-3/4')} />
      ))}
    </div>
  );
};

type SkeletonAvatarProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

Skeleton.Avatar = function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-14',
  };

  return <Skeleton variant={'circular'} className={cn(sizeClasses[size], className)} />;
};

Skeleton.Card = function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900', className)}>
      <div className={'flex items-start gap-4'}>
        <Skeleton.Avatar size={'lg'} />
        <div className={'flex-1 space-y-2'}>
          <Skeleton variant={'text'} className={'h-5 w-1/3'} />
          <Skeleton variant={'text'} className={'h-4 w-2/3'} />
        </div>
      </div>
      <div className={'mt-4 space-y-2'}>
        <Skeleton variant={'text'} className={'h-4'} />
        <Skeleton variant={'text'} className={'h-4'} />
        <Skeleton variant={'text'} className={'size-4/5'} />
      </div>
    </div>
  );
};

type SkeletonTableProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

Skeleton.Table = function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className={'flex gap-4 border-b border-black/10 pb-3 dark:border-white/10'}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant={'text'} className={'h-4 flex-1'} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className={'flex gap-4 py-2'}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant={'text'} className={'h-4 flex-1'} />
          ))}
        </div>
      ))}
    </div>
  );
};

Skeleton.StatCard = function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900', className)}>
      <div className={'flex items-start justify-between'}>
        <div className={'space-y-2'}>
          <Skeleton variant={'text'} className={'h-3 w-20'} />
          <Skeleton variant={'text'} className={'h-8 w-16'} />
          <Skeleton variant={'text'} className={'h-3 w-24'} />
        </div>
        <Skeleton variant={'rectangular'} className={'size-11 rounded-xl'} />
      </div>
    </div>
  );
};

Skeleton.ServerCard = function SkeletonServerCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900', className)}>
      <div className={'mb-6 flex items-start justify-between'}>
        <div className={'flex items-center gap-4'}>
          <Skeleton variant={'rectangular'} className={'size-14 rounded-xl'} />
          <div className={'space-y-2'}>
            <Skeleton variant={'text'} className={'h-6 w-32'} />
            <Skeleton variant={'text'} className={'h-4 w-24'} />
          </div>
        </div>
        <Skeleton variant={'rectangular'} className={'h-7 w-20 rounded-full'} />
      </div>
      <div className={'mb-6 flex items-center gap-3 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800'}>
        <Skeleton variant={'rectangular'} className={'size-10 rounded-lg'} />
        <div className={'space-y-1.5'}>
          <Skeleton variant={'text'} className={'h-3 w-12'} />
          <Skeleton variant={'text'} className={'h-7 w-16'} />
        </div>
        <div className={'ml-auto flex -space-x-2'}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.Avatar key={`avatar-${i}`} size={'sm'} />
          ))}
        </div>
      </div>
      <div className={'grid grid-cols-2 gap-4'}>
        <div className={'space-y-3 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800'}>
          <div className={'flex items-center justify-between'}>
            <Skeleton variant={'text'} className={'h-4 w-12'} />
            <Skeleton variant={'text'} className={'h-5 w-10'} />
          </div>
          <Skeleton variant={'rectangular'} className={'h-2 rounded-full'} />
        </div>
        <div className={'space-y-3 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800'}>
          <div className={'flex items-center justify-between'}>
            <Skeleton variant={'text'} className={'h-4 w-12'} />
            <Skeleton variant={'text'} className={'h-5 w-10'} />
          </div>
          <Skeleton variant={'rectangular'} className={'h-2 rounded-full'} />
        </div>
      </div>
    </div>
  );
};
