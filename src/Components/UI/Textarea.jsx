import { forwardRef, useId } from 'react';
import { cn } from '@/Utils/cn';

const Textarea = forwardRef(function Textarea({ label, error, required, className, id, rows = 4, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? `textarea-${autoId}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink-800 dark:text-ink-200">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition',
          'placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
          'dark:bg-ink-800 dark:text-ink-100',
          error ? 'border-red-500' : 'border-ink-300 focus:border-brand-500 dark:border-ink-600',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="mt-1 text-xs font-medium text-red-600">
          ⚠ {error}
        </p>
      )}
    </div>
  );
});

export default Textarea;