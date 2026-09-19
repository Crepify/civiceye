import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle, Sparkles } from 'lucide-react';
import type { ToastItem } from '@/types';
import { uid } from '@/utils/cn';

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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());
  const [isAmrita, setIsAmrita] = useState(false);

  // Brand detection without requiring BrandProvider (to avoid useBrand must be within BrandProvider error)
  // ToastProvider wraps AuthProvider which wraps BrandProvider, so it cannot use useBrand directly
  useEffect(() => {
    const detect = () => {
      const hasAmritaClass = typeof document !== 'undefined' && document.documentElement.classList.contains('amrita');
      const isAmritaRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/amrita');
      const brandQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('brand') : null;
      setIsAmrita(brandQuery === 'amrita' || hasAmritaClass || isAmritaRoute);
    };
    detect();
    const observer = new MutationObserver(detect);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
    window.addEventListener('popstate', detect);
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', detect);
    };
  }, []);

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

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(var(--nav-height)+0.75rem)] z-[90] flex flex-col items-center gap-2.5 px-4 sm:top-6 sm:items-end sm:px-6"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            const accent =
              toast.type === 'success'
                ? isAmrita
                  ? 'bg-[#A51636]'
                  : 'bg-[#ffd630]'
                : toast.type === 'error'
                  ? 'bg-rose-500'
                  : toast.type === 'warning'
                    ? 'bg-amber-400'
                    : isAmrita
                      ? 'bg-[#A51636]'
                      : 'bg-sky-500';

            const iconColor =
              toast.type === 'success'
                ? 'text-emerald-400'
                : toast.type === 'error'
                  ? 'text-rose-400'
                  : toast.type === 'warning'
                    ? 'text-amber-300'
                    : isAmrita
                      ? 'text-[#E52B50]'
                      : 'text-sky-400';

            const borderColor = isAmrita ? 'border-white/10' : 'border-[#172b44]/10';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -18, scale: 0.94, rotate: isAmrita ? 0 : -1 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, x: 44, scale: 0.92, rotate: isAmrita ? 0 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className={
                  isAmrita
                    ? `pointer-events-auto relative flex w-full max-w-sm overflow-hidden rounded-[16px] border ${borderColor} bg-[#1a0f14]/95 shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl`
                    : `pointer-events-auto relative flex w-full max-w-sm overflow-hidden rounded-[14px] border-2 border-[#172b44] bg-[#0f1a2e]/95 shadow-[6px_6px_0_#172b44] backdrop-blur-xl`
                }
              >
                <div className={`absolute bottom-0 right-0 top-0 w-[5px] ${accent}`} />
                <div className="flex items-start gap-3 p-4 pr-10">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : toast.type === 'error' ? 'border-rose-500/30 bg-rose-500/10' : toast.type === 'warning' ? 'border-amber-500/30 bg-amber-500/10' : isAmrita ? 'border-[#A51636]/30 bg-[#A51636]/10' : 'border-sky-500/30 bg-sky-500/10'}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[14px] font-bold leading-tight text-white">
                      {toast.title}
                      {toast.type === 'success' ? <span>👋</span> : null}
                      {toast.type === 'info' ? <Sparkles className="h-3.5 w-3.5 text-white/60" /> : null}
                    </p>
                    {toast.message ? (
                      <p className="mt-1 text-[13px] leading-[1.45] text-slate-300/90">{toast.message}</p>
                    ) : null}
                  </div>
                </div>

                <button
                  onClick={() => dismiss(toast.id)}
                  className="absolute right-[14px] top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>

                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[3px] origin-left ${accent}`}
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
