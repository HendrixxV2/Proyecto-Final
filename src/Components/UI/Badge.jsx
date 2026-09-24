import { AlertCircle, CheckCircle2, Clock, Info, XCircle } from 'lucide-react';
import { cn } from '@/Utils/cn';

const TONES = {
  neutral: { class: 'bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200', Icon: Info },
  success: { class: 'bg-jade-100 text-jade-700 dark:bg-jade-900 dark:text-jade-200', Icon: CheckCircle2 },
  warning: { class: 'bg-gold-400/25 text-gold-600 dark:bg-gold-600/25 dark:text-gold-400', Icon: Clock },
  danger: { class: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', Icon: XCircle },
  info: { class: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200', Icon: AlertCircle },
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
      {/* El estado nunca depende solo del color: ícono + texto */}
      {icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </span>
  );
}