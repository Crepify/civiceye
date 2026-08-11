# CivicEye / Amrita Eye — AI Handoff Document

Paste this entire document into a new Arena.ai instance to continue development with
full context. Last updated: 2026-08-10.

---

## 1. PROJECT IDENTITY

**CivicEye** — "Making cities better, one report at a time."
**Amrita Eye** — campus-branded mode (auto-activated on `@…amrita.edu` logins):
"Keeping our campus safe, one report at a time."

A civic issue reporting platform: citizens/campus students photograph and pin issues
(potholes, garbage, broken street lights, accidents, suspicious activity on campus…),
community validates them (upvote/downvote/confirm/reject), and staff/admins moderate
and act. Real data + real auth via **Supabase**, real AI image detection via **Groq**
(and Gemini when a working key exists).

History: originally a hackathon prototype, now a **passion project**. Concept origin
(stated on the About page): hostelers new to a city wanting to know where the potholes,
dark streets and flooded junctions are before trouble finds them. Project start date
branded as **1 August 2026**.

---

## 2. TECH STACK & RUNNING

- **Frontend:** React 18 + TypeScript + Vite 5 (strict TS, `@/` path alias)
- **Styling:** TailwindCSS 3.4 (custom CSS-variable palette), glassmorphism, Framer Motion
- **Routing:** React Router 6; login-first (all pages gated by auth)
- **Backend/DB:** Supabase (Postgres + Auth + Storage + RLS)
- **AI:** Groq `qwen/qwen3.6-27b` vision (primary real engine), Gemini fallback, built-in
  mock estimate as last resort
- **Maps:** Google Maps JS API (via `@googlemaps/js-api-loader` + markerclusterer),
  built-in SVG fallback map when no key
- **Other:** lucide-react icons, react-hook-form + zod, qrcode.react, `@supabase/supabase-js`

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build
npm run lint       # eslint, zero warnings
```

---

## 3. KEY ENVIRONMENT VARIABLES (.env / Vercel)

```env
VITE_SUPABASE_URL=            # required for login + real data
VITE_SUPABASE_ANON_KEY=       # required
VITE_GOOGLE_MAPS_API_KEY=     # optional (fallback vector map otherwise)
VITE_GEMINI_API_KEY=          # optional — see §7 (currently quota-blocked key exists)
VITE_GEMINI_MODEL=gemini-2.0-flash
VITE_GROQ_API_KEY=            # PRIMARY real AI engine — set & working
VITE_GROQ_MODEL=qwen/qwen3.6-27b
VITE_ADMIN_EMAILS=            # optional comma-separated extra admins
VITE_APP_URL=                 # origin for QR/magic links
VITE_AUTHORITIES=             # dashboard assign list
```

---

## 4. FEATURES (ALL BUILT)

**Auth (Supabase)** — email+password, magic link, password reset; sessions persist
(`persistSession`); login-first gate redirects everything to `/login` when logged out;
"Connect Supabase" setup screen when keys missing. Any valid email accepted;
`@…amrita.edu` → Amrita Eye brand.

**Branding** — `BrandContext` + `html.amrita` class. Amrita = red primary
(`--c-primary-500: 228 0 43`) + yellow accent (`--c-accent-500: 245 158 11`), red
favicon swap, logo "Amrita Eye", red/yellow gradients. CivicEye = indigo/emerald.
Brand-aware CSS utility classes: `brand-grad-1..6`, `brand-cta`, `brand-panel`,
`brand-glow-a/b`, `text-gradient`, `logo-mark`. Tailwind `accent` color is defined.
Amrita mode: city-only categories hidden (accident, illegal-dumping, traffic-signal);
campus-only "security" (Suspicious Activity) shown; verified badges go gold.

**Reports** — multi-step wizard: category → photo (upload/camera/QR phone→desktop sync)
→ AI analysis (real model w/ blur warning + AI disclaimer) → location (GPS ±30 m
disclaimer, pin-drop, **auto campus detection**: report coords vs campus boundary →
recommended "Mark as campus") → details (name from profile) → review → submit (photo
uploaded to Supabase Storage, report saved with `scope`).

**Community validation** — upvote/downvote/confirm/reject per user (atomic RPC),
3 confirms → verified. **Flag button** on every post (spam/harassment/false-info/
inappropriate/other + note) → saved to `report_flags` → staff panel.

**Reviews** — per-report review threads with agree/disagree tallies (atomic RPC),
landing page shows live community reviews (fake testimonials removed).

**Scope system** — every report has `scope: 'city' | 'campus'`. Amrita sees campus
only by default; FilterBar has **All/Campus/City** toggle on Map + Community. Admin
can bulk "Mark as campus/city". `src/data/campus.ts` holds campus center + radius
(Amrita Bengaluru Kasavanahalli, 1200 m — editable).

**Maps** — MapView dispatcher: GoogleMapView (clustered severity pins, custom circle
heatmap overlay — deprecated HeatmapLayer replaced, info windows w/ React popup) or
FallbackMapView (SVG engine, no key). Clicking a side-list report pans/zooms. Landing
hero + CTA use the real MapView now.

**Staff/Admin panel** (`/admin`) — admin-gated (see §8). Flagged posts inbox
(take-down deletes post + flag; dismiss clears flag), scope manager (mark campus/city),
reporters table (name/email/post count). Notification bell starts empty (dummy
notifications removed).

**Live AI page** (`/live`) — WIP banner; mock CCTV watchtower with detection boxes;
does NOT write to DB (marked work-in-progress).

**Other pages** — Landing (hero, stats, how-it-works, features, community reviews,
map CTA, category marquee), Features, Map, Community (search/filter/sort/paginate/
skeletons), About (real story + timeline), Contact, Report details, 404.

---

## 5. SUPABASE SCHEMA (supabase/schema.sql — re-runnable)

Tables: `profiles` (auto-created on signup via trigger; `is_amrita` flag),
`reports` (incl. `code` CE-xxxx, `scope`, `ai` jsonb), `report_votes` (PK
user+report+vote_type), `reviews`, `review_votes`, `report_flags`,
`admin_users` (email + brand), `report-photos` storage bucket.

RLS: reports read=public, insert/update=any authed user, delete=owner OR `is_admin()`;
profiles read=public/update=own; votes/reviews/flags=authed.

Functions: `handle_new_user()` trigger, `touch_updated_at()`, `vote_on_report()`
(atomic, auto-verifies at 3 confirms), `vote_on_review()`, `is_admin()`
(security definer — admin_users table OR `%@amrita.edu` AND NOT `%.students.%`).

MIGRATION note: if schema was run before the "security" category or `scope` column,
the ALTER/DO blocks at the top add them safely. Re-running the whole file is safe.

---

## 6. ADMIN CONFIG (src/data/admins.ts)

- `bl.ai.u4aid26006@bl.students.amrita.edu` → Amrita admin
- `architrenjeev@gmail.com` → CivicEye admin
- Teacher rule: any `@amrita.edu` email NOT `*.students.*` = Amrita admin
- Add admins: edit `src/data/admins.ts`, or `VITE_ADMIN_EMAILS` env, or insert into
  `admin_users` table.

---

## 7. REAL AI — CURRENT STATE (IMPORTANT)

**Working:** Groq `qwen/qwen3.6-27b` vision with key
`<your-groq-key>` (VERIFIED live: detected
pothole 1.0/high/clear, garbage 0.95/high/clear). Engine order: Gemini → Groq → mock.
Result card shows which engine ran.

**Known gotchas:**
- Qwen emits a `<think>` block before JSON — parser strips it; strict Groq
  `response_format: json_object` FAILS with `json_validate_failed`, so it is NOT used.
- "Model returned no JSON" = truncated think-only reply → service now retries once
  (600 ms) + `max_tokens: 900`.
- Groq free tier ~8k tokens/min (~2–3 analyses/min); 429 → wait ~15–20 s.
- Gemini key `<your-gemini-key>` is **quota-blocked
  (429 limit:0)** — needs a FRESH key created in a NEW project at
  aistudio.google.com/apikey to work.
- **BOTH KEYS HAVE BEEN PASTED IN CHAT → ROTATE THEM** once stable (regenerate Groq
  key; get new Gemini key in a new project). Keep keys only in .env/Vercel, never code.

Files: `src/services/geminiService.ts`, `src/services/groqService.ts`,
`src/services/aiAnalysisService.ts` (orchestrator `runImageAnalysis` + mock),
`src/types` `AnalysisResult` has `imageQuality`, `qualityNote`, `engine`.

**Free-alternative guide:** `REAL_AI_SETUP.md` (Gemini AI Studio, Groq, GPT-4o-mini,
Cloudflare, HF, local YOLO). Also `PRODUCTION_ROADMAP.md`, `LIVESTREAM_DETECTION.md`,
`SMTP_SETUP.md` (optional custom email; app uses Supabase built-in email ~30/hr with
spam warnings).

---

## 8. GITHUB / DEPLOYMENT STATE

- Repo: **https://github.com/Crepify/civiceye** (branch main)
- Vercel linked → auto-deploys on push; project has env vars set for Supabase +
  Groq + Google Maps.
- Workflow: replace `D:\CIVICEYE` (or wherever) with fresh `civiceye.zip` from the
  workspace, then:
  ```powershell
  cd "D:\CIVICEYE"
  git add .
  git commit -m "..."
  git push -f origin main
  ```
  (`-f` is fine — solo repo.)
- Zip is built excluding `node_modules`, `dist`, `.git`, `*.tsbuildinfo`.

---

## 9. OPEN ITEMS / NATURAL NEXT STEPS

1. **Rotate Groq key** + get a working **new-project Gemini key** (biggest blocker
   for resilience; app works on Groq alone now).
2. Add an on-screen **"Retry analysis"** button (re-run AI on same photo when
   rate-limited/truncated) — user asked about this.
3. **Real /live** pipeline (RTSP/CCTV → YOLO → WebSocket) — page is WIP preview only.
4. Contact page details (user will provide real contact info).
5. Campus config: verify `src/data/campus.ts` center/radius matches real campus;
   optionally draw campus boundary circle on map + "Campus" chip on cards/popups.
6. Optional: fine-tuned YOLO (local, free, offline) per PRODUCTION_ROADMAP Phase 2B.
7. Consider serverless proxy for AI key (client `VITE_` keys are public).
8. Reports created before `scope` column default to `city` — may want admin bulk
   mark-as-campus for real campus spots.

---

## 10. SHORTCUTS / NOTES FOR THE NEXT INSTANCE

- All `VITE_` keys must be set in both `.env` (local) and Vercel env vars; env
  changes require Vercel Redeploy.
- Test "real AI" by checking the result card badge ("Analysed by Groq Llama Vision")
  and console for `[CivicEye] Gemini unavailable: ...` / `Groq unavailable: ...`.
- Sandbox quirk: `node_modules` gets wiped between sessions → `npm install` first;
  headless browser checks need `npx puppeteer browsers install chrome` + apt libs.
- Login-first means pages redirect to /login when not authed; testing UI often needs
  a logged-in session or a configured Supabase project.
