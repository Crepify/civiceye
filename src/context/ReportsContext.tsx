import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Report, VoteType } from '@/types';
import { reportService, mapRow } from '@/services/reportService';
import type { ReportRow } from '@/services/reportService';
import { supabase } from '@/lib/supabase';

/**
 * Reports store (async).
 * Reads from Supabase on mount and refreshes after every mutation so all
 * pages share one consistent, live view of the database.
 */

interface ReportsContextValue {
  reports: Report[];
  /** True while the initial fetch is in flight. */
  loading: boolean;
  /** True when a mutation is in flight. */
  mutating: boolean;
  error: string | null;
  /** Refresh from Supabase, optionally filtered to a brand scope. */
  refresh: (scope?: 'city' | 'campus' | 'all') => Promise<void>;
  /** Admin: permanently remove a report. */
  removeReport: (id: string) => Promise<void>;
  /** Admin: move a report between City and Campus scope. */
  setScope: (id: string, scope: 'city' | 'campus') => Promise<void>;
  getById: (idOrCode: string) => Report | undefined;
  addReport: (input: Parameters<typeof reportService.create>[0]) => Promise<Report>;
  vote: (id: string, voteType: VoteType) => Promise<Report | undefined>;
  voteUp: (id: string) => Promise<void>;
  voteDown: (id: string) => Promise<void>;
  confirmReport: (id: string) => Promise<Report | undefined>;
  rejectReport: (id: string) => Promise<void>;
  markResolved: (id: string) => Promise<void>;
  assignToAuthority: (id: string, authorityId: string) => Promise<void>;
  rejectAsAuthority: (id: string) => Promise<void>;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (scope?: 'city' | 'campus' | 'all') => {
      try {
        setLoading(true);
        const list = await reportService.getAll(scope ?? 'all');
        setReports(list);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void refresh();

    if (!supabase) return;
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const row = payload.new as ReportRow;
            const updatedReport = mapRow(row);
            setReports((prev) => {
              const exists = prev.some((r) => r.id === updatedReport.id);
              if (exists) {
                return prev.map((r) => (r.id === updatedReport.id ? updatedReport : r));
              } else if (payload.eventType === 'INSERT') {
                return [updatedReport, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              }
              return prev;
            });
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id: string };
            setReports((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  /** Run a mutation, then refresh. */
  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<void> => {
      setMutating(true);
      try {
        await action();
        await refresh();
      } finally {
        setMutating(false);
      }
    },
    [refresh],
  );

  const value = useMemo<ReportsContextValue>(
    () => ({
      reports,
      loading,
      mutating,
      error,
      refresh,
      getById: (idOrCode) => reports.find((r) => r.id === idOrCode || r.code === idOrCode),
      addReport: (input) =>
        reportService.create(input).then((created) => {
          void refresh();
          return created;
        }),
      vote: (id, voteType) => reportService.vote(id, voteType),
      voteUp: (id) => run(() => reportService.vote(id, 'up')),
      voteDown: (id) => run(() => reportService.vote(id, 'down')),
      confirmReport: (id) =>
        reportService.vote(id, 'confirm').then((updated) => {
          void refresh();
          return updated;
        }),
      rejectReport: (id) => run(() => reportService.vote(id, 'reject')),
      markResolved: (id) => run(() => reportService.markResolved(id)),
      assignToAuthority: (id, authorityId) =>
        run(() => reportService.markInProgress(id, authorityId)),
      rejectAsAuthority: (id) => run(() => reportService.rejectReport(id)),
      removeReport: (id) => run(() => reportService.remove(id)),
      setScope: (id, scope) => run(() => reportService.updateScope(id, scope)),
    }),
    [reports, loading, mutating, error, refresh, run],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export { ReportsContext };
