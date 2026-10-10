/**
 * Provider-neutral inbound authority reply webhook.
 *
 * A mail provider can POST a normalised payload here once selected:
 * { messageId, from, subject, text, reportCode? }
 *
 * The endpoint never trusts an email alone: it requires the private webhook
 * secret, matches the report reference, validates the sender domain for the
 * report scope, and flags resolution claims for admin review. Email wording
 * alone never changes the report status; provider/evidence validation is pending.
 */

const MAX_BODY = 120_000;
const RESOLUTION_WORDS = /\b(resolved|fixed|completed|closed|rectified|repaired|done)\b/i;
const CAMPUS_DOMAIN = /@(?:[a-z0-9-]+\.)*amrita\.edu$/i;
const CITY_AUTHORITY_DOMAINS = [
  /@bbmp\.gov\.in$/i,
  /@bescom\.co\.in$/i,
  /@bwssb\.gov\.in$/i,
  /@karnataka\.gov\.in$/i,
];

function supabaseConfig() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return { url: process.env.SUPABASE_URL.replace(/\/$/, ''), key: process.env.SUPABASE_SERVICE_ROLE_KEY };
}

async function supabaseRequest(config, path, options = {}) {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(typeof data === 'string' ? data : data?.message || 'Supabase request failed');
  return data;
}

function clean(value, max = 120_000) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function senderEmail(value) {
  const text = typeof value === 'string' ? value.trim().slice(0, 500) : '';
  const bracket = text.match(/<([^>]+)>/);
  const email = (bracket?.[1] || text).trim().toLowerCase();
  return /^[^\s<>@]+@(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(email) ? email : '';
}

function reportReference(raw) {
  const explicit = clean(raw.reportCode || raw.code || '', 80).toUpperCase();
  const combined = `${explicit} ${clean(raw.subject, 500)} ${clean(raw.text || raw.body, 3000)}`;
  return combined.match(/\bCE-[A-Z0-9]{8}\b/i)?.[0]?.toUpperCase() || null;
}

function validSender(email, scope) {
  if (scope === 'campus') return CAMPUS_DOMAIN.test(email);
  return CITY_AUTHORITY_DOMAINS.some((pattern) => pattern.test(email));
}

export const config = { api: { bodyParser: { sizeLimit: '256kb' } } };

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  if (!process.env.AUTHORITY_INBOUND_SECRET || req.headers['x-authority-webhook-secret'] !== process.env.AUTHORITY_INBOUND_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const configValue = supabaseConfig();
  if (!configValue) return res.status(503).json({ reason: 'SUPABASE_SERVICE_ROLE_NOT_CONFIGURED' });

  const raw = req.body || {};
  const subject = clean(raw.subject || raw.email?.subject, 500);
  const body = clean(raw.text || raw.body || raw.email?.text || raw.html, MAX_BODY);
  if (JSON.stringify(raw).length > MAX_BODY || !subject || !body) return res.status(400).json({ error: 'subject and text are required.' });

  const email = senderEmail(raw.from || raw.sender || raw.email?.from);
  const code = reportReference({ ...raw, subject, text: body });
  if (!email || !code) return res.status(400).json({ error: 'A sender email and CE report reference are required.' });

  try {
  const reports = await supabaseRequest(configValue, `reports?code=eq.${encodeURIComponent(code)}&select=id,code,scope,status`);
  const report = reports?.[0];
  if (!report) return res.status(404).json({ error: 'Report reference not found.' });

  const senderAllowed = validSender(email, report.scope);
  const hasResolution = RESOLUTION_WORDS.test(`${subject} ${body}`);
  const validationStatus = senderAllowed ? 'needs_review' : 'rejected';
  const reason = !senderAllowed
    ? `Sender domain is not allow-listed for ${report.scope} reports.`
    : hasResolution ? 'Possible resolution claim; sender and evidence require admin verification.' : 'Reply received without explicit resolution language.';
  const messageId = clean(raw.messageId || raw['message-id'] || '', 255) || null;

  try {
    await supabaseRequest(configValue, 'authority_responses', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates' },
      body: JSON.stringify({ report_id: report.id, message_id: messageId, sender_email: email, subject, body, validation_status: validationStatus, validation_reason: reason }),
    });
  } catch (error) {
    if (!/duplicate|unique/i.test(error.message || '')) throw error;
  }

  return res.status(202).json({ ok: true, accepted: false, reportId: report.id, code, validationStatus, adminReview: 'pending' });
  } catch (error) {
    console.error('[authority-inbound] storage failed:', error.message);
    return res.status(502).json({ error: 'Could not store authority response. Retry delivery.' });
  }
}
