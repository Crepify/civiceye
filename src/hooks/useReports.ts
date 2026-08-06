import { useContext } from 'react';
import { ReportsContext } from '@/context/ReportsContext';

/** Access the shared reports store. Throws if used outside the provider. */
export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within a ReportsProvider');
  return ctx;
}
