// EmptyState.jsx
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Sin resultados', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 px-6 py-12 text-center dark:border-ink-600">
      <Icon aria-hidden="true" className="h-10 w-10 text-ink-400" />
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}