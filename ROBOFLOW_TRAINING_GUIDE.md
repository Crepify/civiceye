# Train your own Roboflow model for on-device AI — complete guide

**Goal:** a small YOLO model that detects civic issues (potholes, garbage,
manholes…) **in the browser** — free, private, offline, unlimited — with zero
code changes. The app already has the engine (`src/services/onDeviceYolo.ts`);
you just produce a model file and set 2 env vars.

---

## 1. The exact class list (matches your app — no code edits)

Train **exactly these 11 classes** (they map 1:1 to CivicEye/Amrita Eye
categories in `src/services/onDeviceMap.ts`):

```
pothole, broken-road, garbage, sidewalk, manhole, fallen-tree,
street-light, water-leakage, sewage, illegal-dumping, traffic-signal
```

Leave out `accident`, `security`, `other` unless you have real data for them —
a detector trained on roads won't help detect a crash, and fewer classes =
higher precision. (Aliases like "open manhole", "trash", "potholes" already map
to the right category automatically, so you don't need them as separate classes.)

---

## 2. Build the dataset (the 80% that decides quality)

### 2a. Roboflow Universe public datasets (fastest — free)
1. app.roboflow.com → **Create Project** → name it (e.g. `civiceye-ondrive`) →
   **Object Detection** → Continue.
2. **Add Images → Public Datasets** → search each class and **Add**:
   - "pothole" (there are huge public pothole datasets)
   - "garbage" / "trash pile" / "litter"
   - "manhole" / "open manhole"
   - "broken road" / "road crack"
   - "street light" / "streetlight"
   - "fallen tree"
   - "water leak" / "flood"
   - "sewage" / "drain"
   - "construction debris" / "illegal dumping"
   - "traffic light" / "stop sign" (traffic-signal)
3. **Annotate** anything that's unlabeled: tight boxes around the issue, one
   class per box. **Volume targets:**
   - **≥ 100 boxes per class** = good demo
   - **200–500 boxes per class** = "real product" quality
   - Fewer than 50/class → the model will miss it.

### 2b. Annotation quality rules (matters more than quantity)
- Tight boxes — just the pothole, not the whole road.
- Consistent class definitions:
  - `pothole` = hole with visible depth
  - `broken-road` = cracks/erosion WITHOUT a hole
  - `garbage` = uncollected waste/litter pile
  - `manhole` = manhole cover, open or broken
  - `street-light` = pole/lamp, working or broken
  - `traffic-signal` = traffic light / signal housing (not road signs)
- 20 clean images beat 50 sloppy ones. Redo blurry/ambiguous boxes.

### 2c. Generate a version
- **Generate** (auto-augment). Good defaults: flip (horizontal), rotate ±15°,
  brightness/contrast jitter, blur ≤ 2px, noise, scale ±10%. Rotation beyond
  ±15° doesn't help (potholes don't care about orientation) and can hurt.

---

## 3. Train

1. Project → **Versions** → pick your generated version → **Train**.
2. Choose **Train with Ultralytics** (free GPU, no card).
3. **Model:** start with **YOLOv11n** (nano — fastest on phones, ~6–10 MB).
   If you want more accuracy and have a decent phone, try **YOLOv11s** (~2×
   slower). Don't start bigger than `s` for on-device.
4. **Epochs:** default (or ~100–150); Roboflow stops when it stops improving.
5. Wait for training (~5–30 min depending on dataset size).

### Quality gate
After training, Roboflow shows validation metrics. Aim for **mAP50 ≥ 0.70**.
Below ~0.5 = not usable — add data for the failing classes and retrain.

---

## 4. Export to ONNX

1. Trained version → **Deploy** tab → **Export** → **ONNX** → Download.
2. The zip contains `best.onnx` (or `weights/best.onnx`) + `data.yaml` /
   `metadata.yaml`. **Keep `data.yaml`** — the `names:` list (in order) is your
   class list for the env var.

> Optional pro move: use **Colab** to export `int8`-quantized ONNX for a ~4×
> smaller/faster file (re-check accuracy after quantizing):
> ```python
> !pip install -q ultralytics
> !yolo export model=best.pt format=onnx int8=True imgsz=640
> ```

---

## 5. Host the model file

Upload `best.onnx` anywhere with CORS. Easiest = GitHub + jsDelivr:
1. Push `best.onnx` to a GitHub repo (e.g. `Crepify/civiceye-models`).
2. Your URL becomes:
   ```
   https://cdn.jsdelivr.net/gh/Crepify/civiceye-models@main/best.onnx
   ```
   (or Hugging Face: `https://huggingface.co/{user}/{repo}/resolve/main/best.onnx`)

---

## 6. Wire it in (5 minutes, no code)

Add to `.env` AND to Vercel → Settings → Environment Variables:

```env
VITE_ONDEVICE_YOLO_URL=https://cdn.jsdelivr.net/gh/Crepify/civiceye-models@main/best.onnx
VITE_ONDEVICE_YOLO_LABELS=pothole,broken-road,garbage,sidewalk,manhole,fallen-tree,street-light,water-leakage,sewage,illegal-dumping,traffic-signal
VITE_ONDEVICE_YOLO_SIZE=640
VITE_ONDEVICE_YOLO_CONF=0.35
```

> `VITE_ONDEVICE_YOLO_LABELS` order MUST match the `names:` order in
> `data.yaml` (index = class id in the export). If you trained at 416 or 1280,
> set `VITE_ONDEVICE_YOLO_SIZE` to match instead of 640.

Rebuild + redeploy. Done — the app now runs your model in the browser first.

---

## 7. Verify it works

1. Open the app, go to **Report an issue**, upload a **pothole photo**.
2. Watch the badge: it should say **"🖥️ Analysed on your device (custom civic
   model)"** — with NO Roboflow cloud call.
3. DevTools → Console should show no "custom on-device YOLO unavailable" error.
4. Test every class you trained (garbage, manhole, fallen tree…).

If the model loads but says "not confident", the label didn't match a category —
check `data.yaml` names vs the list above.

---

## 8. Bonus: use the SAME model for cloud too (save credits + double-verify)

Instead of a separate cloud model, point the cloud path at the same detector:

```env
VITE_ROBOFLOW_MODEL=<your-project>/<version>   # e.g. civiceye-ondrive/2
```

- Cloud (standard inference) runs the same weights — faster & cheaper than the
  workflow.
- On-device + cloud agreeing = **"Double-verified ✓✓"** trust signal (great
  demo).
- Only falls back to the cloud when the on-device run isn't confident.

---

## 9. Sizing cheat-sheet

| Model | Size | Speed on phone | Use when |
|---|---|---|---|
| YOLOv11n | ~6 MB | ~0.5–1.5s | default — fast, good enough |
| YOLOv11s | ~19 MB | ~1.5–3s | need more accuracy |
| YOLOv11n int8 | ~2 MB | fastest | tiny models, slightly less accurate |

First visit downloads the model (then it's cached/offline). Nano + int8 keeps
that first-load small.

---

## Quick checklist

```bash
1. Roboflow: New Project → Object Detection → Add public datasets (≥100 boxes/class)
2. Annotate tight, consistent boxes → Generate version → Train YOLOv11n
3. Check mAP50 ≥ 0.70 → Deploy → Export ONNX → download best.onnx
4. Push best.onnx to GitHub → URL = https://cdn.jsdelivr.net/gh/<user>/<repo>@main/best.onnx
5. Set VITE_ONDEVICE_YOLO_URL + VITE_ONDEVICE_YOLO_LABELS (from data.yaml) + rebuild
6. Test a pothole photo → expect the 🖥️ on-device badge
7. (Optional) VITE_ROBOFLOW_MODEL = same model for cloud + double-verify
```
