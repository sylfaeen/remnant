import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@remnant/frontend/lib/cn';

export const badgeVariants = cva('inline-flex items-center font-medium', {
  variants: {
    variant: {
      default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
      muted: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
      success: 'bg-emerald-600/10 dark:bg-emerald-400/10 text-emerald-700',
      warning: 'bg-amber-500/10 dark:bg-amber-400/10 text-amber-600',
      info: 'bg-teal-500/10 text-teal-500',
      cyan: 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700',
      blue: 'bg-blue-600/10 text-blue-700',
      violet: 'bg-violet-600/10 text-violet-700',
    },
    size: {
      xs: 'rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider',
      sm: 'rounded-md px-1.5 py-0.5 text-xs uppercase tracking-wider',
      md: 'rounded-full px-2.5 py-0.5 text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}
