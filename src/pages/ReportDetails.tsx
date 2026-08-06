import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCheck,
  Crosshair,
  MapPin,
  Navigation,
  Share2,
  ShieldCheck,
  ThumbsDown,
  Wrench,
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useToast } from '@/hooks/useToast';
import { categoryById, SEVERITY_META, STATUS_META } from '@/data/categories';
import { authorityById } from '@/data/authorities';
import { Badge } from '@/components/Badge';
import { VoteButtons } from '@/components/VoteButtons';
import { ReportCard } from '@/components/ReportCard';
import { ReportToAuthority } from '@/components/ReportToAuthority';
import { EmptyState } from '@/components/EmptyState';
import { formatCoords, formatDateTime, timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Full report view with voting, validation and related reports. */
export function ReportDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reports, getById } = useReports();
  const toast = useToast();

  const report = id ? getById(id) : undefined;

  if (!report) {
    return (
      <div className="section-pad py-24">
        <EmptyState
          icon={<MapPin className="h-8 w-8" />}
          title="Report not found"
          description="This report may have been removed, or the link is incorrect."
          action={
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
          }
        />
      </div>
    );
  }

  const category = categoryById(report.category);
  const severity = SEVERITY_META[report.severity];
  const status = STATUS_META[report.status];
  const assigned = authorityById(report.assignedTo);
  const related = reports
    .filter((r) => r.id !== report.id && r.category === report.category)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  const share = async () => {
    try {
      await navigator.share({
        title: report.title,
        text: report.description,
        url: window.location.href,
      });
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Could not share');
      }
    }
  };

  return (
    <div className="pb-20 pt-[calc(var(--nav-height)+2.5rem)] sm:pt-[calc(var(--nav-height)+3.5rem)]">
      <div className="section-pad">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Main column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            {/* Hero image */}
            <div className="card overflow-hidden">
              <div className="relative">
                <img
                  src={report.image}
                  alt={report.title}
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                  <Badge className="bg-white/90 text-slate-700 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
                    {category.label}
                  </Badge>
                  <Badge className={cn('backdrop-blur', severity.bg, severity.color)}>
                    {severity.label} severity
                  </Badge>
                  <Badge className={cn('backdrop-blur', status.bg, status.color)}>
                    {status.label}
                  </Badge>
                  {report.verified ? (
                    <Badge className="bg-emerald-500/90 text-white backdrop-blur">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                  {report.id} · {timeAgo(report.date)}
                </p>
                <h1 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl">
                  {report.title}
                </h1>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  {report.locationName}
                </p>
                <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {report.description}
                </p>

                {/* Report meta */}
                <div className="mt-7 grid gap-3 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span>
                      Reported <strong>{formatDateTime(report.date)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Crosshair className="h-4 w-4 text-primary-500" />
                    <span className="tabular-nums">{formatCoords(report.coordinates)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span>By {report.author}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Wrench className="h-4 w-4 text-primary-500" />
                    {assigned ? (
                      <span>
                        Assigned to <strong>{assigned.name}</strong>
                      </span>
                    ) : (
                      <span>Not yet assigned to an agency</span>
                    )}
                  </div>
                </div>

                {/* Community validation */}
                <div className="mt-7">
                  <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                    Community validation
                  </h2>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="chip">
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                        {report.confirms} confirmations
                      </span>
                      <span className="chip">
                        <ThumbsDown className="h-3.5 w-3.5 text-rose-500" />
                        {report.rejects} rejections
                      </span>
                      <span className="chip">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        {report.verified
                          ? 'Verified'
                          : `Needs ${3 - report.confirms} more confirmations`}
                      </span>
                    </div>
                    <VoteButtons report={report} />
                  </div>
                </div>
              </div>
            </div>

            {/* Related reports */}
            {related.length > 0 ? (
              <div>
                <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
                  Similar reports nearby
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((r, i) => (
                    <ReportCard key={r.id} report={r} index={i} />
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-5"
          >
            <div className="card overflow-hidden">
              <div className="h-56">
                <iframe
                  title="Report location"
                  src={`https://maps.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}&z=15&output=embed`}
                  className="h-full w-full border-0 grayscale-[0.2]"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {report.locationName}
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${report.coordinates.lat},${report.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Directions
                </a>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Take action</h3>
              <button onClick={() => void share()} className="btn-secondary w-full">
                <Share2 className="h-4 w-4" />
                Share this report
              </button>
              <ReportToAuthority
                subject={`report ${report.id}`}
                label="Report to authority"
                variant="primary"
                className="w-full"
              />
              <Link to="/report" className="btn-ghost w-full">
                File your own report
              </Link>
            </div>

            {assigned ? (
              <div className="card flex items-start gap-3 p-5">
                <span
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: assigned.color }}
                >
                  <Wrench className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Handled by
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                    {assigned.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {assigned.department}
                  </p>
                </div>
              </div>
            ) : null}
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
