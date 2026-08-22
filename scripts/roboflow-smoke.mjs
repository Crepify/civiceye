/**
 * Roboflow workflow — smoke test.
 *
 * Runs the real "CivicEye Pothole Reporting Starter" workflow once against
 * a sample image and asserts the response matches the grounded contract:
 *   { outputs: [ { output_image: { type: 'base64', value: <jpeg> } } ] }
 *
 * Usage:
 *   RF_KEY=<your roboflow api key> node scripts/roboflow-smoke.mjs
 *
 * The API key must come from the environment (never hard-coded).
 * Image outputs are decoded and written to /tmp for verification; only
 * byte sizes are logged — never the raw base64.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const KEY = process.env.RF_KEY ?? process.env.VITE_ROBOFLOW_API_KEY ?? '';
const WORKSPACE = process.env.RF_WORKSPACE ?? 'aswathram-kumar';
const WORKFLOW_ID = process.env.RF_WORKFLOW_ID ?? 'civiceye-pothole-reporting-starter-1786336062967';
const SAMPLE = resolve('public/reports/pothole.jpg');
const OUT = '/tmp/roboflow-annotated.jpg';

if (!KEY) {
  console.error('❌ Set RF_KEY=<your roboflow api key> before running.');
  process.exit(1);
}
if (!existsSync(SAMPLE)) {
  console.error(`❌ Sample image not found: ${SAMPLE}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runWorkflow(b64) {
  const url = `https://serverless.roboflow.com/${WORKSPACE}/workflows/${WORKFLOW_ID}`;
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: KEY, inputs: { image: { type: 'base64', value: b64 } } }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (res.ok) return res.json();
      if ((res.status === 429 || res.status >= 500) && attempt < 2) {
        await sleep(500 * 2 ** attempt);
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await sleep(500 * 2 ** attempt);
    }
  }
  throw lastErr;
}

// Mirror of the parser in src/services/roboflowService.ts (kept in sync).
function extractAnnotatedImage(node) {
  if (Array.isArray(node)) {
    for (const item of node) {
      const f = extractAnnotatedImage(item);
      if (f) return f;
    }
    return null;
  }
  if (node && typeof node === 'object') {
    const o = node;
    if (typeof o.type === 'string' && o.type === 'base64' && typeof o.value === 'string' && o.value.length > 0) {
      return o.value;
    }
    for (const k of Object.keys(o)) {
      const f = extractAnnotatedImage(o[k]);
      if (f) return f;
    }
  }
  return null;
}

const b64 = readFileSync(SAMPLE).toString('base64');
console.log(`🔍 Running workflow ${WORKSPACE}/${WORKFLOW_ID} on ${SAMPLE}…`);

const data = await runWorkflow(b64);

// Assertions on the grounded contract
const outputs = data?.outputs;
if (!Array.isArray(outputs) || outputs.length === 0) {
  console.error('❌ Expected `outputs` array (length >= 1) in the response.');
  console.error('   Got:', JSON.stringify(Object.keys(data ?? {})).slice(0, 200));
  process.exit(1);
}
console.log(`✅ outputs array present (${outputs.length} entry).`);

const annotatedB64 = extractAnnotatedImage(outputs[0]);
if (!annotatedB64) {
  console.error('❌ No base64 image output found in outputs[0].');
  console.error('   outputs[0] keys:', Object.keys(outputs[0] ?? {}).join(', '));
  process.exit(1);
}
console.log(`✅ annotated image found (base64 length ${annotatedB64.length}).`);

// Decode + write to disk; log size only.
const buf = Buffer.from(annotatedB64, 'base64');
writeFileSync(OUT, buf);
console.log(`✅ decoded & wrote ${buf.length} bytes → ${OUT}`);

if (buf.length < 10_000) {
  console.error('❌ Annotated image suspiciously small — may not be a real JPEG.');
  process.exit(1);
}

const entry = outputs[0] ?? {};
const primary = entry.primary_issue;
const preds = entry.predictions?.predictions ?? entry.predictions;
if (Array.isArray(preds) && preds.length > 0) {
  const sample = preds.slice(0, 5).map((p) => `${p.class} (${Math.round((p.confidence ?? 0) * 100)}%)`);
  console.log(`✅ detections: ${sample.join(', ')}`);
} else if (typeof primary === 'string' && primary.trim()) {
  console.log(`✅ primary_issue: ${primary}`);
} else {
  console.log('ℹ️  No prediction boxes in this run (image-only).');
}

console.log('🎉 Smoke test passed.');
process.exit(0);
