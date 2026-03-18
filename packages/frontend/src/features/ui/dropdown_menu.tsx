import type { ComponentPropsWithoutRef } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@remnant/frontend/lib/cn';

export function DropdownMenu(props: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

DropdownMenu.Trigger = function DropdownMenuTrigger(props: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
};

DropdownMenu.Content = function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'animate-fade-in z-(--z-modal) min-w-44 rounded-xl border border-black/10 bg-white p-1 shadow-lg',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

DropdownMenu.Item = function DropdownMenuItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors outline-none data-[highlighted]:bg-zinc-100 dark:text-zinc-300 dark:data-[highlighted]:bg-zinc-800',
        className
      )}
      {...props}
    />
  );
};

DropdownMenu.Separator = function DropdownMenuSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn('my-1 h-px bg-black/4', className)} {...props} />;
};
