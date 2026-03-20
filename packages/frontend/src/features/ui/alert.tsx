import { createContext, use, type ComponentProps } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';

type AlertVariant = 'warning' | 'error' | 'success' | 'info';

const variants: Record<AlertVariant, { container: string; icon: string; text: string }> = {
  warning: {
    container: 'border-amber-500/20 bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-500',
    text: 'text-amber-800 dark:text-amber-200',
  },
  error: {
    container: 'border-red-500/20 bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-600 dark:text-red-500',
    text: 'text-red-800 dark:text-red-200',
  },
  success: {
    container: 'border-green-500/20 bg-green-50 dark:bg-green-950/30',
    icon: 'text-green-600 dark:text-green-500',
    text: 'text-green-800 dark:text-green-200',
  },
  info: {
    container: 'border-blue-500/20 bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-500',
    text: 'text-blue-800 dark:text-blue-200',
  },
};

const icons: Record<AlertVariant, typeof TriangleAlert> = {
  warning: TriangleAlert,
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
};

const AlertContext = createContext<AlertVariant>('warning');

type AlertProps = ComponentProps<'div'> & {
  variant?: AlertVariant;
};

export function Alert({ variant = 'warning', className, children, ...rest }: AlertProps) {
  const Icon = icons[variant];

  return (
    <AlertContext value={variant}>
      <div
        className={cn('flex items-center gap-3 rounded-lg border px-4 py-3', variants[variant].container, className)}
        role={'alert'}
        {...rest}
      >
        <Icon className={cn('size-4 shrink-0', variants[variant].icon)} strokeWidth={2} />
        <div className={'min-w-0 flex-1'}>{children}</div>
      </div>
    </AlertContext>
  );
}

Alert.Text = function AlertText({ className, ...rest }: ComponentProps<'p'>) {
  const variant = use(AlertContext);
  return <p className={cn('text-sm', variants[variant].text, className)} {...rest} />;
};
