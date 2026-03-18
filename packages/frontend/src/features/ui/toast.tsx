import { useState, useEffect, useCallback, createContext, use, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { cn } from '@remnant/frontend/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Array<Toast>;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Array<Toast>>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const description = toast.description ?? t('toast.defaultDescription');
      setToasts((prev) => [...prev, { ...toast, description, id }]);
      return id;
    },
    [t]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  return (
    <ToastContext value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext>
  );
}

type ToastContainerProps = {
  toasts: Array<Toast>;
  onRemove: (id: string) => void;
};

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className={
        'pointer-events-none fixed bottom-0 left-1/2 z-(--z-toast) flex w-full -translate-x-1/2 flex-col items-center gap-3 pb-10'
      }
      aria-live={'polite'}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

type ToastItemProps = {
  toast: Toast;
  onRemove: (id: string) => void;
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const duration = toast.type === 'loading' ? 0 : (toast.duration ?? 5000);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  }, [toast.id, onRemove]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleRemove, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleRemove]);

  const icons: Record<ToastType, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    loading: Loader2,
  };

  const Icon = icons[toast.type];

  const iconColors: Record<ToastType, string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-sky-400',
    loading: 'text-white/70',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex min-h-12 w-full max-w-100 items-center gap-3 overflow-hidden rounded-xl bg-zinc-900 py-3 pr-4 pl-3.5 shadow-2xl',
        isExiting ? 'animate-toast-slide-out' : 'animate-toast-slide-in'
      )}
      role={'alert'}
    >
      {duration > 0 && (
        <div className={'absolute inset-0 bg-white/8'} style={{ animation: `toast-sweep ${duration}ms linear forwards` }} />
      )}
      <div className={cn('relative shrink-0', iconColors[toast.type])}>
        <Icon className={cn('size-4.5', toast.type === 'loading' && 'animate-spin')} strokeWidth={2} />
      </div>
      <div className={'relative min-w-0 flex-1'}>
        <p className={'font-medium text-white'}>{toast.title}</p>
        {toast.description && <p className={'text-white/60'}>{toast.description}</p>}
      </div>
    </div>
  );
}
