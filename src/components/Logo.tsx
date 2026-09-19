import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useBrand } from '@/hooks/useBrand';
import { EasterEggModal } from '@/components/EasterEggModal';

interface LogoProps {
  to?: string;
  iconOnly?: boolean;
  className?: string;
}

export function Logo({ to, iconOnly = false, className }: LogoProps) {
  const { meta, brand } = useBrand();
  const [easterOpen, setEasterOpen] = useState(false);
  const clicksRef = useRef<number[]>([]);

  const handleLogoClick = () => {
    // Only for CivicEye logo per your request — 3 clicks pulls up fun about us
    if (brand !== 'civiceye') return;
    const now = Date.now();
    clicksRef.current = [...clicksRef.current.filter((t) => now - t < 2000), now];
    if (clicksRef.current.length >= 3) {
      clicksRef.current = [];
      setEasterOpen(true);
    }
  };

  useEffect(() => {
    if (easterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [easterOpen]);

  const mark = (
    <span
      onClick={handleLogoClick}
      className={cn(
        'logo-mark relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl shadow-glow transition-transform hover:scale-105 active:scale-95',
        brand === 'civiceye' ? 'animate-pulse' : '',
      )}
      title={brand === 'civiceye' ? 'Triple-click for secret lab! 🎉' : undefined}
    >
      <MapPin className="h-5 w-5 text-white" strokeWidth={2.4} />
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400 dark:border-slate-900" />
    </span>
  );

  const wordmark = iconOnly ? null : (
    <span className="flex flex-col leading-none">
      <span onClick={handleLogoClick} className="cursor-pointer text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
        {meta.wordmarkPrefix}
        <span className="text-gradient">Eye</span>
      </span>
      <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 sm:block">
        {meta.tagline}
      </span>
    </span>
  );

  return (
    <>
      {to ? (
        <Link to={to} className={cn('flex items-center gap-2.5', className)} aria-label={`${meta.appName} home`}>
          {mark}
          {wordmark}
        </Link>
      ) : (
        <span className={cn('flex items-center gap-2.5', className)}>
          {mark}
          {wordmark}
        </span>
      )}
      <EasterEggModal open={easterOpen} onClose={() => setEasterOpen(false)} />
    </>
  );
}
