import { cn } from '@/Utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-ink-200/70 dark:bg-ink-700/70', className)}
      {...props}
    />
  );
}

export default Skeleton;

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-200 p-5 dark:border-ink-700">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2" role="status" aria-label="Cargando tabla">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}