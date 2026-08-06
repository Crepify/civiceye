import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';

/** Access the toast API. Throws if used outside the provider. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
