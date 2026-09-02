import { Building2, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

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
    <section className="bg-transparent">
      <div className="mx-auto max-w-[1920px] px-6 py-28 sm:py-36 flex flex-col items-center">
        <div className="mb-16 flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-widest text-[#A51636] dark:text-[#E52B50]">
          <span>Real-time impact</span>
        </div>

        <div className="grid w-full max-w-6xl grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 sm:grid-cols-4 rounded-2xl overflow-hidden">
          {/* Metric 1 */}
          <div className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-8">
              <Building2 className="h-5 w-5 text-neutral-900 dark:text-white" />
              <span>Total Reports</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white tabular-nums">
              {stats.total}
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-8">
              <ShieldCheck className="h-5 w-5 text-neutral-900 dark:text-white" />
              <span>Verified</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white tabular-nums">
              {stats.verified}
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-[#A51636] dark:text-[#E52B50] uppercase mb-8">
              <CheckCircle2 className="h-5 w-5 text-[#A51636] dark:text-[#E52B50]" />
              <span>Resolved</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-[#A51636] dark:text-[#E52B50] tabular-nums">
              {stats.resolved}
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-[#FFFFFF] dark:bg-[#161618] p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-3 text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-8">
              <Clock className="h-5 w-5 text-neutral-900 dark:text-white" />
              <span>In Progress</span>
            </div>
            <div className="text-[56px] sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white tabular-nums">
              {stats.inProgress + stats.pending}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
