import type { AnalysisResult, CategoryId, Coordinates } from '@/types';
import { detectBlur } from '@/utils/image';
import { ACCEPT_CONFIDENCE, clamp01, mapLabel, severityFromConfidence } from './onDeviceMap';
import { customYoloEnabled, analyzeWithCustomYolo } from './onDeviceYolo';

/**
 * ON-DEVICE AI engine — runs a real object-detection model in the browser
 * via Transformers.js (@huggingface/transformers).
 *
 * - Model runs on WASM/WebGPU locally: FREE, PRIVATE (photo never leaves the
 *   device), OFFLINE-capable after first download, no rate limits.
 * - The default model (Xenova/yolos-tiny) is trained on COCO — the 80 general
 *   everyday classes (person, car, traffic light…). It does NOT know civic
 *   issues (potholes, garbage, manholes…), so by default this engine only
 *   CLAIMS results it can map to a real category; everything else hands off
 *   to Roboflow/Hugging Face in the orchestrator.
 * - To make on-device detect ALL kinds of civic issues, point it at a custom
 *   YOLO ONNX model trained on YOUR categories (see onDeviceYolo.ts + docs):
 *     VITE_ONDEVICE_YOLO_URL / VITE_ONDEVICE_YOLO_LABELS
 *
 * Env:
 *   VITE_AI_ONDEVICE = 'true' (default true) | 'false'
 *   VITE_ONDEVICE_MODEL = 'Xenova/yolos-tiny' (small object-detection model)
 */

const MODEL = import.meta.env.VITE_ONDEVICE_MODEL?.trim() || 'Xenova/yolos-tiny';
const ENABLED = import.meta.env.VITE_AI_ONDEVICE !== 'false';

export const onDeviceEnabled = ENABLED;

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

export interface OnDeviceVerdict {
  /** True if the on-device model is confident enough to be the answer. */
  confident: boolean;
  result: AnalysisResult;
}

function verdictBase(coordinates: Coordinates | null, imageQuality: AnalysisResult['imageQuality']): AnalysisResult {
  return {
    category: 'other',
    confidence: 0,
    severity: 'low',
    description: '',
    objects: [],
    coordinates,
    timestamp: new Date().toISOString(),
    tags: [],
    imageQuality,
    engine: 'ondevice',
  };
}

/**
 * Turn a ranked list of {label, score} detections into a verdict.
 * Scans ALL detections (not just the top-1) and picks the HIGHEST-confidence
 * one that maps to a real civic category — so a scene with "car 0.9 +
 * person 0.5" correctly yields security 0.5 instead of giving up on "car".
 */
function verdictFromDetections(
  ranked: Array<{ label: string; score: number }>,
  coordinates: Coordinates | null,
  quality: AnalysisResult['imageQuality'],
  sourceNote: string,
): OnDeviceVerdict {
  const base = verdictBase(coordinates, quality);
  if (ranked.length === 0) {
    base.description = `${sourceNote} found no objects in this photo.`;
    return { confident: false, result: base };
  }

  const objects = ranked
    .slice(0, 6)
    .map((d) => `${d.label} (${Math.round(d.score * 100)}%)`);
  base.objects = objects;
  base.tags = ranked.slice(0, 5).map((d) => d.label);
  base.confidence = clamp01(ranked[0].score);

  // Best detection that actually maps to a civic category.
  const confidentMatch =
    ranked.find((d) => mapLabel(d.label) !== 'other' && d.score >= ACCEPT_CONFIDENCE) ?? null;
  const category: CategoryId = confidentMatch ? mapLabel(confidentMatch.label) : 'other';

  base.category = category;
  base.severity = severityFromConfidence(confidentMatch ? confidentMatch.score : ranked[0].score);
  base.description =
    `${sourceNote}: found ${ranked.length} object type(s) — ` +
    `top: ${ranked[0].label} (${Math.round(ranked[0].score * 100)}%). ` +
    (confidentMatch
      ? `Best match: "${confidentMatch.label}" → ${category.replace(/-/g, ' ')}.`
      : 'No specific civic issue recognised on-device — the cloud engine will take a closer look.');

  return { confident: Boolean(confidentMatch), result: base };
}

/**
 * Run on-device detection on a photo. Never throws for model issues — it
 * returns a low-confidence verdict so the orchestrator falls through to cloud.
 */
export async function analyzeOnDevice(photo: string, coordinates: Coordinates | null): Promise<OnDeviceVerdict> {
  const quality = await detectBlur(photo).catch(() => 'clear' as const);
  const base = verdictBase(coordinates, quality);

  if (!ENABLED) return { confident: false, result: base };

  // 1) Custom civic-trained YOLO model, if configured — this is the upgrade
  //    that detects potholes/garbage/manholes/etc. on-device.
  if (customYoloEnabled) {
    try {
      const verdict = await analyzeWithCustomYolo(photo, coordinates, quality);
      if (verdict.confident) return verdict;
      console.warn('[CivicEye] custom on-device YOLO not confident — trying the general model.');
    } catch (err) {
      console.warn('[CivicEye] custom on-device YOLO unavailable:', err);
    }
  }

  // 2) General Transformers.js model (COCO). Only claims civic categories
  //    it can map (traffic light / stop sign / fire hydrant / person).
  try {
    const detector = await getPipeline();
    const detections = await detector(photo);

    // Keep the top match per label, sorted by confidence.
    const bestByLabel = new Map<string, number>();
    for (const d of detections) {
      bestByLabel.set(d.label, Math.max(bestByLabel.get(d.label) ?? 0, d.score));
    }
    const ranked = [...bestByLabel.entries()].sort((a, b) => b[1] - a[1]);

    return verdictFromDetections(
      ranked.map(([label, score]) => ({ label, score })),
      coordinates,
      quality,
      'On-device model',
    );
  } catch (err) {
    base.description = 'On-device model unavailable on this browser.';
    console.warn('[CivicEye] on-device AI unavailable:', err);
    return { confident: false, result: base };
  }
}
