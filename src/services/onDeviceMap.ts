import type { CategoryId, Severity } from '@/types';
import { CATEGORIES } from '@/data/categories';

/**
 * Shared on-device label → category mapping.
 * Used by BOTH engines that run in the browser:
 *  - the general Transformers.js model (COCO labels like "traffic light")
 *  - a custom YOLO ONNX model trained on civic issues (labels like "pothole")
 *
 * A label wins if:
 *  1. it's in the explicit COCO map below, OR
 *  2. it matches a real category id (hyphens, case-insensitive), OR
 *  3. it matches an alias ("trash" → garbage, "potholes" → pothole …)
 * Otherwise it maps to "other".
 */

export const ACCEPT_CONFIDENCE = 0.35;

/** COCO-style labels the general model can see → CivicEye categories. */
const COCO_MAP: Record<string, CategoryId> = {
  'traffic light': 'traffic-signal',
  'traffic-light': 'traffic-signal',
  'stop sign': 'traffic-signal',
  'fire hydrant': 'water-leakage',
  person: 'security',
};

/** Friendly aliases for labels a civic-trained model might use. */
const ALIASES: Record<string, CategoryId> = {
  potholes: 'pothole',
  'broken road': 'broken-road',
  trash: 'garbage',
  rubbish: 'garbage',
  waste: 'garbage',
  litter: 'garbage',
  'garbage pile': 'garbage',
  'open manhole': 'manhole',
  'missing manhole cover': 'manhole',
  'manhole cover': 'manhole',
  'fallen tree': 'fallen-tree',
  'street light': 'street-light',
  'streetlight': 'street-light',
  'water leak': 'water-leakage',
  'leaking pipe': 'water-leakage',
  'sewage overflow': 'sewage',
  'sewer overflow': 'sewage',
  'illegal dumping': 'illegal-dumping',
  'dumped waste': 'illegal-dumping',
  'dumped debris': 'illegal-dumping',
  debris: 'garbage',
  'construction debris': 'illegal-dumping',
  accident: 'accident',
  collision: 'accident',
  crash: 'accident',
  'suspicious person': 'security',
  'unattended bag': 'security',
};

/** Set of valid category ids (used to accept custom model labels verbatim). */
const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

export function mapLabel(label: string): CategoryId {
  const key = label.trim().toLowerCase();
  if (COCO_MAP[key]) return COCO_MAP[key];
  if (ALIASES[key]) return ALIASES[key];
  const hyphenated = key.replace(/[\s_]+/g, '-');
  if (VALID_CATEGORIES.has(hyphenated)) return hyphenated as CategoryId;
  return 'other';
}

export function severityFromConfidence(score: number): Severity {
  if (score > 0.82) return 'critical';
  if (score > 0.68) return 'high';
  if (score > 0.5) return 'medium';
  return 'low';
}

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
