import { motion } from 'framer-motion';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Recoverable error panel with a retry action. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\u2019t load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-rose-200/70 bg-rose-50/60 px-6 py-14 text-center dark:border-rose-500/20 dark:bg-rose-500/5"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {message}
      </p>
      {onRetry ? (
        <button onClick={onRetry} className="btn-secondary mt-6">
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      ) : null}
    </motion.div>
  );
}
