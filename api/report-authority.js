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
  'bbmp-42': { name: 'BBMP — Roads & Potholes', department: 'Roads & Infrastructure', email: 'comm@bbmp.gov.in' },
  'bbmp-swm': { name: 'BBMP Solid Waste Management', department: 'Sanitation', email: 'comm@bbmp.gov.in' },
  bwssb: { name: 'BWSSB Helpline', department: 'Water Supply & Sewerage', email: '' },
  bescom: { name: 'BESCOM 1912', department: 'Street Lighting & Power', email: '' },
  'traffic-police': { name: 'Bengaluru Traffic Police', department: 'Traffic & Signals', email: '' },
  'forest-dept': { name: 'BBMP Forest Cell', department: 'Trees & Parks', email: 'comm@bbmp.gov.in' },
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
  const mapsDirUrl = hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null;
  const reportUrl = report.url || (report.id ? `https://civiceye-pied.vercel.app/report/${report.id}` : null);
  const appName = report.scope === 'campus' ? 'Amrita Eye' : 'CivicEye';
  const isCampus = report.scope === 'campus';
  const severityUpper = String(report.severity || '').toUpperCase();
  const severityNote = report.severity === 'critical' ? 'Immediate action required — safety risk' : report.severity === 'high' ? 'High priority — please act within 24h' : report.severity === 'medium' ? 'Medium priority — 7 days' : 'Low priority — review when possible';

  const ai = report.ai || {};
  const hasAnnotated = Boolean(ai.annotatedImage);

  const rows = [
    ['Reference', ref],
    ['Report', report.code || report.id || '—'],
    ['Title', report.title],
    ['Category', report.category],
    ['Severity', `${severityUpper} — ${severityNote}`],
    ['Location', report.locationName || (hasCoords ? `${lat}, ${lng}` : '—')],
    ['Google Maps', mapsUrl || '—'],
    ['Directions', mapsDirUrl || '—'],
    ['Report Link', reportUrl || '—'],
    ['Reported by', report.author || 'Citizen'],
    ['Citizen reply-to', report.reporterEmail || '—'],
    ['Submitted via', appName + (isCampus ? ' — Estate Office' : ' — BBMP')],
    ['SLA requested', report.severity === 'critical' ? '24 hours' : '7 working days'],
    ai.confidence ? ['AI Confidence', `${Math.round(ai.confidence*100)}%`] : null,
    ai.model ? ['AI Model', ai.model] : null,
    ai.objects ? ['AI Detected', (ai.objects||[]).join(', ')] : null,
  ].filter(Boolean);

  const tableRows = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;white-space:nowrap;vertical-align:top;">${esc(k)}</td>
        <td style="padding:8px 12px;font-size:14px;color:#0f172a;word-break:break-all;">${esc(v)}</td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <div style="background:${isCampus ? 'linear-gradient(135deg,#A51636,#E52B50)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)'};padding:20px 24px;">
      <p style="margin:0;color:#e0e7ff;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${esc(appName)} · ${severityUpper} · ${esc(ref)}</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">New ${isCampus ? 'campus' : 'civic'} issue reported — ${esc(severityUpper)}</h1>
      <p style="margin:6px 0 0;color:#e0e7ff;font-size:13px;">Routed to: ${esc(authority.name)} (${esc(authority.department)}) — ${esc(severityNote)}</p>
    </div>
    <div style="padding:16px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${tableRows}</table>
      
      <div style="margin:16px 0;padding:14px 16px;background:#f1f5f9;border-radius:12px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;">Description</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">${esc(report.description)}</p>
      </div>

      ${hasAnnotated ? `
      <div style="margin:16px 0;padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:.08em;">AI Analysis — Annotated Image with Bounding Boxes</p>
        <p style="margin:0 0 8px;font-size:13px;color:#065f46;">Model: ${esc(ai.model)} · Confidence: ${ai.confidence ? Math.round(ai.confidence*100)+'%' : '—'} · Detected: ${esc((ai.objects||[]).join(', '))}</p>
        <p style="margin:0;font-size:13px;color:#065f46;">Summary: ${esc(ai.summary)}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#047857;">Annotated image is attached to this email and also visible on the report page. Original photo is also attached.</p>
      </div>` : `
      <div style="margin:16px 0;padding:14px 16px;background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;">
        <p style="margin:0;font-size:12px;color:#92400e;">AI annotated image not available for this report — original evidence photo is attached. View full report for AI details if available.</p>
      </div>`}

      ${
        message
          ? `<div style="margin:16px 0;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:.08em;">Note from the citizen</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#7c2d12;white-space:pre-wrap;">${esc(message)}</p>
      </div>`
          : ''
      }

      <div style="margin:20px 0 8px;">
        ${reportUrl ? `<a href="${esc(reportUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 18px;background:${isCampus ? '#A51636' : '#4f46e5'};color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">View full report & AI annotation on website</a>` : ''}
        ${mapsUrl ? `<a href="${esc(mapsUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">Open location in Google Maps — ${esc(severityUpper)}</a>` : ''}
        ${mapsDirUrl ? `<a href="${esc(mapsDirUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 18px;background:#ffffff;color:#0f172a;border:1px solid #e2e8f0;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">Get directions</a>` : ''}
      </div>

      <p style="font-size:12px;color:#94a3b8;line-height:1.6;">
        This escalation was auto-generated when a citizen pressed “Report to authority” in ${esc(appName)}.
        ${isCampus ? 'Estate Office will review within SLA.' : 'BBMP will acknowledge within SLA.'} 
        Evidence photos (original + AI annotated with bounding boxes) are attached to this email.
        ${report.image ? `Original: ${esc(report.image)}` : ''}
      </p>
    </div>
  </div>
</body></html>`;

  const text = [
    `${appName} — ${severityUpper} — Citizen escalation ${ref}`,
    `Routed to: ${authority.name} (${authority.department}) — ${severityNote}`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    ai.summary ? `AI Summary: ${ai.summary}` : '',
    ai.objects ? `AI Detected: ${(ai.objects||[]).join(', ')}` : '',
    ai.confidence ? `AI Confidence: ${Math.round(ai.confidence*100)}%` : '',
    hasAnnotated ? `AI Annotated Image: Attached to this email (bounding boxes around ${report.category})` : '',
    '',
    `Description:\n${report.description}`,
    message ? `\nNote from the citizen:\n${message}` : '',
    reportUrl ? `\nFull report & AI annotation on website: ${reportUrl}` : '',
    mapsUrl ? `\nGoogle Maps (Severity ${severityUpper}): ${mapsUrl}` : '',
    mapsDirUrl ? `\nDirections: ${mapsDirUrl}` : '',
    report.image ? `\nOriginal Evidence Photo: ${report.image}` : '',
    hasAnnotated ? `\nAnnotated Evidence Photo (AI with bounding boxes): Attached` : '',
  ]
    .filter((l) => l !== '')
    .join('\n');

  return {
    subject: `[${appName}] ${severityUpper} — ${report.title} — escalation ${ref}`.slice(0, 160),
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

    // Attach original + AI annotated pictures if they are data URLs or http URLs
    const attachments = [];
    const addAttachmentFromDataUrl = (dataUrl, filename) => {
      if (!dataUrl || typeof dataUrl !== 'string') return;
      if (dataUrl.startsWith('data:')) {
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const contentType = match[1];
          const base64 = match[2];
          attachments.push({
            filename,
            content: Buffer.from(base64, 'base64'),
            contentType,
          });
        }
      }
    };

    // Original photo
    addAttachmentFromDataUrl(report.image, `original-${ref}.jpg`);
    // AI annotated photo
    if (report.ai?.annotatedImage) {
      addAttachmentFromDataUrl(report.ai.annotatedImage, `ai-annotated-${ref}.jpg`);
    }

    // If image is http URL (not data URL), we cannot attach directly without fetching, but we include link in email
    // For data URLs we attach, for http we leave as link (to avoid fetching in serverless)

    await transport.sendMail({
      from: process.env.SMTP_FROM || `"CivicEye Alerts" <${process.env.SMTP_USER}>`,
      to,
      ...(report.reporterEmail ? { replyTo: String(report.reporterEmail).slice(0, 254) } : {}),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments: attachments.length ? attachments : undefined,
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
