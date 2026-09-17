import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { AmritaCampusMap } from '@/components/campus/AmritaCampusMap';

export function AmritaMapPage() {
  const { reports } = useReports();
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialView = (() => {
    const bParam = searchParams.get('b');
    const f = searchParams.get('f');
    if (!bParam || !f) return undefined;
    let buildingId = bParam;
    if (buildingId.startsWith('block-')) buildingId = buildingId.replace('block-', '').toLowerCase();
    if (buildingId.length === 1 && ['a','b','c','d','e'].includes(buildingId.toLowerCase())) buildingId = buildingId.toLowerCase();
    if (buildingId === 'way/631815097') buildingId = 'e';
    const valid = ['a','b','c','d','e'];
    if (!valid.includes(buildingId)) {
      const maybe = f.split('-')[0].toLowerCase();
      buildingId = valid.includes(maybe) ? maybe : 'a';
    }
    return { mode: 'floor' as const, buildingId, floorId: f };
  })();

  const campusReports = useMemo(() => reports.filter((r) => r.scope === 'campus'), [reports]);

  return (
    <div className="flex h-[calc(100vh-var(--nav-height))] flex-col bg-[#FFF5F7] pt-[calc(var(--nav-height)+2.5rem)] dark:bg-[#1A030A]">
      <div className="flex items-center gap-3 border-b border-[#A51636]/10 bg-white px-4 py-3 dark:border-white/5 dark:bg-[#111]">
        <Link to="/amrita" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#A51636]" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Campus Map</h1>
        </div>
        <div className="ml-auto hidden items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 sm:flex">
          <MapPin className="h-3.5 w-3.5" /> Amrita Bengaluru Campus
        </div>
      </div>

      <div className="min-h-0 flex-1 p-2 sm:p-3">
        <AmritaCampusMap reports={campusReports} selectedId={selectedId} onSelect={setSelectedId} initialView={initialView} className="h-full" />
      </div>
    </div>
  );
}
