// src/hooks/useTheme.js
import { useContext } from 'react';
import { ThemeContext } from '@/Context/ThemeContext';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}