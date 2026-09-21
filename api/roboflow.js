/**
 * Vercel serverless function — Roboflow proxy with security patches
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
  if (!origin) return '*';
  const allowed = cfg.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return origin;
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
  if (str.startsWith('data:image/')) return true;
  const sample = str.slice(0, 200).replace(/\s/g, '');
  return /^[A-Za-z0-9+/=]+$/.test(sample) && sample.length > 100;
}

const WORKFLOW_BASE = 'https://serverless.roboflow.com';
const DETECT_BASE = 'https://detect.roboflow.com';
const MAX_IMAGE_CHARS = 15 * 1024 * 1024;

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };
export const maxDuration = 60;

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
    res.end(JSON.stringify({ error: 'Forbidden origin', origin }));
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
  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: 'Roboflow API key not configured. Set ROBOFLOW_API_KEY in Vercel env.' }));
    return;
  }
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);
    const rf = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, signal: controller.signal });
    clearTimeout(timeout);
    const text = await rf.text();
    res.writeHead(rf.status, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(text);
  } catch (err) {
    const isAbort = err.name === 'AbortError';
    console.error('[roboflow proxy] error:', err);
    res.writeHead(isAbort ? 504 : 502, { 'Content-Type': 'application/json', ...securityHeaders(origin) });
    res.end(JSON.stringify({ error: `Roboflow proxy failed: ${err?.message ?? err}`, hint: isAbort ? 'Timeout after 40s' : 'Check ROBOFLOW_API_KEY/WORKSPACE/WORKFLOW_ID' }));
  }
}
