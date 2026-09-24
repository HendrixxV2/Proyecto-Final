import { forwardRef, useId } from 'react';
import { cn } from '@/Utils/cn';

const Select = forwardRef(function Select(
  { label, error, required, options = [], placeholder, className, id, children, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? `select-${autoId}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink-800 dark:text-ink-200">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 shadow-sm transition',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40',
          'dark:bg-ink-800 dark:text-ink-100',
          error ? 'border-red-500' : 'border-ink-300 focus:border-brand-500 dark:border-ink-600',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children ??
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          ⚠ {error}
        </p>
      )}
    </div>
  );
});

export default Select;