import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { detectBlur } from '@/utils/image';

/**
 * Roboflow inference client (free tier, no card).
 *
 * The browser cannot call Roboflow directly (their serverless endpoint omits
 * `Access-Control-Allow-Origin` in the preflight, so browsers block it — CORS).
 * Instead we call OUR OWN proxy:
 *   - Cloudflare Worker (VITE_ROBOFLOW_PROXY_URL), preferred, or
 *   - Vercel function `api/roboflow.js` (mirrored in dev by the vite proxy)
 * The proxy forwards to Roboflow server-side (no CORS there) and returns the
 * response unchanged.
 *
 * Body: { image: "<base64>", api_key?: "<key>", model?: "<model/version>" }
 *   - no `model`  → runs the WORKFLOW (workspace + workflow_id from env)
 *   - with `model` → runs a standard detect.roboflow.com model
 *
 * REAL RESPONSE (grounded): the "CivicEye Pothole Reporting Starter" workflow
 * returns
 *   { outputs: [ { output_image: {type:"base64",value:"<annotated jpeg>"},
 *                  predictions: [{ class, confidence, x, y, width, height }] } ] }
 * Parser keys off real output names and never hard-codes them.
 */

const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY?.trim() ?? '';
const WORKSPACE = import.meta.env.VITE_ROBOFLOW_WORKSPACE?.trim() ?? '';
const WORKFLOW_ID = import.meta.env.VITE_ROBOFLOW_WORKFLOW_ID?.trim() ?? '';
const MODEL = import.meta.env.VITE_ROBOFLOW_MODEL?.trim() ?? '';
const PROXY_URL = import.meta.env.VITE_ROBOFLOW_PROXY_URL?.trim() ?? '';

/** True when a full Roboflow target (workflow or model) is configured. */
export const hasRoboflowKey = Boolean(API_KEY && (WORKSPACE && WORKFLOW_ID ? true : MODEL));

/** Validate a proxy URL — reject placeholders like "<you>". */
function isValidProxyUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /^[a-z0-9.-]+$/i.test(u.hostname) && u.hostname.includes('.') && !u.hostname.includes('<');
  } catch {
    return false;
  }
}

/** Where the browser sends the request (Worker → Vercel function). */
export const PROXY_TARGET = PROXY_URL
  ? isValidProxyUrl(PROXY_URL)
    ? `${PROXY_URL.replace(/\/+$/, '')}/`
    : null
  : '/api/roboflow';

/** Diagnostics for the UI/console. */
export const roboflowConfig = {
  apiKey: Boolean(API_KEY),
  workspace: Boolean(WORKSPACE),
  workflowId: Boolean(WORKFLOW_ID),
  model: Boolean(MODEL),
  proxyUrl: PROXY_URL && isValidProxyUrl(PROXY_URL) ? PROXY_URL : null,
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

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3;
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
/* HTTP with timeout + retries                                         */
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

/** Model class labels → CivicEye categories (normalized: spaces → hyphens). */
const CLASS_MAP: Record<string, CategoryId> = {
  // Roads
  pothole: 'pothole',
  'pothole-hole': 'pothole',
  'water-filled-pothole': 'pothole',
  'water-filled': 'pothole',
  'broken-road': 'broken-road',
  'road-damage': 'broken-road',
  crack: 'broken-road',
  'open-trench': 'manhole',
  'open-manhole': 'manhole',
  'missing-manhole-cover': 'manhole',
  // Sidewalks
  sidewalk: 'sidewalk',
  'broken-sidewalk': 'sidewalk',
  'damaged-sidewalk': 'sidewalk',
  // Waste
  garbage: 'garbage',
  'garbage-accumulation': 'garbage',
  'garbage-pile': 'garbage',
  trash: 'garbage',
  litter: 'garbage',
  // Trees
  'fallen-tree': 'fallen-tree',
  'fallen-tree-branch': 'fallen-tree',
  tree: 'fallen-tree',
  'tree-branch': 'fallen-tree',
  'fallen-tree-trunk': 'fallen-tree',
  'tree-trunk': 'fallen-tree',
  // Lighting
  'street-light': 'street-light',
  'broken-street-light': 'street-light',
  'broken-streetlight': 'street-light',
  streetlight: 'street-light',
  // Water / sewage
  'water-leakage': 'water-leakage',
  'water-leak': 'water-leakage',
  'water-leaking': 'water-leakage',
  sewage: 'sewage',
  'sewage-overflow': 'sewage',
  // Dumping
  'illegal-dumping': 'illegal-dumping',
  dumping: 'illegal-dumping',
  // Traffic
  'traffic-light': 'traffic-signal',
  'traffic-signal': 'traffic-signal',
  signal: 'traffic-signal',
  'broken-traffic-light': 'traffic-signal',
  // Accidents / security
  accident: 'accident',
  crash: 'accident',
  collision: 'accident',
  'suspicious-activity': 'security',
  person: 'security',
};

function mapClass(label: string): CategoryId {
  const key = label.trim().toLowerCase().replace(/[_\s]+/g, '-');
  return CLASS_MAP[key] ?? 'other';
}

/**
 * Aggregate noisy detector output (SAM workflows emit many overlapping
 * boxes per class) into a single reliable verdict.
 *
 * Strategy (validated against the real workflow): group boxes by mapped
 * category, then pick the category with the SINGLE HIGHEST box confidence
 * (tie-break: more boxes). This mirrors what the model is most confident
 * about, rather than letting a class with many weak boxes win.
 */
function aggregateVerdict(
  predictions: Prediction[],
): { category: CategoryId; confidence: number; representativeClass: string } {
  const byCategory = new Map<CategoryId, { max: number; count: number; label: string }>();

  for (const p of predictions) {
    const cat = mapClass(p.class);
    const entry = byCategory.get(cat) ?? { max: 0, count: 0, label: p.class };
    entry.count += 1;
    if (p.confidence > entry.max) {
      entry.max = p.confidence;
      entry.label = p.class; // keep the label of the highest-confidence box
    }
    byCategory.set(cat, entry);
  }

  let best: { category: CategoryId; max: number; count: number; label: string } | null = null;
  for (const [cat, e] of byCategory) {
    if (cat === 'other') continue; // never pick "other" if a real category exists
    if (
      !best ||
      e.max > best.max ||
      (e.max === best.max && e.count > best.count)
    ) {
      best = { category: cat, ...e };
    }
  }
  // If every detection mapped to 'other', fall back to the highest entry.
  if (!best) {
    let fb: { category: CategoryId; max: number; count: number; label: string } | null = null;
    for (const [cat, e] of byCategory) {
      if (!fb || e.max > fb.max) fb = { category: cat, ...e };
    }
    best = fb ?? { category: 'other', max: 0, count: 0, label: 'Unknown' };
  }

  return {
    category: best.category,
    confidence: clamp(best.max || 0, 0, 1),
    representativeClass: best.label,
  };
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

/** Recursively find every {class, confidence} object in the response. */
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

/** Find the workflow's image-shaped output (data URL for the UI). */
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

/** Call the Roboflow proxy (Worker or /api/roboflow). */
async function callProxy(body: { image: string; api_key?: string; model?: string }): Promise<unknown> {
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
 * Analyze a photo with Roboflow via the proxy. Workflow if
 * workspace+workflow_id configured, else the detect endpoint
 * (VITE_ROBOFLOW_MODEL). Returns an AnalysisResult (engine: 'roboflow');
 * if the workflow returns no predictions, reports that honestly.
 */
export async function analyzePhotoWithRoboflow(
  photo: string,
  coordinates: Coordinates | null,
): Promise<AnalysisResult & { annotatedImage?: string | null }> {
  if (!hasRoboflowKey)
    throw new RoboflowError('Roboflow is not configured (key + workspace/workflow or model).');

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
    data = await callProxy({ image: b64, api_key: API_KEY });
    const outputs = (data as { outputs?: unknown[] })?.outputs ?? [];
    for (const entry of outputs) {
      predictions = predictions.concat(extractPredictions(entry));
      annotated = annotated ?? extractAnnotatedImage(entry);
    }
    base.annotatedImage = annotated;
    if (predictions.length === 0) {
      base.description =
        'The workflow ran, but it returned no detection data. Expose the predictions as a workflow output, ' +
        'or use a detect.roboflow.com model URL.';
      return base;
    }
  } else if (MODEL) {
    data = await callProxy({ image: b64, api_key: API_KEY, model: MODEL });
    predictions = extractPredictions(data);
    if (predictions.length === 0) {
      base.description = 'The model did not detect any known civic issue in this photo.';
      return base;
    }
  } else {
    throw new RoboflowError('No Roboflow target configured (workspace+workflow_id or model).');
  }

  const verdict = aggregateVerdict(predictions);
  const confidence = verdict.confidence;
  const category = verdict.category;
  const sev = severityFromConfidence(confidence);
  const objects = predictions.slice(0, 8).map((p) => `${p.class} (${Math.round(p.confidence * 100)}%)`);

  // Human-friendly, grounded description from the real detections.
  const unique = [...new Set(predictions.map((p) => p.class))];
  const topObjects = predictions
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map((p) => `${p.class} (${Math.round(p.confidence * 100)}%)`)
    .join(', ');
  const severityWord: Record<Severity, string> = {
    low: 'Minor',
    medium: 'Moderate',
    high: 'Significant',
    critical: 'Critical',
  };
  const description =
    `${severityWord[sev]} ${category.replace(/-/g, ' ')} detected in the photo ` +
    `(${unique.length} distinct object type${unique.length === 1 ? '' : 's'}, ` +
    `${predictions.length} detection${predictions.length === 1 ? '' : 's'} total). ` +
    `Top matches: ${topObjects}. ` +
    (annotated
      ? 'The annotated image highlights each detection; this report can be reviewed before submission.'
      : 'No annotated image was returned by the detector.');

  return {
    category,
    confidence,
    severity: sev,
    description,
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
