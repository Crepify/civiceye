import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  /** Optional: omit to make the dialog non-dismissible (e.g. mid-animation). */
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Tailwind size classes for the dialog. */
  size?: string;
  /** Hide the default close button (for custom layouts). */
  hideClose?: boolean;
}

/** Accessible modal dialog with backdrop blur + escape handling. */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'max-w-lg',
  hideClose = false,
}: ModalProps) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Lock body scroll while open.
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm dark:bg-slate-950/70"
            aria-label="Close dialog"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={cn(
              'relative w-full overflow-hidden rounded-3xl border border-white/60 bg-white shadow-glow dark:border-white/10 dark:bg-slate-900',
              size,
            )}
          >
            {title !== undefined ? (
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                {!hideClose && onClose ? (
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
            ) : !hideClose && onClose ? (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg bg-white/80 p-1.5 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
            <div className="max-h-[80vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
