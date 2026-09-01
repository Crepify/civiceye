import type { Authority, CategoryId, Report } from '@/types';
import { authorityForCategory, mailToLink, smsLink, whatsAppLinks } from '@/data/authorities';
import { supabase } from '@/lib/supabase';
import emailjs from '@emailjs/browser';

/**
 * Client-side email fallback via EmailJS (https://www.emailjs.com/) — a
 * third-party sender that needs no server at all. Configure with the
 * VITE_EMAILJS_* env vars (see ENVIRONMENT.md). The public key is safe for
 * the browser; restrict it to your domain in the EmailJS dashboard.
 */
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() ?? '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() ?? '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() ?? '';

export const isEmailJSConfigured = Boolean(
  EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY,
);

export const newEscalationRef = (): string =>
  `ESC-${Date.now().toString(36).toUpperCase()}`;

/**
 * Send the escalation via EmailJS from the browser. Variable names here must
 * match the EmailJS template (documented in ENVIRONMENT.md).
 */
export async function sendEscalationViaEmailJS(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message: string | undefined,
  ref: string,
): Promise<void> {
  const reportUrl = `${window.location.origin}/report/${report.id}`;
  const mapsUrl = `https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`;
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: authority.email,
      authority_name: authority.name,
      department: authority.department,
      app_name: report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye',
      ref,
      report_code: report.code ?? report.id,
      title: report.title,
      category: report.category,
      severity: report.severity,
      location_name: report.locationName,
      coordinates: `${report.coordinates.lat}, ${report.coordinates.lng}`,
      maps_url: mapsUrl,
      report_url: reportUrl,
      image_url: report.image,
      author: report.author,
      reporter_email: reporterEmail ?? '—',
      description: report.description,
      message: message ?? '',
      sla: '7 working days',
    },
    { publicKey: EMAILJS_PUBLIC_KEY },
  );
}

/** Payload sent to POST /api/report-authority. */
export interface EscalationPayload {
  authorityId: string;
  message?: string;
  report: {
    id?: string;
    code?: string;
    title: string;
    description: string;
    category: CategoryId | string;
    severity: string;
    locationName?: string;
    coordinates?: { lat: number; lng: number } | null;
    image?: string;
    url?: string;
    author?: string;
    reporterEmail?: string;
    scope?: 'city' | 'campus';
  };
}

export interface EscalationResult {
  status: 'sent' | 'not-configured';
  ref: string;
  to?: string;
  authorityName?: string;
}

/** Build the escalation payload for a report + authority pair. */
export function buildEscalationPayload(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message?: string,
): EscalationPayload {
  return {
    authorityId: authority.id,
    message,
    report: {
      id: report.id,
      code: report.code,
      title: report.title,
      description: report.description,
      category: report.category,
      severity: report.severity,
      locationName: report.locationName,
      coordinates: report.coordinates,
      image: report.image,
      url: `${window.location.origin}/report/${report.id}`,
      author: report.author,
      reporterEmail: reporterEmail ?? undefined,
      scope: report.scope,
    },
  };
}

/**
 * Ask the server to email the report package to the authority.
 * Throws only on network errors; delivery problems come back as a result.
 */
export async function sendEscalationEmail(payload: EscalationPayload): Promise<EscalationResult> {
  const res = await fetch('/api/report-authority', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.status === 503) {
    const data = await res.json().catch(() => ({}));
    return {
      status: 'not-configured',
      ref: data.ref ?? '',
      to: data.to,
      authorityName: data.authority?.name,
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Delivery failed (${res.status})`);
  }
  const data = await res.json();
  return { status: 'sent', ref: data.ref, to: data.to, authorityName: data.authority?.name };
}

/**
 * The pre-filled email body used for the mailto: fallback (and copied for
 * reference) when the SMTP gateway is not configured.
 */
export function escalationEmailText(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message?: string,
): { subject: string; body: string } {
  const url = `${window.location.origin}/report/${report.id}`;
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';
  const subject = `[${appName}] ${report.title} — report ${report.code ?? report.id}`;
  const body = [
    `To: ${authority.name} (${authority.department})`,
    ``,
    `Report: ${report.code ?? report.id}`,
    `Title: ${report.title}`,
    `Category: ${report.category}`,
    `Severity: ${report.severity}`,
    `Location: ${report.locationName} (${report.coordinates.lat}, ${report.coordinates.lng})`,
    `Link: ${url}`,
    `Evidence photo: ${report.image}`,
    `Reported by: ${report.author}${reporterEmail ? ` <${reporterEmail}>` : ''}`,
    ``,
    `Description:`,
    report.description,
    message ? `\nNote:\n${message}` : '',
    ``,
    `— Sent from ${report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye'}`,
  ].join('\n');
  return { subject, body };
}

/** WhatsApp deep links for pinging the authority about a report (one per number). */
export function escalationWhatsAppTargets(
  report: Report,
  authority: Authority,
): { number: string; url: string }[] {
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';
  const text = [
    `${appName} report: ${report.title}`,
    `Category: ${report.category} · Severity: ${report.severity}`,
    `Location: ${report.locationName}`,
    `Details: ${window.location.origin}/report/${report.id}`,
  ].join('\n');
  return whatsAppLinks(authority, text);
}

/** The SMS deep link for texting the authority about a report. */
export function escalationSmsUrl(report: Report, authority: Authority): string | undefined {
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';
  const text = [
    `${appName} report: ${report.title}`,
    `Category: ${report.category} · Severity: ${report.severity}`,
    `Location: ${report.locationName} (${report.coordinates.lat}, ${report.coordinates.lng})`,
    `Details: ${window.location.origin}/report/${report.id}`,
  ].join('\n');
  return smsLink(authority, text);
}

/** The mailto: fallback link for a report escalation. */
export function escalationMailToUrl(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message?: string,
): string {
  const { subject, body } = escalationEmailText(report, authority, reporterEmail, message);
  return mailToLink(authority, subject, body);
}

/**
 * Best-effort log of the escalation in Supabase (`authority_reports` table —
 * see supabase/authority-reports.sql). Never throws: the escalation itself
 * must succeed even before the migration is run.
 */
export async function logEscalation(entry: {
  report: Report | null;
  authority: Authority;
  channel: 'email' | 'whatsapp' | 'phone' | 'sms' | 'mailto';
  reporterId?: string | null;
  reporterEmail?: string | null;
  message?: string;
}): Promise<void> {
  if (!supabase) return;
  try {
    const { report, authority, channel, reporterId, reporterEmail, message } = entry;
    await supabase.from('authority_reports').insert({
      report_id: report?.id ?? null,
      report_code: report?.code ?? null,
      authority_id: authority.id,
      authority_email: authority.email,
      channel,
      reporter_id: reporterId ?? null,
      reporter_email: reporterEmail ?? null,
      message: message ?? null,
    });
  } catch {
    /* audit logging is best-effort only */
  }
}

/** Which authority handles this report's category in its scope. */
export function responsibleAuthority(report: Pick<Report, 'category' | 'scope'>): Authority {
  return authorityForCategory(report.category, report.scope);
}
