import { Accessibility, Eye, EyeOff, RotateCcw, Volume2 } from 'lucide-react';
import { useA11y } from '@/Hooks/useA11y';
import FontSizeControl from '@/Components/UI/FontSizeControl';
import { useLanguage } from '@/Hooks/useLanguage';

export default function AccessibilityPanel() {
  const { highContrast, underlineLinks, reducedMotion, visualFeedback, toggle, reset } = useA11y();
  const { t } = useLanguage();

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-500 hover:bg-ink-50 focus-visible:outline-offset-4 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700">
        <Accessibility aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">{t('common.accessibility')}</span>
        <span className="sr-only">{t('common.accessibility')}</span>
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-white p-4 shadow-soft dark:border-ink-700 dark:bg-ink-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{t('accessibility.preferences')}</h2>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-300">{t('accessibility.saved')}</p>
          </div>
          <button type="button" onClick={reset} aria-label="Restablecer accesibilidad" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 border-t border-ink-100 pt-3 dark:border-ink-700">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300">{t('accessibility.textSize')}</p>
          <FontSizeControl />
        </div>

        <div className="mt-4 grid gap-2 border-t border-ink-100 pt-3 dark:border-ink-700">
          <button type="button" onClick={() => toggle('highContrast')} aria-pressed={highContrast} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700">
            <span className="flex items-center gap-2"><Eye aria-hidden="true" className="h-4 w-4" /> {t('accessibility.contrast')}</span>
            <span aria-hidden="true" className="text-xs font-bold">{highContrast ? t('accessibility.on') : t('accessibility.off')}</span>
          </button>
          <button type="button" onClick={() => toggle('underlineLinks')} aria-pressed={underlineLinks} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700">
            <span className="flex items-center gap-2"><EyeOff aria-hidden="true" className="h-4 w-4" /> {t('accessibility.underline')}</span>
            <span aria-hidden="true" className="text-xs font-bold">{underlineLinks ? t('accessibility.on') : t('accessibility.off')}</span>
          </button>
          <button type="button" onClick={() => toggle('reducedMotion')} aria-pressed={reducedMotion} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700">
            <span className="flex items-center gap-2"><Accessibility aria-hidden="true" className="h-4 w-4" /> {t('accessibility.motion')}</span>
            <span aria-hidden="true" className="text-xs font-bold">{reducedMotion ? t('accessibility.on') : t('accessibility.off')}</span>
          </button>
          <button type="button" onClick={() => toggle('visualFeedback')} aria-pressed={visualFeedback} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700">
            <span className="flex items-center gap-2"><Volume2 aria-hidden="true" className="h-4 w-4" /> {t('accessibility.feedback')}</span>
            <span aria-hidden="true" className="text-xs font-bold">{visualFeedback ? t('accessibility.on') : t('accessibility.off')}</span>
          </button>
        </div>
      </div>
    </details>
  );
}