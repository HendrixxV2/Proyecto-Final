import { Loader2 } from 'lucide-react';
import { cn } from '@/Utils/cn';

export default function Spinner({ label = 'Cargando…', className, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

  return (
    <div role="status" aria-live="polite" className={cn('inline-flex items-center gap-2 text-ink-500 dark:text-ink-400', className)}>
      <Loader2 aria-hidden="true" className={cn('animate-spin', sizes[size])} />
      <span className="text-sm">{label}</span>
    </div>
  );
}