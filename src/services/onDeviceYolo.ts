import type { AnalysisResult, CategoryId, Coordinates } from '@/types';
import { ACCEPT_CONFIDENCE, clamp01, mapLabel, severityFromConfidence } from './onDeviceMap';

/**
 * CUSTOM ON-DEVICE YOLO engine (the "detect ALL civic issues" upgrade).
 *
 * The default on-device model (Xenova/yolos-tiny) only knows 80 general
 * COCO classes, so it can't see potholes/garbage/manholes. The fix is a
 * YOLOv8 / YOLO11 model fine-tuned on YOUR civic categories (train for free
 * on Roboflow), exported to ONNX, hosted anywhere with CORS (GitHub raw,
 * Hugging Face, jsDelivr…), and pointed at with env vars:
 *
 *   VITE_ONDEVICE_YOLO_URL    = https://…/model.onnx   (required to activate)
 *   VITE_ONDEVICE_YOLO_LABELS = pothole,garbage,manhole,… (class names in order)
 *   VITE_ONDEVICE_YOLO_SIZE   = 640        (model input size, default 640)
 *   VITE_ONDEVICE_YOLO_CONF   = 0.35       (minimum box confidence)
 *
 * Supports the two common YOLO ONNX output layouts:
 *  - raw  [1, 4+N, 8400] or [1, 8400, 4+N]  (cx,cy,w,h + class scores)
 *  - NMS'd [1, N, 6]                        (x1,y1,x2,y2,score,class)
 * Runs on onnxruntime-web (WASM) — the same runtime Transformers.js uses,
 * so no extra install beyond the dependency already in package.json.
 */

const YOLO_URL = import.meta.env.VITE_ONDEVICE_YOLO_URL?.trim() ?? '';
const YOLO_LABELS = (String(import.meta.env.VITE_ONDEVICE_YOLO_LABELS ?? '').trim() ?? '')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean);
const YOLO_SIZE = Number(import.meta.env.VITE_ONDEVICE_YOLO_SIZE) || 640;
const YOLO_CONF = Number(import.meta.env.VITE_ONDEVICE_YOLO_CONF) || ACCEPT_CONFIDENCE;

export const customYoloEnabled = Boolean(YOLO_URL);

export interface YoloDetection {
  label: string;
  score: number;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
}

let sessionPromise: Promise<{ run: (input: Float32Array) => Promise<YoloDetection[]> } | null> | null = null;

/** Lazy singleton — creates the ONNX session once, caches it for the session. */
async function getSession(): Promise<{ run: (input: Float32Array) => Promise<YoloDetection[]> } | null> {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    const ort = await import('onnxruntime-web');
    const session = await ort.InferenceSession.create(YOLO_URL, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    return {
      async run(input: Float32Array): Promise<YoloDetection[]> {
        const tensor = new ort.Tensor('float32', input, [1, 3, YOLO_SIZE, YOLO_SIZE]);
        const inputName = session.inputNames[0];
        if (!inputName) throw new Error('Model has no declared input.');
        const results = await session.run({ [inputName]: tensor });
        const outputs = Object.values(results);
        if (outputs.length === 0) return [];
        const out = outputs[0];
        const data = out.data as Float32Array;
        const dims = out.dims ?? [];
        return decodeYoloOutput(data, dims, YOLO_SIZE, YOLO_SIZE, YOLO_CONF, YOLO_LABELS);
      },
    };
  })().catch((err) => {
    console.warn('[CivicEye] failed to load custom YOLO ONNX session:', err);
    return null;
  });
  return sessionPromise;
}

/** Letterbox the image to SIZE×SIZE and return a CHW float32 tensor + geometry. */
async function preprocess(photo: string): Promise<{
  tensor: Float32Array;
  scale: number;
  padX: number;
  padY: number;
  imgW: number;
  imgH: number;
}> {
  const img = new Image();
  img.src = photo;
  await img.decode();

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const scale = Math.min(YOLO_SIZE / imgW, YOLO_SIZE / imgH);
  const nw = Math.max(1, Math.round(imgW * scale));
  const nh = Math.max(1, Math.round(imgH * scale));
  const padX = (YOLO_SIZE - nw) / 2;
  const padY = (YOLO_SIZE - nh) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = YOLO_SIZE;
  canvas.height = YOLO_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not available.');
  ctx.fillStyle = '#727272'; // YOLO letterbox gray (114/255)
  ctx.fillRect(0, 0, YOLO_SIZE, YOLO_SIZE);
  ctx.drawImage(img, padX, padY, nw, nh);

  const { data } = ctx.getImageData(0, 0, YOLO_SIZE, YOLO_SIZE);
  const n = YOLO_SIZE * YOLO_SIZE;
  const tensor = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    tensor[i] = data[p] / 255;
    tensor[n + i] = data[p + 1] / 255;
    tensor[2 * n + i] = data[p + 2] / 255;
  }
  return { tensor, scale, padX, padY, imgW, imgH };
}

/** Decode YOLO output into detections in ORIGINAL image coordinates. */
function decodeYoloOutput(
  data: Float32Array,
  dims: readonly number[],
  imgW: number,
  imgH: number,
  conf: number,
  labels: string[],
): YoloDetection[] {
  if (dims.length < 3) return [];
  const d1 = dims[1];
  const d2 = dims[2];
  const stride = Math.min(d1, d2);
  const count = Math.max(d1, d2);

  const labelOf = (idx: number) => labels[idx] ?? `class-${idx}`;

  // NMS'd end-to-end export: [1, N, 6] → x1,y1,x2,y2,score,class
  if (stride === 6) {
    const out: YoloDetection[] = [];
    for (let i = 0; i < count; i++) {
      const o = i * 6;
      const score = data[o + 4];
      if (score < conf) continue;
      const cls = Math.round(data[o + 5]);
      out.push({
        label: labelOf(cls),
        score,
        box: {
          xmin: data[o],
          ymin: data[o + 1],
          xmax: data[o + 2],
          ymax: data[o + 3],
        },
      });
    }
    return out;
  }

  // Raw export: [1, 4+N, anchors] or [1, anchors, 4+N]
  const boxes: YoloDetection[] = [];
  for (let i = 0; i < count; i++) {
    const o = i * stride;
    const cx = data[o];
    const cy = data[o + 1];
    const w = data[o + 2];
    const h = data[o + 3];
    if (w <= 0 || h <= 0) continue;

    let best = 0;
    let bestScore = 0;
    for (let c = 4; c < stride; c++) {
      const s = data[o + c];
      if (s > bestScore) {
        bestScore = s;
        best = c - 4;
      }
    }
    if (bestScore < conf) continue;

    const x1 = (cx - w / 2) * imgW;
    const y1 = (cy - h / 2) * imgH;
    const x2 = (cx + w / 2) * imgW;
    const y2 = (cy + h / 2) * imgH;
    boxes.push({
      label: labelOf(best),
      score: bestScore,
      box: { xmin: x1, ymin: y1, xmax: x2, ymax: y2 },
    });
  }
  return nms(boxes, 0.45);
}

/** Class-aware Non-Maximum Suppression. */
function nms(boxes: YoloDetection[], iouTh: number): YoloDetection[] {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const kept: YoloDetection[] = [];
  for (const b of sorted) {
    const overlaps = kept.some((k) => {
      if (k.label !== b.label) return false;
      return iou(b.box, k.box) >= iouTh;
    });
    if (!overlaps) kept.push(b);
    if (kept.length >= 64) break;
  }
  return kept;
}

function iou(
  a: { xmin: number; ymin: number; xmax: number; ymax: number },
  b: { xmin: number; ymin: number; xmax: number; ymax: number },
): number {
  const x1 = Math.max(a.xmin, b.xmin);
  const y1 = Math.max(a.ymin, b.ymin);
  const x2 = Math.min(a.xmax, b.xmax);
  const y2 = Math.min(a.ymax, b.ymax);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = (a.xmax - a.xmin) * (a.ymax - a.ymin) + (b.xmax - b.xmin) * (b.ymax - b.ymin) - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * Run the custom YOLO model on a photo. Returns a verdict in the same shape
 * as the Transformers.js engine; `confident` is true when a detection maps
 * to a real civic category above the confidence threshold.
 */
export async function analyzeWithCustomYolo(
  photo: string,
  coordinates: Coordinates | null,
  quality: AnalysisResult['imageQuality'],
): Promise<{ confident: boolean; result: AnalysisResult }> {
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

  const session = await getSession();
  if (!session) throw new Error('Custom YOLO session unavailable.');

  const { tensor, scale, padX, padY } = await preprocess(photo);
  const detections = await session.run(tensor);

  // Map boxes back from the letterboxed space to original photo coordinates.
  const mapped = detections
    .map((d) => ({
      label: d.label,
      score: d.score,
      box: {
        xmin: (d.box.xmin - padX) / scale,
        ymin: (d.box.ymin - padY) / scale,
        xmax: (d.box.xmax - padX) / scale,
        ymax: (d.box.ymax - padY) / scale,
      },
    }))
    .sort((a, b) => b.score - a.score);

  if (mapped.length === 0) {
    base.description = 'Custom on-device model found no objects in this photo.';
    return { confident: false, result: base };
  }

  const confidentMatch =
    mapped.find((d) => mapLabel(d.label) !== 'other' && d.score >= ACCEPT_CONFIDENCE) ?? null;
  const category: CategoryId = confidentMatch ? mapLabel(confidentMatch.label) : 'other';

  base.objects = mapped.slice(0, 6).map((d) => `${d.label} (${Math.round(d.score * 100)}%)`);
  base.tags = mapped.slice(0, 5).map((d) => d.label);
  base.confidence = clamp01(mapped[0].score);
  base.category = category;
  base.severity = severityFromConfidence(confidentMatch ? confidentMatch.score : mapped[0].score);
  base.description =
    `Analysed on your device (custom civic model): top detection "${mapped[0].label}" at ` +
    `${Math.round(mapped[0].score * 100)}%. ` +
    (confidentMatch
      ? `Maps to ${category.replace(/-/g, ' ')}.`
      : 'No specific civic issue recognised on-device — the cloud engine will take a closer look.');

  return { confident: Boolean(confidentMatch), result: base };
}
