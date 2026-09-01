import { Building2, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AmritaMetricsProps {
  stats: {
    total: number;
    verified: number;
    resolved: number;
    pending: number;
    inProgress: number;
  };
}

export function AmritaMetrics({ stats }: AmritaMetricsProps) {
  return (
    <section className="bg-[#F5F5F7] dark:bg-[#0D0D0D] border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-[1920px] px-6 py-28 sm:py-36 flex flex-col items-center">
        <div className="mb-16 flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-widest text-[#A51636] dark:text-[#E52B50]">
          <span>Real-time impact</span>
        </div>

        <div className="grid w-full max-w-6xl grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 sm:grid-cols-4 rounded-2xl overflow-hidden">
          {/* Metric 1 */}
          <motion.div
            whileHover={{ y: -6, backgroundColor: '#FFF5F7' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center group transition-colors duration-300"
          >
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-8 transition-colors duration-300 group-hover:text-[#A51636] dark:group-hover:text-[#E52B50]">
              <Building2 className="h-5 w-5 text-neutral-900 dark:text-white transition-transform duration-500 group-hover:scale-125 group-hover:rotate-[-6deg]" />
              <span>Total Reports</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white tabular-nums transition-transform duration-500 group-hover:scale-110">
              {stats.total}
            </div>
          </motion.div>

          {/* Metric 2 */}
          <motion.div
            whileHover={{ y: -6, backgroundColor: '#FFF5F7' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center group transition-colors duration-300"
          >
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-8 transition-colors duration-300 group-hover:text-[#A51636] dark:group-hover:text-[#E52B50]">
              <ShieldCheck className="h-5 w-5 text-neutral-900 dark:text-white transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6" />
              <span>Verified</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white tabular-nums transition-transform duration-500 group-hover:scale-110">
              {stats.verified}
            </div>
          </motion.div>

          {/* Metric 3 */}
          <motion.div
            whileHover={{ y: -6, backgroundColor: '#FFF2F5' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center group transition-colors duration-300"
          >
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-[#A51636] dark:text-[#E52B50] uppercase mb-8">
              <CheckCircle2 className="h-5 w-5 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-[-6deg]" />
              <span>Resolved</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-[#A51636] dark:text-[#E52B50] tabular-nums transition-transform duration-500 group-hover:scale-110">
              {stats.resolved}
            </div>
          </motion.div>

          {/* Metric 4 */}
          <motion.div
            whileHover={{ y: -6, backgroundColor: '#FFF5F7' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center group transition-colors duration-300"
          >
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-8 transition-colors duration-300 group-hover:text-[#A51636] dark:group-hover:text-[#E52B50]">
              <Clock className="h-5 w-5 text-neutral-900 dark:text-white transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6" />
              <span>In Progress</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white tabular-nums transition-transform duration-500 group-hover:scale-110">
              {stats.inProgress + stats.pending}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
