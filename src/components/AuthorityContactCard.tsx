import { Check, Clock, Copy, ExternalLink, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import type { Authority } from '@/types';
import { telLink, whatsAppLinks } from '@/data/authorities';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

/** True when this is the CivicEye team's own capture inbox (not a public dept inbox). */
const isTeamInbox = (email: string) => /@gmail\.com$/i.test(email.trim());

/**
 * Compact card with an authority's real public channels.
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
  const waTargets = whatsAppLinks(authority, undefined).slice(0, 1);

  const copyText = async (text: string, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast.success(label, text);
    } catch {
      toast.info(label, text);
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

      <dl className="mt-3 space-y-2 text-xs">
        {authority.email.trim() ? (
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 font-semibold text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              {isTeamInbox(authority.email) ? 'Via CivicEye' : 'Grievance email'}
            </dt>
            <dd className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">
              {authority.email}
            </dd>
            <button
              onClick={() => void copyText(authority.email, 'Email copied')}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
              title="Copy email address"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : null}

        {authority.phone ? (
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 font-semibold text-slate-400">
              <Phone className="h-3.5 w-3.5" />
              Call
            </dt>
            <dd className="min-w-0 flex-1 truncate">
              {phoneHref ? (
                <a href={phoneHref} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                  {authority.phone}
                </a>
              ) : (
                <span className="font-medium text-slate-700 dark:text-slate-200">{authority.phone}</span>
              )}
              {authority.phoneNote ? (
                <span className="ml-1.5 text-slate-400">· {authority.phoneNote}</span>
              ) : null}
            </dd>
          </div>
        ) : null}

        {waTargets.length > 0 ? (
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 font-semibold text-slate-400">
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </dt>
            <dd className="min-w-0 flex-1 truncate">
              {waTargets.map((t) => (
                <a
                  key={t.number}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  +{t.number.replace(/^(\d{2})(\d+)/, '$1 $2')}
                </a>
              ))}
              {authority.whatsappNote ? (
                <span className="ml-1.5 text-slate-400">· {authority.whatsappNote}</span>
              ) : null}
            </dd>
          </div>
        ) : null}

        {authority.portalUrl ? (
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 font-semibold text-slate-400">
              <Globe className="h-3.5 w-3.5" />
              Portal
            </dt>
            <dd className="min-w-0 flex-1 truncate">
              <a
                href={authority.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                {authority.portalLabel ?? 'Open official portal'}
                <ExternalLink className="h-3 w-3" />
              </a>
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

        {authority.source ? (
          <p className="pt-1 text-[10px] text-slate-400">Source: {authority.source}</p>
        ) : null}
      </dl>
    </div>
  );
}
