# CivicEye — On-Device AI System Handoff (for the AI/Live dev)

**Read this first.** You own the on-device detection engine. This document tells
you exactly how it works today, what you can build next, and how to verify your
changes. It is the *only* doc you need for this subsystem.

---

## 1. What the system is

CivicEye is a React 18 + TypeScript + Vite (v5) SPA that lets citizens report
civic issues (potholes, garbage, manholes, broken roads…). When a user uploads a
photo, the app runs an **AI analysis chain** and the **first engine that
succeeds wins**:

```
  user photo
      │
      ▼
 ① ON-DEVICE  Transformers.js model (general COCO: YOLOS-tiny)   — free, private, offline
      │        + OPTIONAL custom civic YOLO ONNX model (your job to wire/improve)
      ▼
 ② ROBOFLOW   CivicLENS — real object detection (cloud, trained on civic issues)
      ▼
 ③ HUGGING FACE Inference API (DETR) — cloud backup
      ▼
 ④ BUILT-IN MOCK — last resort, deterministic, clearly labelled
```

Orchestrator: `src/services/aiAnalysisService.ts` → `runImageAnalysis()`.

**Your subsystem = stage ①** (`src/services/onDeviceService.ts` and friends).
The stage only *claims* a result when it maps a detection to a real CivicEye
category with confidence ≥ `0.35`; otherwise it returns `confident: false` and
the orchestrator falls through to Roboflow. This guard must NEVER be removed —
it's what stops the app from confidently mislabelling photos.

---

## 2. Files you own (all in `src/services/`)

| File | Purpose |
|---|---|
| `onDeviceService.ts` | Main engine — loads the Transformers.js pipeline (lazy), runs it, produces the verdict. Tries the custom YOLO first, then the general model. |
| `onDeviceYolo.ts` | **Custom civic YOLO runtime** — loads a user-supplied ONNX model via `onnxruntime-web` (WASM), letterboxes, decodes YOLOv8/11 outputs, runs class-aware NMS. This is the "detect potholes on-device" path. |
| `onDeviceMap.ts` | Shared label → CivicEye category mapping (COCO labels, aliases like "trash"→garbage, and verbatim category-id match) + confidence→severity helpers. |
| `aiAnalysisService.ts` | Orchestrator (stage ① calls you; you don't own it, but understand the contract). |

Types you produce: `AnalysisResult` with `engine: 'ondevice'` (see
`src/types/index.ts`). The UI shows a badge
"🖥️ Analysed on your device (private & offline)" when you win
(`src/pages/ReportPage.tsx`).

---

## 3. How the on-device engine works (today)

### 3.1 Default model (Transformers.js)
- **Model:** `Xenova/yolos-tiny` (settable via `VITE_ONDEVICE_MODEL`).
- **Library:** `@huggingface/transformers@3.4.0` (pinned — do NOT bump to v4;
  its postinstall OOM-kills small machines; install with `--ignore-scripts`).
- **Runtime:** `onnxruntime-web` (WASM; WebGPU optional). The 24 MB wasm + ~833 KB
  JS are **lazy-loaded** — first analyse downloads them, browser caches them, so
  later runs work offline. Both chunks are bundled locally (no CDN).
- **Pipeline:** `pipeline('object-detection', MODEL, { dtype: 'q8' })` — quantized.
  Lazy singleton (`pipelinePromise`) so the heavy load happens once per session.
- **Accept logic:** it scans ALL detections (not just top-1) and picks the
  highest-confidence detection that maps to a real category ≥ 0.35. Example: a
  photo with `car 0.92, person 0.55` → `security` 0.55 wins (car maps to
  `other`). `confident = true` only when such a match exists.

### 3.2 Custom YOLO (the upgrade)
Activated by env (all optional):
```
VITE_ONDEVICE_YOLO_URL     = https://…/best.onnx        (required to activate)
VITE_ONDEVICE_YOLO_LABELS  = pothole,garbage,manhole,…   (class names IN ORDER)
VITE_ONDEVICE_YOLO_SIZE    = 640
VITE_ONDEVICE_YOLO_CONF    = 0.35
```
When set, `onDeviceService` calls `analyzeWithCustomYolo()` FIRST; only if that
isn't confident does it fall back to the general model.

`onDeviceYolo.ts` details:
- Lazy ONNX session via `onnxruntime-web` (`executionProviders: ['wasm']`).
- Preprocess: letterbox to 640×640 (gray 114), CHW float32 tensor `[1,3,640,640]`,
  normalized /255.
- Decodes BOTH common YOLO export layouts:
  - raw `[1, 4+N, 8400]` or `[1, 8400, 4+N]` (cx,cy,w,h + class scores)
  - end-to-end NMS `[1, N, 6]` (x1,y1,x2,y2,score,class)
- Class-aware NMS (IoU 0.45), boxes mapped back to original photo coords.
- Labels map through `onDeviceMap.mapLabel()`: exact category id match
  (hyphenated), aliases ("trash"→garbage, "potholes"→pothole…), else `other`.

---

## 4. How to get the model URL (answer to "all I need to do is add URL")

### 4a. Already have a trained Roboflow model? Use it on-device (5 min)

> **Your exact setup (workspace → Vercel serverless key):** the API key you
> linked to Vercel is only used for CLOUD calls (the proxy → serverless.roboflow.com).
> On-device doesn't need the key at all — it needs the **model file itself**
> (exported ONNX), which Roboflow lets you download from the same workspace. So:
> the cloud path = your key; the on-device path = your exported `best.onnx`. Both
> use the SAME trained model — same weights, same classes. You are not duplicating
> anything.

You don't need to retrain. Your trained Roboflow version is a YOLO model — the
app can run the SAME weights in the browser:

1. **Export ONNX:** app.roboflow.com → your project → the **trained version**
   (e.g. `v1`) → **Deploy** tab → **Export** → pick **ONNX** → Download.
   The zip contains `best.onnx` (or `weights/best.onnx`) + `data.yaml` /
   `metadata.yaml`.
2. **Host `best.onnx`** anywhere with CORS:
   - jsDelivr (easiest): push it to a GitHub repo → URL
     `https://cdn.jsdelivr.net/gh/{user}/{repo}@main/best.onnx`
   - or Hugging Face: `https://huggingface.co/{user}/{repo}/resolve/main/best.onnx`
   - or GitHub raw: `https://raw.githubusercontent.com/{user}/{repo}/main/best.onnx`
3. **Class labels = the `names:` list in `data.yaml`**, in order (index = class id):
   ```
   VITE_ONDEVICE_YOLO_URL=https://cdn.jsdelivr.net/gh/you/civiceye-models@main/best.onnx
   VITE_ONDEVICE_YOLO_LABELS=pothole,garbage,manhole,broken-road   ← EXACT order from data.yaml
   ```
4. **Input size:** if you trained at 640, leave `VITE_ONDEVICE_YOLO_SIZE=640`.
   If you trained at 416 or 1280, set it to that number (must match the model).
5. **Rebuild** (`npm run build`) → test with a photo → you should see
   `Analysed on your device (custom civic model)` and the 🖥️ badge — no cloud call.

**⚠️ Critical — class names must map to CivicEye categories.** `onDeviceMap.ts`
accepts a label if it matches a category id exactly (`pothole`, `broken-road`…)
or an alias (`trash`→garbage, `potholes`→pothole…). If your Roboflow class is
something CivicEye doesn't know (e.g. `pothole-cover-missing`), it maps to
`other` and the engine won't claim it (falls to cloud). Either name your classes
to match, or add entries to `onDeviceMap.ts` ALIASES.

### 4b. Train a fresh model from scratch (if you want a bigger/better one)

The URL is just the **web address of your exported ONNX model file**. You
produce it once, then anyone can paste it into `VITE_ONDEVICE_YOLO_URL`.

1. **Get a trained model** (free, no card):
   - Go to https://app.roboflow.com → Create Project → **Object Detection**.
   - Add images of your classes (search **Public Datasets** for "pothole",
     "garbage", "manhole" and Add them — fastest path). Annotate boxes; 50+
     images for a demo, 200+ for a product look.
   - **Generate** a version → **Train with Ultralytics** → **YOLOv8n** or
     **YOLO11n** (nano = fast on phones) → Train (free GPU, minutes).
2. **Export:** Deploy → Export → **ONNX** → download `best.onnx`.
3. **Host it somewhere with CORS** (any of these works):
   - **jsDelivr (easiest):** push the file to a GitHub repo, then the URL is
     `https://cdn.jsdelivr.net/gh/{user}/{repo}@main/best.onnx`
   - **Hugging Face:** create a model repo, upload, URL =
     `https://huggingface.co/{user}/{repo}/resolve/main/best.onnx`
   - **GitHub raw:** `https://raw.githubusercontent.com/{user}/{repo}/main/best.onnx`
4. **Set the env** (`.env` locally + Vercel dashboard for prod) and rebuild:
   ```
   VITE_ONDEVICE_YOLO_URL=https://cdn.jsdelivr.net/gh/you/civiceye-models@main/best.onnx
   VITE_ONDEVICE_YOLO_LABELS=pothole,garbage,manhole,broken-road,fallen-tree,street-light,sewage
   ```
   Label order MUST match the class order in the Roboflow export (index = class id).
5. Test with a real pothole photo — you should see
   `Analysed on your device (custom civic model)` and the on-device badge.

If the URL is wrong/CORS-blocked, the engine logs
`[CivicEye] custom on-device YOLO unavailable:` and falls back gracefully —
the app never crashes.

---

## 5. Env reference (your subsystem)

| Var | Default | Meaning |
|---|---|---|
| `VITE_AI_ONDEVICE` | `true` | Master switch (`'false'` disables stage ①) |
| `VITE_ONDEVICE_MODEL` | `Xenova/yolos-tiny` | Transformers.js model id |
| `VITE_ONDEVICE_YOLO_URL` | *(empty)* | Custom ONNX URL — activates custom engine |
| `VITE_ONDEVICE_YOLO_LABELS` | *(empty)* | Comma-separated class names, in order |
| `VITE_ONDEVICE_YOLO_SIZE` | `640` | Model input size |
| `VITE_ONDEVICE_YOLO_CONF` | `0.35` | Min box confidence |

Never commit real keys/URLs in code — `.env` is gitignored; `VITE_*` vars are
baked at build time.

---

## 6. Test & verify (run after every change)

```bash
cd civiceye
npm install --ignore-scripts        # ← ALWAYS this (v4 OOM gotcha)
npm run typecheck                   # 0 errors
npm run lint                        # 0 warnings
VITE_DEMO_MODE=true npm run build   # must end "✓ built"
npm run preview -- --port 4173 --strictPort
```
Then in the browser (DevTools → Console):
- First analyse downloads the model (~25 MB) — be patient; later runs are fast.
- Badge shows which engine won; `[CivicEye] … not confident` logs mean it
  correctly handed off (normal for general model on pothole photos).
- `VITE_DEMO_MODE=true` lets you run without logging in.

---

## 7. What you should build next (task list, pick any)

1. **Download-progress UI** — show "Downloading model (12 MB)…" instead of a
   blank spinner on first run (Transformers.js exposes `progress_callback`).
2. **WebGPU acceleration** — try `device: 'webgpu'` with WASM fallback; measure
   on a mid-range phone. (Known issue: YOLOS-tiny is slow on WebGPU — DETR and
   YOLO11 usually aren't; benchmark before shipping.)
3. **Offload to a Web Worker** — keep the UI thread free during inference
   (heavy detections currently block briefly).
4. **Fine-tuned model quality** — train YOLO11n on a bigger civic dataset
   (200–500 images/class), export q8-quantized ONNX, measure mAP vs inference
   time. Add a benchmark table to the README.
5. **Model warm-up** — preload the session on first idle (`requestIdleCallback`)
   so the first real analyse is instant.
6. **Better label coverage** — extend `onDeviceMap.ts` aliases + add a
   user-facing "what it saw" list (objects already exposed in the result card).
7. **Live camera** — the `/live` page already streams frames to Roboflow
   (~1 credit/frame!). Wire stage ① into `/live` so the on-device model runs
   free + unlimited there, and only escalate to Roboflow when unsure.
8. **Confidence calibration** — show a "low confidence — verify" hint when the
   winning score is close to the 0.35 floor.
9. **Cache API persistence** — pre-cache the ONNX + wasm in a Service Worker so
   repeat visits are fully offline.

## 8. Constraints & gotchas (do not break)

- Keep both heavy chunks **lazy** (dynamic `import()` only). The initial bundle
  must stay small.
- `@huggingface/transformers` stays at `^3.4.0`; install with `--ignore-scripts`.
- `onnxruntime-web` is a direct dep (needed by `onDeviceYolo.ts`); never add
  `onnxruntime-node` (huge native binary).
- The `confident` guard (≥ 0.35 + real category) is load-bearing — keep it.
- Don't reintroduce Groq anywhere in the chain (removed by owner).
- When you merge with teammates (A = UI, B = Amrita UI): use branches, never
  force-push; unzip into a CLEAN folder (zip-over leaves deleted files behind).
- After any env/deps change: `npm run typecheck && npm run lint && npm run build`.

---

## 9. Current known limitations (your starting point)

- General COCO model can't see potholes/garbage — that's WHY the custom YOLO
  path exists; until a model URL is set, on-device only confidently detects
  traffic lights / stop signs / fire hydrants / people.
- No WebGPU path yet; WASM only (works everywhere, slower on old phones).
- No download progress UI (first run can look "stuck").
- `/live` still burns Roboflow credits instead of using on-device first.
- `onnxruntime-web` loads two wasm variants (threaded + jsep) — both are bundled;
  verify tree-shaking isn't loading both on low-end devices.

Good luck — questions welcome. 🚀

---

## 10. Making on-device AI INSANELY good (playbook)

Ordered by impact. Doing items 1–3 gets you ~90% of the way.

### 1. Data beats everything (≈80% of the gain)
- **Use Roboflow Universe public datasets** to bootstrap each class in minutes:
  search "pothole", "garbage", "manhole", "broken road" → *Add to Project*.
  Combine 2–3 datasets per class, then dedupe/clean.
- **Volume target:** ≥ 100 annotated boxes/class (demo), 200–500/class (product).
  Underrepresented classes → Roboflow's "balance classes" sampling.
- **Annotation quality matters more than quantity:** tight boxes around the
  issue, consistent class rules (e.g. "pothole" = hole with visible depth;
  "broken-road" = cracks/crosion without a hole). 50 sloppy images < 20 clean ones.
- **Augmentation (Roboflow Generate):** flip, rotate ±15°, brightness/contrast
  jitter, blur ≤2px, noise, scale ±10%. Skip heavy rotation only if orientation
  matters (it doesn't for potholes/garbage).
- **Image size:** 640 is the sweet spot for on-device. 800–1280 helps small
  objects (manholes at distance) but is 2–4× slower — benchmark before using.

### 2. Model choice (Roboflow one-click OR free Colab)
- **One-click:** Roboflow → Train with Ultralytics → **YOLOv11n** (fast) or
  **YOLOv11s** (more accurate, ~2–3× slower). Nano first, measure, then try small.
- **Full control (free):** train on Google Colab (free GPU):
  ```python
  !pip install -q ultralytics
  !yolo train model=yolo11s.pt data=dataset.yaml epochs=150 imgsz=640 patience=25
  !yolo export model=runs/detect/train/weights/best.pt format=onnx int8=True  # or fp16
  ```
- **Quality gate:** Roboflow's validation reports **mAP50** — aim ≥ 0.70, and
  ALWAYS test on real phone photos you didn't train on (download from web).
- **Quantization:** fp16 = safe default (2× smaller). `int8=True` = ~4× smaller +
  faster WASM, but re-check accuracy; int8 can lose 1–5% mAP.

### 3. Runtime speed & feel (the "wow" factor)
- **WebGPU:** onnxruntime-web 1.22+ supports `executionProviders: ['webgpu','wasm']`
  (WebGPU first, WASM fallback). Big speedup on modern laptops/phones. Caveat:
  YOLOS-tiny is known-slow on WebGPU — YOLO11/RT-DETR usually aren't. Benchmark.
- **Web Worker + OffscreenCanvas:** move inference off the UI thread so the
  spinner/animation never freezes. (Top priority for perceived quality.)
- **Warm-up:** preload the ONNX session on first idle
  (`requestIdleCallback`/`setTimeout` after page load) → first Analyse is instant.
- **Download progress:** surface Transformers.js `progress_callback` so the first
  run shows "Downloading model (12 MB)…" instead of looking stuck.
- Do NOT enable threaded wasm (needs COOP/COEP headers, which break Google Maps
  third-party scripts on this app).

### 4. Consensus & self-improvement (the "real product" layer)
- **Dual-verify fusion:** run on-device + Roboflow; if both agree with high
  confidence, badge it "Double-verified ✓✓". If they disagree, show both results
  and let the user pick. Near-production reliability, great demo story.
- **Human-feedback loop (free training data):** the app already lets users
  *edit* the AI category. Log those corrections (report id, AI guess, user's fix)
  to a Supabase table → export → retrain v2. Every correction is a free sample.
- **Temporal smoothing on `/live`:** average detections across frames (EMA or
  majority vote over last 5) → far steadier live boxes, fewer flickers.
- **Context prior:** use campus/city scope to nudge class priors (campus →
  garbage/manhole/street-light; city road → pothole/broken-road). Cheap + robust.

### 5. Measure everything (so "insanely good" is provable)
- Keep a **benchmark table**: model, quant, size, mAP50, ms/frame (phone+laptop),
  model MB. Update it after every change.
- Add a hidden **self-test page** (`/selftest`) that runs a fixed set of sample
  photos through the full chain and prints per-engine verdicts — demos to judges
  AND regression tests in one.

### Priority for your next sprint
1. Wire on-device into `/live` (kills the Roboflow credit burn)
2. Download-progress UI + warm-up (removes the "stuck" first-run feeling)
3. Train YOLOv11s on a good dataset, export int8, benchmark vs YOLOv11n
4. WebGPU attempt with WASM fallback, then Web Worker offload
5. Human-feedback capture + dual-verify badge

Good luck — questions welcome. 🚀
