import { useContext } from 'react';
import { NotificationContext } from '@/context/NotificationContext';

/** Access the notification bell store. Throws if used outside the provider. */
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
