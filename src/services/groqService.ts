import type { AnalysisResult, CategoryId, Coordinates, Severity } from '@/types';
import { categoryById } from '@/data/categories';

/**
 * Groq vision engine (free tier, no card) — Llama 3.2 90B Vision.
 * Drop-in second provider: used when Gemini is unavailable/rate-limited.
 * Set VITE_GROQ_API_KEY in your environment to activate.
 */

const API_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim() ?? '';
// Current Groq vision model (free tier). Override via VITE_GROQ_MODEL.
const MODEL = import.meta.env.VITE_GROQ_MODEL?.trim() || 'qwen/qwen3.6-27b';

export const hasGroqKey = Boolean(API_KEY);

const CATEGORY_ENUM = [
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

const PROMPT = `You are a civic inspection AI for an app that detects problems in photos.
Analyze the attached image and reply with ONLY ONE JSON OBJECT.
Do NOT think out loud. Do NOT include markdown, explanations or extra text. Output the JSON only.

1) IMAGE QUALITY: return one of "clear" | "blurry" | "unclear" | "low-light".
   Be honest: blurry = out of focus/motion blur; unclear = subject too far or obstructed; low-light = too dark.
2) DETECTION: if a civic issue is visible, classify into one of:
   ${CATEGORY_ENUM.join(', ')}.
   (pothole, broken-road, garbage, sidewalk, manhole, fallen-tree, street-light,
    water-leakage, sewage, illegal-dumping, traffic-signal, accident=collision/crash,
    security=suspicious activity, other=anything else). If nothing clear, use "other" with low confidence.
3) SEVERITY: low | medium | high | critical.

JSON schema:
{"category":"<one of the above>","confidence":<0.0 to 1.0>,"severity":"low|medium|high|critical","objects":["<visible objects>"],"summary":"<2-3 sentence factual description, only what is visible>","imageQuality":"clear|blurry|unclear|low-light","qualityNote":"<short reason>"}`;

/** Parse model output defensively (strip markdown fences + think blocks). */
function parseModelJson(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '');
  // Qwen models emit a <think> reasoning block before the answer.
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  // If any leading prose exists before the JSON, skip it.
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model returned no JSON.');
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    // Fallback: try extracting just the first JSON object.
    const first = cleaned.slice(start);
    const depthScan = first.split('');
    let depth = 0;
    let objEnd = -1;
    for (let i = 0; i < depthScan.length; i++) {
      const ch = depthScan[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          objEnd = i + 1;
          break;
        }
      }
    }
    if (objEnd === -1) throw new Error('Model returned unparseable JSON.');
    return JSON.parse(first.slice(0, objEnd)) as Record<string, unknown>;
  }
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

/** Run REAL analysis via Groq's Llama 3.2 vision model. Throws on failure. */
export async function analyzePhotoWithGroq(
  photo: string,
  coordinates: Coordinates | null,
): Promise<AnalysisResult> {
  if (!hasGroqKey) throw new Error('VITE_GROQ_API_KEY is not configured.');

  const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/s.exec(photo);
  if (!match) throw new Error('Unsupported image format.');
  const mime = match[1];
  const b64 = match[2];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 700,
      // NOTE: we intentionally do NOT use response_format json_object —
      // qwen models emit a <think> block and strict JSON validation
      // rejects it with "json_validate_failed". Our parser strips the
      // think block and extracts the JSON object itself.
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 429) throw new Error('Groq rate limited (429).');
    throw new Error(`Groq error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned no content.');

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
    engine: 'groq',
  };
}
