import { type Ref, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@remnant/frontend/lib/cn';

const selectVariants = cva(
  [
    'flex w-full appearance-none text-zinc-900 transition-all duration-(--duration-fast) disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-offset-0 pr-9',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 hover:border-black/12 dark:hover:border-white/12',
        ghost: 'bg-transparent border border-transparent focus:border-black/10 focus:ring-zinc-900/20 hover:bg-zinc-100',
        filled: 'bg-white border border-black/10 focus:border-zinc-900 focus:ring-zinc-900/20 hover:bg-zinc-100',
      },
      selectSize: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-3.5 text-sm rounded-lg',
        lg: 'h-12 px-4 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
);

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>, VariantProps<typeof selectVariants> {
  error?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ className, variant, selectSize, error, ref, children, ...props }: SelectProps) {
  return (
    <div className={'relative'}>
      <select
        className={cn(
          selectVariants({ variant, selectSize }),
          error && 'border-red-600 focus:border-red-600 focus:ring-red-600/20',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className={'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-400'}
        strokeWidth={2}
      />
    </div>
  );
}
