# CivicEye — How to Actually Add All the AI Engines

**Exact step-by-step implementation guide.** The code is already written and building.
This guide tells you exactly *how to add it, configure it, test it, and deploy it* —
so you can reproduce it on your own machine or a fresh checkout.

---

## 0. The big picture — what you're building

CivicEye now has a **5-engine analysis chain**. When a user reports a photo, the app
tries engines in order and uses the **first one that succeeds**:

```
  User photo
      │
      ▼
 ① ON-DEVICE  (Transformers.js, runs IN the browser — free, private, offline)
      │  only accepted if it maps to a real civic category with ≥ 0.35 confidence
      ▼
 ② ROBOFLOW   (CivicLENS — real object detection, trained on civic issues)
      │  only if VITE_ROBOFLOW_API_KEY (+ workspace/workflow or model) set
      ▼
 ③ HUGGING FACE (DETR object detector — cloud backup)
      │  only if VITE_HF_API_TOKEN set
      ▼
 ④ BUILT-IN MOCK (always works, deterministic per photo)
```

- Each result is **tagged with the engine that produced it**, and the UI shows a badge
  so you (and a judge) can see which AI actually analysed the photo.
- The on-device engine's heavy code (~24 MB) is **lazy-loaded** — it only downloads
  when the user first clicks "Analyse", so your app stays fast.

**Why on-device first?** Free, unlimited, private (photo never leaves the device),
and works offline after a one-time model download. But a general model like YOLOS
can't reliably see "pothole", so it only claims results it's confident about
(traffic light / stop sign → traffic-signal, fire hydrant → water-leakage,
person → security). Everything else falls through to the specialised cloud engines.

---

## Step 1 — Get the API keys (make the accounts)

You need **3 free accounts** for the cloud engines (all have free tiers, no credit card).

| # | Provider | Sign up at | What to create | Key looks like | Free quota |
|---|----------|-----------|----------------|----------------|------------|
| 1 | **Roboflow** (primary cloud) | https://roboflow.com → **Sign up** | API key at **app.roboflow.com → Settings → API** | `<plain text key>` | ~1000 credits/mo (≈1 credit per analyse) |
| 2 | **Hugging Face** (cloud backup) | https://huggingface.co → **Join** | **Settings → Access Tokens → New token** (type: *Read*) | `hf_...` | Rate-limited, free |

Also needed for the **Roboflow workflow** (this is what the starter project uses):

- **Workspace slug** → app.roboflow.com, top-left dropdown next to your project name.
  Current default in the code: `aswathram-kumar`
- **Workflow ID** → open the "CivicEye Pothole Reporting Starter" workflow →
  **Deploy → Workflows** → the URL is
  `https://serverless.roboflow.com/{workspace}/workflows/{workflow_id}`
  Current default: `civiceye-pothole-reporting-starter-1786336062967`

> If you'd rather use a simple **model** instead of the workflow (returns per-box
> confidences), grab `model/version` from any model's **Use via API** tab, e.g.
> `pothole-detection/1`.

---

## Step 2 — Install the npm packages

In your project root (`civiceye/`):

```bash
npm install
```

If the machine **runs out of memory (OOM)** or hangs — which happens on some systems
because `@huggingface/transformers` v4 runs a postinstall that extracts a huge native
CUDA binary — install the pinned version **without scripts** instead:

```bash
npm install @huggingface/transformers@3.4.0 --ignore-scripts
```

`package.json` already pins `"@huggingface/transformers": "^3.4.0"`, which gives you
the browser WASM runtime (`onnxruntime-web`) and **skips the native CUDA extraction**.

> Why 3.4.0 and not v4? v4's postinstall downloads `onnxruntime-node` (a large native
> binary) that OOM-kills small machines/CI. v3.4.0 with `--ignore-scripts` is safe.
> `--ignore-scripts` also skips rollup's postinstall — that's fine, Rollup's native
> binding is already present.

The other AI-related deps are already in `package.json` and need no action:
`@supabase/supabase-js`, `@googlemaps/js-api-loader`, `@emailjs/browser`, `nodemailer`.

---

## Step 3 — Add the code files

There are **5 files** involved in the AI chain. Three of them are NEW (you must add
them), two already existed (they're in the zip and need no changes unless missing).

| File | Status | What it does |
|------|--------|--------------|
| `src/services/onDeviceService.ts` | **NEW** | Runs YOLOS-tiny object detection in the browser via Transformers.js |
| `src/services/huggingfaceService.ts` | **NEW** | Calls the Hugging Face Inference API (DETR model) |
| `src/services/aiAnalysisService.ts` | **UPDATED** | Orchestrator — tries engines ①→④ in order |
| `src/services/roboflowService.ts` | Already in zip | Roboflow workflow + standard-detect client |

Also required (already in zip): `src/utils/image.ts` (`compressImageForAI`, `detectBlur`),
and the engine union in `src/types/index.ts`:

```ts
engine?: 'ondevice' | 'roboflow' | 'huggingface' | 'mock';
```

### File 3a — `src/services/onDeviceService.ts` (new)

```ts
import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { detectBlur } from '@/utils/image';

/**
 * ON-DEVICE AI engine — runs a real object-detection model in the browser
 * via Transformers.js (@huggingface/transformers).
 *
 * - Model runs on WASM/WebGPU locally: FREE, PRIVATE (photo never leaves the
 *   device), OFFLINE-capable after first download, no rate limits.
 * - The model is downloaded once (~25 MB) and cached in the browser.
 * - Because a general COCO model doesn't know "pothole", this engine only
 *   claims results it's confident about; specialized civic detection falls
 *   through to Roboflow/Hugging Face in the orchestrator.
 *
 * Env:
 *   VITE_AI_ONDEVICE = 'true' (default true) | 'false'
 *   VITE_ONDEVICE_MODEL = 'Xenova/yolos-tiny' (small object-detection model)
 */

const MODEL = import.meta.env.VITE_ONDEVICE_MODEL?.trim() || 'Xenova/yolos-tiny';
const ENABLED = import.meta.env.VITE_AI_ONDEVICE !== 'false';

export const onDeviceEnabled = ENABLED;

/** Minimum confidence for the on-device result to be trusted. */
const ACCEPT_CONFIDENCE = 0.35;

/* Lazy singleton: the model + pipeline are heavy, so we load them on first
 * use only, and keep them cached for the rest of the session. */
let pipelinePromise: Promise<unknown> | null = null;

async function getPipeline(): Promise<(input: string) => Promise<Array<{ label: string; score: number; box: { xmin: number; ymin: number; xmax: number; ymax: number } }>>> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      // Dynamic import keeps the heavy library out of the initial bundle.
      const { pipeline } = await import('@huggingface/transformers');
      const detector = await pipeline('object-detection', MODEL, {
        dtype: 'q8', // quantized → small + fast
      });
      return detector as (
        input: string,
      ) => Promise<Array<{ label: string; score: number; box: { xmin: number; ymin: number; xmax: number; ymax: number } }>>;
    })();
  }
  return pipelinePromise as Promise<
    (input: string) => Promise<Array<{ label: string; score: number; box: { xmin: number; ymin: number; xmax: number; ymax: number } }>>
  >;
}

/** Map COCO-style labels the on-device model can see → CivicEye categories. */
const ON_DEVICE_MAP: Record<string, CategoryId> = {
  'traffic light': 'traffic-signal',
  'traffic-light': 'traffic-signal',
  'fire hydrant': 'water-leakage',
  'stop sign': 'traffic-signal',
  person: 'security',
};

function mapLabel(label: string): CategoryId {
  const key = label.trim().toLowerCase();
  return ON_DEVICE_MAP[key] ?? 'other';
}

function severityFromConfidence(score: number): Severity {
  if (score > 0.82) return 'critical';
  if (score > 0.68) return 'high';
  if (score > 0.5) return 'medium';
  return 'low';
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export interface OnDeviceVerdict {
  /** True if the on-device model is confident enough to be the answer. */
  confident: boolean;
  result: AnalysisResult;
}

/**
 * Run on-device detection on a photo. Never throws for model issues — it
 * returns a low-confidence verdict so the orchestrator falls through to cloud.
 */
export async function analyzeOnDevice(photo: string, coordinates: Coordinates | null): Promise<OnDeviceVerdict> {
  const quality = await detectBlur(photo);
  const base: AnalysisResult = {
    category: 'other',
    confidence: 0,
    severity: 'low',
    description: '',
    objects: [],
    coordinates,
    timestamp: new Date().toISOString(),
    tags: [],
    imageQuality: quality,
    engine: 'ondevice',
  };

  if (!ENABLED) return { confident: false, result: base };

  try {
    const detector = await getPipeline();
    const detections = await detector(photo);

    // Keep the top match per label, sorted by confidence.
    const bestByLabel = new Map<string, number>();
    for (const d of detections) {
      bestByLabel.set(d.label, Math.max(bestByLabel.get(d.label) ?? 0, d.score));
    }
    const ranked = [...bestByLabel.entries()].sort((a, b) => b[1] - a[1]);

    if (ranked.length === 0) {
      base.description = 'On-device model found no objects in this photo.';
      return { confident: false, result: base };
    }

    const [topLabel, topScore] = ranked[0];
    const confidence = clamp(topScore, 0, 1);
    const category = mapLabel(topLabel);

    const objects = ranked.slice(0, 6).map(([l, s]) => `${l} (${Math.round(s * 100)}%)`);
    base.confidence = confidence;
    base.category = category;
    base.severity = severityFromConfidence(confidence);
    base.objects = objects;
    base.tags = ranked.slice(0, 5).map(([l]) => l);
    base.description =
      `Analysed on your device: found ${ranked.length} object type(s). ` +
      `Top: ${topLabel} (${Math.round(confidence * 100)}%). ` +
      (category !== 'other'
        ? `This maps to ${category.replace(/-/g, ' ')}.`
        : 'No specific civic issue recognised locally — the cloud engine will take a closer look.');

    // Only confident when it actually maps to a real civic category.
    return { confident: category !== 'other' && confidence >= ACCEPT_CONFIDENCE, result: base };
  } catch (err) {
    base.description = 'On-device model unavailable on this browser.';
    console.warn('[CivicEye] on-device AI unavailable:', err);
    return { confident: false, result: base };
  }
}
```

### File 3b — `src/services/huggingfaceService.ts` (new)

```ts
import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { detectBlur } from '@/utils/image';

/**
 * Hugging Face Inference API engine — third cloud backup.
 * Used after on-device + Roboflow have failed or been skipped.
 *
 * Env:
 *   VITE_HF_API_TOKEN = your HF token (free at huggingface.co/settings/tokens)
 *   VITE_HF_MODEL     = object-detection model, default 'facebook/detr-resnet-50'
 *
 * NOTE: a VITE_ token is public (same caveat as the other keys). For
 * production, route this through a tiny serverless proxy (like
 * api/roboflow.js) so the token stays server-side.
 */

const HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN?.trim() ?? '';
const HF_MODEL = import.meta.env.VITE_HF_MODEL?.trim() || 'facebook/detr-resnet-50';

export const hasHuggingFaceKey = Boolean(HF_TOKEN);

interface HFDetection {
  label: string;
  score: number;
  box?: { xmin: number; ymin: number; xmax: number; ymax: number };
}

function mapLabel(label: string): CategoryId {
  const key = label.trim().toLowerCase();
  if (key.includes('traffic light') || key.includes('stop sign')) return 'traffic-signal';
  if (key.includes('fire hydrant')) return 'water-leakage';
  if (key === 'person') return 'security';
  return 'other';
}

function severityFromConfidence(score: number): Severity {
  if (score > 0.82) return 'critical';
  if (score > 0.68) return 'high';
  if (score > 0.5) return 'medium';
  return 'low';
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Run object detection via the HF Inference API. Throws on failure. */
export async function analyzeWithHuggingFace(
  photo: string,
  coordinates: Coordinates | null,
): Promise<AnalysisResult> {
  if (!hasHuggingFaceKey) throw new Error('VITE_HF_API_TOKEN is not configured.');

  // Extract the raw bytes from the data URL (HF wants the raw image body).
  const match = /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,(.+)$/s.exec(photo);
  if (!match) throw new Error('Unsupported image format.');
  const bytes = Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0));

  const res = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/octet-stream',
    },
    body: bytes,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Hugging Face returned ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as HFDetection[] | { error?: string };
  if (!Array.isArray(data)) throw new Error(`Hugging Face: ${(data as { error?: string }).error ?? 'unknown error'}`);
  if (data.length === 0) {
    throw new Error('Hugging Face found no objects in this photo.');
  }

  // Top detection, highest score first.
  const top = [...data].sort((a, b) => b.score - a.score)[0];
  const confidence = clamp(top.score, 0, 1);
  const category = mapLabel(top.label);

  return {
    category,
    confidence,
    severity: severityFromConfidence(confidence),
    description:
      `Analysed by Hugging Face: top detection "${top.label}" at ` +
      `${Math.round(confidence * 100)}% confidence.` +
      (category !== 'other' ? ` This maps to ${category.replace(/-/g, ' ')}.` : ''),
    objects: data
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((d) => `${d.label} (${Math.round(d.score * 100)}%)`),
    coordinates,
    timestamp: new Date().toISOString(),
    tags: data.sort((a, b) => b.score - a.score).slice(0, 5).map((d) => d.label),
    imageQuality: await detectBlur(photo).catch(() => 'clear' as const),
    engine: 'huggingface',
  };
}
```

### File 3c — `src/services/aiAnalysisService.ts` (update — the orchestrator)

Keep everything that's already in the file (`ANALYSIS_STAGES`, `analyzePhoto`, hash
utilities, etc.) and make sure the imports + `runImageAnalysis` are exactly this:

```ts
import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { CATEGORIES, categoryById } from '@/data/categories';
import { compressImageForAI } from '@/utils/image';
import { analyzePhotoWithRoboflow, hasRoboflowKey, roboflowStatus } from './roboflowService';
import { analyzeOnDevice, onDeviceEnabled } from './onDeviceService';
import { analyzeWithHuggingFace, hasHuggingFaceKey } from './huggingfaceService';
```

…and the orchestrator function:

```ts
/**
 * Orchestrator: try the REAL engines in order (on-device → Roboflow →
 * Hugging Face), falling back to the built-in mock estimate only if all fail
 * (no keys, offline, or rate limited). Result is tagged with the engine used.
 * Photos are compressed before hitting the APIs to stay under quotas.
 */
export async function runImageAnalysis(
  photo: string,
  coordinates: Coordinates | null,
): Promise<AnalysisOutput> {
  // Compress once for all real-model calls (keeps payloads small).
  let aiPhoto = photo;
  try {
    aiPhoto = await compressImageForAI(photo);
  } catch {
    aiPhoto = photo; // fall back to original if compression fails
  }

  // 1) ON-DEVICE — free, private, offline-capable. Only trusted when it maps
  //    to a real civic category with enough confidence; otherwise the cloud
  //    engines take over (a general model can't see "pothole").
  if (onDeviceEnabled) {
    try {
      const { confident, result } = await analyzeOnDevice(aiPhoto, coordinates);
      if (confident) return { ...result, photo };
      console.warn('[CivicEye] on-device AI not confident — using cloud engines.');
    } catch (err) {
      console.warn('[CivicEye] on-device AI unavailable:', err);
    }
  }

  // 2) Roboflow (CivicLENS) — primary cloud engine, trained on civic issues.
  if (hasRoboflowKey) {
    try {
      const real = await analyzePhotoWithRoboflow(aiPhoto, coordinates);
      return { ...real, photo };
    } catch (err) {
      console.warn('[CivicEye] Roboflow unavailable:', err);
    }
  } else {
    console.warn('[CivicEye] Roboflow is NOT configured correctly —', roboflowStatus().reason);
  }
  // 3) Hugging Face Inference API — cloud backup (after on-device + Roboflow).
  if (hasHuggingFaceKey) {
    try {
      const real = await analyzeWithHuggingFace(aiPhoto, coordinates);
      return { ...real, photo };
    } catch (err) {
      console.warn('[CivicEye] Hugging Face unavailable:', err);
    }
  }
  const mock = analyzePhoto({ photo, coordinates });
  return { ...mock, engine: 'mock' as const };
}
```

### File 3d — The result-card badges (already wired in `ReportPage.tsx`)

The analysis result card shows which engine ran, at roughly lines 780–810 of
`src/pages/ReportPage.tsx`:

```tsx
{analysis.engine === 'roboflow' ? (
  <p ...>✅ Detected by CivicLENS AI (real object detection)</p>
) : analysis.engine === 'ondevice' ? (
  <p ...>🖥️ Analysed on your device (private & offline)</p>
) : analysis.engine === 'huggingface' ? (
  <p ...>Analysed by Hugging Face (real model)</p>
) : (
  <p ...>Estimated locally (demo mode — no real AI keys configured)</p>
)}
```

There's also a config-warning card under the result when the engine wasn't Roboflow:
it calls `roboflowStatus()` and shows *"Roboflow not active: <reason>"* — that's
intentional, it tells you exactly why the primary engine was skipped.

---

## Step 4 — Configure the environment variables

Copy the template and fill it in:

```bash
cp .env.example .env
```

Then edit `.env` — the AI-relevant variables:

```env
# --- AI ENGINE CHAIN -------------------------------------------------
# ① ON-DEVICE (free, private, no key needed — default ON)
VITE_AI_ONDEVICE=true
VITE_ONDEVICE_MODEL=Xenova/yolos-tiny

# ② ROBOFLOW (primary cloud engine)
VITE_ROBOFLOW_API_KEY=REPLACE_WITH_YOUR_KEY
VITE_ROBOFLOW_WORKSPACE=REPLACE_WITH_YOUR_WORKSPACE      # e.g. aswathram-kumar
VITE_ROBOFLOW_WORKFLOW_ID=REPLACE_WITH_YOUR_WORKFLOW_ID  # e.g. civiceye-pothole-reporting-starter-1786336062967
# Alternative to workflow: a simple detect model (model/version)
VITE_ROBOFLOW_MODEL=
# RECOMMENDED proxy (Cloudflare Worker, 30s timeout) — see Step 9.
# Without it, the app uses the Vercel /api/roboflow function (10s Hobby limit).
VITE_ROBOFLOW_PROXY_URL=

# ③ HUGGING FACE (cloud backup)
VITE_HF_API_TOKEN=REPLACE_WITH_YOUR_TOKEN
VITE_HF_MODEL=facebook/detr-resnet-50

# --- Everything else (already configured) ----------------------------
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_APP_URL=...
```

> **Never commit `.env`** — it's in `.gitignore`. Only the template `.env.example`
> (with empty values) is committed.

---

## Step 5 — Build & verify (do this after ANY change)

```bash
cd civiceye
npm run typecheck   # TypeScript — must pass with 0 errors
npm run lint        # ESLint — must pass with 0 warnings
npm run build       # production build (also runs tsc)
```

Expected build output (notice the lazy AI chunks):

```
dist/assets/index-*.js                        ~656 kB  (main app)
dist/assets/vendor-react-*.js                 ~164 kB
dist/assets/vendor-maps-*.js                  ~24 kB
dist/assets/vendor-motion-*.js                ~115 kB
dist/assets/transformers.web-*.js             ~833 kB  ← on-device engine (lazy)
dist/assets/ort-wasm-simd-threaded.jsep-*.wasm ~23.9 MB ← model runtime (lazy)
```

The two last chunks are **only downloaded when the user first clicks Analyse** — that
lazy loading is what keeps the initial page fast.

For screenshots/demos without keys:

```bash
VITE_DEMO_MODE=true npm run build
npm run preview -- --port 4173 --strictPort
```

---

## Step 6 — Test each engine (prove it works)

Open the app, log in, go to **Report an issue**, pick/upload a photo, and click
**Analyse**. Watch DevTools → Console + Network.

| # | Engine | How you know it worked | Network tab shows |
|---|--------|------------------------|-------------------|
| ① | On-device | Badge **"🖥️ Analysed on your device (private & offline)"**; first run downloads ~24 MB (be patient). Console: *no* "not confident" warning. | `transformers.web-*.js` + `ort-wasm-*.wasm` (first time only) |
| ② | Roboflow | Badge **"✅ Detected by CivicLENS AI"**. Console shows no "Roboflow unavailable". | POST to your proxy URL (worker or `/api/roboflow`) → upstream `serverless.roboflow.com` |
| ③ | Hugging Face | Badge **"Analysed by Hugging Face"**. First call may cold-start 20–60 s (model loading). | POST to `api-inference.huggingface.co/models/facebook/detr-resnet-50` |
| ④ | Mock | Badge **"Estimated locally (demo mode…)"** — only when every real engine failed or no keys. | No AI calls |

**To force-test a specific engine** (temporarily), just comment out the earlier
stages in `runImageAnalysis`, or unset the earlier keys.

**To test with a pothole photo:** any clear photo of a pothole/cracked road →
on-device will *not* be confident (general model) → falls to Roboflow, which IS
trained on potholes → you should see the CivicLENS badge and a high confidence.

---

## Step 7 — Deploy to Vercel

1. Push to GitHub (`main` → Vercel auto-deploys).
2. In the **Vercel dashboard → your project → Settings → Environment Variables**,
   add **every** variable from `.env` (the VITE_ ones plus `ROBOFLOW_API_KEY` for the
   serverless proxy):

   ```
   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_MAPS_API_KEY,
   VITE_AI_ONDEVICE, VITE_ONDEVICE_MODEL,
   VITE_ROBOFLOW_API_KEY, VITE_ROBOFLOW_WORKSPACE, VITE_ROBOFLOW_WORKFLOW_ID,
   VITE_ROBOFLOW_MODEL, VITE_ROBOFLOW_PROXY_URL,
   VITE_HF_API_TOKEN, VITE_HF_MODEL,
   VITE_APP_URL, ROBOFLOW_API_KEY
   ```
3. **Redeploy** (Deployments → latest → ⋯ → Redeploy). Vite bakes VITE_* values into
   the bundle at build time, so env changes need a rebuild.

---

## Step 8 — Deploy the Roboflow proxy (IMPORTANT — CORS)

**Why:** Roboflow's serverless endpoint omits `Access-Control-Allow-Origin` in its
preflight response, so **browsers block direct calls** (CORS error). The app must go
through a proxy that adds the header.

The repo ships TWO proxy options:

**Option A (recommended): Cloudflare Worker — 30 s timeout, free**
```bash
cd civiceye/worker
npx wrangler login
npx wrangler secret put ROBOFLOW_API_KEY   # paste your Roboflow key
npx wrangler deploy
```
Then set in Vercel env (and `.env`):
```
VITE_ROBOFLOW_PROXY_URL=https://roboflow-proxy.YOUR_SUBDOMAIN.workers.dev
```

**Option B (built-in fallback): Vercel function — 10 s Hobby timeout**
Already deployed with the repo at `/api/roboflow` (see `api/roboflow.js`).
Works, but Roboflow workflows can take 5–15 s, so a slow one may hit Vercel's 10 s
Hobby limit → this is why Option A exists.

The app validates the proxy URL: if it contains `<you>` or is empty, you'll get a
clear "Roboflow proxy not configured" message and Roboflow is skipped gracefully.

---

## Step 9 — Gotchas & honest limitations

1. **Roboflow credits are finite.** Free tier ≈ 1000 credits/mo, ≈ 1 credit per
   photo analysis. The **Live AI** page (`/live`) consumes ~1 credit **per frame** —
   for demos keep the interval at **8 seconds** or more, or use a local model.
2. **HF free tier is rate-limited and cold-starts.** The first call to DETR can take
   20–60 s while the model loads. Later calls are fast.
3. **The default on-device model is general, not civic.** It only confidently
   detects traffic lights / stop signs / fire hydrants / people and hands off
   potholes to Roboflow — by design (see Step 6). To detect civic issues
   on-device, train a custom YOLO model and set `VITE_ONDEVICE_YOLO_URL` (Step 10).
4. **WebGPU is optional.** The on-device engine runs on plain WASM everywhere; WebGPU
   just makes it faster. No special browser flag needed.
5. **The HF token is a `VITE_` var → it's public in the bundle** (same caveat as all
   VITE_ keys). For production, the clean fix is a tiny serverless proxy like
   `api/roboflow.js` — copy it to `api/huggingface.js` (POST to
   `api-inference.huggingface.co/models/{model}` with the token read from server env).
6. **VITE_ env vars are baked at build time** — after changing `.env`, rebuild and
   redeploy. They're not hot-swappable.
7. **Keys in git history = GitHub blocks your push.** The repo still contains old
   real keys in history (that's why you saw `push declined due to repository rule
   violations`). Fix: redact `ANTIGRAVITY_PROMPT.md`, `git commit --amend`, and
   **rotate the keys** (new Roboflow key, new HF token), then scrub
   history with `git filter-repo` if GitHub still refuses.

---

## Step 10 — Make on-device AI detect EVERYTHING (custom YOLO model)

### Why you saw "on-device AI not confident"

The default on-device model (`Xenova/yolos-tiny`) is a **general-purpose COCO
model** — it knows 80 everyday classes (person, car, truck, traffic light, stop
sign, fire hydrant…) but **has never seen a pothole, garbage pile, manhole,
sewage overflow, broken road…** Those aren't in its vocabulary, so when you test
with a pothole photo it detects "car 0.92 / truck 0.61", maps that to
`other`, and correctly **hands off to Roboflow** (which IS trained on civic
issues). That's the guard working as designed — no model can detect what it was
never trained on.

### The fix: point on-device at YOUR OWN civic model

This repo now ships a **custom ONNX YOLO runtime** (`src/services/onDeviceYolo.ts`).
If you set `VITE_ONDEVICE_YOLO_URL`, the app runs YOUR model in the browser first
(free, private, offline) and only falls to Roboflow when your model is unsure.
You can train it for free on Roboflow:

1. **Create a dataset** → app.roboflow.com → Create Project → Object Detection →
   upload 100–300 photos of potholes / garbage / manholes / broken roads (phone
   photos are perfect). **Pro tip:** Roboflow has free public datasets — search
   "pothole", "garbage", "manhole" under *Public Datasets* and just Add to Project.
2. **Annotate** boxes on each photo (fast — a few per minute; 50+ images is
   enough for a demo, 200+ is much better).
3. **Generate a version** → *Generate* (auto-augments). 
4. **Train** → *Train with Ultralytics* → pick **YOLOv8n** or **YOLO11n** (the
   "nano" sizes run fast on phones) → Train (free GPU, a few minutes).
5. **Export ONNX** → *Deploy → Export → ONNX*. Download `best.onnx` (or
   `weights/best.onnx`).
6. **Host it** — upload the `.onnx` anywhere with CORS enabled:
   - GitHub: push to a repo, use the `raw.githubusercontent.com/...` URL, or
   - Hugging Face: create a model repo, upload, use
     `https://huggingface.co/{user}/{repo}/resolve/main/best.onnx`, or
   - jsDelivr: `https://cdn.jsdelivr.net/gh/{user}/{repo}@main/best.onnx`.
7. **Configure** in `.env` (and Vercel env):
   ```
   VITE_ONDEVICE_YOLO_URL=https://cdn.jsdelivr.net/gh/you/civiceye-models@main/best.onnx
   VITE_ONDEVICE_YOLO_LABELS=pothole,broken-road,garbage,manhole,fallen-tree,street-light,sewage
   VITE_ONDEVICE_YOLO_SIZE=640
   VITE_ONDEVICE_YOLO_CONF=0.35
   ```
   **`VITE_ONDEVICE_YOLO_LABELS` order must match the class order in your
   Roboflow export** (0 = first class). Any label that matches a CivicEye
   category (or an alias like "trash"→garbage, "potholes"→pothole) maps
   automatically; the rest are reported as-is but don't win the verdict.
8. Rebuild (`npm run build`) — the app now runs your civic model **on-device**
   before touching the cloud.

**Output formats supported:** raw YOLOv8/YOLO11 export (`[1, 4+N, 8400]` or
`[1, 8400, 4+N]`) and end-to-end NMS export (`[1, N, 6]`). Both decode + NMS in
the browser, so it "just works" with a standard Roboflow/Ultralytics export.

**Trade-offs to know:**
- Nano models (~6–10 MB) run in ~0.5–2 s on phones; small models (`yolov8s`)
  are more accurate but slower. Start nano.
- The model file is a **first-load download** (cached after that, offline
  afterwards) — just like the current 24 MB default model.
- Accuracy depends on YOUR dataset. A 50-image demo set will occasionally
  mislabel; 200+ images with clean boxes looks like a real product.

> Also possible without training: point `VITE_ONDEVICE_MODEL` at a bigger
> general model (e.g. `Xenova/detr-resnet-50`) — better COCO accuracy, but
> still won't see potholes. Custom training is the only way to detect civic
> issues on-device.

---

## Quick file checklist (fresh checkout / teammate merge)

```
✅ npm install (or npm install @huggingface/transformers@3.4.0 --ignore-scripts)
✅ npm install onnxruntime-web@^1.21.0 --ignore-scripts   (custom YOLO runtime)
✅ src/services/onDeviceService.ts        ← NEW (code above)
✅ src/services/onDeviceYolo.ts           ← NEW (custom civic YOLO, Step 10)
✅ src/services/onDeviceMap.ts            ← NEW (shared label mapping)
✅ src/services/huggingfaceService.ts     ← NEW (code above)
✅ src/services/aiAnalysisService.ts      ← UPDATE runImageAnalysis (code above)
✅ src/services/roboflowService.ts        ← from zip
✅ src/utils/image.ts                     ← from zip (compressImageForAI, detectBlur)
✅ src/types/index.ts                     ← engine union includes 'ondevice' | 'huggingface'
✅ src/pages/ReportPage.tsx               ← badges (from zip)
✅ .env                                   ← filled (never committed)
✅ worker/roboflow-proxy.js + worker/README.md  ← Cloudflare worker
✅ api/roboflow.js                        ← Vercel fallback proxy
✅ npm run typecheck && npm run lint && npm run build   ← all green
```
