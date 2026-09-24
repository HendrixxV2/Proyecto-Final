import { createContext, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/Hooks/useLocalStorage';
import { LANGUAGE_KEY } from '@/Utils/constants';
import { getTranslation } from '@/i18n/translations';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useLocalStorage(LANGUAGE_KEY, 'es');

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : language === 'en' ? 'en' : 'es';
  }, [language]);

  const updateLanguage = useCallback((nextValue) => {
    setLanguage(nextValue);
  }, [setLanguage]);

  const value = useMemo(
    () => ({ language, setLanguage: updateLanguage, t: (key) => getTranslation(language, key) }),
    [language, updateLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
