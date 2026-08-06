import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface LoaderProps {
  /** Render a centered full-block overlay. */
  full?: boolean;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

/** Branded spinner with optional label. */
export function Loader({ full = false, label, className, size = 'md' }: LoaderProps) {
  const spinner = (
    <span className={cn('relative flex items-center justify-center gap-2.5', className)}>
      <span className="relative">
        <span
          className={cn(
            'block rounded-full border-2 border-primary-200 dark:border-primary-900',
            SIZES[size],
          )}
        />
        <span
          className={cn(
            'absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary-600',
            SIZES[size],
          )}
        />
      </span>
      {label ? (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      ) : null}
    </span>
  );

  if (!full) return spinner;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-950/70"
      role="status"
      aria-label="Loading"
    >
      {spinner}
    </motion.div>
  );
}
