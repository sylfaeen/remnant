import type { ComponentPropsWithoutRef, HTMLAttributes, PropsWithChildren } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@remnant/frontend/lib/cn';

export function Dialog(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

Dialog.Trigger = function DialogTrigger(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
};

Dialog.Portal = function DialogPortal(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
};

Dialog.Close = function DialogClose(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
};

Dialog.Overlay = function DialogOverlay({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-(--z-modal-backdrop) bg-black/60 backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
};

Dialog.Content = function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay />
      <DialogPrimitive.Content
        className={cn(
          'data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out fixed top-[50%] left-[50%] z-(--z-modal) w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border border-black/10 bg-white p-0 shadow-lg focus:outline-none dark:border-white/10 dark:bg-zinc-900',
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </Dialog.Portal>
  );
};

Dialog.Header = function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex items-start gap-4 border-b border-black/10 bg-linear-to-b from-zinc-500/3 to-transparent px-6 pt-6 pb-5 dark:border-white/10 dark:from-transparent',
        className
      )}
      {...props}
    />
  );
};

Dialog.Icon = function DialogIcon({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', className)}>{children}</div>;
};

Dialog.Title = function DialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100', className)}
      {...props}
    />
  );
};

Dialog.Description = function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('mt-0.5 text-sm text-zinc-500 dark:text-zinc-400', className)} {...props} />;
};

Dialog.Body = function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-4 px-6 pt-5 pb-2', className)} {...props} />;
};

Dialog.Footer = function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-col-reverse border-t border-black/10 px-6 py-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-white/10',
        className
      )}
      {...props}
    />
  );
};

Dialog.Error = function DialogError({ children }: PropsWithChildren) {
  return <div className={'rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-600'}>{children}</div>;
};
