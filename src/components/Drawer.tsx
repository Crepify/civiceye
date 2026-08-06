import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

type DrawerSide = 'left' | 'right';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: DrawerSide;
  /** Tailwind width classes. */
  width?: string;
}

/** Slide-in side panel (mobile nav / filters). */
export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  width = 'w-[88vw] max-w-sm',
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const fromLeft = side === 'left';

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm dark:bg-slate-950/70"
            aria-label="Close panel"
          />
          <motion.div
            initial={fromLeft ? { x: '-100%' } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={fromLeft ? { x: '-100%' } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className={cn(
              'absolute inset-y-0 flex flex-col border-white/60 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900',
              fromLeft ? 'left-0 border-r' : 'right-0 border-l',
              width,
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
              {title ? (
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
              ) : (
                <span />
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
