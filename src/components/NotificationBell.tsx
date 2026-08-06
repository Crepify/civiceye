import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, ShieldCheck, Sparkles, Trash2, Wrench } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

const TYPE_ICON = {
  report: { icon: Bell, color: 'text-sky-500 bg-sky-500/10' },
  verify: { icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10' },
  resolve: { icon: Wrench, color: 'text-teal-500 bg-teal-500/10' },
  system: { icon: Sparkles, color: 'text-violet-500 bg-violet-500/10' },
} as const;

/** Notification bell with dropdown panel. */
export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:border-primary-400/40 dark:hover:text-white"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-glow backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-primary-600 transition-colors hover:bg-primary-500/10 dark:text-primary-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                  aria-label="Clear notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                  You\u2019re all caught up. ✨
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => {
                  const meta = TYPE_ICON[n.type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5',
                        !n.read && 'bg-primary-500/[0.04]',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          meta.color,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {n.title}
                          </span>
                          {!n.read ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {n.message}
                        </span>
                        <span className="mt-1 block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          {timeAgo(n.date)}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
