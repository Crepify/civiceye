import { useEffect, useState } from 'react';
import { SunDim, Sun, SunMedium } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const STORAGE_KEY = 'civiceye-brightness';
/** Light-mode-only brightness steps (percent). */
const LEVELS = [100, 110, 90, 80] as const;

function readLevel(): number {
  try {
    const v = Number(window.localStorage.getItem(STORAGE_KEY));
    return (LEVELS as readonly number[]).includes(v) ? v : 100;
  } catch {
    return 100;
  }
}

/**
 * Brightness adjuster that sits next to the light/dark switch.
 * Light mode only: cycles 100% → 110% → 90% → 80% using a fixed veil,
 * so no layout/fixed-position side effects. Hidden entirely in night mode.
 */
export function BrightnessControl() {
  const { theme } = useTheme();
  const [level, setLevel] = useState<number>(100);

  useEffect(() => {
    setLevel(readLevel());
  }, []);

  useEffect(() => {
    let veil = document.getElementById('brightness-veil') as HTMLDivElement | null;
    if (!veil) {
      veil = document.createElement('div');
      veil.id = 'brightness-veil';
      veil.style.position = 'fixed';
      veil.style.inset = '0';
      veil.style.pointerEvents = 'none';
      veil.style.zIndex = '2147483000';
      document.body.appendChild(veil);
    }
    const dark = theme === 'dark';
    if (dark || level === 100) {
      veil.style.display = 'none';
    } else {
      veil.style.display = 'block';
      if (level < 100) {
        veil.style.background = '#081521';
        veil.style.opacity = String((100 - level) / 100);
      } else {
        veil.style.background = '#ffffff';
        veil.style.opacity = String((level - 100) / 100);
      }
    }
    return () => {
      if (veil) veil.style.display = 'none';
    };
  }, [level, theme]);

  if (theme === 'dark') return null;

  const cycle = () => {
    const idx = (LEVELS as readonly number[]).indexOf(level);
    const next = LEVELS[(idx + 1) % LEVELS.length];
    setLevel(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* private mode */
    }
  };

  const Icon = level > 100 ? Sun : level === 100 ? SunMedium : SunDim;

  return (
    <button
      onClick={cycle}
      className="relative flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white/70 px-2 text-[10px] font-black text-slate-600 transition-all duration-200 hover:border-amber-300 hover:text-amber-600"
      aria-label={`Brightness ${level} percent — click to change`}
      title={`Brightness ${level}% (light mode only)`}
    >
      <Icon className="h-4 w-4" />
      {level}%
    </button>
  );
}
