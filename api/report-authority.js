/**
 * Vercel serverless function — "Report to Authority" email gateway.
 *
 * POST /api/report-authority
 * Body:
 *   {
 *     authorityId: "bbmp-42",                     // required (allow-listed)
 *     message?: "...",                            // optional user note
 *     report: {                                   // required
 *       code? / id?, title, description, category, severity,
 *       locationName?, coordinates?: { lat, lng },
 *       image?, url?, author?, reporterEmail?, scope?
 *     }
 *   }
 *
 * The recipient email is resolved SERVER-SIDE (env override first, then the
 * built-in directory). The client can never choose the "to" address, so this
 * function cannot be abused as an open spam relay.
 *
 * Delivery config (Vercel project → Settings → Environment Variables):
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS   — any SMTP provider
 *   SMTP_FROM                                       — e.g. "CivicEye <alerts@yourdomain.com>"
 *   AUTHORITY_EMAIL_<ID>                            — e.g. AUTHORITY_EMAIL_BBMP_42
 *                                                     (overrides the default official inbox)
 *
 * If SMTP is not configured the function responds 503 with
 * { reason: "EMAIL_NOT_CONFIGURED" } and the UI falls back to a mailto: link,
 * so the feature still works end-to-end during demos.
 */

import nodemailer from 'nodemailer';

/* Built-in authority directory (id → { name, department, email }).
 * Keep in sync with src/data/authorities.ts. Env vars always win. */
const DIRECTORY = {
  'bbmp-42': { name: 'BBMP Ward 42 Control Room', department: 'Roads & Infrastructure', email: 'civiceyeoffcial@gmail.com' },
  'bbmp-swm': { name: 'BBMP Solid Waste Management', department: 'Sanitation', email: 'civiceyeoffcial@gmail.com' },
  bwssb: { name: 'BWSSB Helpline', department: 'Water Supply & Sewerage', email: 'civiceyeoffcial@gmail.com' },
  bescom: { name: 'BESCOM 1912', department: 'Street Lighting & Power', email: 'civiceyeoffcial@gmail.com' },
  'traffic-police': { name: 'Bengaluru Traffic Police', department: 'Traffic & Signals', email: 'civiceyeoffcial@gmail.com' },
  'forest-dept': { name: 'BBMP Forest Cell', department: 'Trees & Parks', email: 'civiceyeoffcial@gmail.com' },
  'amrita-estate': { name: 'Campus Estate & Civil Works', department: 'Campus Infrastructure', email: 'civiceyeoffcial@gmail.com' },
  'amrita-facilities': { name: 'Facilities & Housekeeping', department: 'Sanitation, Water & Electrical', email: 'civiceyeoffcial@gmail.com' },
  'amrita-security': { name: 'Campus Security Control Room', department: 'Safety & Security', email: 'civiceyeoffcial@gmail.com' },
};

const MAX_BODY_CHARS = 20_000;

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

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

function emailFor(authorityId) {
  const envKey = `AUTHORITY_EMAIL_${authorityId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
  return (process.env[envKey] || '').trim() || DIRECTORY[authorityId].email;
}

function buildEmail({ authority, report, message, ref }) {
  const lat = report?.coordinates?.lat;
  const lng = report?.coordinates?.lng;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const mapsUrl = hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : null;
  const reportUrl = report.url || null;
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';

  const rows = [
    ['Reference', ref],
    ['Report', report.code || report.id || '—'],
    ['Title', report.title],
    ['Category', report.category],
    ['Severity', report.severity],
    ['Location', report.locationName || (hasCoords ? `${lat}, ${lng}` : '—')],
    ['Reported by', report.author || 'Citizen'],
    ['Citizen reply-to', report.reporterEmail || '—'],
    ['Submitted via', appName],
    ['SLA requested', '7 working days'],
  ];

  const tableRows = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;white-space:nowrap;vertical-align:top;">${esc(k)}</td>
        <td style="padding:8px 12px;font-size:14px;color:#0f172a;">${esc(v)}</td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:20px 24px;">
      <p style="margin:0;color:#e0e7ff;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${esc(appName)} · Citizen escalation ${esc(ref)}</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">New civic issue reported in your jurisdiction</h1>
      <p style="margin:6px 0 0;color:#e0e7ff;font-size:13px;">Routed to: ${esc(authority.name)} (${esc(authority.department)})</p>
    </div>
    <div style="padding:16px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${tableRows}</table>
      <div style="margin:16px 0;padding:14px 16px;background:#f1f5f9;border-radius:12px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;">Description</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">${esc(report.description)}</p>
      </div>
      ${
        message
          ? `<div style="margin:16px 0;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:.08em;">Note from the citizen</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#7c2d12;white-space:pre-wrap;">${esc(message)}</p>
      </div>`
          : ''
      }
      <div style="margin:20px 0 8px;">
        ${reportUrl ? `<a href="${esc(reportUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 18px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">View full report & evidence photo</a>` : ''}
        ${mapsUrl ? `<a href="${esc(mapsUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">Open location in Google Maps</a>` : ''}
      </div>
      <p style="font-size:12px;color:#94a3b8;line-height:1.6;">
        This escalation was generated when a citizen pressed “Report to authority” in ${esc(appName)}.
        Please acknowledge within the requested SLA. ${report.image ? `Evidence photo: ${esc(report.image)}` : ''}
      </p>
    </div>
  </div>
</body></html>`;

  const text = [
    `${appName} — Citizen escalation ${ref}`,
    `Routed to: ${authority.name} (${authority.department})`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    `Description:\n${report.description}`,
    message ? `\nNote from the citizen:\n${message}` : '',
    reportUrl ? `\nFull report: ${reportUrl}` : '',
    mapsUrl ? `\nLocation: ${mapsUrl}` : '',
    report.image ? `\nEvidence photo: ${report.image}` : '',
  ]
    .filter((l) => l !== '')
    .join('\n');

  return {
    subject: `[${appName}] ${report.title} — escalation ${ref}`.slice(0, 160),
    html,
    text,
  };
}

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const raw = req.body;
  if (!raw || JSON.stringify(raw).length > MAX_BODY_CHARS) {
    res.status(413).json({ error: 'Payload too large.' });
    return;
  }

  const authorityId = String(raw.authorityId || '').trim();
  const authority = DIRECTORY[authorityId];
  if (!authority) {
    res.status(400).json({ error: 'Unknown authorityId.' });
    return;
  }

  const report = raw.report || {};
  if (!report.title || !report.category) {
    res.status(400).json({ error: '`report.title` and `report.category` are required.' });
    return;
  }

  const message = String(raw.message || '').slice(0, 2000);
  const ref = `ESC-${Date.now().toString(36).toUpperCase()}`;
  const to = emailFor(authorityId);

  const smtp = smtpConfig();
  if (!smtp) {
    // Not configured yet — tell the UI to fall back to a mailto: link.
    res.status(503).json({
      reason: 'EMAIL_NOT_CONFIGURED',
      ref,
      to,
      authority: { id: authorityId, name: authority.name, department: authority.department },
    });
    return;
  }

  try {
    const transport = nodemailer.createTransport(smtp);
    const mail = buildEmail({ authority, report, message, ref });
    await transport.sendMail({
      from: process.env.SMTP_FROM || `"CivicEye Alerts" <${process.env.SMTP_USER}>`,
      to,
      ...(report.reporterEmail ? { replyTo: String(report.reporterEmail).slice(0, 254) } : {}),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });

    res.status(200).json({
      ok: true,
      ref,
      to,
      authority: { id: authorityId, name: authority.name, department: authority.department },
    });
  } catch (err) {
    console.error('[report-authority] send failed:', err);
    res.status(502).json({ error: 'Email delivery failed. Please try again later.', ref });
  }
};
