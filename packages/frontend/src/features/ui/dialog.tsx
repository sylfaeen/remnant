import type { ComponentProps, ComponentPropsWithoutRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@remnant/frontend/lib/cn';

export function Dialog(rest: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...rest} />;
}

Dialog.Trigger = function DialogTrigger(rest: ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...rest} />;
};

Dialog.Portal = function DialogPortal(rest: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...rest} />;
};

Dialog.Close = function DialogClose(rest: ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...rest} />;
};

Dialog.Overlay = function DialogOverlay({ className, ...rest }: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-(--z-modal-backdrop) bg-black/60 backdrop-blur-sm',
        className
      )}
      {...rest}
    />
  );
};

Dialog.Content = function DialogContent({ className, ...rest }: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay />
      <DialogPrimitive.Content
        className={cn(
          'data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out fixed top-[50%] left-[50%] z-(--z-modal) w-full max-w-xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border border-black/10 bg-white p-0 shadow-lg focus:outline-none dark:border-white/10 dark:bg-zinc-900',
          className
        )}
        {...rest}
      />
    </Dialog.Portal>
  );
};

Dialog.Header = function DialogHeader({ className, ...rest }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative flex items-center gap-4 border-b border-black/10 px-6 pt-6 pb-5 dark:border-white/10', className)}
      {...rest}
    />
  );
};

Dialog.Icon = function DialogIcon({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', className)} {...rest} />;
};

Dialog.Title = function DialogTitle({ className, ...rest }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100', className)}
      {...rest}
    />
  );
};

Dialog.Description = function DialogDescription({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('mt-0.5 text-sm text-zinc-500 dark:text-zinc-400', className)} {...rest} />;
};

Dialog.Body = function DialogBody({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('space-y-4 px-6 pt-5 pb-2', className)} {...rest} />;
};

Dialog.Footer = function DialogFooter({ className, ...rest }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-col-reverse border-t border-black/10 px-6 py-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-white/10',
        className
      )}
      {...rest}
    />
  );
};

Dialog.Error = function DialogError({ className, ...rest }: ComponentProps<'div'>) {
  return (
    <div className={cn('rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-600', className)} {...rest} />
  );
};
