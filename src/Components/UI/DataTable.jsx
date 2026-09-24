import { cn } from '@/Utils/cn';

export default function DataTable({ columns, rows, keyField = 'id', empty = null, caption, className }) {
  if (!rows?.length) return empty;

  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-700', className)}>
      <table className="min-w-full divide-y divide-ink-200 text-sm dark:divide-ink-700">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-ink-100 dark:bg-ink-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-ink-300',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200 bg-white dark:divide-ink-700 dark:bg-ink-800/60">
          {rows.map((row) => (
            <tr key={row[keyField]} className="transition hover:bg-ink-50 dark:hover:bg-ink-700/40">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 align-middle text-ink-700 dark:text-ink-200',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}