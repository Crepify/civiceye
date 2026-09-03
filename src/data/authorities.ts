import type { Authority, CategoryId } from '@/types';

/* ====================================================================
 *  Authority contacts
 *
 *  `email` defaults to the official CivicEye inbox
 *  (civiceyeoffcial@gmail.com) so every escalated report is captured by
 *  the team. `phone` / `whatsapp` are the public civic helplines; the
 *  official complaint portal for each body is in `portalUrl`.
 *
 *  When you have a dedicated department inbox, set `AUTHORITY_EMAIL_<ID>`
 *  on Vercel (see ENVIRONMENT.md) — the server-side email function reads
 *  the delivery address from env first and overrides this default.
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
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
    address: 'BBMP Ward 42 Office, 4th Main Road, Bengaluru — 5600XX', // TODO
    hours: 'Mon–Sat 9:30–17:30',
    // Official grievance portal — verify it's current before demoing.
    portalUrl: 'https://bbmp.samparka.online', // BBMP Samparka (roads/potholes)
  },
  {
    id: 'bbmp-swm',
    name: 'BBMP Solid Waste Management',
    department: 'Sanitation',
    color: '#22c55e',
    scope: 'city',
    categories: ['garbage', 'illegal-dumping'],
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
    address: 'SWM Cell, BBMP Head Office, NR Square, Bengaluru — 560002', // TODO
    hours: 'Mon–Sat 9:00–18:00',
    portalUrl: 'https://bbmp.samparka.online', // BBMP Samparka (garbage/SWM)
  },
  {
    id: 'bwssb',
    name: 'BWSSB Helpline',
    department: 'Water Supply & Sewerage',
    color: '#38bdf8',
    scope: 'city',
    categories: ['water-leakage', 'sewage'],
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
    address: 'BWSSB, Cauvery Bhavan, KG Road, Bengaluru — 560009', // TODO
    hours: '24×7 helpline',
    portalUrl: 'https://bwssb.karnataka.gov.in', // official BWSSB site
  },
  {
    id: 'bescom',
    name: 'BESCOM 1912',
    department: 'Street Lighting & Power',
    color: '#facc15',
    scope: 'city',
    categories: ['street-light'],
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
    address: 'BESCOM Corporate Office, KR Circle, Bengaluru — 560001', // TODO
    hours: '24×7 helpline (1912)',
    portalUrl: 'https://bescom.karnataka.gov.in', // official BESCOM site
  },
  {
    id: 'traffic-police',
    name: 'Bengaluru Traffic Police',
    department: 'Traffic & Signals',
    color: '#fb7185',
    scope: 'city',
    categories: ['traffic-signal', 'accident'],
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
    address: 'Traffic Management Centre, Infantry Road, Bengaluru — 560001', // TODO
    hours: '24×7 control room',
    portalUrl: 'https://www.bengalurucitypolice.gov.in', // Bangalore City Police
  },
  {
    id: 'forest-dept',
    name: 'BBMP Forest Cell',
    department: 'Trees & Parks',
    color: '#34d399',
    scope: 'city',
    categories: ['fallen-tree'],
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
    address: 'Forest Cell, BBMP Head Office, NR Square, Bengaluru — 560002', // TODO
    hours: 'Mon–Sat 10:00–17:00',
    portalUrl: 'https://bbmp.gov.in', // BBMP main site (tree cell)
  },

  /* ------------------------ Amrita Eye (campus) ---------------------- */
  {
    id: 'amrita-estate',
    name: 'Campus Estate & Civil Works',
    department: 'Campus Infrastructure',
    color: '#f59e0b',
    scope: 'campus',
    categories: ['pothole', 'broken-road', 'sidewalk', 'manhole', 'fallen-tree', 'other'],
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
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
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
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
    email: 'civiceyeoffcial@gmail.com', // TEST: personal inbox — replace with the real dept email
    phone: '+919480079837', // TEST: personal number — replace with real dept number
    whatsapp: ['919480079837', '919741042014'], // TEST: personal numbers — replace with real dept numbers
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

/** wa.me deep links, one per authority WhatsApp number, with an optional pre-filled message. */
export function whatsAppLinks(
  a: Authority,
  message?: string,
): { number: string; url: string }[] {
  return (a.whatsapp ?? []).map((raw) => {
    const digits = raw.replace(/\D/g, '');
    const base = `https://wa.me/${digits}`;
    return { number: digits, url: message ? `${base}?text=${encodeURIComponent(message)}` : base };
  });
}

/**
 * sms: deep link with a pre-filled body — opens the citizen's messaging app.
 * The "?&body" form works on both Android (?body) and iOS (&body).
 */
export function smsLink(a: Authority, message?: string): string | undefined {
  if (!a.phone) return undefined;
  const number = a.phone.replace(/[^\d+]/g, '');
  const base = `sms:${number}`;
  return message ? `${base}?&body=${encodeURIComponent(message)}` : base;
}

/** mailto: link with pre-filled subject + body. */
export function mailToLink(a: Authority, subject: string, body: string): string {
  return `mailto:${a.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
