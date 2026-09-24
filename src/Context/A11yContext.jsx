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
};

export function A11yProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(A11Y_KEY, DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    const scale = FONT_SCALES.find((f) => f.id === settings.fontScale)?.value ?? 1;

    root.style.fontSize = `${16 * scale}px`;
    root.dataset.fontScale = settings.fontScale;
    root.classList.toggle('reduce-motion', settings.reducedMotion);
    root.classList.toggle('underline-links', settings.underlineLinks);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('visual-feedback', settings.visualFeedback);
  }, [settings]);

  const setFontScale = useCallback(
    (fontScale) => setSettings((prev) => ({ ...prev, fontScale })),
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
    () => ({ ...settings, setFontScale, increaseFont, decreaseFont, toggle, reset }),
    [settings, setFontScale, increaseFont, decreaseFont, toggle, reset],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}