import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StepMeta {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepMeta[];
  current: number;
  /** Steps already completed (index < current) are marked with a check. */
  onStepClick?: (index: number) => void;
}

/** Horizontal progress stepper used by the report wizard. */
export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex items-center gap-0" aria-label="Report progress">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step.label}
            className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}
          >
            <button
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              className="group flex items-center gap-2"
              aria-current={active ? 'step' : undefined}
            >
              <motion.span
                animate={{ scale: active ? 1.08 : 1 }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                  done && 'border-emerald-500 bg-emerald-500 text-white shadow-glow-emerald',
                  active && 'border-primary-500 bg-primary-500 text-white shadow-glow',
                  !done &&
                    !active &&
                    'border-slate-300 bg-white text-slate-400 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-500',
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </motion.span>
              <span className="hidden flex-col items-start sm:flex">
                <span
                  className={cn(
                    'text-xs font-bold',
                    active
                      ? 'text-primary-600 dark:text-primary-400'
                      : done
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {step.label}
                </span>
                {step.description ? (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {step.description}
                  </span>
                ) : null}
              </span>
            </button>
            {i < steps.length - 1 ? (
              <span className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <motion.span
                  initial={false}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  className="block h-full rounded-full bg-emerald-500"
                />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
