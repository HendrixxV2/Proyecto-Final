import { AArrowDown, AArrowUp, RotateCcw } from 'lucide-react';
import { useA11y } from '@/Hooks/useA11y';
import { useLanguage } from '@/Hooks/useLanguage';
import { FONT_SCALES } from '@/Utils/constants';

export default function FontSizeControl() {
  const { fontScale, setFontScale, increaseFont, decreaseFont, reset } = useA11y();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('ui.textSize')}>
      <button
        type="button"
        onClick={decreaseFont}
        aria-label={t('ui.decreaseText')}
        className="rounded-lg p-1.5 text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
      >
        <AArrowDown aria-hidden="true" className="h-4 w-4" />
      </button>

      <span className="sr-only" aria-live="polite">
        {t('ui.textSize')}: {FONT_SCALES.find((f) => f.id === fontScale)?.title}
      </span>

      <div className="flex gap-0.5">
        {FONT_SCALES.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFontScale(f.id)}
            aria-label={f.title}
            aria-pressed={fontScale === f.id}
            style={{ fontSize: `${0.65 + i * 0.15}rem` }}
            className={
              fontScale === f.id
                ? 'rounded px-1.5 font-bold text-brand-600 dark:text-brand-300'
                : 'rounded px-1.5 text-ink-500 hover:text-ink-800 dark:hover:text-ink-100'
            }
          >
            A
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={increaseFont}
        aria-label={t('ui.increaseText')}
        className="rounded-lg p-1.5 text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
      >
        <AArrowUp aria-hidden="true" className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={reset}
        aria-label={t('ui.resetAccessibility')}
        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 dark:hover:bg-ink-700"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}