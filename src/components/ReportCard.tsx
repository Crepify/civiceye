import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import type { Report } from '@/types';
import { categoryById, SEVERITY_META, STATUS_META } from '@/data/categories';
import { Badge } from './Badge';
import { VoteButtons } from './VoteButtons';
import { formatCoordsShort, timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

interface ReportCardProps {
  report: Report;
  index?: number;
}

/** Community feed / list card. */
export function ReportCard({ report, index = 0 }: ReportCardProps) {
  const category = categoryById(report.category);
  const severity = SEVERITY_META[report.severity];
  const status = STATUS_META[report.status];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group card flex flex-col overflow-hidden"
    >
      <Link
        to={`/report/${report.id}`}
        className="relative block overflow-hidden"
        aria-label={report.title}
      >
        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={report.image}
            alt={report.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge
            className={cn(
              'bg-white/90 text-slate-700 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200',
            )}
          >
            {category.label}
          </Badge>
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <Badge className={cn('text-white backdrop-blur', status.bg)}>{status.label}</Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur',
              severity.bg,
              severity.color,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', severity.dot)} />
            {severity.label} severity
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 backdrop-blur dark:bg-slate-900/80 dark:text-slate-300">
            {timeAgo(report.date)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link
          to={`/report/${report.id}`}
          className="text-base font-bold leading-snug text-slate-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
        >
          {report.title}
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {report.description}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{report.locationName}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="tabular-nums">{formatCoordsShort(report.coordinates)}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
          <VoteButtons report={report} compact />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {report.author}
            </span>
            <Link
              to={`https://www.google.com/maps/dir/?api=1&destination=${report.coordinates.lat},${report.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400"
              title="Get directions"
            >
              <Navigation className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
