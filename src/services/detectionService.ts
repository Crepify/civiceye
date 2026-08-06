import type { CategoryId, Coordinates, Severity } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { severityFromScore } from './aiAnalysisService';

/**
 * Mock live-stream detection engine.
 *
 * Simulates a computer-vision pipeline running over CCTV feeds:
 * frame sampling → object detection → issue classification → event.
 *
 * In production this is a Python service (FastAPI + YOLOv8) consuming
 * RTSP/HLS streams — see LIVESTREAM_DETECTION.md. The contract below is
 * intentionally identical to what that service would emit, so swapping
 * the mock for real detections is a drop-in change.
 */

export interface LiveCamera {
  id: string;
  name: string;
  area: string;
  coords: Coordinates;
  streamLabel: string;
}

/** Mock CCTV cameras spread across the city. */
export const LIVE_CAMERAS: LiveCamera[] = [
  {
    id: 'CAM-01',
    name: 'Koramangala 80ft Rd',
    area: 'Koramangala, Bengaluru',
    coords: { lat: 12.9352, lng: 77.6245 },
    streamLabel: 'CCTV-KMG-01',
  },
  {
    id: 'CAM-02',
    name: 'MG Road Junction',
    area: 'MG Road, Bengaluru',
    coords: { lat: 12.9757, lng: 77.604 },
    streamLabel: 'CCTV-MGR-02',
  },
  {
    id: 'CAM-03',
    name: 'Indiranagar 12th Main',
    area: 'Indiranagar, Bengaluru',
    coords: { lat: 12.9784, lng: 77.6408 },
    streamLabel: 'CCTV-IDN-03',
  },
  {
    id: 'CAM-04',
    name: 'HSR Ring Road',
    area: 'HSR Layout, Bengaluru',
    coords: { lat: 12.9116, lng: 77.6372 },
    streamLabel: 'CCTV-HSR-04',
  },
];

/** A bounding box as percentages of the frame (0–100). */
export interface DetectionBox {
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DetectionResult {
  frameIndex: number;
  camera: LiveCamera;
  /** Null when the model decides the scene is clear. */
  category: CategoryId | null;
  confidence: number;
  severity: Severity;
  boxes: DetectionBox[];
  timestamp: string;
  image: string;
  summary: string;
}

/** Label pools per category for the mock object detector. */
const DETECTION_LABELS: Record<CategoryId, string[]> = {
  pothole: ['pothole', 'asphalt crack', 'road damage'],
  'broken-road': ['eroded road', 'cracked surface', 'gravel patch'],
  garbage: ['waste pile', 'overflowing bin', 'litter'],
  sidewalk: ['broken slab', 'uneven tiles', 'trip hazard'],
  manhole: ['open manhole', 'missing cover', 'exposed shaft'],
  'fallen-tree': ['fallen tree', 'blocked path', 'uprooted trunk'],
  'street-light': ['dark lamp', 'damaged pole', 'flickering light'],
  'water-leakage': ['burst pipe', 'water flow', 'road flooding'],
  sewage: ['sewage overflow', 'blocked drain', 'flooded gutter'],
  'illegal-dumping': ['debris dump', 'construction rubble', 'illegal waste'],
  'traffic-signal': ['dark signal', 'damaged signal', 'stuck light'],
  accident: ['collision', 'damaged vehicle', 'crash debris'],
  security: ['unattended bag', 'restricted area intrusion', 'suspicious person'],
  other: ['structure damage', 'public hazard'],
};

/** Category weights for the simulated stream (accidents are rarer). */
const CATEGORY_WEIGHTS: Array<[CategoryId | 'clear', number]> = [
  ['clear', 18],
  ['pothole', 14],
  ['broken-road', 10],
  ['garbage', 12],
  ['sidewalk', 8],
  ['manhole', 6],
  ['fallen-tree', 5],
  ['street-light', 9],
  ['water-leakage', 6],
  ['sewage', 5],
  ['illegal-dumping', 5],
  ['traffic-signal', 6],
  ['accident', 4],
  ['other', 4],
];

/* ------------------------- deterministic PRNG ------------------------- */

function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------ engine ------------------------------- */

function pickCategory(rand: () => number): CategoryId | 'clear' {
  const total = CATEGORY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let roll = rand() * total;
  for (const [cat, w] of CATEGORY_WEIGHTS) {
    roll -= w;
    if (roll <= 0) return cat;
  }
  return 'clear';
}

/** Evaluate one frame of one camera — deterministic per (camera, frame). */
export function detectFrame(camera: LiveCamera, frameIndex: number): DetectionResult {
  const seed = hashString(`${camera.id}:${frameIndex}`);
  const rand = mulberry32(seed);
  const category = pickCategory(rand);

  const base = 0.55 + rand() * 0.43; // 0.55 – 0.98
  const confidence = Math.round(base * 100) / 100;
  const severity = severityFromScore(confidence);

  const boxes: DetectionBox[] = [];
  let summary = '';

  if (category !== 'clear') {
    const labels = DETECTION_LABELS[category];
    const count = 1 + Math.floor(rand() * 2);
    const used = new Set<string>();
    for (let i = 0; i < count; i++) {
      const pool = labels.filter((l) => !used.has(l));
      const label = pool[Math.floor(rand() * pool.length)] ?? labels[0];
      used.add(label);
      boxes.push({
        label,
        confidence: Math.round((confidence - rand() * 0.18) * 100) / 100,
        x: Math.round(6 + rand() * 58),
        y: Math.round(12 + rand() * 40),
        w: Math.round(18 + rand() * 30),
        h: Math.round(14 + rand() * 26),
      });
    }
    const meta = CATEGORIES.find((c) => c.id === category);
    summary = `Detected ${meta?.short.toLowerCase() ?? 'an issue'} on ${camera.name} (confidence ${Math.round(confidence * 100)}%).`;
  } else {
    summary = `Scene clear on ${camera.name} — no issues detected.`;
  }

  return {
    frameIndex,
    camera,
    category: category === 'clear' ? null : category,
    confidence,
    severity,
    boxes,
    timestamp: new Date().toISOString(),
    image: category === 'clear' ? '' : (CATEGORIES.find((c) => c.id === category)?.image ?? ''),
    summary,
  };
}
