import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

/** Access the current theme + toggle. Throws if used outside the provider. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
