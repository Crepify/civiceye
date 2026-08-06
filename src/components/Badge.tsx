import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  /** Short label text (alternative to children). */
  label?: string;
  /** Tailwind classes that paint the badge. */
  className?: string;
  icon?: ReactNode;
  dot?: boolean;
  title?: string;
  children?: ReactNode;
}

/** Small status / category pill. */
export function Badge({ label, className, icon, dot, title, children }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        className ?? 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {icon}
      {label ?? children}
    </span>
  );
}
