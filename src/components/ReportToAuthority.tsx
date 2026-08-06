import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CheckCircle2, FileCheck2, Loader2, Send, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';
import { useToast } from '@/hooks/useToast';
import { useNotifications } from '@/hooks/useNotifications';
import { useBrand } from '@/hooks/useBrand';
import { cn } from '@/utils/cn';

interface ReportToAuthorityProps {
  /** What is being sent (e.g. "your report" or "the selected 42 reports"). */
  subject?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  onDone?: () => void;
}

const SENDING_STEPS = [
  'Compiling report package…',
  'Attaching evidence photos…',
  'Routing to the relevant office…',
  'Confirming receipt…',
];

/**
 * "Report to Authority" simulation.
 * Prototype only — animates a submission and shows a success state.
 */
export function ReportToAuthority({
  subject = 'your report',
  label = 'Report to authority',
  variant = 'primary',
  className,
  onDone,
}: ReportToAuthorityProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done'>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const toast = useToast();
  const notifications = useNotifications();
  const { isAmrita } = useBrand();
  const timerRef = useRef<number | null>(null);

  const resolvedLabel = isAmrita ? 'Report to staff' : label;
  const office = isAmrita ? 'campus office' : 'ward office';

  const start = () => {
    setPhase('sending');
    setStepIndex(0);
    setOpen(true);

    SENDING_STEPS.forEach((_, i) => {
      timerRef.current = window.setTimeout(() => setStepIndex(i), i * 650);
    });
    timerRef.current = window.setTimeout(
      () => {
        setPhase('done');
        toast.success('Report sent!', `The ${office} has received ${subject}.`);
        notifications.add({
          type: 'report',
          title: 'Report sent',
          message: `Your submission (${subject}) was delivered to the ${office}. Track its status in the dashboard.`,
        });
        onDone?.();
      },
      SENDING_STEPS.length * 650 + 400,
    );
  };

  const close = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(false);
    setPhase('idle');
  };

  return (
    <>
      <button
        onClick={start}
        className={cn(
          variant === 'primary' && 'btn-primary',
          variant === 'secondary' && 'btn-secondary',
          variant === 'ghost' && 'btn-ghost',
          variant === 'danger' && 'btn-danger',
          className,
        )}
      >
        <Send className="h-4 w-4" />
        {resolvedLabel}
      </button>

      <Modal
        open={open}
        onClose={phase === 'sending' ? undefined : close}
        hideClose={phase === 'sending'}
        title="Report to authorities"
      >
        <div className="px-6 py-10 text-center">
          <AnimatePresence mode="wait">
            {phase === 'sending' ? (
              <motion.div
                key="sending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-glow">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Sending to your ward office…
                </h3>
                <div className="mx-auto mt-6 max-w-xs space-y-3 text-left">
                  {SENDING_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                          i < stepIndex
                            ? 'bg-emerald-500 text-white'
                            : i === stepIndex
                              ? 'bg-primary-500 text-white'
                              : 'bg-slate-100 text-slate-400 dark:bg-white/10',
                        )}
                      >
                        {i < stepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          'text-sm',
                          i <= stepIndex
                            ? 'text-slate-700 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500',
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                {/* Confetti sparks */}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <motion.span
                      key={deg}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((deg * Math.PI) / 180) * 64,
                        y: Math.sin((deg * Math.PI) / 180) * 64,
                        opacity: 0,
                        scale: 0.3,
                      }}
                      transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                      className="absolute h-2.5 w-2.5 rounded-full"
                      style={{
                        background: `hsl(${deg + 40} 85% 60%)`,
                      }}
                    />
                  ))}
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow-emerald"
                  >
                    <CheckCircle2 className="h-9 w-9" />
                  </motion.span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Delivered! 🎉
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-200">{subject}</strong> has been
                  sent to the ward office with photos, coordinates and priority. This is a simulated
                  delivery — in a real deployment it would create a ticket in the agency&apos;s
                  system.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
                  <span className="chip">
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
                    Ticket #CE-{Math.floor(1000 + Math.random() * 9000)}
                  </span>
                  <span className="chip">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                    SLA: 7 working days
                  </span>
                </div>
                <button onClick={close} className="btn-primary mt-8">
                  <Building2 className="h-4 w-4" />
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </>
  );
}
