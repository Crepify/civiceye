import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MapPin, PhoneCall, Siren, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/hooks/useBrand';
import { useReports } from '@/hooks/useReports';
import { useToast } from '@/hooks/useToast';
import { requestLocation } from '@/services/geoService';
import { mockReverseGeocode } from '@/services/geocodeService';
import { displayName, scopeForBrand } from '@/services/reportService';
import { cn } from '@/utils/cn';

/**
 * Global SOS action. It deliberately requires a confirmation before asking
 * for GPS and creating a critical report, so an accidental tap cannot publish
 * a location. It uses the existing `security` category to avoid a database
 * migration while clearly labelling the report as an SOS emergency.
 */
export function SOSButton() {
  const { user, profile } = useAuth();
  const { isAmrita } = useBrand();
  const { addReport } = useReports();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const sendSOS = async () => {
    if (sending) return;
    setSending(true);
    try {
      const location = await requestLocation(10000);
      if (location.status !== 'success' || !location.coords) {
        toast.error(
          'SOS was not sent',
          location.error ?? 'Location access is required to create an emergency report.',
        );
        return;
      }

      const { coords } = location;
      const locationName = mockReverseGeocode(coords);
      const report = await addReport({
        title: 'SOS Emergency Alert',
        description:
          `Emergency assistance requested at ${locationName}. ` +
          `The reporter's current GPS location was captured by the SOS button. ` +
          'Please verify immediately and contact emergency services if there is immediate danger.',
        coordinates: coords,
        locationName,
        category: 'security',
        severity: 'critical',
        photoUrl: '',
        author: displayName(profile),
        userId: user.id,
        scope: scopeForBrand(isAmrita ? 'amrita' : 'civiceye'),
        ai: {
          confidence: 1,
          objects: ['SOS emergency alert'],
          summary: 'Emergency report created from the authenticated user SOS action.',
          model: 'civiceye-sos',
          source: 'sos-button',
          imageQuality: null,
          disclaimer: 'Location-based alert; verify the situation before taking action.',
        },
      });

      setOpen(false);
      toast.success(
        'SOS report sent',
        `${report.code ?? 'Emergency report'} was created at ${locationName}.`,
      );
    } catch (error) {
      toast.error(
        'SOS could not be sent',
        error instanceof Error ? error.message : 'Please try again or call emergency services.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border-2 border-white bg-rose-600 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_14px_40px_-10px_rgba(225,29,72,0.75)] transition hover:-translate-y-0.5 hover:bg-rose-500 focus-visible:ring-rose-500 sm:bottom-7 sm:right-7"
        aria-label="Open SOS emergency report"
      >
        <Siren className="h-5 w-5" />
        SOS
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:items-center"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !sending) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sos-dialog-title"
              className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-2xl dark:border-rose-500/30 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4 border-b border-rose-100 bg-rose-50 px-5 py-4 dark:border-rose-500/20 dark:bg-rose-500/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-500/30">
                    <Siren className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 id="sos-dialog-title" className="text-lg font-extrabold text-rose-950 dark:text-rose-100">
                      Send SOS alert?
                    </h2>
                    <p className="text-xs font-medium text-rose-700/80 dark:text-rose-200/80">
                      A critical report will be created at your current location.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={sending}
                  className="rounded-xl p-2 text-rose-400 transition hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 dark:hover:bg-rose-500/20 dark:hover:text-rose-200"
                  aria-label="Close SOS dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <p>
                    CivicEye will request your GPS location and create a <strong>critical</strong>{' '}
                    emergency report visible to the relevant dashboard. Location access is required.
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  This report does not replace emergency services. If someone is in immediate danger,
                  call India&apos;s emergency number first:
                </p>

                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call 112
                </a>

                <button
                  type="button"
                  onClick={() => void sendSOS()}
                  disabled={sending}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70',
                    'bg-rose-600 shadow-rose-600/25 hover:bg-rose-500',
                  )}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Siren className="h-4 w-4" />}
                  {sending ? 'Getting location and sending…' : 'Confirm and send SOS'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
