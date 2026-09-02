# 👁️ CivicEye / Amrita Eye

**Making cities better, one report at a time.**

CivicEye is a civic-issue reporting platform. Citizens and campus students photograph and pin problems — potholes, garbage, broken street lights, fallen trees, water leaks, and more — the community validates them, and staff/authorities act on them. Amrita Eye is the campus-branded mode (auto-activated for `@…amrita.edu` users) with campus-specific categories and routing.

---

## ✨ Features

| Area | What it does |
| --- | --- |
| 🗺️ **Live map** | Google Maps (with key) or built-in fallback map. Marker clustering, severity heatmap, filters, search, current location, and popups with photos/votes/status. Clicking a report zooms & pins it. |
| 📸 **AI photo analysis** | Upload or take a photo → **CivicLENS AI** (Roboflow) detects category, confidence, severity, objects, and a description. Blurry/unclear photos warn the user. Category is user-editable. |
| 📡 **Live AI Detection** | `/live` captures your device camera, a video file, or screen — sends frames to CivicLENS AI (Roboflow), draws detection boxes, and can auto-create reports. |
| 📱 **QR phone → desktop flow** | Scan a QR on your desktop, take the photo on your phone, it syncs back automatically. |
| ✅ **Community validation** | Upvote / downvote / confirm / reject. 3 confirmations → report becomes **Verified**. Flag button on every post. |
| 💬 **Reviews** | Report threads with agree/disagree tallies; landing page shows live community reviews. |
| 🏛️ **Authorities dashboard** | KPIs, category/severity/weekly charts, hotspot list, recent reports, assign/resolve/reject, downloadable ward report, and **real "Report to Authority"** escalation (email/WhatsApp/SMS/mailto). |
| 🎓 **Amrita Eye mode** | Red/white/black/yellow campus theme, campus-only categories (suspicious activity, etc.), campus-scoped reports & routing. Auto-activates on `@…amrita.edu` logins. |
| 🛡️ **Staff/Admin panel** | Flagged-post moderation (take down/dismiss), scope management (mark campus/city), reporter details. Configurable admins. |

**Tech:** React 18 · TypeScript · Vite 5 · TailwindCSS · Framer Motion · React Router · Supabase (auth, Postgres, storage, RLS) · Google Maps · Roboflow (CivicLENS AI) · Lucide icons · Vercel serverless functions.

---

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. The app works out of the box with the fallback map; real features activate when environment variables are set (see [Environment](#-environment-variables)).

### Scripts

```bash
npm run dev          # dev server
npm run build        # type-check + production build
npm run preview      # preview the build
npm run lint         # eslint (zero warnings)
npm run typecheck    # typescript only
```

---

## 🧭 Pages

| Route | Page |
| --- | --- |
| `/` | Landing — hero, live map preview, stats, how-it-works, features, community reviews |
| `/map` | Interactive map — clustering, heatmap, filters, search, zoom-on-click |
| `/live` | Live AI Detection — camera / video / screen → CivicLENS AI boxes |
| `/report` | Report wizard — category → photo → AI analysis → location → details → review |
| `/report/:id` | Report detail — evidence, votes, reviews, flag, report-to-authority |
| `/community` | Community feed — search, filter, sort, paginate |
| `/dashboard` | Authorities dashboard — KPIs, charts, map, assign/resolve |
| `/admin` | Staff/admin moderation panel (admin-only) |
| `/about` · `/contact` · `/login` | Product pages + auth |
| `*` | 404 |

---

## 🔐 Authentication

- Supabase Auth: email + password, magic link, password reset.
- Login-first — every page redirects to `/login` when signed out.
- **Admin rule:** emails in `src/data/admins.ts` (or `VITE_ADMIN_EMAILS`) are admins. Every `@amrita.edu` email that is **not** a `*.students.*` address is an Amrita Eye admin.

---

## 🌍 Environment variables

All keys are stored on **Vercel** (or `.env` locally). Every `VITE_` var is read at build time — set them, then **Redeploy**.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` | Supabase project (auth + data + storage) |
| `VITE_GOOGLE_MAPS_API_KEY` | Real Google Maps (optional; fallback map otherwise) |
| `VITE_ROBOFLOW_API_KEY` | CivicLENS AI — real object detection (primary engine) |
| `VITE_ROBOFLOW_WORKSPACE` | Roboflow workspace slug |
| `VITE_ROBOFLOW_WORKFLOW_ID` | Roboflow workflow slug (your pothole workflow) |
| `VITE_ROBOFLOW_PROXY_URL` | Cloudflare Worker URL for Roboflow (30s timeout; else Vercel `/api/roboflow`) |
| `VITE_AI_ONDEVICE` · `VITE_ONDEVICE_MODEL` | On-device AI (default `true`, model `Xenova/yolos-tiny`) |
| `VITE_ONDEVICE_YOLO_URL` · `VITE_ONDEVICE_YOLO_LABELS` | Custom civic YOLO ONNX model (optional — detect potholes etc. on-device) |
| `VITE_HF_API_TOKEN` · `VITE_HF_MODEL` | Hugging Face backup (default `facebook/detr-resnet-50`) |
| `VITE_ADMIN_EMAILS` | Extra comma-separated admin emails |
| `VITE_APP_URL` | Public origin (QR + magic links) |

**SMTP / EmailJS (optional):** `SMTP_HOST/PORT/USER/PASS/FROM` or `VITE_EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY` enable real authority escalation emails. Without them, the app falls back to `mailto:`.

---

## 🧠 AI engines (order)

1. **CivicLENS AI (Roboflow)** — **PRIMARY** cloud engine, trained on civic issues. Runs via a proxy (Cloudflare Worker preferred, or `/api/roboflow`).
2. **Custom on-device YOLO** *(fallback)* — if `VITE_ONDEVICE_YOLO_URL` is set, runs your YOLO ONNX model in the browser (Crepify/CivicEyeModel). Used when Roboflow is unavailable/unconfigured — free, private, offline.
3. **On-device (Transformers.js)** — general COCO model, only trusted when it confidently maps to a civic category.
4. **Hugging Face Inference API** — cloud backup (needs `VITE_HF_API_TOKEN`).
5. **Built-in estimate** — last resort, clearly labeled.

Photos are compressed before sending (768px, JPEG ~72) to stay within free-tier quotas.

> ⚠️ **Quota note:** Roboflow free tier ≈ 1,000 inferences/month. Each report photo = 1; each live frame = 1. Use `/live` sparingly ("Careful · 8s") or run a local model for unlimited inference.

---

## 📁 Project structure

```
├─ src/
│  ├─ components/        # UI: Navbar, Footer, cards, map views, review/flag/vote…
│  │  └─ map/            # GoogleMapView, FallbackMapView, MapView, MapPopup
│  ├─ context/           # Auth, Brand, Reports, Notifications, Toast, Theme
│  ├─ data/              # categories, authorities, admins, campus config, brands
│  ├─ hooks/             # useAuth, useBrand, useReports, useToast, …
│  ├─ lib/               # supabase client, storage upload
│  ├─ pages/             # one file per route
│  ├─ services/          # roboflow, on-device, huggingface, report, geo, detection, authority, review
│  ├─ styles/            # Tailwind + brand theme (CivicEye indigo / Amrita red)
│  ├─ types/             # domain types
│  └─ utils/             # cn, format, geo, image compression
├─ api/                  # Vercel serverless: roboflow proxy, report-authority email
├─ worker/               # Cloudflare Worker (Roboflow proxy, 30s timeout)
├─ supabase/             # schema.sql + setup SQL (re-runnable)
└─ scripts/              # roboflow smoke test, report generator
```

---

## 🚀 Deployment

- **Host:** Vercel (auto-deploys from GitHub). Build: `npm run build` → output `dist`.
- **Supabase:** free project for auth/data/storage — run `supabase/schema.sql` (re-runnable), plus `supabase/storage-fix.sql` if uploads fail with RLS errors. For live cross-user updates (confirm counts, resolves, new reports), enable Realtime on the `reports` table: Database → Replication → `supabase_realtime` → toggle `reports` ON, or run `supabase/realtime-fix.sql`.
- **Email links (magic link / confirm / reset):** the app uses the PKCE flow and routes links through `/auth/callback`. In Supabase → **Authentication → URL Configuration** set **Site URL** to `https://<your-app>.vercel.app` and add these **Redirect URLs**: `https://<your-app>.vercel.app/auth/callback`, `https://<your-app>.vercel.app/**`, and `http://localhost:5173/**` for dev. If a confirmation link still lands on a "sign in to Vercel" page, that's Vercel **Deployment Protection** on a preview URL — use the production domain, or turn it off in Vercel → Settings → Deployment Protection.
- **Roboflow proxy:** deploy `worker/roboflow-proxy.js` as a Cloudflare Worker (see `worker/README.md`) and set `VITE_ROBOFLOW_PROXY_URL` — avoids Vercel's 10s serverless timeout.

---

## 🤝 Contributing / collaboration

Multiple people work on this repo. Read **`COLLABORATION.md`** — the short version:
- **Never use `git push -f`.** Use `git pull --rebase` before pushing.
- Work on branches and merge via pull requests.
- Only `git add` the files you changed.
- Never commit `.env` or API keys.

---

## 📖 More docs

- **`ARCHITECTURE.md`** — how the app is put together (data flow, map engines, AI pipeline).
- **`COLLABORATION.md`** — git workflow for the team.

---

## ⚠️ Status

Active development. AI detection uses real Roboflow inference (CivicLENS AI branding); Live AI and authority escalation are functional. Google Maps requires a key; without it the built-in vector map is used.
