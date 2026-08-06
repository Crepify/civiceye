import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCheck, Flag, Inbox, ShieldCheck, Trash2, UserRound, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/hooks/useBrand';
import { useToast } from '@/hooks/useToast';
import { useReports } from '@/hooks/useReports';
import { flagService } from '@/services/flagService';
import type { Flag as FlagModel } from '@/services/flagService';
import { isAdminEmail } from '@/data/admins';
import { categoryById } from '@/data/categories';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';
import { supabase } from '@/lib/supabase';

/** Staff / admin panel — flagged posts, take-downs, user details. */
export function AdminPanel() {
  const { user } = useAuth();
  const { brand } = useBrand();
  const toast = useToast();
  const { reports, loading, removeReport } = useReports();

  const isAdmin = isAdminEmail(user?.email, brand);
  const [flags, setFlags] = useState<FlagModel[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Array<{ id: string; email: string; full_name: string | null }>>([]);

  const loadFlags = useCallback(async () => {
    setFlagsLoading(true);
    try {
      const list = await flagService.getAll();
      setFlags(list);
    } catch {
      setFlags([]);
    } finally {
      setFlagsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      void loadFlags();
      // Load reporter profiles (emails) for the staff view.
      if (supabase) {
        void (async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('id, email, full_name');
            setProfiles((data as Array<{ id: string; email: string; full_name: string | null }>) ?? []);
          } catch {
            setProfiles([]);
          }
        })();
      }
    }
  }, [isAdmin, loadFlags]);

  // User detail: map userId → profile email/name.
  const profileByUserId = useMemo(() => {
    const map = new Map<string, { email: string; full_name: string | null }>();
    for (const p of profiles) map.set(p.id, { email: p.email, full_name: p.full_name });
    return map;
  }, [profiles]);

  if (!isAdmin) {
    return (
      <div className="section-pad py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
          Staff only
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          This panel is for verified {brand === 'amrita' ? 'Amrita campus' : 'city'} staff
          members. If you're a teacher or listed admin, sign in with that account.
        </p>
        <Link to="/login" className="btn-primary mt-6">
          Sign in as staff
        </Link>
      </div>
    );
  }

  const handleTakeDown = async (flag: FlagModel) => {
    if (!flag.report?.id) return;
    setBusy(flag.id);
    try {
      await removeReport(flag.report.id); // RLS allows admins to delete
      await flagService.remove(flag.id); // clear the flag too
      toast.success('Post taken down', 'The flagged post has been removed.');
      await loadFlags();
    } catch (err) {
      toast.error('Could not take down', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleDismiss = async (flagId: string) => {
    setBusy(flagId);
    try {
      await flagService.remove(flagId);
      toast.info('Flag dismissed', 'No action taken.');
      await loadFlags();
    } catch (err) {
      toast.error('Could not dismiss', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="pb-16 pt-[calc(var(--nav-height)+2.5rem)] sm:pt-[calc(var(--nav-height)+3.5rem)]">
      <div className="section-pad">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          <ShieldCheck className="h-4 w-4" />
          Staff &amp; Admin
        </p>
        <h1 className="heading-xl mt-2">Moderation panel</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
          Posts reported by civilians show up here. Take down anything inappropriate, or dismiss
          flags that are unfounded.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{flags.length}</p>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Open flags
            </p>
          </div>
          <div className="card p-5">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{reports.length}</p>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Total posts ({brand === 'amrita' ? 'campus' : 'city'})
            </p>
          </div>
        </div>

        {/* Flags inbox */}
        <div className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Flag className="h-4.5 w-4.5 text-rose-500" />
            Flagged posts
          </h2>

          {flagsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-3 w-40" />
                  <div className="skeleton mt-2 h-3 w-full" />
                </div>
              ))}
            </div>
          ) : flags.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 py-14 text-center dark:border-white/10">
              <Inbox className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                No flags right now
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Reported posts will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => {
                const rep = flag.report;
                const cat = rep ? categoryById(rep.category as never) : null;
                return (
                  <motion.div
                    key={flag.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card overflow-hidden"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                      {rep?.photo_url ? (
                        <img
                          src={rep.photo_url}
                          alt=""
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                            {flag.reason}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            by {flag.flaggerEmail} · {timeAgo(flag.date)}
                          </span>
                        </div>
                        <Link
                          to={`/report/${rep?.id}`}
                          className="mt-1.5 block text-sm font-bold text-slate-900 hover:text-primary-600 dark:text-white"
                        >
                          {rep?.title ?? 'Unknown post'}
                        </Link>
                        {cat ? (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {cat.label} · {rep?.location_name ?? ''} · by {rep?.author_name}
                          </p>
                        ) : null}
                        {flag.note ? (
                          <p className="mt-2 rounded-xl bg-rose-500/5 px-3 py-2 text-xs italic text-slate-500 dark:text-slate-400">
                            “{flag.note}”
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => void handleTakeDown(flag)}
                          disabled={busy === flag.id}
                          className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-500 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Take down
                        </button>
                        <button
                          onClick={() => void handleDismiss(flag.id)}
                          disabled={busy === flag.id}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Users (student details) */}
        <div className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Users className="h-4.5 w-4.5 text-primary-500" />
            Reporters &amp; details
          </h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70 text-[11px] uppercase tracking-widest text-slate-400 dark:border-white/10">
                    <th className="pb-3 pr-4 font-bold">Reporter</th>
                    <th className="pb-3 pr-4 font-bold">Email</th>
                    <th className="pb-3 pr-4 font-bold">Scope</th>
                    <th className="pb-3 font-bold">Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-3">
                        <div className="skeleton h-8 w-full" />
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                        No reports yet.
                      </td>
                    </tr>
                  ) : (
                    [...new Map(reports.map((r) => [r.author, r])).values()].map((r) => (
                      <tr
                        key={r.userId ?? r.author}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50/60 dark:border-white/5 dark:hover:bg-white/[0.03]"
                      >
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/10 text-[11px] font-extrabold text-primary-600 dark:text-primary-400">
                              {r.author[0]?.toUpperCase() ?? '?'}
                            </span>
                            {r.author}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-500 dark:text-slate-400">
                          {r.userId ? (profileByUserId.get(r.userId)?.email ?? '—') : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                              r.scope === 'campus'
                                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                : 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                            )}
                          >
                            {r.scope === 'campus' ? 'Campus' : 'City'}
                          </span>
                        </td>
                        <td className="py-3 text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                          {reports.filter((x) => x.userId === r.userId).length}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <UserRound className="h-3.5 w-3.5" />
            Reporter emails come from their profiles — visible to staff for follow-ups.
          </p>
        </div>
      </div>
    </div>
  );
}
