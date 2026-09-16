import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Sparkles } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { AmritaCampusMap } from '@/components/campus/AmritaCampusMap';
import { CAMPUS_CONFIG, CAMPUS_ACREAGE } from '@/data/campus';

/**
 * Fullscreen dedicated campus map for Amrita Eye
 * Route: /amrita/map
 * This page is public, no login required for viewing (per handover: guests and freshers can view everything without logging in)
 * Every campus issue only shows up on this map, every location pinnable.
 */
export function AmritaMapPage() {
  const { reports } = useReports();
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Support deep links: /amrita/map?b=block-c&f=c-g&room=C-G7&person=<id> — fix buildingId mapping so floor plans actually show (was placeholder)
  // b can be: 'a','b','c','d','e' or 'block-a'..'block-e' or osm id 'way/631815097' (main academic -> pick block)
  const initialView = (() => {
    const bParam = searchParams.get('b');
    const f = searchParams.get('f');
    if (!bParam || !f) return undefined;
    let buildingId = bParam;
    // Map block- prefix: block-c -> c, block-C -> c, etc.
    if (buildingId.startsWith('block-')) {
      buildingId = buildingId.replace('block-', '').toLowerCase();
    }
    // Map letter A-E to lower case a-e
    if (buildingId.length === 1 && buildingId.toUpperCase() in ['A','B','C','D','E']) {
      buildingId = buildingId.toLowerCase();
    }
    // Map osm main academic block to first block (E is main)
    if (buildingId === 'way/631815097') {
      buildingId = 'e';
    }
    // Validate buildingId exists in floors
    const valid = ['a','b','c','d','e'];
    if (!valid.includes(buildingId)) {
      // Try to extract letter from param like 'block-c' already handled, or 'c-g' floor id contains block letter
      const maybe = f.split('-')[0].toLowerCase();
      if (valid.includes(maybe)) buildingId = maybe;
      else buildingId = 'a'; // fallback to A Block
    }
    return { mode: 'floor' as const, buildingId, floorId: f };
  })();

  useEffect(() => {
    const room = searchParams.get('room');
    const person = searchParams.get('person');
    if (room || person) {
      // Let map handle via search query after mount
      console.log('[AmritaMap] deep link', { room, person });
    }
  }, [searchParams]);

  const campusReports = useMemo(() => reports.filter((r) => r.scope === 'campus'), [reports]);

  return (
    <div className="flex h-[calc(100vh-var(--nav-height))] flex-col bg-[#FFF5F7] pt-[calc(var(--nav-height)+2.5rem)] dark:bg-[#1A030A]">
      <div className="flex items-center gap-3 border-b border-[#A51636]/10 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/5 dark:bg-white/[0.02]">
        <Link to="/amrita" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#A51636]" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Amrita Bengaluru Campus Map</h1>
          <span className="hidden rounded-full bg-[#A51636]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#A51636] sm:inline-flex">Custom · No GMaps · 1m pinnable</span>
        </div>
        <div className="ml-auto hidden items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex">
          <MapPin className="h-3.5 w-3.5" /> Kasavanahalli, Carmelaram P.O., 560035 · {CAMPUS_ACREAGE.totalMeasured} acres measured
          <span className="h-3 w-px bg-slate-200 dark:bg-white/10" />
          <Sparkles className="h-3.5 w-3.5 text-[#A51636]" /> {CAMPUS_CONFIG.name}
        </div>
      </div>

      <div className="min-h-0 flex-1 p-2 sm:p-3">
        <AmritaCampusMap reports={campusReports} selectedId={selectedId} onSelect={setSelectedId} initialView={initialView} className="h-full" />
      </div>

      <div className="border-t border-[#A51636]/10 bg-white/60 px-4 py-2 text-[11px] leading-relaxed text-slate-500 backdrop-blur dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
        <b>Public map</b> — Guests and freshers can view everything without logging in. Real OSM footprints, Esri World Imagery satellite, 155 faculty searchable, 163 rooms, 12 buildings, 5 blocks A–E (E,A,B,C,D order confirmed), named halls with real capacities, 4th floor library 16,550 sq ft. Every location pinnable to 1m, QR deep links for door codes, Dijkstra campus routing (Gate1→Cafeteria 306m/~4min), BFS indoor routing, constant-size labels. Campus issues only show on this map — no city reports mixed.
      </div>
    </div>
  );
}
