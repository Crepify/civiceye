# 🎯 ANTIGRAVITY HANDOFF PROMPT — CivicEye / Amrita Eye

Paste the ENTIRE block below (from `BEGIN PROMPT` to `END PROMPT`) into Google Antigravity.
The `civiceye` folder is already open in Antigravity. This is the EXACT state of the project
and everything that has happened — treat it as ground truth, don't guess.

---

BEGIN PROMPT

You are taking over development of the CivicEye / Amrita Eye project, a React + TypeScript
web app already open in your workspace (the `civiceye` folder). This is a precise handoff of
everything that exists and everything that has happened. Read the codebase to confirm, then
continue from the Open Items at the end.

## 1. WHAT THIS PROJECT IS

CivicEye = a civic-issue reporting platform. Citizens / campus students photograph and pin
public problems (potholes, garbage, broken street lights, fallen trees, water leaks,
accidents, suspicious activity on campus), the community validates them, AI analyses photos,
and authorities/staff act on them via a dashboard. Amrita Eye = campus-branded mode that
auto-activates for @…amrita.edu emails (red/white/black/yellow theme, campus-only categories,
campus-scoped reports & routing). Tagline: "Making cities better, one report at a time."

## 2. TECH STACK (exact)

- Frontend: React 18, TypeScript (strict), Vite 5, TailwindCSS 3 (custom CSS-variable brand
  palette), Framer Motion, React Router 6 (login-first app), lucide-react, react-hook-form + zod,
  qrcode.react.
- Backend/DB: Supabase (Postgres, Auth, Storage, RLS). Client: @supabase/supabase-js.
- AI: Roboflow (branded "CivicLENS AI") object detection = PRIMARY; Groq vision
  (qwen/qwen3.6-27b) = fallback; built-in mock estimate = last resort.
- Maps: Google Maps JS API (@googlemaps/js-api-loader + @googlemaps/markerclusterer) with a
  built-in SVG fallback map when no key.
- Serverless: Vercel functions (`api/roboflow.js`, `api/report-authority.js`) + Cloudflare
  Worker (`worker/roboflow-proxy.js`).
- Email: nodemailer (SMTP gateway) + EmailJS client fallback + mailto/WhatsApp/SMS fallbacks.
- Dependencies (package.json): @googlemaps/js-api-loader, @googlemaps/markerclusterer,
  @hookform/resolvers, @supabase/supabase-js, framer-motion, lucide-react, qrcode.react,
  react, react-dom, react-hook-form, react-router-dom, zod, @emailjs/browser, nodemailer.

## 3. PROJECT STRUCTURE (current)

Root: README.md (fully rewritten, clean), ARCHITECTURE.md, COLLABORATION.md, PRESENTATION.md,
PROJECT_DOCUMENTATION.docx, CivicEye_Presentation.pptx, screenshots/ (7 PNGs), api/,
worker/, supabase/, scripts/, src/, vite.config.ts, vercel.json, tsconfig.json,
tailwind.config.js, test-email-preview.html.

src/: components/ (incl. map/ GoogleMapView, FallbackMapView, MapView, MapPopup; AuthorityContactCard;
ReviewSection; CommunityReviews; FlagButton; VoteButtons; ReportToAuthority; AdminPanel-related;
Logo, Navbar, Footer, ThemeToggle, NotificationBell, Modal, Drawer, etc.), context/ (AuthContext,
BrandContext, ReportsContext, NotificationContext, ToastContext, ThemeContext, AppProviders),
data/ (categories, authorities, admins, brands, campus, features, notifications), hooks/,
lib/ (supabase.ts, storage.ts), pages/ (Landing, MapPage, ReportPage, ReportDetails, Dashboard,
Community, LiveDetection, Features, About, Contact, Login, AdminPanel, AuthCallback,
ResetPassword, NotFound), services/ (aiAnalysisService, authorityService, detectionService,
flagService, geoService, geocodeService, groqService, mapService, reportService, reviewService,
roboflowService, syncService), styles/index.css, types/index.ts, utils/ (cn, format, geo,
image, auth, download).

## 4. KEY FEATURES — EXACT CURRENT BEHAVIOR

- Auth: Supabase email+password / magic link / password reset. Login-first: every non-auth
  page redirects to /login unless VITE_DEMO_MODE=true (demo bypass added for screenshots/demos).
- Branding: html.amrita class swaps CSS variables (indigo→Amrita red 228 0 43, accent
  emerald→yellow 245 158 11); brand-grad-1..6, brand-cta, brand-panel, brand-glow-a/b utility
  classes; favicon swaps to red logo-amrita.svg in Amrita mode; Logo shows "CivicEye" or
  "Amrita Eye".
- Report wizard: category → photo (upload/camera/QR phone→desktop sync) → AI analysis →
  location → details → review. AI result card shows engine badge ("✅ Detected by CivicLENS
  AI"), editable category dropdown (with "⚠️ AI may be wrong — you can change it" hint),
  blur/unclear warning, "Retry analysis" button, Original/AI-annotated image toggle.
- AI pipeline: runImageAnalysis → Roboflow (via proxy /api/roboflow or VITE_ROBOFLOW_PROXY_URL
  Worker) → Groq → mock. Photos compressed to 768px JPEG ~72 before sending. Roboflow
  predictions aggregated by max-confidence-per-category (aggregateVerdict), objects deduped.
  roboflowStatus() / roboflowConfig() diagnostics surface missing-env errors in UI + console.
- Campus auto-detection: src/data/campus.ts (center 12.9027,77.6812, radius 1200m) —
  LocationStep shows "inside Amrita Bengaluru Campus" card + Mark-as-campus buttons.
- Scope system: reports.scope = 'city' | 'campus'. Amrita sees campus by default; FilterBar has
  All/Campus/City toggle (Map + Community). Admin can mark reports campus/city.
- Community validation: vote_on_report RPC (up/down/confirm/reject, one per user via
  report_votes PK); 3 confirms → verified. FlagButton posts to report_flags.
- Reviews: reviewService + ReviewSection, agree/disagree via vote_on_review RPC.
- Map: MapView dispatcher (Google or fallback). Custom circle-based heat overlay (the old
  google.maps.visualization.HeatmapLayer was REMOVED — deprecated in Maps v3.65). Clicking a
  report in the side list or a marker sets view center + zoom 16.
- Live AI (/live): LiveDetection.tsx — device camera / video file / screen capture → full
  frames to Roboflow detectFrameWithRoboflow → draws boxes, can auto-create deduped pending
  reports. Inference intervals 2s/4s/8s. WARNING: consumes ~1 Roboflow credit per frame
  (free tier ~1000/mo).
- Authority escalation (REAL): api/report-authority.js (nodemailer SMTP gateway, server-side
  recipient allow-list, returns 503 EMAIL_NOT_CONFIGURED → client falls back to mailto).
  authorityService.ts (EmailJS send + SMTP + WhatsApp/SMS/mailto links + logEscalation to
  Supabase authority_reports). AuthorityContactCard shows contact channels. authorities.ts has
  campus-scoped authorities (Amrita Estate/Facilities/Security) + authorityForCategory routing.
- Admin panel (/admin): admin-gated (src/data/admins.ts + VITE_ADMIN_EMAILS + admin_users DB
  table + teacher rule: any @amrita.edu NOT *.students.* is an Amrita admin). Flags inbox
  (take down/dismiss), scope manager (mark campus/city), reporters table (name/email/count).
- Dashboard: KPI cards, category/severity donut/weekly charts, hotspots, live ward map
  (scoped), recent-reports table with Resolve/Assign/Reject. ChartCard has overflow-hidden.
- Presentation/docs: CivicEye_Presentation.pptx (13 slides, Segoe UI, dark premium theme, 7
  screenshots embedded), PROJECT_DOCUMENTATION.docx (Segoe UI, styled, includes "4.0 UI /
  Design → NEW UI COMING SOON."), PRESENTATION.md, screenshots/*.png.

## 5. ENVIRONMENT VARIABLES (stored on Vercel; .env for local)

- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY — REQUIRED (auth/data/storage).
- VITE_GOOGLE_MAPS_API_KEY — optional (fallback map otherwise).
- VITE_ROBOFLOW_API_KEY = pH4YPhBlARoTRyhNk6Y8 (SHARED IN CHAT — ROTATE).
- VITE_ROBOFLOW_WORKSPACE = aswathram-kumar.
- VITE_ROBOFLOW_WORKFLOW_ID = civiceye-pothole-reporting-starter-1786336062967 (returns
  output_image + predictions[] with class/confidence).
- VITE_ROBOFLOW_PROXY_URL = Cloudflare Worker URL (e.g. civiceye.architrenjeev.workers.dev) —
  optional; without it the app uses /api/roboflow (Vercel, 10s Hobby timeout).
- VITE_GROQ_API_KEY = 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 (SHARED IN
  CHAT — ROTATE), VITE_GROQ_MODEL = qwen/qwen3.6-27b.
- VITE_ADMIN_EMAILS — extra comma-separated admins.
- VITE_APP_URL, VITE_AUTHORITIES, VITE_DEMO_MODE (true for login-bypass demos).
- Optional email: SMTP_HOST/PORT/USER/PASS/FROM or VITE_EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY.

## 6. GIT STATE & COLLABORATION (exact)

- Repo: https://github.com/Crepify/civiceye (branch main), Vercel auto-deploys from main.
- Historical pushes used `git push -f` while solo. With teammates now, the rule (documented in
  COLLABORATION.md) is: NEVER force-push; work on branches; `git pull --rebase` before push;
  only `git add` files you changed; never commit .env/keys.
- GitHub secret scanning BLOCKED a push because HANDOFF.md contained real Groq/Gemini keys —
  they were redacted to <your-groq-key>/<your-gemini-key> in the repo copy. There may still be
  old commits containing keys in history (from before redaction); if push is blocked again,
  scrub with git filter-branch/filter-repo or use GitHub's unblock link, and ROTATE the keys.
- Current admin emails in src/data/admins.ts + supabase/schema.sql: architrenjeev@gmail.com
  (civiceye), xetawaw@gmail.com (civiceye), bl.ai.u4aid26006@bl.students.amrita.edu (amrita),
  bl.ai.u4aid26007@bl.students.amrita.edu (amrita).
- Supabase schema (supabase/schema.sql, re-runnable): profiles, reports (with scope column),
  report_votes, reviews, review_votes, report_flags, admin_users, authority_reports,
  storage bucket report-photos + storage RLS policies (storage-fix.sql). Functions:
  handle_new_user, touch_updated_at, vote_on_report, vote_on_review, is_admin.
- A "Live AI" developer's complete zip (via Google Drive) was merged into the base: added
  api/report-authority.js, src/services/authorityService.ts, src/components/AuthorityContactCard.tsx,
  supabase/authority-reports.sql, supabase/storage-fix.sql; updated ReportToAuthority,
  authorities.ts, Dashboard, LiveDetection, ReportDetails, ReportPage, roboflowService,
  types, vite-env.d.ts, schema.sql, vite.config.ts, package.json (+@emailjs/browser,
  +nodemailer). Build verified (tsc + eslint + vite build all pass).
- TWO MORE zips are still pending (NOT yet merged): "CivicEye UI" dev (A) and "Amrita UI"
  dev (B). They are based on the same current version. When they arrive, merge in order
  C(AI, done) → A (CivicEye UI) → B (Amrita UI), build-verify, and flag conflicts.

## 7. OPEN ITEMS / KNOWN ISSUES (do these next)

1. CONFIRMATION COUNT BUG (reported, NOT fixed): a user confirmed a report; a second person
   confirmed; the first user's screen still shows confirms=1 even after refresh. vote_on_report
   RPC and refresh logic look correct. Diagnosis plan: check report_votes rows for that report
   (2 confirm rows?) and whether person B was actually signed in. Likely fix: add a Supabase
   Realtime subscription to ReportsContext so reports live-update across users (enable
   Realtime on the reports table in Supabase). Investigate and fix.
2. ROTATE the Roboflow + Groq API keys (they were shared in chat) and update Vercel env.
3. When the A and B zips arrive, merge them (see §6) and re-verify the build.
4. Optional: verify campus coordinates in src/data/campus.ts against the real campus.
5. Optional: enable Supabase Realtime for reports (needed for the confirmation fix).
6. The "Report to Authority" contacts in src/data/authorities.ts are sample data (email
   xetawaw@gmail.com used as placeholder) — replace with real contacts when provided.
7. Live AI consumes Roboflow credits per frame — consider local GPU (Ollama / YOLO) for
   unlimited inference (VITE_AI_URL-style option not yet built).

## 8. COMMANDS

npm install · npm run dev · npm run build (tsc --noEmit && vite build) · npm run lint ·
npm run typecheck · npm run preview · VITE_DEMO_MODE=true npm run dev (login-bypass demo).

END PROMPT
