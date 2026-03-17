import type { ComponentPropsWithoutRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@remnant/frontend/lib/cn';

export function Tooltip(props: ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

Tooltip.Provider = function TooltipProvider(props: ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider {...props} />;
};

Tooltip.Trigger = function TooltipTrigger(props: ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />;
};

Tooltip.Content = function TooltipContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'z-50 max-w-80 rounded-xl border border-black/10 bg-white p-4 text-sm text-zinc-600 shadow-lg',
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        {...{ sideOffset }}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
};
