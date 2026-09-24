import { cn } from '@/Utils/cn';
import Skeleton from './Skeleton';

export default function StatCard({ label, value, delta, Icon, tone = 'brand', loading = false }) {
  const tones = {
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
    jade: 'bg-jade-100 text-jade-700 dark:bg-jade-900 dark:text-jade-200',
    gold: 'bg-gold-400/25 text-gold-600 dark:bg-gold-600/25 dark:text-gold-400',
    ink: 'bg-ink-200 text-ink-700 dark:bg-ink-700 dark:text-ink-200',
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-4 h-8 w-20" />
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft dark:border-ink-700 dark:bg-ink-800">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{label}</p>
        {Icon && (
          <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tones[tone])}>
            <Icon aria-hidden="true" className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">{value}</p>
      {delta && <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{delta}</p>}
    </article>
  );
}