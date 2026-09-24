// ErrorState.jsx
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Algo salió mal', description, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900 dark:bg-red-950/40">
      <AlertTriangle aria-hidden="true" className="h-10 w-10 text-red-600 dark:text-red-400" />
      <h3 className="mt-4 font-display text-lg font-semibold text-red-900 dark:text-red-100">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-red-700 dark:text-red-300">
        {description ?? 'No pudimos cargar la información. Verifica tu conexión e inténtalo de nuevo.'}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={() => onRetry()} icon>
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}