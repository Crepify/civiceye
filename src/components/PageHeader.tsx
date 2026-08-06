import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Hero header used at the top of interior pages. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-primary-50/70 via-white to-white pb-10 pt-10 dark:border-white/5 dark:from-primary-950/30 dark:via-slate-950 dark:to-slate-950 sm:pb-14 sm:pt-14">
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="section-pad relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {eyebrow ? (
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="heading-xl">{title}</h1>
          {description ? (
            <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </motion.div>
      </div>
    </section>
  );
}
