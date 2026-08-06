import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastItem } from '@/types';
import { uid } from '@/utils/cn';

/**
 * Toast notification system.
 * Usage: `const toast = useToast(); toast.success('Saved!')`
 */

const TOAST_DURATION = 4200;
const VISIBLE_MAX = 4;

interface ToastContextValue {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => string;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const COLORS = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-sky-500',
  warning: 'text-amber-500',
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = uid('toast');
      setToasts((prev) => {
        const next = [...prev, { ...toast, id }];
        // Keep the stack readable — drop the oldest beyond the cap.
        return next.slice(Math.max(0, next.length - VISIBLE_MAX));
      });
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), TOAST_DURATION),
      );
      return id;
    },
    [dismiss],
  );

  const api = useMemo<ToastContextValue>(
    () => ({
      toasts,
      push,
      success: (title, message) => push({ type: 'success', title, message }),
      error: (title, message) => push({ type: 'error', title, message }),
      info: (title, message) => push({ type: 'info', title, message }),
      warning: (title, message) => push({ type: 'warning', title, message }),
      dismiss,
    }),
    [toasts, push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-20 z-[90] flex flex-col items-center gap-2 px-4 sm:top-6 sm:items-end sm:px-6"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-glow backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
              >
                <div className="flex items-start gap-3 p-4">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${COLORS[toast.type]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {toast.title}
                    </p>
                    {toast.message ? (
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {toast.message}
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => dismiss(toast.id)}
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* progress bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
                  className={`h-0.5 origin-left ${COLORS[toast.type]}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export { ToastContext };
