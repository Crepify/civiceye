# 🧠 Real AI image detection — free setup guide

The app now supports **real** image analysis: upload any PNG/JPG (or take a photo on
your phone), and a hosted vision model will:

1. **Check image quality** — if the photo is blurry / unclear / too dark, the app
   **warns the user** ("⚠️ Photo looks blurry… consider retaking it").
2. **Detect the issue** — potholes, broken roads, accidents, broken traffic lights,
   garbage, water leakage, suspicious activity, and more.
3. Return a **confidence score**, **severity**, detected **objects** and a grounded
   **summary**.

Without an API key it falls back to the built-in mock estimate (clearly labeled
"Built-in estimate"). With a key, the report card says "Analysed by Gemini Vision".

---

## ⭐ Best free option — Google Gemini (recommended)

**Cost:** Free tier (no credit card). Gemini 2.0 Flash / 1.5 Flash are extremely
cheap even past the free tier (~$0.03–0.09 per 1,000 images).

### 1. Get a free API key (2 minutes)

1. Go to **https://aistudio.google.com/apikey** (sign in with any Google account).
2. Click **"Create API key"** → pick a Google Cloud project (or "Create API key in
   new project").
3. Copy the key (starts with `AIza…`).
4. Add it to your environment:
   - **Local:** in `.env` → `VITE_GEMINI_API_KEY=AIza…` (and optional
     `VITE_GEMINI_MODEL=gemini-2.0-flash`)
   - **Vercel:** Project → Settings → Environment Variables → add `VITE_GEMINI_API_KEY`
     → Redeploy.

### 2. Test it

Open `/report` → upload any photo → the wizard shows the scan animation, then real
results: category, confidence, severity, objects, summary, quality verdict + warning
if blurry.

> ⚠️ The key is bundled in the client (it's a `VITE_` var). For a prototype that's
> fine, but restrict the key: Google AI Studio → API keys → restrict to your domain.
> For production, call Gemini from a serverless function instead (see below).

---

## Other free options (if you'd rather not use Gemini)

| Service | Free tier | Notes |
| --- | --- | --- |
| **Google Gemini (AI Studio)** | Free API key, generous | ⭐ Best choice — vision + JSON out, blur judgment built into the prompt |
| **OpenAI GPT-4o-mini** | ~$5–15 trial credits | Very good vision; credits expire |
| **Groq (llama-3.2-90b-vision)** | Free tier, fast | Vision LLM, JSON out — works as a drop-in for the same prompt |
| **Cloudflare Workers AI** | Free daily quota | Some vision models free; needs a Cloudflare account |
| **Hugging Face Inference API** | Free (small quota) | Try a zero-shot model like `OWLv2` — no training needed |
| **Local YOLOv8 (no API at all)** | Free forever | Runs on your laptop/Colab; needs a dataset — see below |

### How to switch providers
`src/services/geminiService.ts` calls one REST endpoint with a prompt. To swap in
another provider, keep the same JSON contract (`category`, `confidence`, `severity`,
`objects`, `summary`, `imageQuality`, `qualityNote`) — the UI doesn't change.

---

## How blur/unclear detection works

Two layers:

1. **The vision model judges quality** (the prompt asks it to return
   `imageQuality: clear|blurry|unclear|low-light` + a reason). This is the main check
   and it's quite reliable — the model sees the same pixels you do.
2. **(Optional, local) OpenCV Laplacian check** — a classic free no-API blur metric:
   `variance(Laplacian(gray))`. Below a threshold → blurry. You can run this on the
   client with a small canvas, or on a server. For most cases the model's own verdict
   is enough.

The app shows the warning on the **AI Analysis step** so the user can retake the photo
before submitting.

---

## Optionally: fine-tune YOLO for free (most accurate + no API cost)

If you want a *trained* detector (not an LLM) with calibrated confidence:

1. Collect labeled images (potholes: **Pothole-600 / RDCLD / Crack500**; garbage:
   **TACO**; accidents/vehicles: **UA-DETRAC**; or label your own in **Roboflow**
   free tier).
2. Train in Google Colab (free GPU):
   ```bash
   pip install ultralytics
   yolo detect train model=yolo11n.pt data=dataset.yaml epochs=60 imgsz=640
   yolo detect export model=runs/detect/train/weights/best.pt format=onnx
   ```
3. Serve it from a small FastAPI endpoint that returns the same JSON contract
   (`confidence` from the calibrated softmax, plus a blur pre-check with OpenCV).

Full details in `PRODUCTION_ROADMAP.md` (Phase 2 — Track B).

---

## Security notes

- `VITE_GEMINI_API_KEY` is client-visible. For a real launch, proxy through a tiny
  serverless function (Vercel functions are free within limits) so the key stays
  server-side.
- Rate limits: Gemini free tier is generous; if you hit `429`, the app automatically
  falls back to the built-in estimate, so users never see a broken flow.
