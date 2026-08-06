import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  index?: number;
}

/** Animated counter + icon card for landing/dashboard stats. */
export function StatCard({ icon: Icon, label, value, sub, gradient, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="card group relative overflow-hidden p-6"
    >
      <div
        className={cn(
          'absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25',
          gradient,
        )}
      />
      <div
        className={cn(
          'mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft',
          gradient,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
      {sub ? <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p> : null}
    </motion.div>
  );
}
