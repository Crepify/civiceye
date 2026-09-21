/**
 * Vercel serverless function — Roboflow proxy with security patches
 * - Rate limiting: 20 req/min per IP
 * - Origin check via CIVICEYE_ORIGIN
 * - Input validation: base64 image, max size
 * - Security headers: nosniff, DENY, no-store
 */

const rateMap = new Map();
function rateLimit(ip, max, windowMs) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > windowMs) {
    rateMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
function getClientIp(req) {
  return (req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown');
}
function allowedOrigin(origin) {
  const cfg = (process.env.CIVICEYE_ORIGIN || '*').trim();
  if (cfg === '*') return '*';
  const allowed = cfg.split(',').map((s) => s.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) return origin;
  return null;
}
function securityHeaders(origin) {
  const ao = allowedOrigin(origin);
  return {
    ...(ao ? { 'Access-Control-Allow-Origin': ao } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store',
  };
}
function isValidBase64Image(str) {
  if (typeof str !== 'string') return false;
  if (str.length > 15 * 1024 * 1024) return false;
  return /^[A-Za-z0-9+/=]+$/.test(str.slice(0, 100)) || str.startsWith('data:image/');
}

const WORKFLOW_BASE = 'https://serverless.roboflow.com';
const DETECT_BASE = 'https://detect.roboflow.com';
const MAX_IMAGE_CHARS = 15 * 1024 * 1024;

export default async function handler(req, res) {
  const origin = req.headers.origin || null;
  if (req.method === 'OPTIONS') {
    const allowed = allowedOrigin(origin);
    res.writeHead(allowed ? 204 : 403, securityHeaders(origin));
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }
  if (allowedOrigin(origin) === null) {
    res.writeHead(403, securityHeaders(origin));
    res.end('Forbidden origin');
    return;
  }
  const ip = getClientIp(req);
  if (!rateLimit(ip, 20, 60_000)) {
    res.writeHead(429, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a minute.' }));
    return;
  }
  const bodyStr = JSON.stringify(req.body || {});
  if (bodyStr.length > MAX_IMAGE_CHARS) {
    res.writeHead(413, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: 'Payload too large. Max ~10MB image.' }));
    return;
  }
  const apiKey = process.env.ROBOFLOW_API_KEY || process.env.VITE_ROBOFLOW_API_KEY || req.body?.api_key || '';
  const workspace = process.env.ROBOFLOW_WORKSPACE || process.env.VITE_ROBOFLOW_WORKSPACE || 'aswathram-kumar';
  const workflowId = process.env.ROBOFLOW_WORKFLOW_ID || process.env.VITE_ROBOFLOW_WORKFLOW_ID || 'civiceye-pothole-reporting-starter-1786336062967';
  const model = req.body?.model?.trim() || '';
  const image = req.body?.image;
  if (!image) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: '`image` (base64) is required.' }));
    return;
  }
  if (!isValidBase64Image(image)) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: 'Invalid image format. Must be base64 JPEG/PNG/WebP under 10MB.' }));
    return;
  }
  if (model && !/^[a-zA-Z0-9\-_\/\.]+$/.test(model)) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: 'Invalid model identifier.' }));
    return;
  }
  let target;
  let payload;
  if (model) {
    target = `${DETECT_BASE}/${model.replace(/^\/+/, '')}?api_key=${encodeURIComponent(apiKey)}`;
    payload = JSON.stringify({ image });
  } else {
    target = `${WORKFLOW_BASE}/${encodeURIComponent(workspace)}/workflows/${encodeURIComponent(workflowId)}`;
    payload = JSON.stringify({ api_key: apiKey, inputs: { image: { type: 'base64', value: image } } });
  }
  try {
    const rf = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
    const text = await rf.text();
    res.writeHead(rf.status, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(text);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: `Roboflow proxy failed: ${err?.message ?? err}` }));
  }
}
