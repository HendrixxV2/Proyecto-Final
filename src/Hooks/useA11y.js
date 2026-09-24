// src/hooks/useA11y.js
import { useContext } from 'react';
import { A11yContext } from '@/Context/A11yContext';

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y debe usarse dentro de <A11yProvider>');
  return ctx;
}