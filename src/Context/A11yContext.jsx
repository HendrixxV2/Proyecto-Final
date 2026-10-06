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

const COLOR_PALETTE_FILTERS = {
  'red-green': 'hue-rotate(35deg) saturate(0.9)',
  'blue-yellow': 'hue-rotate(180deg) saturate(0.9)',
};

function applyColorPalette(root, colorPalette, highContrast) {
  const palette = COLOR_PALETTE_FILTERS[colorPalette] ? colorPalette : 'standard';
  const filters = [
    highContrast && 'contrast(1.15)',
    COLOR_PALETTE_FILTERS[palette],
  ].filter(Boolean);

  root.dataset.colorPalette = palette;
  root.style.filter = filters.join(' ');
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
    root.classList.toggle('visual-feedback', settings.visualFeedback);
    root.classList.toggle('high-contrast', settings.highContrast);
    applyColorPalette(root, settings.colorPalette, settings.highContrast);
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
      const language = document.documentElement.lang || 'es';
      const isMandarin = language.startsWith('zh');
      utterance.lang = isMandarin ? 'zh-CN' : language;
      if (isMandarin) {
        const voices = synthesis.getVoices?.() ?? [];
        const voice = voices.find((candidate) => candidate.lang.toLowerCase() === 'zh-cn')
          ?? voices.find((candidate) => candidate.lang.toLowerCase().startsWith('zh'));
        if (voice) utterance.voice = voice;
      }
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