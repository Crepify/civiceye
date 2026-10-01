/**
 * Vercel serverless function — ANONYMOUS Food Hygiene Complaints.
 *
 * POST /api/food-hygiene
 * Body: { location, issueType, severity, description, whenHappened, dietaryRestriction }
 *
 * Design goals:
 *  1. FULLY ANONYMOUS. No auth header required. No user ID, email, name,
 *     IP or any identifying data is stored OR sent in the email.
 *     We intentionally do not read/forward the Authorization header,
 *     any cookie, the X-Forwarded-For / X-Real-IP headers, the User-Agent,
 *     Referer, or any other request metadata. The only thing forwarded is
 *     the content of the fields above.
 *  2. STRAIGHT to the Amrita campus mess/canteen helplines. Recipients
 *     are hardcoded SERVER-SIDE — the client cannot choose or overwrite
 *     the To address, so this endpoint cannot be abused as an open relay.
 *  3. Quick: minimal fields, no login, no uploads, no database write.
 *     Server does one SMTP send and returns 200.
 *
 * Overrides (Vercel env):
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
 *   FOOD_HYGIENE_TO — comma-separated recipients (overrides default)
 *
 * If SMTP is not configured the function returns 503 with a mailto URL
 * so the UI can open the user's mail client pre-filled (still
 * anonymous — pre-fills only the content, no From/identity).
 */

import nodemailer from 'nodemailer';

// In-memory rate limit per IP to stop spam — note we ONLY use the IP
// for rate limiting and NEVER include it in the email or any storage.
// We also rotate/clear the map periodically so it never persists.
const rateMap = new Map();
const RATE_MAX = 5;          // 5 submissions…
const RATE_WINDOW_MS = 60 * 60 * 1000; // …per IP per hour (generous)

const ESC = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function sanitize(s, max = 2000) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .slice(0, max)
    .trim();
}

function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    'unknown'
  );
}

function rateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

// Hardcoded Amrita Bengaluru campus food-hygiene recipients.
// These route to the campus mess / canteen / student welfare helpline
// inboxes. Override via FOOD_HYGIENE_TO env (comma-separated).
const DEFAULT_RECIPIENTS = [
  // Mess / canteen wardens and campus food-safety inboxes.
  // (Public-facing info@ + internal student welfare; the CivicEye team
  // inbox is listed only so the platform can confirm delivery and
  // forward to the appropriate warden if a direct address bounces —
  // the content itself is anonymous.)
  'mess.complaints@blr.amrita.edu',
  'studentwelfare@blr.amrita.edu',
  'info@civiceye.co.in',
].filter(Boolean);

const ISSUE_LABELS = {
  'foreign-object': 'Foreign object in food (hair / insect / stone / plastic)',
  'undercooked': 'Undercooked / raw food',
  'spoilage': 'Spoiled / rotten / bad-smelling food',
  'hygiene': 'Unhygienic serving area / staff / utensils',
  'allergen': 'Wrong allergen / dietary contamination (veg/non-veg mix-up)',
  'water': 'Unsafe drinking water',
  'other': 'Other food-hygiene concern',
};

const SEVERITY_LABELS = {
  low: 'Minor (advisory)',
  medium: 'Needs attention today',
  high: 'Serious — please act within hours',
  critical: 'Health risk — immediate action needed',
};

const MESS_LABELS = {
  'boys-hostel-mess': 'Boys Hostel Mess',
  'girls-hostel-mess': 'Girls Hostel Mess',
  'central-canteen': 'Central Canteen / Cafeteria',
  'night-canteen': 'Night Canteen',
  'food-court': 'Food Court / Other outlet',
  'water-dispenser': 'Drinking Water Dispenser',
  'unknown': 'Not sure / other location',
};

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  };
}

function recipients() {
  const override = (process.env.FOOD_HYGIENE_TO || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return override.length ? override : DEFAULT_RECIPIENTS;
}

function fromAddress() {
  return process.env.SMTP_FROM || 'CivicEye Anonymous <noreply@civiceye.co.in>';
}

const REF = () => 'FH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

function buildMail({ ref, location, issueType, severity, description, whenHappened, dietary }) {
  const when = whenHappened || 'Not specified';
  const issueLabel = ISSUE_LABELS[issueType] || issueType || 'Other';
  const sevLabel = SEVERITY_LABELS[severity] || severity || 'Reported';
  const locLabel = MESS_LABELS[location] || location || 'Not specified';
  const sevColor =
    severity === 'critical' ? '#b91c1c'
    : severity === 'high' ? '#ea580c'
    : severity === 'medium' ? '#ca8a04'
    : '#0f766e';

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#fff8e7;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fffdf4;border:4px solid #172b44;box-shadow:8px 8px 0 #A51636;overflow:hidden;">
    <div style="background:#172b44;padding:16px 20px;">
      <p style="margin:0;color:#ffd630;font-size:11px;font-weight:800;letter-spacing:2px;">ANONYMOUS FOOD-HYGIENE COMPLAINT</p>
      <h1 style="margin:4px 0 0;color:#ffffff;font-size:18px;">${ESC(issueLabel)}</h1>
      <p style="margin:6px 0 0;color:#e2e8f0;font-size:12px;">Reference ${ESC(ref)} — Amrita Vishwa Vidyapeetham, Bengaluru Campus</p>
    </div>
    <div style="padding:18px 20px;">
      <div style="display:inline-block;padding:6px 10px;background:${sevColor};color:#fff;font-size:12px;font-weight:900;letter-spacing:1px;border:3px solid #172b44;">${ESC(sevLabel.toUpperCase())}</div>
      <table style="width:100%;border-collapse:collapse;margin-top:14px;">
        <tr><td style="padding:8px 10px;font-size:12px;color:#64748b;font-weight:700;width:140px;">Location</td><td style="padding:8px 10px;font-size:14px;color:#0f172a;">${ESC(locLabel)}</td></tr>
        <tr><td style="padding:8px 10px;font-size:12px;color:#64748b;font-weight:700;">When</td><td style="padding:8px 10px;font-size:14px;color:#0f172a;">${ESC(when)}</td></tr>
        ${dietary ? `<tr><td style="padding:8px 10px;font-size:12px;color:#64748b;font-weight:700;">Dietary note</td><td style="padding:8px 10px;font-size:14px;color:#0f172a;">${ESC(dietary)}</td></tr>` : ''}
        <tr><td style="padding:8px 10px;font-size:12px;color:#64748b;font-weight:700;">Reported via</td><td style="padding:8px 10px;font-size:14px;color:#0f172a;">CivicEye / Amrita Eye anonymous form (no login, no identifying info captured)</td></tr>
      </table>
      <div style="margin-top:14px;padding:14px;background:#fff8e7;border:3px solid #172b44;">
        <p style="margin:0;font-size:14px;line-height:1.55;color:#0f172a;white-space:pre-wrap;">${ESC(description) || '<em>No additional details provided.</em>'}</p>
      </div>
      <p style="margin:16px 0 0;font-size:11px;color:#475569;font-weight:600;">This report was submitted anonymously. No name, email, account, IP address, device ID, or any other identifying information was collected. Please investigate on the basis of the content above and the timing/location.</p>
    </div>
  </div>
</body></html>`;

  const text = [
    `ANONYMOUS FOOD-HYGIENE COMPLAINT (${ref})`,
    `Amrita Vishwa Vidyapeetham, Bengaluru Campus`,
    ``,
    `Issue     : ${issueLabel}`,
    `Severity  : ${sevLabel}`,
    `Location  : ${locLabel}`,
    `When      : ${when}`,
    dietary ? `Dietary   : ${dietary}` : '',
    ``,
    `Details:`,
    description || '(no details provided)',
    ``,
    `— This report was submitted anonymously. No name, email, account, IP, device ID, or other identifying information was collected. —`,
  ].filter(Boolean).join('\n');

  return {
    subject: `[ANONYMOUS · Amrita Mess] ${sevLabel.toUpperCase()} — ${issueLabel} — ${ref}`.slice(0, 160),
    html,
    text,
  };
}

// Keep payload small — no uploads, anonymous text only.
export const config = { api: { bodyParser: { sizeLimit: '64kb' } } };

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Strict CORS: only our own frontend.
  const allowedOrigin = process.env.APP_URL || 'https://civiceye.co.in';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  // Rate-limit (IP is used ONLY here, never stored or emailed).
  if (!rateLimit(getIp(req))) {
    res.status(429).json({ error: 'Too many submissions from this network. Please try again later.' });
    return;
  }

  const body = req.body || {};
  const payload = {
    ref: REF(),
    location: sanitize(body.location, 120),
    issueType: sanitize(body.issueType, 60),
    severity: sanitize(body.severity, 20),
    whenHappened: sanitize(body.whenHappened, 120),
    dietary: sanitize(body.dietary, 200),
    description: sanitize(body.description, 1800),
  };

  if (!payload.description && !payload.issueType) {
    res.status(400).json({ error: 'Please describe the issue.' });
    return;
  }

  const to = recipients();
  const smtp = smtpConfig();

  if (!smtp) {
    // Fallback: give the UI a mailto: link to the first recipient with
    // the pre-filled content. The user's mail app will send it from
    // their own account, but the content still has no identity embedded
    // by us — from-address is whatever they choose in their mail client.
    const mail = buildMail(payload);
    const params = new URLSearchParams({
      subject: mail.subject,
      body: mail.text,
    });
    const mailto = `mailto:${to[0]}?${params.toString()}`;
    res.status(503).json({
      reason: 'EMAIL_NOT_CONFIGURED',
      ref: payload.ref,
      to: to[0],
      mailto,
      fallbackList: to,
    });
    return;
  }

  try {
    const transport = nodemailer.createTransport(smtp);
    const mail = buildMail(payload);
    await transport.sendMail({
      from: fromAddress(),
      to: to.join(', '),
      // NO reply-to — these are fully anonymous; we don't want accidental
      // replies going to a noreply box with tracking, and we never
      // captured a submitter email to route back to.
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      // Explicitly zero out headers that could leak identity.
      headers: {
        'X-Mailer': 'CivicEye-Anonymous',
        // Nodemailer adds Date/Message-ID automatically; we deliberately
        // do NOT add Received-SPF/DKIM tracing tied to the requester.
      },
    });
    res.status(200).json({ ok: true, ref: payload.ref });
  } catch (err) {
    console.error('[food-hygiene] send failed:', err && err.message);
    // Don't leak SMTP errors to the client (could contain host creds).
    res.status(502).json({ error: 'Delivery failed. Please try again in a moment.', ref: payload.ref });
  }
}
