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
      'Content-Type': 'image/jpeg',
    },
    body: bytes,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 503 || res.status === 429) throw new Error(`HF busy/rate-limited (${res.status})`);
    throw new Error(`HF error ${res.status}: ${text.slice(0, 120)}`);
  }

  const detections = (await res.json()) as HFDetection[];
  const ranked = detections
    .filter((d) => typeof d.score === 'number' && typeof d.label === 'string')
    .sort((a, b) => b.score - a.score);

  const quality = await detectBlur(photo);

  if (ranked.length === 0) {
    return {
      category: 'other',
      confidence: 0.15,
      severity: 'low',
      description: 'Hugging Face model found no objects in this photo.',
      objects: [],
      coordinates,
      timestamp: new Date().toISOString(),
      tags: [],
      imageQuality: quality,
      engine: 'huggingface',
    };
  }

  const top = ranked[0];
  const confidence = clamp(Number(top.score) || 0, 0, 1);
  const category = mapLabel(top.label);
  const objects = ranked.slice(0, 8).map((d) => `${d.label} (${Math.round(d.score * 100)}%)`);

  return {
    category,
    confidence,
    severity: severityFromConfidence(confidence),
    description:
      `Hugging Face detected: ${top.label} (${Math.round(confidence * 100)}%). ` +
      `${ranked.length} object type(s) found.`,
    objects,
    coordinates,
    timestamp: new Date().toISOString(),
    tags: ranked.slice(0, 5).map((d) => d.label),
    imageQuality: quality,
    engine: 'huggingface',
  };
}
