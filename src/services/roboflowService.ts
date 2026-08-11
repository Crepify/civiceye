import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { detectBlur } from '@/utils/image';

/**
 * Roboflow inference client (free tier, no card).
 *
 * The browser CANNOT call Roboflow directly — its serverless endpoint
 * omits `Access-Control-Allow-Origin` in the preflight, so browsers
 * block the request (CORS). Instead we call OUR OWN serverless proxy:
 *   POST /api/roboflow   (Vercel function `api/roboflow.js`, mirrored in
 *                        dev by a vite proxy to serverless.roboflow.com)
 * The proxy forwards to Roboflow server-side (no CORS there) and returns
 * the response unchanged.
 *
 * Body: { image: "<base64>", api_key?: "<key>", model?: "<model/version>" }
 *   - no `model`  → runs the WORKFLOW
 *     (workspace + workflow_id from env, defaulting to
 *      "CivicEye Pothole Reporting Starter")
 *   - with `model` → runs a standard detect.roboflow.com model
 *
 * REAL RESPONSE (grounded): the workflow returns
 *   { outputs: [ { output_image: { type: "base64", value: "<annotated jpeg>" } } ] }
 * i.e. only an annotated image — no class/confidence keys. The parser keys
 * off the real output names, never hard-codes them, and reports honestly
 * when the workflow does not expose predictions.
 */

const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY?.trim() ?? '';
const WORKSPACE = import.meta.env.VITE_ROBOFLOW_WORKSPACE?.trim() ?? '';
const WORKFLOW_ID = import.meta.env.VITE_ROBOFLOW_WORKFLOW_ID?.trim() ?? '';
const MODEL = import.meta.env.VITE_ROBOFLOW_MODEL?.trim() ?? '';
/** Optional Cloudflare Worker URL — preferred over the Vercel proxy. */
const PROXY_URL = import.meta.env.VITE_ROBOFLOW_PROXY_URL?.trim() ?? '';

/**
 * Validate the proxy URL. Catches placeholder junk like
 * "https://roboflow-proxy.<you>.workers.dev" before fetch throws a
 * confusing "Failed to parse URL" error.
 */
function isValidProxyUrl(url: string): boolean {
  try {
    const u = new URL(url);
    // Hostname must not contain placeholder chars and must have a dot.
    return /^[a-z0-9.-]+$/i.test(u.hostname) && u.hostname.includes('.') && !u.hostname.includes('<');
  } catch {
    return false;
  }
}

export const PROXY_TARGET = PROXY_URL
  ? isValidProxyUrl(PROXY_URL)
    ? `${PROXY_URL.replace(/\/+$/, '')}/`
    : null
  : '/api/roboflow';

export const hasRoboflowKey = Boolean(API_KEY && (WORKSPACE && WORKFLOW_ID ? true : MODEL));

/** Which Roboflow env pieces are present (for diagnostics). */
export const roboflowConfig = {
  apiKey: Boolean(API_KEY),
  workspace: Boolean(WORKSPACE),
  workflowId: Boolean(WORKFLOW_ID),
  model: Boolean(MODEL),
  proxyUrl: PROXY_URL ? PROXY_URL : null,
};

/** Human-readable reason Roboflow is skipped (or null when it will run). */
export function roboflowStatus(): { ok: boolean; reason: string } {
  if (!API_KEY) return { ok: false, reason: 'Missing VITE_ROBOFLOW_API_KEY.' };
  if (WORKSPACE && WORKFLOW_ID) return { ok: true, reason: '' };
  if (MODEL) return { ok: true, reason: '' };
  return {
    ok: false,
    reason:
      'Incomplete Roboflow config: set VITE_ROBOFLOW_WORKSPACE and VITE_ROBOFLOW_WORKFLOW_ID ' +
      '(or VITE_ROBOFLOW_MODEL) in addition to VITE_ROBOFLOW_API_KEY.',
  };
}

/** Where the browser sends the request: Worker (if set) else /api/roboflow. */
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3; // 1 call + 2 retries
const BACKOFF_BASE_MS = 500;

/** Typed error for all Roboflow failures. */
export class RoboflowError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'RoboflowError';
  }
}

/* ------------------------------------------------------------------ */
/* Low-level HTTP with timeout + retries/backoff                       */
/* ------------------------------------------------------------------ */

async function postJsonWithRetry(
  url: string,
  body: string,
  signal: AbortSignal | undefined,
  attempt = 0,
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal,
    });
  } catch (err) {
    // Network / timeout error.
    if (attempt + 1 < MAX_ATTEMPTS) {
      await sleep(BACKOFF_BASE_MS * 2 ** attempt);
      return postJsonWithRetry(url, body, signal, attempt + 1);
    }
    throw new RoboflowError(
      err instanceof Error ? `Roboflow network error: ${err.message}` : 'Roboflow network error.',
      undefined,
      'network',
    );
  }

  // Retry on 429 / 5xx (transient); never on other 4xx.
  if ((res.status === 429 || res.status >= 500) && attempt + 1 < MAX_ATTEMPTS) {
    await sleep(BACKOFF_BASE_MS * 2 ** attempt);
    return postJsonWithRetry(url, body, signal, attempt + 1);
  }

  return res;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Parsing — defensive, keyed on the REAL response shape               */
/* ------------------------------------------------------------------ */

const CLASS_MAP: Record<string, CategoryId> = {
  pothole: 'pothole',
  'pothole-hole': 'pothole',
  'broken-road': 'broken-road',
  'road-damage': 'broken-road',
  crack: 'broken-road',
  garbage: 'garbage',
  trash: 'garbage',
  litter: 'garbage',
  'garbage-pile': 'garbage',
  sidewalk: 'sidewalk',
  'broken-sidewalk': 'sidewalk',
  manhole: 'manhole',
  'manhole-cover': 'manhole',
  'fallen-tree': 'fallen-tree',
  tree: 'fallen-tree',
  'street-light': 'street-light',
  streetlight: 'street-light',
  'water-leakage': 'water-leakage',
  'water-leak': 'water-leakage',
  sewage: 'sewage',
  'sewage-overflow': 'sewage',
  'illegal-dumping': 'illegal-dumping',
  dumping: 'illegal-dumping',
  'traffic-light': 'traffic-signal',
  'traffic-signal': 'traffic-signal',
  signal: 'traffic-signal',
  accident: 'accident',
  crash: 'accident',
  collision: 'accident',
  'suspicious-activity': 'security',
  person: 'security',
};

function mapClass(label: string): CategoryId {
  const key = label.trim().toLowerCase();
  return CLASS_MAP[key] ?? 'other';
}

function severityFromConfidence(score: number): Severity {
  if (score > 0.82) return 'critical';
  if (score > 0.68) return 'high';
  if (score > 0.5) return 'medium';
  return 'low';
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

interface Prediction {
  class: string;
  confidence: number;
}

/**
 * Recursively find every {class, confidence} object anywhere in the
 * workflow response (works regardless of which output name the workflow
 * uses for its predictions).
 */
export function extractPredictions(node: unknown, out: Prediction[] = []): Prediction[] {
  if (Array.isArray(node)) {
    for (const item of node) extractPredictions(item, out);
    return out;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if (typeof obj.class === 'string' && typeof obj.confidence === 'number') {
      out.push({ class: obj.class, confidence: obj.confidence });
    }
    for (const k of Object.keys(obj)) extractPredictions(obj[k], out);
  }
  return out;
}

/**
 * Find the workflow's image-shaped output: the first { type: 'base64',
 * value: <jpeg> } found in an output entry. Returns a data URL (browser)
 * so the annotated image can be shown in the UI; the raw base64 is never
 * logged.
 */
export function extractAnnotatedImage(node: unknown): string | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = extractAnnotatedImage(item);
      if (found) return found;
    }
    return null;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if (
      typeof obj.type === 'string' &&
      obj.type === 'base64' &&
      typeof obj.value === 'string' &&
      obj.value.length > 0
    ) {
      // Treat as JPEG (workflow annotates with the same format as input).
      return `data:image/jpeg;base64,${obj.value}`;
    }
    for (const k of Object.keys(obj)) {
      const found = extractAnnotatedImage(obj[k]);
      if (found) return found;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Call the Roboflow proxy — a Cloudflare Worker (VITE_ROBOFLOW_PROXY_URL,
 * preferred) or the Vercel function `api/roboflow.js` (or the dev proxy
 * in vite.config.ts). Timeout + retries with backoff. Throws
 * RoboflowError on failure.
 */
async function callProxy(
  body: { image: string; api_key?: string; model?: string },
): Promise<unknown> {
  if (!PROXY_TARGET) {
    throw new RoboflowError(
      'VITE_ROBOFLOW_PROXY_URL is invalid (looks like a placeholder, e.g. <you>). ' +
        'Set it to your real Cloudflare Worker URL, or remove it to use /api/roboflow.',
      undefined,
      'config',
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await postJsonWithRetry(PROXY_TARGET, JSON.stringify(body), controller.signal);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new RoboflowError(`Roboflow proxy error ${res.status}: ${text.slice(0, 200)}`, res.status, 'http');
  }

  try {
    return (await res.json()) as unknown;
  } catch {
    throw new RoboflowError('Roboflow proxy returned non-JSON response.', res.status, 'parse');
  }
}

/**
 * Analyze a photo with Roboflow via the local proxy. Uses the workflow if
 * workspace+workflow_id are configured, otherwise the standard detect
 * endpoint (VITE_ROBOFLOW_MODEL). Always returns an AnalysisResult
 * (engine: 'roboflow'); if the workflow returns no predictions (image-only
 * outputs), it reports that honestly.
 */
export async function analyzePhotoWithRoboflow(
  photo: string,
  coordinates: Coordinates | null,
): Promise<AnalysisResult & { annotatedImage?: string | null }> {
  if (!hasRoboflowKey) throw new RoboflowError('Roboflow is not configured (key + workspace/workflow or model).');

  const match = /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,(.+)$/s.exec(photo);
  if (!match) throw new RoboflowError('Unsupported image format.');
  const b64 = match[1];

  const quality = await detectBlur(photo);
  const base: AnalysisResult & { annotatedImage?: string | null } = {
    category: 'other',
    confidence: 0.2,
    severity: 'low',
    description: '',
    objects: [],
    coordinates,
    timestamp: new Date().toISOString(),
    tags: [],
    imageQuality: quality,
    qualityNote: undefined,
    engine: 'roboflow',
    annotatedImage: null,
  };

  let data: unknown;
  let annotated: string | null = null;
  let predictions: Prediction[] = [];

  if (WORKSPACE && WORKFLOW_ID) {
    // Workflow mode → proxy runs serverless.roboflow.com/{workspace}/workflows/{id}.
    data = await callProxy({ image: b64, api_key: API_KEY });
    const outputs = (data as { outputs?: unknown[] })?.outputs ?? [];
    for (const entry of outputs) {
      predictions = predictions.concat(extractPredictions(entry));
      annotated = annotated ?? extractAnnotatedImage(entry);
    }
    base.annotatedImage = annotated;
    if (predictions.length === 0) {
      base.description =
        'The workflow ran, but it only returned an annotated image — no detection data. ' +
        'To get confidence scores, expose the predictions as a workflow output (or use a detect.roboflow.com model URL).';
      return base;
    }
  } else if (MODEL) {
    // Detect mode → proxy runs detect.roboflow.com/{model}?api_key=…
    data = await callProxy({ image: b64, api_key: API_KEY, model: MODEL });
    predictions = extractPredictions(data);
    if (predictions.length === 0) {
      base.description = 'The model did not detect any known civic issue in this photo.';
      return base;
    }
  } else {
    throw new RoboflowError('No Roboflow target configured (workspace+workflow_id or model).');
  }

  const top = predictions.reduce((a, b) => (b.confidence > a.confidence ? b : a));
  const confidence = clamp(Number(top.confidence) || 0, 0, 1);
  const category = mapClass(top.class);
  const objects = predictions.slice(0, 8).map((p) => `${p.class} (${Math.round(p.confidence * 100)}%)`);

  return {
    category,
    confidence,
    severity: severityFromConfidence(confidence),
    description: `Detected "${top.class}" with ${Math.round(confidence * 100)}% confidence. ` +
      `${predictions.length} object${predictions.length === 1 ? '' : 's'} found in the scene.`,
    objects,
    coordinates,
    timestamp: new Date().toISOString(),
    tags: predictions.slice(0, 5).map((p) => p.class),
    imageQuality: quality,
    qualityNote: undefined,
    engine: 'roboflow',
    annotatedImage: annotated,
  };
}
