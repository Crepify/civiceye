import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Lock } from 'lucide-react';
import { isGuest } from '@/utils/guest';

/**
 * Guests can view everything and review reports, but logging new issues
 * needs a free account. Shows a comic notice instead of the report form.
 */
export function GuestGate({ children }: { children: ReactNode }) {
  if (!isGuest()) return <>{children}</>;
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pb-16 pt-[calc(var(--nav-height)+3rem)]">
      <div className="w-full max-w-lg border-[5px] border-[#172b44] bg-[#fff8e7] p-8 text-[#172b44] shadow-[10px_10px_0_#ffd630]">
        <p className="inline-block border-2 border-[#172b44] bg-[#ffd630] px-3 py-1 text-xs font-black tracking-[.14em]">GUEST VIEW</p>
        <h1 className="mt-4 font-serif text-4xl font-black uppercase leading-[.9] [text-shadow:3px_3px_0_#91dcc4]">Look around.<br />Review anything.<br />Log nothing.</h1>
        <p className="mt-4 flex items-start gap-2 text-sm font-semibold leading-relaxed">
          <Eye className="mt-0.5 h-4 w-4 shrink-0" /> Guests can browse every page and leave reviews or comments on reports. Filing a new issue needs a free account — it keeps the map trustworthy.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/login" className="border-[3px] border-[#172b44] bg-[#ffd630] px-4 py-3 text-sm font-black shadow-[4px_4px_0_#172b44] transition hover:-translate-y-0.5">Create free account →</Link>
          <Link to="/map" className="border-[3px] border-[#172b44] bg-[#91dcc4] px-4 py-3 text-sm font-black shadow-[4px_4px_0_#172b44] transition hover:-translate-y-0.5">Keep exploring the map</Link>
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-[#52606a]"><Lock className="h-3 w-3" /> Reporting, voting and status changes stay signed-in only.</p>
      </div>
    </div>
  );
}
