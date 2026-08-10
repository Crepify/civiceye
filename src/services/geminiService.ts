import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { categoryById } from '@/data/categories';

/**
 * REAL image analysis via a hosted vision model (free tier).
 *
 * Default: Google Gemini (gemini-2.0-flash / gemini-1.5-flash) — free
 * via Google AI Studio, no credit card required. The model:
 *   1. Judges photo quality (clear / blurry / unclear / low-light)
 *   2. Detects the issue (pothole, accident, broken traffic light, …)
 *   3. Returns confidence, severity, objects and a grounded summary
 *
 * Set VITE_GEMINI_API_KEY in your environment to activate it.
 * Without a key, the app falls back to the built-in mock estimate.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? '';
const MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || 'gemini-2.0-flash';

export const hasGeminiKey = Boolean(API_KEY);

/** All category ids the model may return (matches our DB constraint). */
const CATEGORY_ENUM: string[] = [
  'pothole',
  'broken-road',
  'garbage',
  'sidewalk',
  'manhole',
  'fallen-tree',
  'street-light',
  'water-leakage',
  'sewage',
  'illegal-dumping',
  'traffic-signal',
  'accident',
  'security',
  'other',
];

const SYSTEM_PROMPT = `You are a civic inspection AI for the "Amrita Eye / CivicEye" app.
Analyze the attached photo (it may come from any phone camera).

TASK 1 — IMAGE QUALITY: decide if the photo is usable.
Return one of: "clear" | "blurry" | "unclear" | "low-light".
- "blurry": out of focus, motion blur, too pixelated.
- "unclear": subject too far, obstructed, or nothing recognizable.
- "low-light": too dark to judge reliably.
Be honest — this warning protects users from false reports.

TASK 2 — ISSUE DETECTION: if the photo shows a civic issue, classify it.
Categories: ${CATEGORY_ENUM.join(', ')}.
- pothole, broken-road, garbage, sidewalk, manhole, fallen-tree,
  street-light, water-leakage, sewage, illegal-dumping, traffic-signal,
  accident (vehicle collision / crash scene), security (suspicious
  activity / unattended bags / forced entry), other (anything else).
If no clear civic issue is visible, use "other" and set confidence low.

TASK 3 — SEVERITY (how urgent/risky): low | medium | high | critical.

Reply with ONLY JSON (no markdown, no extra text):
{
  "category": "<one of the above>",
  "confidence": <0.0 to 1.0>,
  "severity": "low|medium|high|critical",
  "objects": ["<visible objects related to the issue>"],
  "summary": "<2-3 sentence factual description, only what is visible>",
  "imageQuality": "clear|blurry|unclear|low-light",
  "qualityNote": "<one short sentence explaining the quality verdict>"
}`;

/** Parse model output defensively (strip markdown fences + think blocks). */
function parseModelJson(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '');
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model returned no JSON.');
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function toCategoryId(value: unknown): CategoryId {
  const raw = String(value ?? '').trim().toLowerCase();
  if ((CATEGORY_ENUM as string[]).includes(raw)) return raw as CategoryId;
  return 'other';
}

function toSeverity(value: unknown): Severity {
  const raw = String(value ?? '').toLowerCase();
  if (['low', 'medium', 'high', 'critical'].includes(raw)) return raw as Severity;
  return 'medium';
}

function toQuality(value: unknown): AnalysisResult['imageQuality'] {
  const raw = String(value ?? '').toLowerCase();
  if (['clear', 'blurry', 'unclear', 'low-light'].includes(raw)) {
    return raw as AnalysisResult['imageQuality'];
  }
  return 'clear';
}

/**
 * Run REAL analysis on a photo (data URL) with the hosted vision model.
 * Throws on network/API errors — callers fall back to the mock.
 */
export async function analyzePhotoWithAI(
  photo: string,
  coordinates: Coordinates | null,
): Promise<AnalysisResult> {
  if (!hasGeminiKey) throw new Error('VITE_GEMINI_API_KEY is not configured.');

  // Extract mime + base64 from the data URL.
  const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/s.exec(photo);
  if (!match) throw new Error('Unsupported image format.');
  const mime = match[1];
  const b64 = match[2];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      MODEL,
    )}:generateContent?key=${encodeURIComponent(API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { inline_data: { mime_type: mime, data: b64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // 429 = free-tier rate limit → let the caller fall back to mock.
    if (res.status === 429) throw new Error('Rate limited (429). Try again in a minute.');
    throw new Error(`Vision API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Vision API returned no content.');

  const parsed = parseModelJson(text);
  const category = toCategoryId(parsed.category);
  const quality = toQuality(parsed.imageQuality);

  const objects = Array.isArray(parsed.objects)
    ? (parsed.objects as unknown[]).map(String).filter(Boolean).slice(0, 8)
    : [];

  const description =
    typeof parsed.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim()
      : categoryById(category).description;

  return {
    category,
    confidence: clamp(Number(parsed.confidence) || 0, 0, 1),
    severity: toSeverity(parsed.severity),
    description,
    objects,
    coordinates,
    timestamp: new Date().toISOString(),
    tags: objects,
    imageQuality: quality,
    qualityNote:
      typeof parsed.qualityNote === 'string' && parsed.qualityNote.trim()
        ? parsed.qualityNote.trim()
        : undefined,
    engine: 'gemini',
  };
}
