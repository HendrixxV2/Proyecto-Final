import { createContext, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/Hooks/useLocalStorage';
import { THEME_KEY } from '@/Utils/constants';

export const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage(THEME_KEY, 'light');
  const normalizedTheme = theme === 'system' ? getSystemTheme() : theme;

  const resolved = normalizedTheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
  }, [resolved]);

  useEffect(() => {
    if (theme !== 'system') return undefined;
    setTheme(getSystemTheme());
    return undefined;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const current = prev === 'system' ? getSystemTheme() : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme: resolved, setTheme, toggle, isDark: resolved === 'dark' }),
    [theme, resolved, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}