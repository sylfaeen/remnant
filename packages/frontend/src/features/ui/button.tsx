import type { ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@remnant/frontend/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-zinc-900 text-zinc-50 shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200',
        secondary:
          'bg-white text-zinc-900 border border-zinc-200 shadow-xs hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        ghost:
          'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        'ghost-danger':
          'text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-400',
        danger: 'bg-red-500 text-zinc-50 shadow-sm hover:bg-red-600 dark:bg-red-900 dark:text-zinc-50 dark:hover:bg-red-800',
        success: 'bg-emerald-600 text-zinc-50 shadow-sm hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600',
        outline:
          'border border-zinc-200 bg-white shadow-xs hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        link: 'text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 rounded-md px-3 text-sm',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-11 rounded-md px-8',
        icon: 'size-9',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({ className, variant, size, asChild = false, loading = false, disabled, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return <Comp className={cn(buttonVariants({ variant, size, className }))} disabled={isDisabled} {...props} />;
}
