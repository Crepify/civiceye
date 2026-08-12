import { Check, Clock, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import type { Authority } from '@/types';
import { telLink } from '@/data/authorities';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

/**
 * Compact card with an authority's public contact channels.
 * Used inside the ReportToAuthority modal and on the report page sidebar.
 */
export function AuthorityContactCard({
  authority,
  heading = 'Responsible authority',
  className,
}: {
  authority: Authority;
  heading?: string;
  className?: string;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const phoneHref = telLink(authority);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(authority.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast.success('Email copied', authority.email);
    } catch {
      toast.info('Email address', authority.email);
    }
  };

  return (
    <div className={cn('rounded-2xl border border-slate-200/70 p-4 dark:border-white/10', className)}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{heading}</p>

      <div className="mt-3 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: authority.color }}
        >
          <Mail className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {authority.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{authority.department}</p>
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <dt className="flex items-center gap-1.5 font-semibold text-slate-400">
            <Mail className="h-3.5 w-3.5" />
            Email
          </dt>
          <dd className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">
            {authority.email}
          </dd>
          <button
            onClick={() => void copyEmail()}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
            title="Copy email address"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        {authority.phone ? (
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 font-semibold text-slate-400">
              <Phone className="h-3.5 w-3.5" />
              Phone
            </dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">
              {phoneHref ? (
                <a href={phoneHref} className="hover:text-primary-600 hover:underline">
                  {authority.phone}
                </a>
              ) : (
                authority.phone
              )}
            </dd>
          </div>
        ) : null}
        {authority.hours ? (
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 font-semibold text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Hours
            </dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">{authority.hours}</dd>
          </div>
        ) : null}
        {authority.address ? (
          <div className="flex items-start gap-2">
            <dt className="mt-px flex shrink-0 items-center gap-1.5 font-semibold text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              Office
            </dt>
            <dd className="font-medium leading-relaxed text-slate-700 dark:text-slate-200">
              {authority.address}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
