import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useBrand } from '@/hooks/useBrand';

interface LogoProps {
  /** Render as a link to home. */
  to?: string;
  /** Hide the wordmark (icon only). */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Brand mark — automatically shows "CivicEye" (indigo pin) or
 * "Amrita Eye" (red → gold pin) depending on the active brand.
 */
export function Logo({ to, iconOnly = false, className }: LogoProps) {
  const { meta } = useBrand();

  const mark = (
    <span
      className={cn(
        'logo-mark relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-glow',
      )}
    >
      <MapPin className="h-5 w-5 text-white" strokeWidth={2.4} />
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400 dark:border-slate-900" />
    </span>
  );

  const wordmark = iconOnly ? null : (
    <span className="flex flex-col leading-none">
      <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
        {meta.wordmarkPrefix}
        <span className="text-gradient">Eye</span>
      </span>
      <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 sm:block">
        {meta.tagline}
      </span>
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={cn('flex items-center gap-2.5', className)}
        aria-label={`${meta.appName} home`}
      >
        {mark}
        {wordmark}
      </Link>
    );
  }

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {mark}
      {wordmark}
    </span>
  );
}
