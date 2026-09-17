import { Link } from 'react-router-dom';
import { MapPin, Building2 } from 'lucide-react';
import { CAMPUS_CONFIG } from '@/data/campus';
import { AmritaCampusMap } from '@/components/campus/AmritaCampusMap';
import type { Report } from '@/types';

interface AmritaMapCanvasProps {
  campusReports: Report[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function AmritaMapCanvas({ campusReports, selectedId, onSelect }: AmritaMapCanvasProps) {
  return (
    <section className="bg-[#FFF5F7] dark:bg-[#1A030A] border-t border-[#A51636]/10">
      <div className="mx-auto max-w-[1920px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-6 border border-neutral-200 dark:border-neutral-800 border-b-0 bg-white dark:bg-[#111] p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between rounded-t-[20px]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A51636]">
              <span className="h-1.5 w-1.5 bg-[#A51636] animate-pulse rounded-full" />
              Campus Map
            </div>
            <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              <MapPin className="h-7 w-7 text-[#A51636]" />
              Campus issue map
            </h2>
            <p className="max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
              Explore {CAMPUS_CONFIG.name} — buildings, classrooms, labs, and reported issues
            </p>
          </div>

          <Link
            to="/amrita/map"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#A51636] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#8a1230]"
          >
            Open Full Map
            <Building2 className="h-4 w-4" />
          </Link>
        </div>

        <div className="h-[720px] w-full overflow-hidden rounded-b-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0607] shadow-sm">
          <AmritaCampusMap reports={campusReports} selectedId={selectedId} onSelect={onSelect} className="h-full w-full rounded-none border-0 shadow-none" />
        </div>
      </div>
    </section>
  );
}
