# 🎓 CivicEye — College Presentation Pack

> dashboard, live AI, about). Word them below is ready to drop into slides.

---

## Slide 1 — Title
**CivicEye / Amrita Eye**
*Making cities better, one report at a time.*

A citizen-powered platform to report, visualise and fix civic issues — from potholes on city roads to safety concerns on campus.

**Team · Course · College**  *(add your names)*

---

## Slide 2 — The Problem

> "Every year, thousands of students move to a new city and spend four years there knowing almost nothing about it. Where are the potholes? Which streets go dark at night? Which junctions flood every monsoon?"

- Civic issues are reported **everywhere** — helplines, apps, social media — with **no single trusted source**.
- Complaints get **lost, duplicated, or forgotten**.
- Newcomers (students, freshers, new residents) have **no way to know** what's broken or dangerous before trouble finds them.
- Authorities get **scattered, unverifiable** complaints instead of organised data.

**The result:** potholes stay for weeks, dark streets stay dark, and accidents happen that a shared map could have prevented.

---

## Slide 3 — The Solution: CivicEye

CivicEye turns everyday observations into **organised, verifiable civic data**:

- 📸 **Snap a photo** — report a pothole, broken light, garbage pile, or anything unsafe
- 📍 **Pin it on the map** — GPS or manual pin, with campus auto-detection
- 🤖 **AI analysis** — real object detection (CivicLENS AI) identifies the issue, confidence & severity
- ✅ **Community validates** — neighbours confirm; 3 confirms → **Verified**
- 🏛️ **Authorities act** — a live dashboard with priority, assignment & resolution tracking

**One minute to report. One place for everything. Visible progress for all.**

---

## Slide 4 — Amrita Eye (Campus Mode)

A dedicated mode for the campus community:

- Auto-activates for **@amrita.edu** students & staff
- Campus-relevant categories (suspicious activity, water leaks, broken lights…)
- Reports **routed to campus offices** (Estate, Facilities, Security)
- Red & gold campus theme, campus-scoped map

> *"Keeping our campus safe, one report at a time."*

---

## Slide 5 — How It Works (5 steps)

1. **Spot the problem** — choose a category (pothole, garbage, street light, accident…)
2. **Snap a photo** — take it on your phone (QR flow) or upload; AI analyses it
3. **Pin the location** — GPS auto-detected (±30 m) or drop a pin; campus detection
4. **Community verifies** — neighbours confirm; 3 confirms → **Verified**
5. **Authority fixes it** — ward/staff dashboard → assigned → resolved (you get notified)

---

## Slide 6 — Features Tour

| Feature | What it delivers |
|---|---|
| 🗺️ **Live Interactive Map** | Google Maps + clustering, heatmap, filters, search, zoom-on-click |
| 🤖 **CivicLENS AI** | Real object detection: category, confidence, severity, description |
| 📡 **Live AI Detection** | Camera / video / screen → live detection boxes in `/live` |
| ✅ **Community Validation** | Upvote / confirm / reject → Verified status |
| 💬 **Reviews** | Report threads with agree/disagree |
| 🏛️ **Authority Dashboard** | KPIs, charts, assign/resolve, ward report, escalation |
| 🎓 **Amrita Eye** | Campus theme, categories & routing |
| 🛡️ **Admin Panel** | Moderation, take-downs, scope control, reporter details |

---

## Slide 7 — Screenshots (use the images)

- **Landing** — `landing.png`
- **Interactive Map** — `map.png`
- **Community feed** — `community.png`
- **Authority Dashboard** — `dashboard.png`
- **Live AI Detection** — `liveai.png`
- **Login** — `login.png`

*Caption each with a one-liner from the features table.*

---

## Slide 8 — The Technology

| Layer | What we use |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | Supabase (Postgres, Auth, Storage, RLS) + Vercel serverless |
| **AI** | On-device (Transformers.js) + Roboflow (CivicLENS) + Hugging Face fallback |
| **Maps** | Google Maps JS API + marker clustering + heatmap |
| **Deployment** | Vercel + Cloudflare Worker proxy (30s timeout) |

---

## Slide 9 — Real vs Simulated

**Real (works end-to-end):**
- ✅ Login, reports, votes, confirmations, reviews — live in Supabase
- ✅ Photo upload to storage
- ✅ AI photo analysis (real Roboflow inference)
- ✅ Report-to-authority escalation (email/WhatsApp/mailto)
- ✅ Live AI detection (camera/video/screen → Roboflow)

**Prototype aspects:**
- ⚠️ Authority contact data is sample (swap in real contacts)
- ⚠️ AI free-tier quotas apply (~1,000 Roboflow inferences/month)

---

## Slide 10 — What We Learned / Impact

- **Crowdsourcing works** — a shared, verified map is more trusted than scattered complaints
- **AI + community together** — AI speeds reporting; community keeps it honest
- **Built for real users** — born from the "new student in a new city" problem

**Future:** ward-office integration, push notifications, local GPU models for unlimited live AI, city-by-city rollout.

---

## Slide 11 — Thank You / Q&A

**CivicEye / Amrita Eye**
*Making cities better, one report at a time.*

Questions?

*(Contact slide: your names/emails)*
