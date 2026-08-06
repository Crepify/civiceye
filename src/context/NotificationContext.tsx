import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppNotification } from '@/types';
import { SEED_NOTIFICATIONS } from '@/data/notifications';
import { uid } from '@/utils/cn';

/**
 * In-app notification bell store.
 */

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  add: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);

  const add = useCallback((n: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    setNotifications((prev) => [
      { ...n, id: uid('ntf'), date: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  const markRead = useCallback(
    (id: string) =>
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [],
  );

  const clearAll = useCallback(() => setNotifications([]), []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      add,
      markAllRead,
      markRead,
      clearAll,
    }),
    [notifications, add, markAllRead, markRead, clearAll],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export { NotificationContext };
