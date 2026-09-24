import {
  AlertCircle, AlertTriangle, CheckCircle2, Clock, Info, XCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Tono → { clases, icono }. Cada badge incluye SIEMPRE un ícono + texto.
 * Paleta Okabe-Ito: nunca se distingue un estado solo por color.
 */
const TONES = {
  neutral: { class: 'bg-ink-100 text-ink-800 border border-ink-300 dark:bg-ink-700 dark:text-ink-100 dark:border-ink-600', Icon: Info },
  success: { class: 'bg-cian-50 text-cian-800 border border-cian-300 dark:bg-cian-900/40 dark:text-cian-100 dark:border-cian-700', Icon: CheckCircle2 },
  warning: { class: 'bg-naranja-50 text-naranja-800 border border-naranja-400 dark:bg-naranja-900/40 dark:text-naranja-100 dark:border-naranja-600', Icon: Clock },
  danger:  { class: 'bg-bermellon-50 text-bermellon-800 border border-bermellon-400 dark:bg-bermellon-900/40 dark:text-bermellon-100 dark:border-bermellon-600', Icon: XCircle },
  info:    { class: 'bg-azul-50 text-azul-800 border border-azul-300 dark:bg-azul-900/40 dark:text-azul-100 dark:border-azul-700', Icon: AlertCircle },
  accent:  { class: 'bg-magenta-50 text-magenta-800 border border-magenta-300 dark:bg-magenta-900/40 dark:text-magenta-100 dark:border-magenta-700', Icon: AlertTriangle },
};

export default function Badge({ tone = 'neutral', icon = true, className, children, ...props }) {
  const { class: toneClass, Icon } = TONES[tone] ?? TONES.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClass,
        className,
      )}
      {...props}
    >
      {icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </span>
  );
}