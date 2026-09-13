import { useEffect, useState } from 'react';
import { Sun, SunDim } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const STORAGE_KEY = 'civiceye-brightness';
const MIN = 10;
const MAX = 100;

function readLevel(): number {
  try {
    const v = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(v) ? 100 : Math.min(MAX, Math.max(MIN, v));
  } catch {
    return 100;
  }
}

/**
 * Light-mode-only brightness slider (10-100%). Sits next to the theme toggle.
 * Implemented as a fixed veil (no filters on the page, so nothing breaks),
 * and hides completely in night mode.
 */
export function BrightnessControl() {
  const { theme } = useTheme();
  const [level, setLevel] = useState<number>(100);
  const [open, setOpen] = useState(false);

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
    if (dark || level >= 100) {
      veil.style.display = 'none';
    } else {
      veil.style.display = 'block';
      veil.style.background = '#081521';
      veil.style.opacity = String((100 - level) / 100);
    }
    return () => {
      if (veil) veil.style.display = 'none';
    };
  }, [level, theme]);

  if (theme === 'dark') return null;

  const set = (v: number) => {
    setLevel(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      /* private mode */
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white/70 px-2 text-[10px] font-black text-slate-600 transition-all duration-200 hover:border-amber-300 hover:text-amber-600"
        aria-label={`Brightness ${level} percent — open slider`}
        title={`Brightness ${level}% (light mode only)`}
      >
        {level >= 100 ? <Sun className="h-4 w-4" /> : <SunDim className="h-4 w-4" />}
        {level}%
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-50 w-44 border-[3px] border-[#172b44] bg-[#fff8e7] p-3 shadow-[4px_4px_0_#172b44]">
          <p className="mb-1 text-[10px] font-black tracking-wide text-[#172b44]">BRIGHTNESS · {level}%</p>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={5}
            value={level}
            onChange={(e) => set(Number(e.target.value))}
            className="w-full accent-[#ef6b59]"
            aria-label="Brightness slider"
          />
          <div className="flex justify-between text-[9px] font-bold text-[#52606a]">
            <span>10</span>
            <span>100</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
