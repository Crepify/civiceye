import { Check, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, SEVERITY_META, STATUS_META } from '@/data/categories';
import type { ReportFilters, ReportStatus, Severity } from '@/types';
import { cn } from '@/utils/cn';

export type FilterGroup = 'categories' | 'severities' | 'status' | 'verifiedOnly';

interface FilterBarProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  className?: string;
}

function toggleIn<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Reusable filter bar: category chips, severity chips, status chips and
 * a "verified only" switch. Used by the map and community pages.
 */
export function FilterBar({ filters, onChange, className }: FilterBarProps) {
  const update = (patch: Partial<ReportFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </div>

      {/* Categories */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = filters.categories.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => update({ categories: toggleIn(filters.categories, c.id) })}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                  active
                    ? 'border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 bg-white/70 text-slate-500 hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-primary-400/40',
                )}
              >
                {active ? <Check className="h-3 w-3" /> : null}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Severities */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Severity</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SEVERITY_META) as Severity[]).map((s) => {
            const meta = SEVERITY_META[s];
            const active = filters.severities.includes(s);
            return (
              <button
                key={s}
                onClick={() => update({ severities: toggleIn(filters.severities, s) })}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200',
                  active
                    ? 'border-current bg-current/5'
                    : 'border-slate-200 bg-white/70 text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
                  meta.color,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Status</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_META) as ReportStatus[]).map((s) => {
            const meta = STATUS_META[s];
            const active = filters.status.includes(s);
            return (
              <button
                key={s}
                onClick={() => update({ status: toggleIn(filters.status, s) })}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                  active
                    ? 'border-current bg-current/5'
                    : 'border-slate-200 bg-white/70 text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
                  meta.color,
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified only */}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 transition-colors hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary-400/40">
        <button
          role="switch"
          aria-checked={filters.verifiedOnly}
          onClick={() => update({ verifiedOnly: !filters.verifiedOnly })}
          className={cn(
            'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
            filters.verifiedOnly ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
              filters.verifiedOnly ? 'left-[18px]' : 'left-0.5',
            )}
          />
        </button>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Verified reports only
          <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">
            (confirmed by the community)
          </span>
        </span>
      </label>
    </div>
  );
}
