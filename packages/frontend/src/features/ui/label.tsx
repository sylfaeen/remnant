import type { ComponentPropsWithoutRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@remnant/frontend/lib/cn';

export function Label({ className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm font-medium text-zinc-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className)}
      {...props}
    />
  );
}
