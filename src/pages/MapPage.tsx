import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Layers, ListFilter, ShieldCheck, Thermometer } from 'lucide-react';
import type { CategoryId, Coordinates, ReportStatus, Severity, ScopeFilter } from '@/types';
import { useReports } from '@/hooks/useReports';
import { useBrand } from '@/hooks/useBrand';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MapView } from '@/components/map/MapView';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { Drawer } from '@/components/Drawer';
import { Badge } from '@/components/Badge';
import { SEVERITY_META, STATUS_META } from '@/data/categories';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';

interface MapFilters {
  categories: CategoryId[];
  severities: Severity[];
  status: ReportStatus[];
  verifiedOnly: boolean;
  search: string;
  scope: ScopeFilter;
}

const DEFAULT_FILTERS: MapFilters = {
  categories: [],
  severities: [],
  status: [],
  verifiedOnly: false,
  search: '',
  scope: 'all',
};

const ALL = (list: unknown[]) => list.length === 0;

/** Interactive map page: search, filters, heatmap, legend and report list. */
export function MapPage() {
  const { reports } = useReports();
  const { isAmrita } = useBrand();
  const [filters, setFilters] = useLocalStorage<MapFilters>('civiceye:map-filters', {
    ...DEFAULT_FILTERS,
    scope: isAmrita ? 'campus' : 'city',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useLocalStorage<boolean>('civiceye:map-heatmap', false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<{ center: Coordinates; zoom: number }>({
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 12,
  });

  const debouncedSearch = useDebounce(filters.search, 250);

  // This route alone uses the comic field-guide skin; it never changes Home.
  // Amrita Eye keeps its own clean campus map (no comic skin).
  useEffect(() => {
    if (isAmrita) return;
    document.body.classList.add('comic-map-route');
    return () => document.body.classList.remove('comic-map-route');
  }, [isAmrita]);

  const visibleReports = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return reports.filter((r) => {
      if (filters.scope !== 'all' && r.scope !== filters.scope) return false;
      if (!ALL(filters.categories) && !filters.categories.includes(r.category)) return false;
      if (!ALL(filters.severities) && !filters.severities.includes(r.severity)) return false;
      if (!ALL(filters.status) && !filters.status.includes(r.status)) return false;
      if (filters.verifiedOnly && !r.verified) return false;
      if (q) {
        const haystack =
          `${r.title} ${r.description} ${r.locationName} ${r.author} ${r.id}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reports, filters, debouncedSearch]);

  // Keep the selection valid as filters change.
  useEffect(() => {
    if (selectedId && !visibleReports.some((r) => r.id === selectedId)) setSelectedId(null);
  }, [visibleReports, selectedId]);

  // Clicking a report — either a map marker or the side list — centers the
  // map on it and zooms in so the pin is clearly visible.
  useEffect(() => {
    if (!selectedId) return;
    const report = reports.find((r) => r.id === selectedId || r.code === selectedId);
    if (report) {
      setView({ center: report.coordinates, zoom: 16 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.severities.length > 0 ||
    filters.status.length > 0 ||
    filters.verifiedOnly ||
    filters.search.trim().length > 0 ||
    filters.scope !== (isAmrita ? 'campus' : 'city');
  filters.categories.length > 0 ||
    filters.severities.length > 0 ||
    filters.status.length > 0 ||
    filters.verifiedOnly ||
    filters.search.trim().length > 0;

  const clearFilters = () =>
    setFilters({ ...DEFAULT_FILTERS, scope: isAmrita ? 'campus' : 'city' });

  return (
    <div className="comic-map-page flex h-[calc(100vh-var(--nav-height))] flex-col bg-[#fff8e7] pt-[var(--nav-height)] text-[#172b44]">
      {/* Header bar */}
      <div className="z-20 border-b-4 border-[#172b44] bg-[#ffd630] shadow-[0_5px_0_#ef6b59]">
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-serif text-xl font-black uppercase text-[#172b44]">
              <Layers className="h-5 w-5 text-primary-500" />
              Live issue map
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {visibleReports.length} of {reports.length} reports shown · tap a pin for details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SearchBar
              value={filters.search}
              onChange={(search) => setFilters({ ...filters, search })}
              placeholder="Search area, title, id…"
              className="flex-1 lg:w-72"
            />
            <button
              onClick={() => setHeatmap(!heatmap)}
              aria-pressed={heatmap}
              className={cn(
                'flex h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-all',
                heatmap
                  ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-amber-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300',
              )}
            >
              <Thermometer className="h-4 w-4" />
              <span className="hidden sm:inline">Heatmap</span>
            </button>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 lg:hidden"
            >
              <ListFilter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] lg:grid-cols-[1fr_340px] lg:grid-rows-1">
        {/* Map */}
        <div className="relative min-h-[320px] bg-[#fff8e7] p-4 sm:p-5">
          <MapView
            reports={visibleReports}
            selectedId={selectedId}
            onSelect={setSelectedId}
            center={view.center}
            zoom={view.zoom}
            onViewChange={(center, zoom) => setView({ center, zoom })}
            heatmap={heatmap}
            className="h-full min-h-[320px] border-[5px] border-[#172b44] shadow-[8px_8px_0_#ef6b59]"
          />

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-8 left-8 z-20 hidden border-[3px] border-[#172b44] bg-[#fff8e7] px-4 py-3 shadow-[4px_4px_0_#172b44] sm:block">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Severity
            </p>
            <div className="space-y-1.5">
              {Object.entries(SEVERITY_META).map(([key, meta]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
                  {meta.label}
                  <span className="text-[10px] text-slate-400">· weight {meta.weight}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-200/70 pt-2.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Green tick = community verified
            </div>
          </div>

          {/* Empty state overlay */}
          <AnimatePresence>
            {visibleReports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-950/60"
              >
                <EmptyState
                  icon={<Flame className="h-8 w-8" />}
                  title="No reports match your filters"
                  description="Try widening the filters, or be the first to report this area."
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Side list (desktop) */}
        <aside className="hidden min-h-0 flex-col overflow-hidden border-l-[5px] border-[#172b44] bg-[#91dcc4] lg:flex">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-white/5">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Visible reports</p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                Clear filters
              </button>
            ) : null}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {visibleReports.slice(0, 60).map((r) => {
              const severity = SEVERITY_META[r.severity];
              const status = STATUS_META[r.status];
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all',
                    selectedId === r.id
                      ? 'border-primary-400 bg-primary-500/10 shadow-softer'
                      : 'border-slate-200/80 bg-white/80 hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.04]',
                  )}
                >
                  <img
                    src={r.image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {r.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{r.locationName}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge className={cn(severity.bg, severity.color)}>{severity.label}</Badge>
                      <Badge className={cn(status.bg, status.color)}>{status.label}</Badge>
                      {r.verified ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Mobile filters drawer */}
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <div className="p-5">
          <FilterBar filters={filters} onChange={setFilters} />
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="btn-secondary mt-6 w-full">
              Clear all filters
            </button>
          ) : null}
        </div>
      </Drawer>
    </div>
  );
}
