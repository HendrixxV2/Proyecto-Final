import { forwardRef, useId } from 'react';
import { cn } from '@/Utils/cn';

const Input = forwardRef(function Input(
  { label, error, hint, required, className, id, type = 'text', ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `input-${autoId}`;
  const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-800 dark:text-ink-200">
          {label}
          {required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (obligatorio)</span>}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        type={type}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 shadow-sm transition',
          'placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
          'dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500',
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-ink-300 focus:border-brand-500 dark:border-ink-600',
          className,
        )}
        {...props}
      />

      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
});

export default Input;