import { Accessibility, AudioLines, Eye, EyeOff, Palette, RotateCcw, Volume2 } from 'lucide-react';
import { useA11y } from '@/Hooks/useA11y';
import FontSizeControl from '@/Components/UI/FontSizeControl';
import { useLanguage } from '@/Hooks/useLanguage';

export default function AccessibilityPanel() {
  const { highContrast, underlineLinks, reducedMotion, visualFeedback, colorPalette, setColorPalette, voiceGuide, toggle, reset } = useA11y();
  const { t } = useLanguage();
  const voiceAvailable = typeof window !== 'undefined'
    && Boolean(window.speechSynthesis)
    && Boolean(window.SpeechSynthesisUtterance);
  const palettes = [
    { value: 'standard', label: t('accessibility.paletteStandard'), colors: ['#D55E00', '#009E73', '#E69F00', '#2D7BA6'] },
    { value: 'red-green', label: t('accessibility.paletteRedGreen'), colors: ['#0072B2', '#E69F00', '#F0E442', '#56B4E9'] },
    { value: 'blue-yellow', label: t('accessibility.paletteBlueYellow'), colors: ['#CC6677', '#117733', '#AA4499', '#44AA99'] },
  ];

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

        <div className="mt-4 border-t border-ink-100 pt-3 dark:border-ink-700">
          <label htmlFor="accessibility-color-palette" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300">
            <Palette aria-hidden="true" className="h-4 w-4" />
            {t('accessibility.colorPalette')}
          </label>
          <div className="mt-2 flex items-center gap-3">
            <select
              id="accessibility-color-palette"
              value={colorPalette}
              onChange={(event) => setColorPalette(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100"
            >
              {palettes.map((palette) => <option key={palette.value} value={palette.value}>{palette.label}</option>)}
            </select>
            <span className="flex shrink-0 gap-1" aria-hidden="true">
              {palettes.find((palette) => palette.value === colorPalette)?.colors.map((color) => (
                <span key={color} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
              ))}
            </span>
          </div>
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
          <button
            type="button"
            onClick={() => toggle('voiceGuide')}
            aria-pressed={voiceGuide}
            disabled={!voiceAvailable}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink-700 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-ink-100 dark:hover:bg-ink-700"
          >
            <span className="flex items-center gap-2"><AudioLines aria-hidden="true" className="h-4 w-4" /> {t('accessibility.voiceGuide')}</span>
            <span aria-hidden="true" className="text-xs font-bold">{voiceGuide ? t('accessibility.on') : t('accessibility.off')}</span>
          </button>
          {!voiceAvailable && <p className="px-2 text-xs text-ink-500 dark:text-ink-400">{t('accessibility.voiceUnavailable')}</p>}
        </div>
      </div>
    </details>
  );
}