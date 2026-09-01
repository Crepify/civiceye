import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { CAMPUS_CONFIG } from '@/data/campus';
import { MapView } from '@/components/map/MapView';
import type { Report } from '@/types';

interface AmritaMapCanvasProps {
  campusReports: Report[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function AmritaMapCanvas({ campusReports, selectedId, onSelect }: AmritaMapCanvasProps) {
  return (
    <section className="bg-transparent border-t border-[#A51636]/10 dark:border-[#E52B50]/10">
      <div className="mx-auto max-w-[1920px] px-5 py-24 sm:px-8 sm:py-36 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-6 border border-neutral-200 dark:border-neutral-800 border-b-0 bg-[#f5f5f5] dark:bg-[#111] p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between rounded-t-md">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
              <span className="h-1.5 w-1.5 bg-primary-500" aria-hidden="true" />
              <span>Spatial tracking</span>
            </div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-[-0.035em] text-neutral-900 dark:text-white sm:text-4xl">
              <MapPin className="h-7 w-7 text-neutral-900 dark:text-white" />
              Campus issue map
            </h2>
            <p className="max-w-xl text-base leading-7 text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
              Live spatial tracking around {CAMPUS_CONFIG.name}
            </p>
          </div>

          <Link
            to="/map"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white dark:bg-black px-6 text-sm font-semibold text-neutral-900 dark:text-white transition-colors hover:border-neutral-900 hover:bg-neutral-50 dark:bg-neutral-900"
          >
            Fullscreen Map
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path
                d="M4 10h11m-4-4 4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </Link>
        </div>

        <div className="h-[600px] w-full border border-neutral-200 dark:border-neutral-800 rounded-b-md overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <MapView
            reports={campusReports}
            selectedId={selectedId}
            onSelect={onSelect}
            center={CAMPUS_CONFIG.center}
            zoom={15}
          />
        </div>
      </div>
    </section>
  );
}
