# YOLO-World → on-device AI in CivicEye (zero-shot, no training)

**What YOLO-World is:** an open-vocabulary detector. You give it text labels
("pothole", "open manhole", "garbage pile"…) and it detects them **without any
training** — it understands the words. This is the fastest way to get "detect
all civic issues on-device" with no dataset work.

**Why it fits your app:** your on-device engine (`src/services/onDeviceYolo.ts`)
already runs any standard YOLO ONNX model. When YOLO-World is exported with your
labels baked in, it **becomes a standard YOLO model** — same input, same output.
So: export → host → set 2 env vars → done. **No code changes.**

---

## The one rule you must not forget

> Classes are **frozen at export time**. `set_classes()` before export bakes the
> labels into the ONNX; the exported model can't accept new prompts later.
> Change labels → re-export from the original `.pt`.

---

## Step 1 — Export YOLO-World with your 11 civic labels

Run this anywhere with Python (a free Google Colab works perfectly — 2 minutes):

```python
!pip install -q ultralytics

from ultralytics import YOLOWorld

# Pick the model size (see sizing table below)
model = YOLOWorld("yolov8s-worldv2.pt")   # or yolov8n-worldv2.pt (smaller/faster)

# Your 11 civic classes — SAME order will be used in the app env var
model.set_classes([
    "pothole",
    "broken-road",
    "garbage",
    "sidewalk",
    "manhole",
    "fallen-tree",
    "street-light",
    "water-leakage",
    "sewage",
    "illegal-dumping",
    "traffic-signal",
])

# Export a single-image ONNX (batch=1, which is what the browser feeds)
model.export(format="onnx", imgsz=640, dynamic=False, simplify=True)
```

You'll get `yolov8s-worldv2.onnx`. **Verify the output shape** before hosting:
it should be `[1, 15, 8400]` (4 box values + 11 classes) — a standard YOLO head.
(Our engine handles both that raw layout and the `[1, N, 6]` end-to-end-NMS
layout if you export with `nms=True`.)

### Sizing cheat-sheet

| Model | ONNX size (fp32) | fp16 | int8 | Speed on phone | Verdict |
|---|---|---|---|---|---|
| `yolov8n-worldv2` | ~12 MB | ~6 MB | ~3 MB | fastest | start here |
| `yolov8s-worldv2` | ~23 MB | ~12 MB | ~6 MB | good | best accuracy/speed balance |
| `yolov8m-worldv2` | ~48 MB | ~24 MB | ~12 MB | slow | only on desktop |

Export fp16/int8 to shrink it (Ultralytics ≥ 8.4: `model.export(..., quantize=16)`
for fp16; `quantize=int8` needs calibration data, fp16 is the safe default):

```python
model.export(format="onnx", imgsz=640, dynamic=False, quantize=16)
```

---

## Step 2 — Host the ONNX

Push the `.onnx` to a GitHub repo, then the URL is:

```
https://cdn.jsdelivr.net/gh/Crepify/civiceye-models@main/yolov8s-worldv2.onnx
```

(or Hugging Face: `https://huggingface.co/{user}/{repo}/resolve/main/...onnx`)

---

## Step 3 — Wire it in (5 min, no code)

Add to `.env` AND Vercel → Settings → Environment Variables:

```env
VITE_ONDEVICE_YOLO_URL=https://cdn.jsdelivr.net/gh/Crepify/civiceye-models@main/yolov8s-worldv2.onnx
VITE_ONDEVICE_YOLO_LABELS=pothole,broken-road,garbage,sidewalk,manhole,fallen-tree,street-light,water-leakage,sewage,illegal-dumping,traffic-signal
VITE_ONDEVICE_YOLO_SIZE=640
VITE_ONDEVICE_YOLO_CONF=0.35
```

> `VITE_ONDEVICE_YOLO_LABELS` order MUST match the `set_classes()` order above.
> Rebuild + redeploy. The app now runs YOLO-World **in the browser** — free,
> private, offline, unlimited.

---

## Step 4 — Verify

1. Report an issue → upload a **pothole** photo.
2. Badge should read **"🖥️ Analysed on your device (custom civic model)"** — no
   cloud call.
3. Test garbage, manhole, fallen tree… (zero-shot should catch them if they're
   visually distinct).
4. DevTools → Console: no "custom on-device YOLO unavailable" error.

---

## What about the Roboflow YOLO-World you saw in the UI?

Roboflow exposes YOLO-World as a **hosted zero-shot API** (cloud). Two ways to use it:

- **Cloud-only (no download):** call it via your existing Roboflow path — set it
  as your model (`VITE_ROBOFLOW_MODEL`) or a workflow input. Zero-setup, but it
  costs ~1 credit/call and is cloud (not on-device).
- **On-device (this guide):** Roboflow can hand you the **weights** (`Download
  Weights` in the model → returns a `.pt`), but the cleanest export is the
  Ultralytics snippet above — same weights, labels baked, ONNX out.

**Recommendation:** use on-device (this guide) as the primary path, and keep
Roboflow as the fallback when on-device isn't confident — exactly how the chain
already works.

---

## Honest caveats

- **Zero-shot accuracy is good, not perfect.** YOLO-World understands words but
  wasn't trained on Indian pothole photos. For the demo it's excellent; for max
  accuracy, later fine-tune (or train your own) — the wiring is identical.
- **Label phrasing matters.** "pothole" and "open manhole" work well; be
  descriptive: prefer `"broken-road"`, `"street-light"` etc. Experiment with
  phrasing and re-export — it's free.
- **Classes are frozen** in the ONNX — to add/rename a class, re-run Step 1
  with a new `set_classes()` and re-upload.
- **First load downloads the model** (~12–23 MB fp32; ~3–12 MB with fp16/int8),
  then it's cached + offline.
- Need WebGPU speed? The engine already tries `wasm`; WebGPU acceleration is a
  future tweak (benchmark first — YOLO-World on WebGPU is usually fine).

---

## Quick checklist

```bash
1. Colab: pip install ultralytics
2. YOLOWorld("yolov8s-worldv2.pt").set_classes([11 civic labels])   # order matters
3. .export(format="onnx", imgsz=640, dynamic=False, quantize=16)    # fp16 = ~12 MB
4. Push .onnx to GitHub → https://cdn.jsdelivr.net/gh/<user>/<repo>@main/....
5. VITE_ONDEVICE_YOLO_URL + VITE_ONDEVICE_YOLO_LABELS (same order) + rebuild
6. Test a pothole photo → expect the 🖥️ on-device badge, no cloud call
```

---

## ⚠️ Troubleshooting: "Graph output (output0) does not exist in the graph"

You hit this in the app (at `InferenceSession.create`). **Cause: the ONNX file
itself is broken** — almost always because the export used `simplify=True`
(onnxslim rewrites the graph and can drop the `output0` binding, a known
YOLO-World/YOLO-family issue), or an incompatible opset.

**Fix — re-export like this (already updated in the Colab notebook):**
```python
model.export(format="onnx", imgsz=640, dynamic=False, simplify=False, opset=12)
```
Then re-host the NEW file and clear the old one from the CDN cache (see below).

Quick checks before re-hosting:
1. **Verify on your machine first:** in the notebook, cell 6 loads the file
   with onnxruntime. It should print `INPUT images [1,3,640,640]` and
   `OUTPUT output0 [1,15,8400]`. If it errors → file is broken → re-export.
2. **Netron:** open https://netron.app and drag the `.onnx` in — you should see
   the graph. An error page = broken file.
3. **File size sanity:** yolov8s fp32 ≈ 23 MB, fp16 ≈ 12 MB. If your file is a
   few KB, it's not the real model (wrong download / wrong URL).
4. **Check what the URL serves:** open the jsDelivr URL in a browser — it should
   *download* a ~12–23 MB binary. A small error/HTML page = wrong URL.

### Clearing jsDelivr's cache after re-uploading
jsDelivr caches aggressively. After pushing a fixed file, purge it:
```
https://purge.jsdelivr.net/gh/Crepify/civiceye-models@main/yolov8s-worldv2.onnx
```
(open that URL once — it returns `{"status":"ok"}`) or just rename the file
(`...v2.onnx`) and use the new URL.

---

## 📦 How to put the .onnx on GitHub + get the jsDelivr URL (clear steps)

1. **Create a public repo** → github.com → **+** (top-right) → **New repository** →
   name it e.g. `civiceye-models` → **Public** → **Create repository**.
   (jsDelivr only serves **public** repos.)
2. **Upload the file** → click **"uploading an existing file"** (or
   **Add file → Upload files**) → drag your `.onnx` in → scroll down →
   **Commit changes**.
3. **Wait ~30–60 seconds** for GitHub to process the file (large binaries take
   a moment).
4. **Your jsDelivr URL** — the format is always:
   ```
   https://cdn.jsdelivr.net/gh/<USERNAME>/<REPO>@<BRANCH>/<FILENAME>
   ```
   For example:
   ```
   https://cdn.jsdelivr.net/gh/Crepify/civiceye-models@main/yolov8s-worldv2.onnx
   ```
5. **Test the URL** → paste it in a browser → it should **download** the binary.
   - If you get GitHub's page / "Couldn't find the requested file": the repo is
     private, the branch isn't `main`, or the filename is wrong.
   - The **blob** URL (`github.com/.../blob/...`) is a web page — the app cannot
     use it. Only the `cdn.jsdelivr.net/gh/...` (or
     `raw.githubusercontent.com/...`) URL works.
6. **In the app** → `.env` + Vercel:
   ```
   VITE_ONDEVICE_YOLO_URL=https://cdn.jsdelivr.net/gh/Crepify/civiceye-models@main/yolov8s-worldv2.onnx
   VITE_ONDEVICE_YOLO_LABELS=pothole,broken-road,garbage,sidewalk,manhole,fallen-tree,street-light,water-leakage,sewage,illegal-dumping,traffic-signal
   VITE_ONDEVICE_YOLO_SIZE=640
   ```
   Rebuild + redeploy → test a pothole photo → expect the 🖥️ on-device badge.
