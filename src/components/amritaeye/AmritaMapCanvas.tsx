import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Building2, GraduationCap, Flag } from 'lucide-react';
import { CAMPUS_CONFIG, CAMPUS_ACREAGE } from '@/data/campus';
import { AmritaCampusMap } from '@/components/campus/AmritaCampusMap';
import type { Report } from '@/types';

interface AmritaMapCanvasProps {
  campusReports: Report[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function AmritaMapCanvas({ campusReports, selectedId, onSelect }: AmritaMapCanvasProps) {
  return (
    <section className="bg-[#FFF5F7] dark:bg-[#1A030A] border-t border-[#A51636]/10 dark:border-[#E52B50]/10">
      <div className="mx-auto max-w-[1920px] px-5 py-24 sm:px-8 sm:py-36 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-6 border border-neutral-200 dark:border-neutral-800 border-b-0 bg-[#f5f5f5] dark:bg-[#111] p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between rounded-t-md">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              <span className="h-1.5 w-1.5 bg-[#A51636] animate-pulse" aria-hidden="true" />
              <span>Spatial tracking · custom campus map · no Google Maps</span>
            </div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-[-0.035em] text-neutral-900 dark:text-white sm:text-4xl">
              <MapPin className="h-7 w-7 text-[#A51636]" />
              Campus issue map
            </h2>
            <p className="max-w-xl text-base leading-7 text-neutral-500 dark:text-neutral-400">
              Live spatial tracking around {CAMPUS_CONFIG.name} · {CAMPUS_ACREAGE.totalMeasured} acres measured ({CAMPUS_ACREAGE.official} official) · 12 buildings · 5 blocks A–E · 15 floors · 163 rooms · 155 faculty public · every location pinnable to 1m
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#A51636]/10 px-3 py-1 text-xs font-bold text-[#A51636]">
                <Building2 className="h-3.5 w-3.5" /> Real OSM footprints
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <GraduationCap className="h-3.5 w-3.5" /> 155 faculty searchable
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Flag className="h-3.5 w-3.5" /> Campus issues only
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">
                <Sparkles className="h-3.5 w-3.5" /> Every location pinnable
              </span>
            </div>
          </div>

          <Link
            to="/amrita/map"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-900 transition-colors hover:border-[#A51636] hover:bg-[#A51636]/5 dark:border-white/10 dark:bg-black dark:text-white"
          >
            Fullscreen Campus Map
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </Link>
        </div>

        <div className="h-[720px] w-full border border-neutral-200 dark:border-neutral-800 rounded-b-md overflow-hidden bg-[#f8f5f6] dark:bg-[#0a0607]">
          <AmritaCampusMap reports={campusReports} selectedId={selectedId} onSelect={onSelect} className="h-full w-full rounded-none border-0" />
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200 sm:grid-cols-3">
          <div>
            <b>Data honesty:</b> Building footprints, zones, roads, gates from OpenStreetMap API (api.openstreetmap.org). Satellite from Esri World Imagery z19. Named halls (Amriteshwari 265, Sudhamani 300, Krishna 112, Vyasa 90, Rama 85, Valmiki 80, Conference 27, Indo-US 62, E-Learning 120) and library (New Block 4th floor, 16,550 sq ft, 45,880+ items) from amrita.edu. 155 faculty real names/titles/profile URLs.
          </div>
          <div>
            <b>Estimated:</b> Which floor each room is on, specific faculty desk, generic classroom numbering, desk X/Y. Faculty grouped into correct department room. Block letters E,A,B,C,D order confirmed on ground (E nearest gate, D nearest cafeteria) at 67° true wall angle. Hostel codes H1–H6 invented reference labels.
          </div>
          <div>
            <b>Improvements:</b> No Google Maps (ToS forbids tracing). Every location pinnable to 1m with lat/lng copy, QR deep links (/amrita/map?b=block-c&f=c-g&room=C-G7), indoor routing BFS, campus walking Dijkstra (Gate1→Cafeteria 306m/4min/7 steps), constant-size labels, satellite toggle, 155 faculty, campus issues only on this map.
          </div>
        </div>
      </div>
    </section>
  );
}
