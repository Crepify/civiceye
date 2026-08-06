import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DashboardCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  /** Percent change vs. last week. */
  delta?: number;
  /** Ring accent gradient. */
  gradient: string;
  index?: number;
}

/** KPI card for the authorities dashboard. */
export function DashboardCard({
  icon: Icon,
  label,
  value,
  delta,
  gradient,
  index = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="card relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft',
            gradient,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {typeof delta === 'number' ? (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-bold',
              delta >= 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            )}
          >
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}
