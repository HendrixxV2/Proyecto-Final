import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [key, stored]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key !== key || event.newValue === null) return;
      try {
        setStored(JSON.parse(event.newValue));
      } catch {
        /* ignorar */
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  const update = useCallback((value) => {
    setStored((prev) => (typeof value === 'function' ? value(prev) : value));
  }, []);

  const remove = useCallback(() => setStored(initialValue), [initialValue]);

  return [stored, update, remove];
}