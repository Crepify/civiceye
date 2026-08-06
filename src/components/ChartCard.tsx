import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  index?: number;
}

/** Framed container for charts and dashboard panels. */
export function ChartCard({ title, subtitle, children, className, index = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className={cn('card p-5 sm:p-6', className)}
    >
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </motion.div>
  );
}
