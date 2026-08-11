# 👁️ CivicEye

**Making cities better, one report at a time.**

CivicEye is a production-grade **hackathon prototype** of a citizen-powered civic-issue reporting platform. Citizens report potholes, garbage, broken street lights and more with a photo and a pin; the community validates reports; authorities get an organised dashboard to assign, fix and resolve them — all visualised on a live map.

> ⚠️ **Prototype notice:** The AI analysis and live-stream detection are mocked, and the Google Maps integration falls back to a built-in vector map without an API key. **Login, reports, votes and photos are real** — they run on Supabase (see `SUPABASE_SETUP.md`). No dummy data is shipped; the map starts empty until citizens submit real reports.

---

## ✨ Highlights

| Area                                | What you get                                                                                                                                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🗺️ **Live map**                     | Google Maps when a key is configured, built-in SVG fallback otherwise. Marker clustering, severity heatmap, filters, search, current-location, popups with photos/votes/status.                                  |
| 📸 **AI photo analysis** _(mocked)_ | 6-step wizard → snap/upload/QR-scan a photo → animated “vision model” detects category, confidence, severity, objects, description and GPS. |
| 📡 **Live AI Detection** _(mocked)_ | `/live` page simulates a CCTV watchtower — auto-detects potholes, accidents, garbage from “streams” and creates reports. Real YOLOv8 integration blueprint in `LIVESTREAM_DETECTION.md`. |
| 📱 **QR phone→desktop flow**        | Scan a QR on your desktop, take the photo on your phone, it syncs back automatically (BroadcastChannel + simulated cloud relay).                                                                                 |
| ✅ **Community validation**         | Upvote / downvote / confirm / reject. 3 confirmations ⇒ report becomes **Verified** and appears on the map & dashboard.                                                                                          |
| 🏛️ **Authorities dashboard**        | KPI cards, category/severity/weekly charts, hotspot list, recent-report table with _Mark Resolved / Assign / Reject_, downloadable ward report, and a “Report to authority” simulation with a success animation. |
| 🌓 **Polish**                       | Glassmorphism, soft shadows, Framer Motion page/scroll/hover animations, dark mode, toasts, skeletons, empty/error states, notifications, fully responsive & mobile-first.                                       |

**Tech stack:** React 18 · TypeScript · Vite 5 · TailwindCSS · Framer Motion · React Router 6 · Google Maps JS API (+ MarkerClusterer) · Lucide icons · React Hook Form + Zod · qrcode.react

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open **http://localhost:5173** — the app works immediately with the fallback map (no API key
needed). For **login + real reports**, add Supabase keys: see `SUPABASE_SETUP.md` (5 minutes).

### Other scripts

```bash
npm run build        # type-check + production build → dist/
npm run preview      # serve the production build locally
npm run lint         # ESLint (zero warnings allowed)
npm run lint:fix     # auto-fix lint issues
npm run format       # Prettier
npm run typecheck    # TypeScript only
npm run data:generate # regenerate the 100-report mock database
```

---

## 🧭 Pages

| Route                 | Page                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `/`                   | Landing — hero, animated background, stats, how-it-works, features, testimonials, live map preview |
| `/map` | Interactive map — Google/fallback engine, clustering, heatmap, filters, search, legend, popups |
| `/live` | **Live AI Detection** — mock CCTV vision model auto-creates reports (potholes, accidents, …). Real pipeline in `LIVESTREAM_DETECTION.md` |
| `/report` | Multi-step report wizard (category → photo/QR → AI analysis → location → details → review) |
| `/report?session=xxx` | Phone capture mode (opened by scanning the desktop QR code)                                        |
| `/report/:id`         | Report detail — full evidence, meta, community validation, related reports, directions             |
| `/dashboard`          | Authorities dashboard — KPIs, charts, map, recent table, assign/resolve/reject, generate report    |
| `/community`          | Community feed — search, filters, sorting, pagination, skeletons                                   |
| `/about` · `/contact` | Static product pages                                                                               |
| `*`                   | Polished 404                                                                                       |

---

## 🌍 Google Maps setup (optional)

The app runs without a key using its **fallback vector map**. To enable real Google Maps:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. Enable the **Maps JavaScript API** (and optionally **Places API**, **Geocoding API**).
3. Create an **API key** under _APIs & Services → Credentials_ → _Create credentials → API key_.
4. Restrict the key (HTTP referrers → `localhost:*` and your domain) — recommended.
5. Copy `.env.example` → `.env` and set:

```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

6. Restart the dev server. The map now renders with Google Maps, clustering and heatmap.

> 🔑 The key is read at build time via `import.meta.env` — it must be prefixed with `VITE_`.

### 🤖 Real AI engines (image analysis)

Analysis tries **Roboflow → Groq → built-in estimate**, whichever is configured (Roboflow is primary).

**Roboflow workflow ("CivicEye Pothole Reporting Starter")** — env setup:

```env
VITE_ROBOFLOW_API_KEY=<key from app.roboflow.com/settings/api>
VITE_ROBOFLOW_WORKSPACE=aswathram-kumar
VITE_ROBOFLOW_WORKFLOW_ID=civiceye-pothole-reporting-starter-1786336062967
```

- The browser can't call Roboflow directly (its serverless endpoint omits the CORS
  `Access-Control-Allow-Origin` header in preflight), so the app calls **its own proxy**:
  `POST /api/roboflow` (Vercel function `api/roboflow.js`, mirrored in dev by a vite
  proxy). The function forwards to
  `https://serverless.roboflow.com/{workspace}/workflows/{workflow_id}` with
  `{ api_key, inputs: { image: { type: "base64", value } } }` (declared input: `image`;
  URL inputs must be https, base64 works too).
- **Grounded real response:** `{ outputs: [ { output_image: { type: "base64", value: <jpeg> } } ] }`
  — this starter workflow returns **only the annotated image**, no class/confidence data.
  The app shows the annotated image and reports "no detection data" honestly. To get real
  confidence scores, expose the predictions as a workflow output, or set
  `VITE_ROBOFLOW_MODEL=<model/version>` to use a standard `detect.roboflow.com` endpoint
  (which returns per-box `{class, confidence}`).
- Smoke test (validates the live contract; key via env, never hardcoded):
  ```bash
  RF_KEY=<your key> node scripts/roboflow-smoke.mjs
  ```
- ⚠️ **Vercel Hobby functions time out at 10s**, but Roboflow's workflow can take ~5–15s.
  So a **Cloudflare Worker proxy** is recommended (30s free timeout): see
  `worker/README.md` (deploy + `VITE_ROBOFLOW_PROXY_URL`). The app prefers the Worker
  when `VITE_ROBOFLOW_PROXY_URL` is set, otherwise it uses `/api/roboflow` (Vercel),
  falling back to Groq on timeout.

See **[ENVIRONMENT.md](./ENVIRONMENT.md)**, **[DEPLOYMENT.md](./DEPLOYMENT.md)** and
**[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for full details. Email uses Supabase's
built-in sender (~30/hr) — confirmation emails may land in spam, so the login page warns
users to check their junk folder. Optional: **[SMTP_SETUP.md](./SMTP_SETUP.md)** for a
free custom SMTP (own sender name + more capacity).

---

## 🗄️ Mock database

The database is **real (Supabase Postgres)** — no seeded dummy data. The `reports` table stores titles, descriptions, coordinates, category, severity, status, photo URL, votes, confirmations, verification state and the reporter. Schema + RLS in `supabase/schema.sql`.

- Regenerate deterministically: `npm run data:generate` (seeded — same output every run).
- Runtime changes (new reports, votes, status) are persisted to `localStorage` under `civiceye:reports:v1`.
- Reset the demo data anytime from the dashboard header (`↻` button).

---

## 📁 Project structure

```
civiceye/
├─ public/                    # static assets (evidence photos, SVGs, favicon)
├─ scripts/
│  └─ generate-reports.mjs    # mock DB generator
├─ src/
│  ├─ assets/                 # (static imports live here if you add any)
│  ├─ components/             # reusable UI
│  │  └─ map/                 # GoogleMapView, FallbackMapView, MapView, MapPopup
│  ├─ context/                # Theme, Toast, Reports, Notifications providers
│  ├─ data/                   # categories, authorities, brands, features…
│  ├─ hooks/                  # useTheme, useToast, useReports, useDebounce, …
│  ├─ pages/                  # one file per route
│  ├─ services/               # mock "API" layer: reports, geo, AI, sync, maps
│  ├─ styles/                 # Tailwind entry + design tokens
│  ├─ types/                  # domain types
│  ├─ utils/                  # cn, format, geo, download helpers
│  ├─ App.tsx                 # routes + animated layout
│  └─ main.tsx                # entry point
├─ index.html
├─ vite.config.ts / tailwind.config.js / tsconfig.json / …
├─ .env.example
└─ docs? (see README files: ENVIRONMENT.md, DEPLOYMENT.md, GITHUB_SETUP.md, ARCHITECTURE.md)
```

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for a deep dive into the design.

---

## 🧪 Demo script (30 seconds)

1. **Report:** `/report` → pick _Pothole_ → _Browse files_ (use `/reports/pothole.jpg` from `public`) → watch the AI analysis → _Use my location_ (or drop a pin) → add title/description → submit 🎉.
2. **QR flow:** on the photo step choose _Scan from my phone_ → open the QR link in a new tab/phone → take a photo → watch it arrive on the desktop.
3. **Community validation:** open the report from the success screen → _Confirm_ 3 times → it becomes **Verified**.
4. **Dashboard:** `/dashboard` → assign the report to BBMP → mark resolved → _Generate report_ (downloads a `.txt` ward report).
5. **Map:** `/map` → toggle the heatmap, filter by category/severity, search your new report.

---

## 🛠️ Troubleshooting

| Issue                                | Fix                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Map shows the stylised fallback view | That's expected without a key. Add `VITE_GOOGLE_MAPS_API_KEY` to enable Google Maps.          |
| Geolocation denied                   | The wizard falls back to manual pin-dropping with a friendly toast.                           |
| `npm run dev` port in use            | Vite auto-increments to 5174.                                                                 |
| Data “resets” on a new browser       | Expected — the mock DB lives in that browser's `localStorage`. Use the dashboard ↻ to reseed. |

---

## 📄 License

MIT — free to use, modify and demo. All report data is fictional and generated for demonstration purposes.
