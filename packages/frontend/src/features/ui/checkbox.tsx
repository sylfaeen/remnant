import type { ComponentPropsWithoutRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';

export function Checkbox({ className, ...props }: ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer size-5 shrink-0 rounded border border-black/10 bg-white transition-colors focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:border-white/10 dark:bg-zinc-900',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={'flex items-center justify-center'}>
        <Check className={'size-4'} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
