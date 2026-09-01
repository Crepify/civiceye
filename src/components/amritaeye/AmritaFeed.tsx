import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryById } from '@/data/categories';
import type { Report, ReportStatus } from '@/types';

interface AmritaFeedProps {
  campusReports: Report[];
}

type FeedFilter = 'all' | 'pending' | 'resolved';

const FILTERS: Array<{ value: FeedFilter; label: string }> = [
  { value: 'all', label: 'All Reports' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
];

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  'in-progress': 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: '#800020',
  verified: '#737373',
  'in-progress': '#64748b',
  resolved: '#171717',
  rejected: '#a3a3a3',
};

function StatusLight({ status }: { status: ReportStatus }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0">
      <circle cx="5" cy="5" r="3.5" fill={STATUS_COLORS[status]} />
    </svg>
  );
}

function formatReportDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function AmritaFeed({ campusReports }: AmritaFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');

  const filteredReports = useMemo(() => {
    if (activeFilter === 'all') return campusReports;
    return campusReports.filter((report) => report.status === activeFilter);
  }, [activeFilter, campusReports]);

  const reportCounts = useMemo(
    () => ({
      all: campusReports.length,
      pending: campusReports.filter((report) => report.status === 'pending').length,
      resolved: campusReports.filter((report) => report.status === 'resolved').length,
    }),
    [campusReports],
  );

  return (
    <section
      aria-labelledby="campus-reports-title"
      className="border-b border-[#A51636]/10 dark:border-[#E52B50]/10 bg-transparent"
    >
      <div className="mx-auto max-w-[1920px] px-6 py-28 sm:py-36">
        <div className="grid gap-12 border-b border-neutral-200 dark:border-neutral-800 pb-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#A51636] dark:text-[#E52B50]">
              Public issue log
            </p>
            <h2
              id="campus-reports-title"
              className="mt-4 text-3xl sm:text-4xl font-bold leading-[1.2] tracking-tight text-neutral-900 dark:text-white"
            >
              Campus reports
            </h2>
            <p className="mt-4 max-w-xl text-base leading-[1.5] text-neutral-600 dark:text-neutral-400">
              Recent submissions from students and staff, with their current maintenance status.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter campus reports by status"
            className="flex items-center gap-6 overflow-x-auto lg:col-span-5 lg:justify-end"
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  aria-pressed={isActive}
                  className={`shrink-0 rounded-none border-b-2 pb-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-neutral-900 text-neutral-900 dark:text-white'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:text-white'
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 font-mono text-xs text-neutral-400 dark:text-neutral-500">
                    {reportCounts[filter.value].toString().padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3">
            {filteredReports.map((report) => {
              const category = categoryById(report.category);

              return (
                <motion.article
                  key={report.id}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="group relative flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_50px_-12px_rgba(165,22,54,0.25)] dark:hover:border-[#E52B50]/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F5F7] dark:bg-black">
                    <img
                      src={report.image}
                      alt={`Evidence for ${report.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 dark:bg-black/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white backdrop-blur-md transition-colors group-hover:bg-[#A51636] group-hover:text-white dark:group-hover:bg-[#E52B50]">
                      {category.short}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-8">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {report.code ?? `AMR-${report.id.slice(0, 6).toUpperCase()}`}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                        <StatusLight status={report.status} />
                        {STATUS_LABELS[report.status]}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold leading-[1.3] text-neutral-900 dark:text-white transition-colors group-hover:text-[#A51636] dark:group-hover:text-[#E52B50]">
                      {report.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-base leading-[1.5] text-neutral-600 dark:text-neutral-400">
                      {report.description}
                    </p>

                    <div className="mt-6 flex items-start gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-sm leading-5 text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="mt-0.5 h-4 w-4 shrink-0 group-hover:text-[#A51636] dark:group-hover:text-[#E52B50] transition-colors"
                      >
                        <path
                          d="M15.25 8.25c0 4-5.25 8-5.25 8s-5.25-4-5.25-8a5.25 5.25 0 1 1 10.5 0Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                        <circle
                          cx="10"
                          cy="8.25"
                          r="1.75"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                      <span>{report.locationName}</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      <time dateTime={report.date} className="text-xs text-neutral-400 dark:text-neutral-500">
                        {formatReportDate(report.date)}
                      </time>
                      <Link
                        to={`/report/${report.id}`}
                        aria-label={`View report: ${report.title}`}
                        className="inline-flex items-center gap-2 rounded-none text-sm font-semibold text-neutral-900 dark:text-white underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
                      >
                        View report
                        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                          <path
                            d="M4 10h11m-4-4 4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 flex min-h-56 flex-col items-start justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-[#f5f5f5] dark:bg-[#111] p-8 sm:p-10">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-neutral-400 dark:text-neutral-500"
            >
              <path d="M5 7h14M5 12h9M5 17h6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <h3 className="mt-5 text-lg font-semibold text-neutral-900 dark:text-white">No reports in this view</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
              Select another status to return to the public issue log.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="mt-5 rounded-none text-sm font-semibold text-neutral-900 dark:text-white underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
            >
              Show all reports
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
