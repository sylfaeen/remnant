import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@remnant/frontend/lib/cn';

const cardVariants = cva(['rounded-xl transition-all duration-[var(--duration-normal)]'], {
  variants: {
    variant: {
      default: 'bg-white border border-black/10 shadow-card',
      elevated: 'bg-white border border-black/10 shadow-lg',
      glass: 'bg-white/85 backdrop-blur-xl border border-black/5 shadow-lg',
      interactive:
        'bg-white border border-black/10 shadow-card hover:border-black/10 hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer',
      accent: 'bg-white border border-emerald-600/30 shadow-card hover:shadow-glow',
      ghost: 'border border-black/10',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'none',
  },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding, className }))} {...props} />;
}

Card.Header = function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', 'border-b border-black/10', className)} {...props} />;
};

Card.Title = function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-semibold tracking-tight text-zinc-900', className)} {...props} />;
};

Card.Content = function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
};

type CardStatProps = {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
};

Card.Stat = function CardStat({ label, value, trend, className }: CardStatProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className={'mb-1 text-sm tracking-wider text-zinc-600 uppercase'}>{label}</span>
      <span className={'text-2xl font-bold tracking-tight text-zinc-900'}>{value}</span>
      {trend && (
        <span
          className={cn(
            'mt-1 text-sm',
            trend === 'up' && 'text-emerald-600',
            trend === 'down' && 'text-red-600',
            trend === 'neutral' && 'text-zinc-600'
          )}
        >
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
        </span>
      )}
    </div>
  );
};
