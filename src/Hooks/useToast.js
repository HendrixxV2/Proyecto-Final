import { useContext } from 'react';
import { ToastContext } from '@/Context/ToastContext';

const noopToast = {
  toasts: [],
  push: () => undefined,
  dismiss: () => undefined,
  success: () => undefined,
  error: () => undefined,
  info: () => undefined,
  warning: () => undefined,
};

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    console.warn('useToast se usó fuera de <ToastProvider>; se aplicó un fallback sin notificaciones.');
    return noopToast;
  }

  return ctx;
}