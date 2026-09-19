import type { Authority, CategoryId, Report } from '@/types';
import { authorityForCategory, mailToLink, smsLink, whatsAppLinks } from '@/data/authorities';
import { supabase } from '@/lib/supabase';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() ?? '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() ?? '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() ?? '';

export const isEmailJSConfigured = Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
export const newEscalationRef = (): string => `ESC-${Date.now().toString(36).toUpperCase()}`;

export async function sendEscalationViaEmailJS(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message: string | undefined,
  ref: string,
): Promise<void> {
  const reportUrl = `${window.location.origin}/report/${report.id}`;
  const mapsUrl = `https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`;
  const ai = (report as any).ai || {};
  
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
      annotated_image_url: ai.annotatedImage || report.image,
      ai_confidence: ai.confidence ? `${Math.round(ai.confidence * 100)}%` : '—',
      ai_description: ai.description || report.description,
      ai_objects: (ai.objects || []).join(', ') || '—',
      ai_model: ai.model || ai.engine || 'CivicEye AI',
      author: report.author,
      reporter_email: reporterEmail ?? '—',
      description: report.description,
      message: message ?? '',
      sla: '7 working days',
    },
    { publicKey: EMAILJS_PUBLIC_KEY },
  );
}

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
    annotatedImage?: string | null;
    ai?: any;
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

export function buildEscalationPayload(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message?: string,
): EscalationPayload {
  const ai = (report as any).ai || null;
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
      annotatedImage: ai?.annotatedImage || null,
      ai: ai,
      url: `${window.location.origin}/report/${report.id}`,
      author: report.author,
      reporterEmail: reporterEmail ?? undefined,
      scope: report.scope,
    },
  };
}

export async function sendEscalationEmail(payload: EscalationPayload): Promise<EscalationResult> {
  const res = await fetch('/api/report-authority', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.status === 503) {
    const data = await res.json().catch(() => ({}));
    return { status: 'not-configured', ref: data.ref ?? '', to: data.to, authorityName: data.authority?.name };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Delivery failed (${res.status})`);
  }
  const data = await res.json();
  return { status: 'sent', ref: data.ref, to: data.to, authorityName: data.authority?.name };
}

export function escalationEmailText(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message?: string,
): { subject: string; body: string } {
  const url = `${window.location.origin}/report/${report.id}`;
  const mapsUrl = `https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`;
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';
  const ai = (report as any).ai || {};
  const subject = `[${appName}] ${report.title} — ${report.severity.toUpperCase()} — report ${report.code ?? report.id}`;

  const body = [
    `To: ${authority.name} (${authority.department})`,
    ``,
    `Report: ${report.code ?? report.id}`,
    `Title: ${report.title}`,
    `Category: ${report.category}`,
    `Severity: ${report.severity.toUpperCase()}${ai.confidence ? ` (AI confidence ${Math.round(ai.confidence * 100)}%)` : ''}`,
    `Location: ${report.locationName} (${report.coordinates.lat}, ${report.coordinates.lng})`,
    `Google Maps: ${mapsUrl}`,
    `Report Link: ${url}`,
    `Evidence Photo: ${report.image}`,
    ai.annotatedImage ? `AI Annotated Photo: ${ai.annotatedImage.slice(0, 100)}... (attached)` : '',
    ai.description ? `AI Description: ${ai.description}` : '',
    ai.objects ? `AI Objects: ${(ai.objects || []).join(', ')}` : '',
    ai.model ? `AI Model: ${ai.model} (${ai.engine || ''})` : '',
    `Reported by: ${report.author}${reporterEmail ? ` <${reporterEmail}>` : ''}`,
    ``,
    `Description:`,
    report.description,
    message ? `\nNote from citizen:\n${message}` : '',
    ``,
    `— Sent from ${appName}`,
    `This email includes attached picture with AI annotations, Google Maps coordinate link with severity, and link to report on website.`,
    `For Amrita Eye, this is routed to Campus Estate & Civil Works / Facilities & Housekeeping / Security.`,
    `For CivicEye, this is routed to BBMP / BWSSB / BESCOM / Traffic Police with zone-aware email.`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, body };
}

export function escalationWhatsAppTargets(
  report: Report,
  authority: Authority,
): { number: string; url: string }[] {
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';
  const mapsUrl = `https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`;
  const text = [
    `${appName} report: ${report.title}`,
    `Severity: ${report.severity.toUpperCase()} · Category: ${report.category}`,
    `Location: ${report.locationName} — ${mapsUrl}`,
    `Details: ${window.location.origin}/report/${report.id}`,
    `Photo: ${report.image}`,
  ].join('\n');
  return whatsAppLinks(authority, text);
}

export function escalationSmsUrl(report: Report, authority: Authority): string | undefined {
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';
  const mapsUrl = `https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`;
  const text = [
    `${appName} report: ${report.title}`,
    `Severity: ${report.severity.toUpperCase()} · ${report.category}`,
    `Location: ${report.locationName} (${report.coordinates.lat}, ${report.coordinates.lng}) — ${mapsUrl}`,
    `Details: ${window.location.origin}/report/${report.id}`,
  ].join('\n');
  return smsLink(authority, text);
}

export function escalationMailToUrl(
  report: Report,
  authority: Authority,
  reporterEmail: string | null,
  message?: string,
): string {
  const { subject, body } = escalationEmailText(report, authority, reporterEmail, message);
  return mailToLink(authority, subject, body);
}

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

export function responsibleAuthority(report: Pick<Report, 'category' | 'scope'>): Authority {
  return authorityForCategory(report.category, report.scope);
}
