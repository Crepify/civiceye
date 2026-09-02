import { useMemo, useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { AsciiAnimation } from '@/components/AsciiAnimation';
import { AmritaHero } from '@/components/amritaeye/AmritaHero';
import { AmritaMetrics } from '@/components/amritaeye/AmritaMetrics';
import { AmritaMapCanvas } from '@/components/amritaeye/AmritaMapCanvas';
import { AmritaFeed } from '@/components/amritaeye/AmritaFeed';
import { AmritaTaglineReveal } from '@/components/amritaeye/AmritaTaglineReveal';
import { AmritaBenefits } from '@/components/amritaeye/AmritaBenefits';
import { AmritaHowItWorks } from '@/components/amritaeye/AmritaHowItWorks';
import { AmritaFAQ } from '@/components/amritaeye/AmritaFAQ';
import { AmritaCTA } from '@/components/amritaeye/AmritaCTA';

/**
 * Main AmritaEye page executing Apple HIG Minimalist Design System with AM Maroon (#A51636).
 */
export function AmritaEye() {
  const { reports } = useReports();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter for campus scope reports
  const campusReports = useMemo(
    () => reports.filter((r) => r.scope === 'campus'),
    [reports],
  );

  // Calculate quick metrics
  const stats = useMemo(() => {
    const verified = campusReports.filter((r) => r.verified).length;
    const resolved = campusReports.filter((r) => r.status === 'resolved').length;
    const pending = campusReports.filter((r) => r.status === 'pending').length;
    const inProgress = campusReports.filter((r) => r.status === 'in-progress').length;
    return { total: campusReports.length, verified, resolved, pending, inProgress };
  }, [campusReports]);

  return (
    <div className="relative min-h-screen text-neutral-900 dark:text-white font-sans antialiased selection:bg-primary-500 selection:text-white">
      <AsciiAnimation />
      <div className="relative z-10 w-full min-h-screen pointer-events-none">
        <div className="pointer-events-auto w-full h-full">
          <AmritaHero />
          <AmritaMapCanvas
            campusReports={campusReports}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <AmritaMetrics stats={stats} />
          <AmritaTaglineReveal />
          <AmritaBenefits />
          <AmritaHowItWorks />
          <AmritaFeed campusReports={campusReports} />
          <AmritaFAQ />
          <AmritaCTA />
        </div>
      </div>
    </div>
  );
}
