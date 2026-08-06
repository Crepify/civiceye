import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowBigDown, ArrowBigUp, CheckCheck, ShieldCheck, ThumbsDown } from 'lucide-react';
import type { Report } from '@/types';
import { useReports } from '@/hooks/useReports';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { FlagButton } from './FlagButton';
import { compactNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

interface VoteButtonsProps {
  report: Report;
  /** Compact variant for cards (icons only). */
  compact?: boolean;
  className?: string;
}

/**
 * Community validation controls: upvote, downvote, confirm, reject.
 * Votes are atomic per user (Supabase RPC) and require a signed-in
 * account so one person can't spam a report.
 */
export function VoteButtons({ report, compact = false, className }: VoteButtonsProps) {
  const { voteUp, voteDown, confirmReport, rejectReport, mutating } = useReports();
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const verified = report.verified;
  const threshold = 3;

  const requireAuth = (): boolean => {
    if (user) return true;
    toast.info('Sign in required', 'Create a free account to vote on reports.');
    navigate('/login?next=' + encodeURIComponent(window.location.pathname));
    return false;
  };

  const handle = (fn: () => Promise<unknown>, success: () => void) => {
    if (!requireAuth()) return;
    void fn().then(success);
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <button
          onClick={() =>
            handle(
              () => voteUp(report.id),
              () => toast.success('Vote counted!', 'Thanks for supporting this report.'),
            )
          }
          disabled={mutating}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          aria-label="Upvote"
        >
          <ArrowBigUp className="h-4 w-4" />
          {compactNumber(report.votes)}
        </button>
        <button
          onClick={() =>
            handle(
              () => voteDown(report.id),
              () => toast.info('Vote recorded'),
            )
          }
          disabled={mutating}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-500"
          aria-label="Downvote"
        >
          <ArrowBigDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <button
        onClick={() =>
          handle(
            () => voteUp(report.id),
            () => toast.success('Vote counted!', 'Thanks for supporting this report.'),
          )
        }
        disabled={mutating}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-emerald-300 hover:text-emerald-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
      >
        <ArrowBigUp className="h-4 w-4" />
        {compactNumber(report.votes)}
      </button>
      <button
        onClick={() =>
          handle(
            () => voteDown(report.id),
            () => toast.info('Vote recorded'),
          )
        }
        disabled={mutating}
        className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-400 transition-all hover:border-rose-300 hover:text-rose-500 dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-rose-500/40"
        aria-label="Downvote"
      >
        <ArrowBigDown className="h-4 w-4" />
      </button>

      <span className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-white/10 sm:block" />

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          handle(
            () => confirmReport(report.id),
            () => {
              toast.success(
                'Thanks for confirming!',
                'Your confirmation helps verify this report.',
              );
            },
          )
        }
        disabled={mutating}
        className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
        title="Confirm this report is real"
      >
        <CheckCheck className="h-4 w-4" />
        Confirm ({report.confirms}/{threshold})
      </motion.button>
      <button
        onClick={() =>
          handle(
            () => rejectReport(report.id),
            () => toast.info('Thanks for the feedback', 'This report now has a rejection mark.'),
          )
        }
        disabled={mutating}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:border-rose-300 hover:text-rose-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:text-rose-400"
        title="Flag this report as inaccurate"
      >
        <ThumbsDown className="h-4 w-4" />
        Reject
      </button>

      <span className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-white/10 sm:block" />
      <FlagButton reportId={report.id} />

      {verified ? (
        <span className="flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          Verified
        </span>
      ) : null}
    </div>
  );
}
