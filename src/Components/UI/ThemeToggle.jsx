import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/Hooks/useTheme';
import { cn } from '@/Utils/cn';

const OPCIONES = [
  { id: 'light', label: 'Claro', Icon: Sun },
  { id: 'dark', label: 'Oscuro', Icon: Moon },
];

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la interfaz"
      className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-800"
    >
      {OPCIONES.map(({ id, label, Icon }) => {
        const activo = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={`Tema ${label.toLowerCase()}`}
            title={`Tema ${label.toLowerCase()}`}
            onClick={() => setTheme(id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
              activo
                ? 'bg-brand-500 text-white'
                : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700',
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}