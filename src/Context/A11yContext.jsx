import { createContext, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/Hooks/useLocalStorage';
import { A11Y_KEY, FONT_SCALES } from '@/Utils/constants';

export const A11yContext = createContext(null);

const DEFAULTS = {
  fontScale: 'md',
  reducedMotion: false,
  underlineLinks: false,
  highContrast: false,
  visualFeedback: true,
  colorPalette: 'standard',
  voiceGuide: false,
};

const COLOR_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const COLOR_FAMILIES = ['brand', 'jade', 'gold', 'cielo'];
const COLOR_PALETTES = {
  'red-green': { brand: '#0072B2', jade: '#E69F00', gold: '#F0E442', cielo: '#56B4E9' },
  'blue-yellow': { brand: '#CC6677', jade: '#117733', gold: '#AA4499', cielo: '#44AA99' },
};

function getColorScale(hex) {
  const channels = hex.match(/[\da-f]{2}/gi).map((value) => Number.parseInt(value, 16));

  return Object.fromEntries(COLOR_SHADES.map((shade) => {
    const amount = Math.abs(500 - shade) / 500;
    const target = shade < 500 ? 255 : 0;
    const rgb = channels.map((channel) => Math.round(channel + (target - channel) * amount));
    return [shade, rgb.join(' ')];
  }));
}

function applyColorPalette(root, colorPalette) {
  const colors = COLOR_PALETTES[colorPalette];
  root.dataset.colorPalette = colors ? colorPalette : 'standard';

  COLOR_FAMILIES.forEach((family) => {
    const scale = colors ? getColorScale(colors[family]) : null;
    COLOR_SHADES.forEach((shade) => {
      const property = `--a11y-${family}-${shade}`;
      if (scale) root.style.setProperty(property, scale[shade]);
      else root.style.removeProperty(property);
    });
  });
}

export function A11yProvider({ children }) {
  const [storedSettings, setSettings] = useLocalStorage(A11Y_KEY, DEFAULTS);
  const settings = useMemo(() => ({ ...DEFAULTS, ...storedSettings }), [storedSettings]);

  useEffect(() => {
    const root = document.documentElement;
    const scale = FONT_SCALES.find((f) => f.id === settings.fontScale)?.value ?? 1;

    root.style.fontSize = `${16 * scale}px`;
    root.dataset.fontScale = settings.fontScale;
    root.classList.toggle('reduce-motion', settings.reducedMotion);
    root.classList.toggle('underline-links', settings.underlineLinks);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('visual-feedback', settings.visualFeedback);
    applyColorPalette(root, settings.colorPalette);
  }, [settings]);

  useEffect(() => {
    if (!settings.voiceGuide) {
      window.speechSynthesis?.cancel();
      return undefined;
    }

    const synthesis = window.speechSynthesis;
    const Utterance = window.SpeechSynthesisUtterance;
    if (!synthesis || !Utterance) return undefined;

    const speak = (text) => {
      const utterance = new Utterance(text);
      utterance.lang = document.documentElement.lang || 'es';
      synthesis.cancel();
      synthesis.speak(utterance);
    };
    const welcomes = {
      es: 'Guía de voz activada. Al enfocar un enlace, botón o campo, escucharás su nombre.',
      en: 'Voice guide enabled. Focus a link, button, or field to hear its name.',
      'zh-Hant': '語音導覽已啟用。聚焦連結、按鈕或欄位即可聽到其名稱。',
    };
    speak(welcomes[document.documentElement.lang] ?? welcomes.es);

    const announceFocus = (event) => {
      const target = event.target.closest?.('a, button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])');
      if (!target) return;

      const labelledBy = target.getAttribute('aria-labelledby')
        ?.split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent)
        .filter(Boolean)
        .join(' ');
      const label = target.getAttribute('aria-label')
        || labelledBy
        || target.labels?.[0]?.textContent
        || target.innerText
        || target.textContent
        || target.getAttribute('title')
        || target.getAttribute('placeholder');

      if (label?.trim()) speak(label.trim().replace(/\s+/g, ' ').slice(0, 180));
    };

    document.addEventListener('focusin', announceFocus);
    return () => {
      document.removeEventListener('focusin', announceFocus);
      synthesis.cancel();
    };
  }, [settings.voiceGuide]);

  const setFontScale = useCallback(
    (fontScale) => setSettings((prev) => ({ ...prev, fontScale })),
    [setSettings],
  );

  const setColorPalette = useCallback(
    (colorPalette) => setSettings((prev) => ({ ...prev, colorPalette })),
    [setSettings],
  );

  const increaseFont = useCallback(() => {
    setSettings((prev) => {
      const idx = FONT_SCALES.findIndex((f) => f.id === prev.fontScale);
      return { ...prev, fontScale: FONT_SCALES[Math.min(idx + 1, FONT_SCALES.length - 1)].id };
    });
  }, [setSettings]);

  const decreaseFont = useCallback(() => {
    setSettings((prev) => {
      const idx = FONT_SCALES.findIndex((f) => f.id === prev.fontScale);
      return { ...prev, fontScale: FONT_SCALES[Math.max(idx - 1, 0)].id };
    });
  }, [setSettings]);

  const toggle = useCallback(
    (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] })),
    [setSettings],
  );

  const reset = useCallback(() => setSettings(DEFAULTS), [setSettings]);

  const value = useMemo(
    () => ({ ...settings, setFontScale, setColorPalette, increaseFont, decreaseFont, toggle, reset }),
    [settings, setFontScale, setColorPalette, increaseFont, decreaseFont, toggle, reset],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}