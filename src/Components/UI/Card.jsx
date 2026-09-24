import { cn } from '@/Utils/cn';

export function Card({ className, as: Component = 'div', ...props }) {
  return (
    <Component
      className={cn(
        'rounded-2xl border border-ink-200 bg-white shadow-soft',
        'dark:border-ink-700 dark:bg-ink-800',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-4 p-5 pb-0', className)} {...props} />;
}

export function CardTitle({ className, as: Component = 'h3', ...props }) {
  return <Component className={cn('font-display text-lg font-semibold text-ink-900 dark:text-ink-50', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('mt-1 text-sm text-ink-500 dark:text-ink-400', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center gap-3 border-t border-ink-200 p-5 dark:border-ink-700', className)} {...props} />;
}