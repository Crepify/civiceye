# CivicEye — Roboflow proxy (Cloudflare Worker)

Free Worker, 30s timeout (vs Vercel Hobby's 10s). Browser → Worker →
Roboflow (server-side, no CORS).

## Deploy

```bash
npm i -g wrangler
cd worker
wrangler login
wrangler secret put ROBOFLOW_API_KEY      # paste your Roboflow key
wrangler deploy                            # → https://roboflow-proxy.<you>.workers.dev
```

Optional env overrides (defaults = the CivicEye pothole starter workflow):

```bash
wrangler secret put ROBOFLOW_WORKSPACE     # default: aswathram-kumar
wrangler secret put ROBOFLOW_WORKFLOW_ID   # default: civiceye-pothole-reporting-starter-1786336062967
```

## Point the app at it

Set this env var in `.env` / Vercel to make the app call the Worker
(instead of `/api/roboflow`):

```env
VITE_ROBOFLOW_PROXY_URL=https://roboflow-proxy.<you>.workers.dev
```

The app prefers `VITE_ROBOFLOW_PROXY_URL` when set, else falls back to
the Vercel `/api/roboflow` function.

## Test locally

```bash
wrangler dev
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"image":"<base64>","api_key":"<key>"}'
```
