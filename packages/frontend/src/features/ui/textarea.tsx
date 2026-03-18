import { type TextareaHTMLAttributes, type Ref } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@remnant/frontend/lib/cn';
import { inputVariants } from '@remnant/frontend/features/ui/input';

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> &
  Omit<VariantProps<typeof inputVariants>, 'inputSize'> & {
    error?: boolean;
    ref?: Ref<HTMLTextAreaElement>;
  };

export function Textarea({ className, variant, error, ref, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'duration-(--duration-fast focus:ring-offset- flex min-h-20 w-full resize-y py-3 text-zinc-900 transition-all placeholder:text-zinc-600 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-4 dark:placeholder:text-zinc-400',
        variant === 'ghost' &&
          'border border-transparent bg-transparent hover:bg-zinc-100 focus:border-black/10 focus:ring-zinc-900/20',
        variant === 'filled' && 'border border-black/10 bg-white hover:bg-zinc-100 focus:border-zinc-900 focus:ring-zinc-900/20',
        (variant === 'default' || !variant) &&
          'border border-black/10 bg-white hover:border-black/12 focus:border-zinc-900 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/12 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20',
        error && 'border-red-600 focus:border-red-600 focus:ring-red-600/20',
        'rounded-lg px-3.5 text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
