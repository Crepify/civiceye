/**
 * CivicEye — Roboflow proxy (Cloudflare Worker).
 *
 * The browser can't call Roboflow directly (their serverless endpoint
 * omits `Access-Control-Allow-Origin` in the preflight → CORS block).
 * This Worker forwards requests from OUR origin (no CORS) to:
 *
 *   https://serverless.roboflow.com/{workspace}/workflows/{workflow_id}
 *   (or a standard detect.roboflow.com/{model} when `model` is passed)
 *
 * Deploy:
 *   1. wrangler login
 *   2. wrangler deploy                    # or `wrangler dev` to test locally
 *   3. Set secrets:  wrangler secret put ROBOFLOW_API_KEY
 *      (optional env:  ROBOFLOW_WORKSPACE, ROBOFLOW_WORKFLOW_ID)
 *
 * Worker runtimes have a 30s (Free) / 60s (Paid) limit — enough for
 * Roboflow's ~5–15s workflow latency (Vercel Hobby kills at 10s).
 */

const WORKFLOW_BASE = 'https://serverless.roboflow.com';
const DETECT_BASE = 'https://detect.roboflow.com';

// Optional overrides via Worker env (secrets).
const DEFAULT_WORKSPACE = 'aswathram-kumar';
const DEFAULT_WORKFLOW_ID = 'civiceye-pothole-reporting-starter-1786336062967';

export default {
  async fetch(request, env, ctx) {
    // CORS — allow any origin (the key is server-side; the response is
    // the annotated image + predictions).
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const apiKey =
      env.ROBOFLOW_API_KEY ||
      body?.api_key ||
      '';
    const workspace = env.ROBOFLOW_WORKSPACE || DEFAULT_WORKSPACE;
    const workflowId = env.ROBOFLOW_WORKFLOW_ID || DEFAULT_WORKFLOW_ID;
    const model = (body?.model || '').trim();
    const image = body?.image;

    if (!image) {
      return new Response(JSON.stringify({ error: '`image` (base64) is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let target;
    let payload;
    if (model) {
      target = `${DETECT_BASE}/${model.replace(/^\/+/, '')}?api_key=${encodeURIComponent(apiKey)}`;
      payload = JSON.stringify({ image });
    } else {
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
      return new Response(text, {
        status: rf.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Roboflow proxy failed: ${err?.message ?? err}` }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      );
    }
  },
};
