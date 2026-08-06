# 🏭 Making CivicEye Real — From Prototype to Production

A practical, honest roadmap to turn the CivicEye prototype into a real, functioning
platform with **real user data**, **real AI that recognizes images**, **calibrated
confidence scores** and **grounded AI descriptions** — including the "how" for the
Live CCTV detection.

---

## 0. Reality check & architecture

**The hard truths (so you don't waste months):**

1. **A model that "recognizes images" needs data + labels + evaluation, not just code.**
   Plan for dataset work — it's 60% of the AI effort.
2. **"Confidence" printed by a model is NOT automatically valid.** You must *calibrate*
   it against a labeled validation set, or the numbers will lie.
3. **An LLM's "confidence" is not a probability.** Fine-tuned detectors give real
   softmax probabilities; LLMs give vibes. Use the right tool per job.
4. **A real website needs auth, a database, file storage and an API.** You already
   built the UI — now you bolt on a backend that speaks the same contract.

### Target architecture (what we'll build)

```
┌──────────────────────────────┐      ┌───────────────────────────────┐
│  Frontend (this repo)        │      │  Backend services             │
│  React + Vite on Vercel      │ ───► │                               │
│  • reportService → real API  │ HTTP │  FastAPI (Render/Railway/Fly) │
│  • analyzePhoto → /analyze   │      │  ├─ POST /reports             │
│  • /live → WebSocket events  │◄──── │  ├─ POST /analyze (AI)        │
└──────────────────────────────┘ WS   │  └─ WS /detections (live)     │
                                      │                               │
                                      │  Postgres (Supabase)          │
                                      │  • reports, votes, users      │
                                      │  • Auth (Supabase Auth)       │
                                      │  • Storage (photos, S3)       │
                                      │  • Realtime (live feed)       │
                                      └───────────────────────────────┘
```

**Key principle (already built into the prototype):** the frontend talks to
`reportService` / `aiAnalysisService` / `detectionService` behind clean interfaces.
Swap their *internals* from `localStorage`+mock → real HTTP, and the UI barely changes.

---

## Phase 1 — Real data & backend (Week 1)

### 1.1 Spin up a managed backend: Supabase (free)

Supabase gives you Postgres + Auth + Storage + Realtime in one product with a generous
free tier — the fastest legitimate path.

1. Sign up at https://supabase.com → **New project** → copy the project URL + `anon` key.
2. Add to Vercel env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Run this schema (SQL Editor):

```sql
create extension if not exists "uuid-ossp";

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  code          text unique default 'CE-' || upper(substr(md5(random()::text), 1, 8)),
  user_id       uuid references auth.users(id) on delete set null,
  title         text not null,
  description   text not null,
  category      text not null check (category in
    ('pothole','broken-road','garbage','sidewalk','manhole','fallen-tree',
     'street-light','water-leakage','sewage','illegal-dumping',
     'traffic-signal','accident','other')),
  severity      text not null check (severity in ('low','medium','high','critical')),
  status        text not null default 'pending' check (status in
    ('pending','verified','in-progress','resolved','rejected')),
  lat           double precision not null,
  lng           double precision not null,
  location_name text,
  photo_url     text not null,
  ai            jsonb,          -- {category, confidence, severity, objects[], summary, model}
  upvotes       int not null default 0,
  downvotes     int not null default 0,
  confirms      int not null default 0,
  rejects       int not null default 0,
  verified      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.reports (status);
create index on public.reports (category);
create index on public.reports (created_at desc);
```

Enable **Row Level Security** so anyone can read (public good) but only the author
can edit their report:

```sql
alter table public.reports enable row level security;

create policy "public read"     on public.reports for select using (true);
create policy "owner insert"    on public.reports for insert with check (auth.uid() = user_id or user_id is null);
create policy "owner update"    on public.reports for update using (auth.uid() = user_id);
create policy "owner delete"    on public.reports for delete using (auth.uid() = user_id);
```

### 1.2 Real file uploads (photos)

Don't store images in the DB — store URLs.

- **Supabase Storage** (free 1GB): create a `reports` bucket (public), upload via the
  JS SDK, get a URL back, save the URL in `reports.photo_url`.
- Or **Cloudinary** / **UploadThing** / **Cloudflare R2** — all have free tiers.

### 1.3 Real geocoding + GPS from photos

- **GPS:** read EXIF from the JPG on the client with the **`exifr`** package
  (`exifr.gps(file)`). Fall back to `navigator.geolocation`, then manual pin. You
  already have all three fallbacks — just add EXIF as the first source.
- **Reverse geocoding:** replace `mockReverseGeocode` with the **Google Geocoding API**
  (needs the same key, enable the API) or **Mapbox** free tier.

### 1.4 Replace the mock services with real calls (frontend refactor)

Keep the interfaces, swap the internals:

- `src/services/reportService.ts` → methods become `async`, calling
  `supabase.from('reports').select()/insert()/update()` (or your own FastAPI).
- Add Supabase Auth (`email/password` + Google) so `author` is the real logged-in user.
- The votes/confirms actions become `rpc` functions or conditional updates with
  cooldowns so one person can't vote 1000 times.

### 1.5 Seed with *real* data

- Start with your own collected reports (ask 10 friends to use the app for a week —
  this is legitimate, real, local data).
- Augment from **open data** where it exists: check your city/state open-data portal
  (e.g., `data.gov.in`, ward-wise 311-style feeds, IChangeMyCity datasets for
  Bengaluru). Convert to CSV → insert via a script.
- ⚠️ **Don't scrape** Google Maps/OSM issues — it's against their ToS and the data is
  stale anyway.

---

## Phase 2 — Real image AI (Weeks 1–2)

There are **two tracks**. Start with A (ship in days), graduate to B (accurate + cheap).

### Track A — Hosted vision model (launch now)

Use a **multimodal LLM with structured output**. No training, works for *any* category,
costs fractions of a cent per photo.

**Recommendation:** Google **Gemini Flash** (very cheap, generous free tier) or
**GPT-4o-mini** (also cheap). Create a tiny FastAPI service:

```python
# ai_service.py  — pip install fastapi uvicorn google-generativeai python-multipart
import json
from fastapi import FastAPI, UploadFile
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
app = FastAPI()

PROMPT = """You are a civic inspector. Analyze this photo of a public street.
Reply with ONLY JSON matching this schema:
{
  "category": "pothole|broken-road|garbage|sidewalk|manhole|fallen-tree|street-light|water-leakage|sewage|illegal-dumping|traffic-signal|accident|other",
  "severity": "low|medium|high|critical",
  "objects": ["list", "of", "detected", "objects"],
  "summary": "2-3 sentence factual description grounded ONLY in what is visible",
  "confidence": 0.0
}
confidence = your honest self-assessed certainty 0-1. If uncertain, give LOW confidence."""

@app.post("/analyze")
async def analyze(file: UploadFile):
    data = await file.read()
    model = genai.GenerativeModel("gemini-2.0-flash")
    resp = model.generate_content([PROMPT, {"mime_type": file.content_type, "data": data}])
    result = json.loads(resp.text)
    return result
```

Frontend: in `src/services/aiAnalysisService.ts`, replace the mock `analyzePhoto`
body with `fetch(API_URL + '/analyze', { method: 'POST', body: FormData with the photo })`,
then map the response onto the existing `AnalysisResult` type. The wizard UI doesn't
change at all.

> ⚠️ **Honesty about "confidence" from an LLM:** a language model has no native
> probability. Its self-reported confidence is **not** a calibrated probability.
> Fix: collect ~300 labeled photos, prompt the model for confidence, then run the
> labels through calibration (Phase 2.3). Only then show it in the UI as a %.
> Alternatively use Gemini's built-in ground truth / logprobs where available.

### Track B — Fine-tuned detector (production, accurate, cheap)

For real, defensible confidence you want a **fine-tuned YOLO detector** with
calibrated softmax scores.

**1. Collect a labeled dataset** (this is the real work):

| Issue | Public dataset | Size |
|---|---|---|
| Potholes / road damage | Pothole-600, RDCLD, Crack500, AigleRN | 600–26k imgs |
| Garbage / litter | TACO (Trash Annotations in Context) | ~1.5k imgs |
| Vehicles / accidents | UA-DETRAC, ACCID | 10k+ |
| General | **Roboflow Universe** (search "pothole", "road damage", "accident") | many |

Combine → split **70/15/15 train/val/test**. Target **≥ 200–500 images per class**
for decent accuracy; 1,000+ per class is comfortable. Use **CVAT** or **Roboflow
Annotate** to label anything you collect yourself.

**2. Fine-tune YOLOv11** (free GPU: Google Colab or Kaggle):

```yaml
# datasets/civic/data.yaml
names: [pothole, broken-road, garbage, sidewalk, manhole, fallen-tree,
        street-light, water-leakage, sewage, illegal-dumping,
        traffic-signal, accident, debris]
nc: 13
train: datasets/civic/images/train
val:   datasets/civic/images/val
```

```bash
pip install ultralytics
yolo detect train model=yolo11n.pt data=datasets/civic/data.yaml \
      epochs=60 imgsz=640 batch=16
yolo detect export model=runs/detect/train/weights/best.pt format=onnx  # → TensorRT later
```

**3. Serve it** (FastAPI + supervision, ~40 lines — reuses the same `/analyze`
endpoint shape):

```python
from ultralytics import YOLO
import supervision as sv

model = YOLO("best.pt")
box_annotator = sv.BoxAnnotator()

def run_inference(image_bytes):
    result = model.predict(source=image_bytes)[0]
    detections = sv.Detections.from_ultralytics(result)
    detections = detections[detections.confidence >= THRESHOLD]   # after calibration
    # → category = mapped class name, confidence = calibrated score,
    #   severity = heuristic (max conf, class, bbox area/frame area)
    return detections
```

### 2.3 Making confidence *valid* (the part everyone skips)

Raw softmax scores are overconfident (a model says 0.95 and is right only 80% of the
time). Do this:

1. **Calibrate** — temperature scaling (1 line of scipy) or `sklearn`
   `CalibratedClassifierCV` on the **validation set** (never the test set).
2. **Pick a threshold** — plot precision-recall, choose the operating point
   (e.g., `p ≥ 0.65` ⇒ auto-report; `0.45–0.65` ⇒ "needs human review"; below ⇒
   discard). This is what makes the confidence scale *mean something*.
3. **Report honestly in the UI** — show the *calibrated* probability and the model
   name/version, e.g. *"73% confidence · yolo11n-civic v3 · calibrated on 1,240 photos"*.
4. **Evaluate on a held-out test set** — report mAP@0.5, precision/recall at your
   threshold, and a **calibration curve (ECE)**. Put these numbers on an internal
   "model card" page so you (and judges) can see it's real.

### 2.4 Making the AI overview *valid* (grounded, not hallucinated)

Two-layer approach:

1. **Structured facts from the detector** — `objects[]`, class, confidence, bbox
   area, count. These are grounded in the model output.
2. **LLM summary with strict grounding** — feed the *facts*, not the raw image, to a
   cheap LLM and instruct it to describe only what's listed:

```
You see: pothole(0.91), debris(0.62), cracked asphalt(0.58), bbox covers 34% of lane.
Write a 2-3 sentence report. Only mention the objects above. Never invent details.
```

The summary stays *valid* because it's constrained to detected facts — and you can
show "based on model detections" in the UI.

---

## Phase 3 — Real Live stream detection (Week 3)

`/live` already renders the exact event contract. Make the events real:

1. **Ingest streams** — RTSP/HLS from city CCTV (with permission!) or your own
   cameras (an old phone or a Raspberry Pi + camera works). OpenCV
   `cv2.VideoCapture(rtsp_url)` with auto-reconnect, sample 2–5 fps.
2. **Detect** — the Phase 2 YOLO model on each frame.
3. **Track & reason about time** — use **ByteTrack** (via supervision) so you know
   *"the same pothole was seen for 40 frames"* — kills duplicates.
4. **Accidents = temporal heuristics** — a "sudden stop cluster": 2+ vehicles
   overlapping in time with near-zero speed, or vehicles stopped in a lane for
   > N seconds. Detection alone is not enough for accidents; combine it.
5. **Dedupe & cooldown** — one event per (camera, class, bbox-IoU) per 20–30 min.
6. **Push to the app** — FastAPI **WebSocket** (`/ws/detections`) or **Supabase
   Realtime**; the `/live` page consumes it. Auto-create reports via `POST /reports`
   exactly like the mock already does.

The starter code in `LIVESTREAM_DETECTION.md` is already written for this — extend it
with tracking + calibration.

---

## Phase 4 — Community & authorities (Week 3–4)

- **Auth-gated voting** — one vote per user per report (DB unique constraint), so
  verification is meaningful.
- **Moderation** — auto-blur faces/licence plates (YOLO person/plate + Gaussian
  blur) before storing photos; NSFW filter on upload; report/flag button on cards.
- **Authority workflow** — real ward email/PDF generation (keep the existing
  "Generate report" but POST it to a real email via an email API), or integrate with
  a city's grievance API if one exists.
- **Notifications** — push (FCM/OneSignal) or email (Resend/Postmark free tiers).

---

## Phase 5 — Launch checklist, compliance & costs

### Security / compliance (India + global)
- **API keys only server-side** (never `VITE_` secrets). Supabase handles auth.
- **DPDP Act 2023 / GDPR** — consent on photo upload, right to delete reports,
  data retention, blur faces/plates, published privacy policy.
- **Rate limiting** on the AI endpoint (per user/hour) — vision APIs cost money.
- **Content policy** — community validation + moderation for safety-critical claims
  (accidents!). A "verified by authorities" status for official confirmations.

### Realistic monthly cost (startup tier, India-friendly)

| Item | Cost |
|---|---|
| Vercel (frontend) | $0 |
| Supabase (DB + auth + storage) | $0 (free tier) |
| FastAPI service on Render/Railway | $0–7 |
| Gemini Flash / GPT-4o-mini per image | ~$0.001–0.002 / photo |
| YOLO training | $0 (Colab/Kaggle GPU) |
| YOLO inference (CPU, 1–3 cams) | $0–10 (a small VPS) |
| Domain | ~$10–12/yr |

### Suggested 4-week sprint

| Week | Goal |
|---|---|
| 1 | Supabase schema + auth + storage, real report creation, EXIF GPS, real geocoding |
| 2 | `/analyze` via Gemini/GPT-4o-mini, replace mock AI, collect 300+ labeled eval photos |
| 3 | Fine-tune YOLOv11, calibrate, set thresholds, evaluate; WebSocket live detections |
| 4 | Moderation (face blur, NSFW), authority email, RLS hardening, launch + demo script |

---

## What to build next (I can do these right now)

1. **`ai_service/` folder** in this repo — the FastAPI `/analyze` (Gemini or
   OpenAI), plus the fine-tune + calibration scripts and a model-card generator.
2. **Supabase client refactor** — `reportService`, votes, confirms → real Postgres
   with RLS; schema `.sql` included; frontend swaps with zero UI change.
3. **Real `/live`** — WebSocket consumer so the page works against a real detector.
4. **Upload pipeline** — EXIF GPS via `exifr`, photo → storage URL, AI → report.

Tell me which track you want first (hosted-LLM-AI vs fine-tuned-YOLO), and whether
you've created the Supabase project yet — I'll scaffold the exact code.
