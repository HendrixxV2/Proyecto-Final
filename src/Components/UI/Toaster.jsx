import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast } from '@/Hooks/useToast';
import { cn } from '@/Utils/cn';

const VARIANTS = {
  success: { Icon: CheckCircle2, class: 'border-jade-300 bg-jade-50 text-jade-800 dark:border-jade-700 dark:bg-jade-900 dark:text-jade-100' },
  danger: { Icon: XCircle, class: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100' },
  warning: { Icon: AlertTriangle, class: 'border-gold-400 bg-amber-50 text-amber-900 dark:border-gold-600 dark:bg-amber-950 dark:text-amber-100' },
  info: { Icon: Info, class: 'border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100' },
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((toast) => {
        const { Icon, class: variantClass } = VARIANTS[toast.variant] ?? VARIANTS.info;

        return (
          <div
            key={toast.id}
            role={toast.variant === 'danger' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg animate-slide-up',
              variantClass,
            )}
          >
            <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Cerrar notificación"
              className="rounded p-1 transition hover:bg-black/10"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}