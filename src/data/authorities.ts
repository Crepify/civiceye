import type { Authority, CategoryId } from '@/types';

/* ====================================================================
 *  ⚠️  TODO — REPLACE THE PLACEHOLDER CONTACTS BELOW
 *
 *  Every `email`, `phone` and `whatsapp` below is a real-format
 *  PLACEHOLDER. When you have the actual department contacts:
 *
 *    1. Edit this file and swap the values, AND
 *    2. On Vercel, set `AUTHORITY_EMAIL_<ID>` env vars (see
 *       ENVIRONMENT.md) — the server-side email function reads the
 *       delivery address from env first, so nothing is emailed to a
 *       placeholder inbox by accident.
 *
 *  Until SMTP is configured on Vercel, the "Email authority" button
 *  gracefully falls back to opening the citizen's own mail app.
 * ==================================================================== */

/**
 * Civic / campus authorities used for dashboard assignment and the
 * "Report to Authority" escalation flow.
 *
 * scope 'city'   → CivicEye (government & municipal bodies, Bengaluru)
 * scope 'campus' → Amrita Eye (campus offices, escalation = "report to staff")
 */
export const AUTHORITIES: Authority[] = [
  /* ------------------------- CivicEye (city) ------------------------- */
  {
    id: 'bbmp-42',
    name: 'BBMP Ward 42 Control Room',
    department: 'Roads & Infrastructure',
    color: '#f59e0b',
    scope: 'city',
    categories: ['pothole', 'broken-road', 'sidewalk', 'manhole', 'other'],
    email: 'bbmp.ward42.apps@gmail.com', // TODO: replace with the ward office email
    phone: '+918022661234', // TODO: replace with the ward control-room number
    whatsapp: '918022661234', // TODO: replace with the ward WhatsApp helpline
    address: 'BBMP Ward 42 Office, 4th Main Road, Bengaluru — 5600XX', // TODO
    hours: 'Mon–Sat 9:30–17:30',
  },
  {
    id: 'bbmp-swm',
    name: 'BBMP Solid Waste Management',
    department: 'Sanitation',
    color: '#22c55e',
    scope: 'city',
    categories: ['garbage', 'illegal-dumping'],
    email: 'bbmp.swm.apps@gmail.com', // TODO
    phone: '+918022970432', // TODO
    whatsapp: '918022970432', // TODO
    address: 'SWM Cell, BBMP Head Office, NR Square, Bengaluru — 560002', // TODO
    hours: 'Mon–Sat 9:00–18:00',
  },
  {
    id: 'bwssb',
    name: 'BWSSB Helpline',
    department: 'Water Supply & Sewerage',
    color: '#38bdf8',
    scope: 'city',
    categories: ['water-leakage', 'sewage'],
    email: 'bwssb.helpdesk.apps@gmail.com', // TODO
    phone: '+918022945678', // TODO
    address: 'BWSSB, Cauvery Bhavan, KG Road, Bengaluru — 560009', // TODO
    hours: '24×7 helpline',
  },
  {
    id: 'bescom',
    name: 'BESCOM 1912',
    department: 'Street Lighting & Power',
    color: '#facc15',
    scope: 'city',
    categories: ['street-light'],
    email: 'bescom.1912.apps@gmail.com', // TODO
    phone: '+918022871112', // TODO
    address: 'BESCOM Corporate Office, KR Circle, Bengaluru — 560001', // TODO
    hours: '24×7 helpline (1912)',
  },
  {
    id: 'traffic-police',
    name: 'Bengaluru Traffic Police',
    department: 'Traffic & Signals',
    color: '#fb7185',
    scope: 'city',
    categories: ['traffic-signal', 'accident'],
    email: 'btp.control.apps@gmail.com', // TODO
    phone: '+918022868445', // TODO
    whatsapp: '918022868445', // TODO
    address: 'Traffic Management Centre, Infantry Road, Bengaluru — 560001', // TODO
    hours: '24×7 control room',
  },
  {
    id: 'forest-dept',
    name: 'BBMP Forest Cell',
    department: 'Trees & Parks',
    color: '#34d399',
    scope: 'city',
    categories: ['fallen-tree'],
    email: 'bbmp.forest.apps@gmail.com', // TODO
    phone: '+918022867530', // TODO
    address: 'Forest Cell, BBMP Head Office, NR Square, Bengaluru — 560002', // TODO
    hours: 'Mon–Sat 10:00–17:00',
  },

  /* ------------------------ Amrita Eye (campus) ---------------------- */
  {
    id: 'amrita-estate',
    name: 'Campus Estate & Civil Works',
    department: 'Campus Infrastructure',
    color: '#f59e0b',
    scope: 'campus',
    categories: ['pothole', 'broken-road', 'sidewalk', 'manhole', 'fallen-tree', 'other'],
    email: 'estate.office.apps@gmail.com', // TODO: replace with the estate office email
    phone: '+914726470000', // TODO: replace with the estate office number
    whatsapp: '914726470000', // TODO
    address: 'Estate Office, Admin Block, Amrita Campus', // TODO
    hours: 'Mon–Sat 9:00–17:00',
  },
  {
    id: 'amrita-facilities',
    name: 'Facilities & Housekeeping',
    department: 'Sanitation, Water & Electrical',
    color: '#38bdf8',
    scope: 'campus',
    categories: ['garbage', 'sewage', 'water-leakage', 'street-light'],
    email: 'facilities.desk.apps@gmail.com', // TODO
    phone: '+914726470100', // TODO
    whatsapp: '914726470100', // TODO
    address: 'Facilities Office, Ground Floor, Admin Block', // TODO
    hours: 'Mon–Sat 8:30–17:30',
  },
  {
    id: 'amrita-security',
    name: 'Campus Security Control Room',
    department: 'Safety & Security',
    color: '#fb7185',
    scope: 'campus',
    categories: ['security', 'accident'],
    email: 'security.control.apps@gmail.com', // TODO
    phone: '+914726470111', // TODO
    whatsapp: '914726470111', // TODO
    address: 'Security Control Room, Main Gate', // TODO
    hours: '24×7 emergency line',
  },
];

export const authorityById = (id: string | undefined): Authority | undefined =>
  AUTHORITIES.find((a) => a.id === id);

/** All authorities that serve a given product scope. */
export const authoritiesForScope = (scope: 'city' | 'campus'): Authority[] =>
  AUTHORITIES.filter((a) => a.scope === scope);

/**
 * The authority responsible for a report of `category` inside `scope`.
 * Falls back to the first authority of that scope ("catch-all" office)
 * so a caller always gets a real, contactable office.
 */
export function authorityForCategory(
  category: CategoryId | undefined,
  scope: 'city' | 'campus',
): Authority {
  const scoped = authoritiesForScope(scope);
  if (category) {
    const hit = scoped.find((a) => a.categories.includes(category));
    if (hit) return hit;
  }
  return scoped[0] ?? AUTHORITIES[0];
}

/** tel: link for an authority phone number. */
export const telLink = (a: Authority): string | undefined =>
  a.phone ? `tel:${a.phone.replace(/[^\d+]/g, '')}` : undefined;

/** wa.me deep link with an optional pre-filled message. */
export function whatsAppLink(a: Authority, message?: string): string | undefined {
  if (!a.whatsapp) return undefined;
  const digits = a.whatsapp.replace(/\D/g, '');
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** mailto: link with pre-filled subject + body. */
export function mailToLink(a: Authority, subject: string, body: string): string {
  return `mailto:${a.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
