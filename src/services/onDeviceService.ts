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
