/**
 * Vercel serverless function — Roboflow proxy.
 *
 * The browser cannot call Roboflow directly (their serverless workflow
 * endpoint omits `Access-Control-Allow-Origin` in the preflight, so the
 * browser blocks it → CORS error). This function forwards the request
 * from OUR origin (no CORS) and returns Roboflow's JSON unchanged.
 *
 * Body: { "image": "<base64>", "api_key"?: "<key>", "model"?: "<model/version>" }
 *  - no `model`  → runs the WORKFLOW (workspace + workflow_id)
 *  - with `model` → runs a standard detect.roboflow.com model
 *
 * The key is read from server env first (ROBOFLOW_API_KEY), then the
 * VITE_ variant, then (dev proxy only) the client-sent key.
 */

const WORKFLOW_BASE = 'https://serverless.roboflow.com';
const DETECT_BASE = 'https://detect.roboflow.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const apiKey =
    process.env.ROBOFLOW_API_KEY ||
    process.env.VITE_ROBOFLOW_API_KEY ||
    req.body?.api_key ||
    '';

  const workspace =
    process.env.ROBOFLOW_WORKSPACE ||
    process.env.VITE_ROBOFLOW_WORKSPACE ||
    'aswathram-kumar';
  const workflowId =
    process.env.ROBOFLOW_WORKFLOW_ID ||
    process.env.VITE_ROBOFLOW_WORKFLOW_ID ||
    'civiceye-pothole-reporting-starter-1786336062967';
  const model = req.body?.model?.trim() || '';
  const image = req.body?.image;

  if (!image) {
    res.status(400).json({ error: '`image` (base64) is required.' });
    return;
  }

  let target;
  let payload;
  if (model) {
    // Standard detect endpoint → returns per-box predictions.
    target = `${DETECT_BASE}/${model.replace(/^\/+/, '')}?api_key=${encodeURIComponent(apiKey)}`;
    payload = JSON.stringify({ image });
  } else {
    // Workflow endpoint (primary).
    target = `${WORKFLOW_BASE}/${encodeURIComponent(workspace)}/workflows/${encodeURIComponent(workflowId)}`;
    payload = JSON.stringify({
      api_key: apiKey,
      inputs: { image: { type: 'base64', value: image } },
    });
  }

  try {
    const rf = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    const text = await rf.text();
    res.status(rf.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (err) {
    res.status(502).json({ error: `Roboflow proxy failed: ${err?.message ?? err}` });
  }
}
