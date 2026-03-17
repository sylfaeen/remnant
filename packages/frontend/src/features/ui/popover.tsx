import type { ComponentPropsWithoutRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@remnant/frontend/lib/cn';

export function Popover(props: ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

Popover.Trigger = function PopoverTrigger(props: ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />;
};

Popover.Content = function PopoverContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(
          'z-50 max-w-72 rounded-xl border border-black/10 bg-white p-4 text-sm text-zinc-600 shadow-lg',
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        {...{ sideOffset }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
};
