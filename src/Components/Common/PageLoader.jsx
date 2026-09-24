import { Landmark } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-ink-50 dark:bg-ink-900" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-brand-500 text-white">
          <Landmark aria-hidden="true" className="h-7 w-7" />
        </span>
        <p className="text-sm text-ink-500 dark:text-ink-400">Cargando sección…</p>
      </div>
    </div>
  );
}