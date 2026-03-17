import type { ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@remnant/frontend/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-[var(--duration-fast)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring-color)] focus-visible:ring-offset-zinc-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-800 text-white font-semibold shadow-sm hover:shadow-glow-sm hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-600 active:scale-[0.98] border border-emerald-600/20',
        secondary:
          'bg-white/80 backdrop-blur-sm text-zinc-900 border border-black/10 shadow-xs hover:bg-zinc-100 hover:border-black/12 hover:shadow-sm active:bg-zinc-200 active:scale-[0.98]',
        ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200',
        'ghost-danger': 'text-red-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100',
        danger:
          'bg-red-600 text-white font-semibold shadow-sm hover:bg-red-700 hover:shadow-glow-danger active:scale-[0.98] border border-red-600/20',
        success:
          'bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700 hover:shadow-glow-success active:scale-[0.98] border border-emerald-600/20',
        outline: 'border border-black/10 text-zinc-900 hover:bg-white/85 hover:border-emerald-600/30 active:bg-zinc-200',
        link: 'text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700',
      },
      size: {
        xs: 'h-7 px-2.5 text-sm rounded-md',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-5 text-base rounded-lg',
        xl: 'h-12 px-6 text-base rounded-xl',
        icon: 'size-10 rounded-lg',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-12 rounded-xl',
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
