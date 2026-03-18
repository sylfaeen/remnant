import { type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@remnant/frontend/lib/cn';

export const inputVariants = cva(
  [
    'flex w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 dark:placeholder:text-zinc-400 transition-all duration-(--duration-fast) disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-offset-0',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 hover:border-black/12 dark:hover:border-white/12',
        ghost:
          'bg-transparent border border-transparent focus:border-black/10 dark:focus:border-white/10 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 hover:bg-zinc-100 dark:hover:bg-zinc-800',
        filled:
          'bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 hover:bg-zinc-100 dark:hover:bg-zinc-800',
      },
      inputSize: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-3.5 text-sm rounded-lg',
        lg: 'h-12 px-4 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  error?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, variant, inputSize, error, type, ref, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        inputVariants({ variant, inputSize }),
        error && 'border-red-600 focus:border-red-600 focus:ring-red-600/20',
        className
      )}
      ref={ref}
      {...props}
    />
  );
}

export type InputGroupProps = {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function InputGroup({ label, error, hint, required, children, className }: InputGroupProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className={'text-sm font-medium text-zinc-900 dark:text-zinc-100'}>
          {label}
          {required && <span className={'ml-1 text-red-600'}>*</span>}
        </label>
      )}
      {children}
      {error && <p className={'text-sm text-red-600'}>{error}</p>}
      {hint && !error && <p className={'text-sm text-zinc-600 dark:text-zinc-400'}>{hint}</p>}
    </div>
  );
}
