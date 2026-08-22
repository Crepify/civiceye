import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { categoryById } from '@/data/categories';
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
  potholes: 'pothole',
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
  // Lighting — Roboflow SAM3 mapped class is "Broken Street Light"
  'street-light': 'street-light',
  'broken-street-light': 'street-light',
  'broken-streetlight': 'street-light',
  streetlight: 'street-light',
  'street-lamp': 'street-light',
  'lamp-post': 'street-light',
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
  'traffic-signal-damage': 'traffic-signal',
  signal: 'traffic-signal',
  'broken-traffic-light': 'traffic-signal',
  // Accidents / security
  accident: 'accident',
  'traffic-accident': 'accident',
  crash: 'accident',
  collision: 'accident',
  'suspicious-activity': 'security',
  person: 'security',
  // Explicit "other" labels from the workflow (do not treat as a miss)
  'other-infrastructure': 'other',
  'no-issue': 'other',
};

/** Phrases in long SAM3 prompts / Gemini class names, most-specific first. */
const CLASS_CONTAINS: Array<[string, CategoryId]> = [
  ['water filled pothole', 'pothole'],
  ['standing water', 'pothole'],
  ['broken street light', 'street-light'],
  ['street light', 'street-light'],
  ['streetlight', 'street-light'],
  ['lamp post', 'street-light'],
  ['traffic signal', 'traffic-signal'],
  ['traffic light', 'traffic-signal'],
  ['traffic accident', 'accident'],
  ['missing manhole', 'manhole'],
  ['open trench', 'manhole'],
  ['manhole', 'manhole'],
  ['garbage', 'garbage'],
  ['illegal dump', 'illegal-dumping'],
  ['fallen tree', 'fallen-tree'],
  ['water leak', 'water-leakage'],
  ['sewage', 'sewage'],
  ['broken sidewalk', 'sidewalk'],
  ['sidewalk', 'sidewalk'],
  ['broken road', 'broken-road'],
  ['pothole', 'pothole'],
  ['crash', 'accident'],
  ['collision', 'accident'],
];

/** Map a Roboflow class label (short or long SAM3 prompt) to CivicEye ids. */
export function categoryFromRoboflowLabel(label: string): CategoryId {
  const trimmed = label.trim();
  if (!trimmed || /^no issue$/i.test(trimmed)) return 'other';
  const key = trimmed.toLowerCase().replace(/[_\s]+/g, '-');
  if (CLASS_MAP[key]) return CLASS_MAP[key];
  const hay = trimmed.toLowerCase();
  for (const [needle, cat] of CLASS_CONTAINS) {
    if (hay.includes(needle)) return cat;
  }
  return 'other';
}

const mapClass = categoryFromRoboflowLabel;

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
      entry.label = p.class;
    }
    byCategory.set(cat, entry);
  }

  let best: { category: CategoryId; max: number; count: number; label: string } | null = null;
  for (const [cat, e] of byCategory) {
    if (cat === 'other') continue;
    if (!best || e.max > best.max || (e.max === best.max && e.count > best.count)) {
      best = { category: cat, ...e };
    }
  }
  if (!best) {
    let fallback: { category: CategoryId; max: number; count: number; label: string } | null = null;
    for (const [cat, e] of byCategory) {
      if (!fallback || e.max > fallback.max) fallback = { category: cat, ...e };
    }
    best = fallback ?? { category: 'other', max: 0, count: 0, label: 'Unknown' };
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

/** Map the workflow's "Low" | "Medium" | "High" | "None" string. */
export function severityFromWorkflowLabel(label: string | null | undefined): Severity | null {
  if (!label) return null;
  const key = label.trim().toLowerCase();
  if (key.startsWith('crit')) return 'critical';
  if (key.startsWith('high')) return 'high';
  if (key.startsWith('med')) return 'medium';
  if (key.startsWith('low')) return 'low';
  return null;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** A raw object prediction returned by a Roboflow detector. */
export interface RoboflowPrediction {
  class: string;
  confidence: number;
  /** Roboflow standard-detector coordinates (usually pixel values). */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

type Prediction = RoboflowPrediction;

/** Keys that are huge (polygons / jpeg) and never contain a detection. */
const SKIP_RECURSE_KEYS = new Set(['points', 'value', 'video_metadata']);

function readClassName(obj: Record<string, unknown>): string | null {
  for (const key of ['class', 'class_name', 'label', 'predicted_class']) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}

function readConfidence(obj: Record<string, unknown>): number | null {
  for (const key of ['confidence', 'confidence_score', 'score']) {
    const raw = obj[key];
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(n)) return n > 1 ? n / 100 : n;
  }
  return null;
}

/** Recursively find every {class, confidence} object in the response. */
export function extractPredictions(node: unknown, out: RoboflowPrediction[] = []): RoboflowPrediction[] {
  if (Array.isArray(node)) {
    for (const item of node) extractPredictions(item, out);
    return out;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;

    const names = obj.class_name ?? obj.classes;
    const confs = obj.confidence ?? obj.scores;
    if (Array.isArray(names) && Array.isArray(confs) && names.length === confs.length && names.length > 0) {
      names.forEach((name, i) => {
        if (typeof name === 'string') {
          const conf = typeof confs[i] === 'number' ? (confs[i] as number) : Number(confs[i]);
          if (Number.isFinite(conf)) {
            out.push({ class: name, confidence: conf > 1 ? conf / 100 : conf });
          }
        }
      });
    }

    const cls = readClassName(obj);
    const confidence = readConfidence(obj);
    if (cls && confidence != null) {
      const numeric = (key: string): number | undefined => {
        const value = obj[key];
        const parsed = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      };
      out.push({
        class: cls,
        confidence,
        x: numeric('x'),
        y: numeric('y'),
        width: numeric('width'),
        height: numeric('height'),
      });
    }
    for (const key of Object.keys(obj)) {
      if (SKIP_RECURSE_KEYS.has(key)) continue;
      extractPredictions(obj[key], out);
    }
  }
  return out;
}

export interface WorkflowHints {
  primaryIssue: string | null;
  severity: string | null;
  issueClasses: string[];
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t ? t : null;
}

/** Read primary_issue / severity / issue_classes from a workflow output entry. */
export function extractWorkflowHints(node: unknown): WorkflowHints {
  const hints: WorkflowHints = { primaryIssue: null, severity: null, issueClasses: [] };
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      if (value.length > 0 && value.every((item) => typeof item === 'string')) {
        for (const item of value) {
          const s = asNonEmptyString(item);
          if (s) hints.issueClasses.push(s);
        }
        return;
      }
      for (const item of value) visit(item);
      return;
    }
    const obj = value as Record<string, unknown>;
    if (!hints.primaryIssue) {
      hints.primaryIssue =
        asNonEmptyString(obj.primary_issue) ?? asNonEmptyString(obj.primaryIssue) ?? null;
    }
    if (!hints.severity) {
      hints.severity = asNonEmptyString(obj.severity) ?? null;
    }
    if (Array.isArray(obj.issue_classes)) visit(obj.issue_classes);
    for (const key of Object.keys(obj)) {
      if (
        SKIP_RECURSE_KEYS.has(key) ||
        key === 'predictions' ||
        key === 'filtered_predictions' ||
        key === 'output_image'
      ) {
        continue;
      }
      visit(obj[key]);
    }
  };
  visit(node);
  return hints;
}

const ANNOTATED_IMAGE_KEYS = [
  'output_image',
  'visualization',
  'visualisation',
  'annotated_image',
  'label_visualization',
];

function asImageDataUrl(obj: Record<string, unknown>): string | null {
  const value = obj.value;
  if (typeof value !== 'string' || value.length < 80) return null;
  if (value.startsWith('data:image/')) return value;
  if (obj.type === 'base64' || obj.type === 'jpeg' || obj.type === 'jpg' || obj.type === 'png') {
    return `data:image/jpeg;base64,${value}`;
  }
  return null;
}

/**
 * Find the workflow's annotated JPEG. Prefer known output names and never
 * walk SAM3 polygon `points` or prediction arrays — those are huge on mobile
 * and used to prevent the preview from being attached.
 */
export function extractAnnotatedImage(node: unknown): string | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = extractAnnotatedImage(item);
      if (found) return found;
    }
    return null;
  }
  if (!node || typeof node !== 'object') return null;
  const obj = node as Record<string, unknown>;
  const direct = asImageDataUrl(obj);
  if (direct) return direct;
  for (const key of ANNOTATED_IMAGE_KEYS) {
    if (key in obj) {
      const found = extractAnnotatedImage(obj[key]);
      if (found) return found;
    }
  }
  for (const [key, value] of Object.entries(obj)) {
    if (
      SKIP_RECURSE_KEYS.has(key) ||
      key === 'predictions' ||
      key === 'filtered_predictions' ||
      ANNOTATED_IMAGE_KEYS.includes(key)
    ) {
      continue;
    }
    const found = extractAnnotatedImage(value);
    if (found) return found;
  }
  return null;
}

function extractFrameSize(node: unknown): { width: number; height: number } | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = extractFrameSize(item);
      if (found) return found;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  const img = obj.image;
  if (img && typeof img === 'object') {
    const rec = img as Record<string, unknown>;
    const width = Number(rec.width);
    const height = Number(rec.height);
    if (width > 1 && height > 1) return { width, height };
  }
  for (const key of ['predictions', 'filtered_predictions']) {
    if (key in obj) {
      const found = extractFrameSize(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

/** Convert Roboflow centre/size pixels (or 0–1) into percent boxes for the UI. */
export function predictionsToPercentBoxes(
  predictions: RoboflowPrediction[],
  frame: { width: number; height: number } | null,
): import('@/types').AnalysisBox[] {
  const boxes: import('@/types').AnalysisBox[] = [];
  for (const prediction of predictions) {
    if (
      prediction.x == null ||
      prediction.y == null ||
      prediction.width == null ||
      prediction.height == null ||
      prediction.width <= 0 ||
      prediction.height <= 0
    ) {
      continue;
    }
    const normalized =
      Math.abs(prediction.x) <= 1 &&
      Math.abs(prediction.y) <= 1 &&
      Math.abs(prediction.width) <= 1 &&
      Math.abs(prediction.height) <= 1;
    const width = frame?.width && frame.width > 1 ? frame.width : 1;
    const height = frame?.height && frame.height > 1 ? frame.height : 1;
    const centerX = normalized ? prediction.x * 100 : (prediction.x / width) * 100;
    const centerY = normalized ? prediction.y * 100 : (prediction.y / height) * 100;
    const boxW = normalized ? prediction.width * 100 : (prediction.width / width) * 100;
    const boxH = normalized ? prediction.height * 100 : (prediction.height / height) * 100;
    const left = clamp(centerX - boxW / 2, 0, 100);
    const top = clamp(centerY - boxH / 2, 0, 100);
    const right = clamp(centerX + boxW / 2, 0, 100);
    const bottom = clamp(centerY + boxH / 2, 0, 100);
    if (right <= left || bottom <= top) continue;
    boxes.push({
      label: prediction.class,
      confidence: clamp(prediction.confidence, 0, 1),
      x: left,
      y: top,
      w: right - left,
      h: bottom - top,
    });
  }
  return boxes;
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

export interface RoboflowInference {
  predictions: RoboflowPrediction[];
  annotatedImage: string | null;
  primaryIssue: string | null;
  severityLabel: string | null;
  frameSize: { width: number; height: number } | null;
}

/**
 * Run one image through the same Roboflow target used by the report wizard.
 * Keeping this path shared is important: Live AI and Report AI cannot drift
 * onto different models or proxy payloads.
 */
async function runRoboflowInference(photo: string): Promise<RoboflowInference> {
  const match = /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,(.+)$/s.exec(photo);
  if (!match) throw new RoboflowError('Unsupported image format.');

  let data: unknown;
  let predictions: RoboflowPrediction[] = [];
  let annotatedImage: string | null = null;
  let primaryIssue: string | null = null;
  let severityLabel: string | null = null;
  let frameSize: { width: number; height: number } | null = null;

  if (WORKSPACE && WORKFLOW_ID) {
    data = await callProxy({ image: match[1], api_key: API_KEY });
    const outputs = (data as { outputs?: unknown[] })?.outputs ?? [];
    const roots = outputs.length > 0 ? outputs : [data];
    for (const entry of roots) {
      annotatedImage = annotatedImage ?? extractAnnotatedImage(entry);
      frameSize = frameSize ?? extractFrameSize(entry);
      const hints = extractWorkflowHints(entry);
      primaryIssue = primaryIssue ?? hints.primaryIssue;
      severityLabel = severityLabel ?? hints.severity;

      const record = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : null;
      // Prefer the primary-issue boxes (what the overlay labels show), then all SAM3 boxes.
      const filtered = record?.filtered_predictions
        ? extractPredictions(record.filtered_predictions)
        : [];
      const raw = record?.predictions ? extractPredictions(record.predictions) : [];
      const fromEntry = filtered.length > 0 ? filtered : raw.length > 0 ? raw : extractPredictions(entry);
      predictions = predictions.concat(fromEntry);
    }
  } else if (MODEL) {
    data = await callProxy({ image: match[1], api_key: API_KEY, model: MODEL });
    predictions = extractPredictions(data);
    annotatedImage = extractAnnotatedImage(data);
    frameSize = extractFrameSize(data);
  } else {
    throw new RoboflowError('No Roboflow target configured (workspace+workflow or model).');
  }

  return { predictions, annotatedImage, primaryIssue, severityLabel, frameSize };
}

/**
 * Analyze one live frame with the exact same Roboflow workflow/model used for
 * reports. Unlike the report result, this exposes every raw box so the live
 * page can draw detections across successive full-road frames.
 */
export async function detectFrameWithRoboflow(photo: string): Promise<RoboflowInference> {
  if (!hasRoboflowKey) {
    throw new RoboflowError('Roboflow is not configured (key + workspace/workflow or model).');
  }
  return runRoboflowInference(photo);
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

  const { predictions, annotatedImage, primaryIssue, severityLabel, frameSize } =
    await runRoboflowInference(photo);
  base.annotatedImage = annotatedImage;

  const primaryIsNone = !primaryIssue || /^no issue$/i.test(primaryIssue);
  const primaryCategory = !primaryIsNone && primaryIssue ? mapClass(primaryIssue) : null;
  const usefulPrimary = primaryCategory && primaryCategory !== 'other' ? primaryCategory : null;

  // A named Roboflow issue (Pothole, Garbage Accumulation, …) counts even if
  // the box list is empty — that used to become a fake 20% "Other Infrastructure".
  if (predictions.length === 0 && !usefulPrimary && primaryIsNone) {
    base.description = 'The model did not detect any known civic issue in this photo.';
    return base;
  }

  const boxes: Prediction[] =
    predictions.length > 0
      ? predictions
      : primaryIssue
        ? [{ class: primaryIssue, confidence: 0.7 }]
        : [];

  const verdict = aggregateVerdict(boxes);
  // Use the same class Roboflow labelled on the image whenever it maps.
  const category = usefulPrimary ?? verdict.category;
  const matching = boxes.filter((p) => mapClass(p.class) === category);
  const confidence = clamp(
    matching.length > 0
      ? Math.max(...matching.map((p) => p.confidence))
      : verdict.confidence || (usefulPrimary ? 0.7 : 0),
    0,
    1,
  );
  const sev = severityFromWorkflowLabel(severityLabel) ?? severityFromConfidence(confidence);

  // Dedupe objects: each Roboflow class appears once, with its highest confidence.
  const classBest = new Map<string, number>();
  for (const prediction of boxes) {
    classBest.set(
      prediction.class,
      Math.max(classBest.get(prediction.class) ?? 0, prediction.confidence),
    );
  }
  const uniqueClasses = [...classBest.entries()].sort((a, b) => b[1] - a[1]);
  const objects = uniqueClasses
    .slice(0, 8)
    .map(([label, confidenceValue]) => `${label} (${Math.round(confidenceValue * 100)}%)`);

  const severityWord: Record<Severity, string> = {
    low: 'Minor',
    medium: 'Moderate',
    high: 'Significant',
    critical: 'Critical',
  };
  const listed = uniqueClasses
    .slice(0, 4)
    .map(([label, confidenceValue]) => `${label} (${Math.round(confidenceValue * 100)}% confidence)`)
    .join(', ');
  const dominant = categoryById(category).label;
  const shown = listed || dominant;
  const description =
    `${severityWord[sev]} ${dominant} detected in this photo. ` +
    `The image shows ${shown}. ` +
    `These are the top issues the model found in the scene; ` +
    (annotatedImage
      ? 'the annotated preview highlights exactly where each one is located.'
      : 'no annotated preview was returned for this image.');

  return {
    category,
    confidence,
    severity: sev,
    description,
    objects,
    coordinates,
    timestamp: new Date().toISOString(),
    tags: uniqueClasses.slice(0, 5).map(([label]) => label),
    imageQuality: quality,
    qualityNote: undefined,
    engine: 'roboflow',
    annotatedImage,
    boxes: predictionsToPercentBoxes(boxes, frameSize),
  };
}
