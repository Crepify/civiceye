# 🔑 Environment variables & Google Maps API setup

## Variables

All env vars are consumed **at build time** through `import.meta.env` (Vite convention). They must be prefixed with `VITE_` to be exposed to the client bundle.

| Variable                   | Required | Default                                                 | Purpose                                                                                                                 |
| -------------------------- | -------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `VITE_GOOGLE_MAPS_API_KEY` | No       | _(empty)_                                               | Enables real Google Maps. Without it the app uses the built-in fallback vector map.                                     |
| `VITE_APP_URL`             | No       | `window.location.origin`                                | Base URL baked into the QR “scan & upload” link (set it to your production domain, e.g. `https://civiceye.vercel.app`). |
| `VITE_AUTHORITIES`         | No       | `BBMP Ward 42,BWSSB,BESCOM,Traffic Police,Forest Dept.` | Comma-separated mock agencies (dashboard assignment).                                                                   |

### Setup steps

```bash
cp .env.example .env     # then edit .env
```

---

## 🗺️ Getting a Google Maps API key (step by step)

1. **Create/select a project** at [console.cloud.google.com](https://console.cloud.google.com/).

2. **Enable APIs**
   - _APIs & Services → Library_
   - Enable **Maps JavaScript API** (required for the map).
   - Optional but recommended: **Places API** (autocomplete) and **Geocoding API** (address lookup).

3. **Create the key**
   - _APIs & Services → Credentials → + Create credentials → API key_
   - Copy the key, e.g. `AIzaSyB...`.

4. **Restrict the key** (strongly recommended)
   - Click the key → _Application restrictions → HTTP referrers_
   - Add: `http://localhost:*`, `https://localhost:*`, `https://your-app.vercel.app/*`
   - Under _API restrictions_, allow only the three APIs above.

5. **Wire it up**

   ```env
   # .env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyB...
   VITE_APP_URL=https://civiceye.vercel.app
   ```

6. **Restart** the dev server (`npm run dev`) or redeploy on Vercel — the key is inlined at build time.

> 💡 **No-key fallback:** leave the key empty and the app still works — `MapView` renders the built-in vector map (`FallbackMapView`) with the same markers, clustering, heatmap and interactions. This is intentional so judges/demo machines never hit a blank map.

## 🔐 Security notes

- `VITE_*` vars are public by design — never put server secrets there.
- Key restrictions (referrers + API restrictions) protect you from quota abuse even though the key ships in the bundle.
- The Geocoding/Places calls are **not** made in this prototype — location naming uses a local mock (`src/services/geocodeService.ts`). Swap `mockReverseGeocode` for `google.maps.Geocoder` to go live.

---

## 📨 Authority reporting (escalation emails)

"Report to authority" sends a formatted report package (details, evidence-photo
link, GPS + Google Maps link) straight to the responsible department's inbox
via `POST /api/report-authority` (Vercel serverless function).

### 1. Set your real authority contacts

- **Display + directory:** edit `src/data/authorities.ts` — every `email`,
  `phone`, `whatsapp`, `address` is a clearly marked `TODO` placeholder.
- **Delivery inbox (server-side, no code change):** on Vercel set
  `AUTHORITY_EMAIL_<ID>` per authority, e.g.

  | Variable                         | Routes mail for…            |
  | -------------------------------- | --------------------------- |
  | `AUTHORITY_EMAIL_BBMP_42`        | BBMP Ward 42 Control Room   |
  | `AUTHORITY_EMAIL_BBMP_SWM`       | BBMP Solid Waste Management |
  | `AUTHORITY_EMAIL_BWSSB`          | BWSSB Helpline              |
  | `AUTHORITY_EMAIL_BESCOM`         | BESCOM 1912                 |
  | `AUTHORITY_EMAIL_TRAFFIC_POLICE` | Bengaluru Traffic Police    |
  | `AUTHORITY_EMAIL_FOREST_DEPT`    | BBMP Forest Cell            |
  | `AUTHORITY_EMAIL_AMRITA_ESTATE`  | Campus Estate & Civil Works |
  | `AUTHORITY_EMAIL_AMRITA_FACILITIES` | Facilities & Housekeeping |
  | `AUTHORITY_EMAIL_AMRITA_SECURITY`| Campus Security Control Room|

  The recipient can **only** come from this allow-list — citizens can never
  make the function email an arbitrary address.

### 2. Configure SMTP (server-only, no `VITE_` prefix)

| Variable    | Required | Example                                    |
| ----------- | -------- | ------------------------------------------ |
| `SMTP_HOST` | Yes*     | `smtp.gmail.com`, `smtp.resend.com`        |
| `SMTP_PORT` | No       | `587` (TLS) or `465` (SSL)                 |
| `SMTP_USER` | Yes*     | your SMTP username                         |
| `SMTP_PASS` | Yes*     | your SMTP password / app password          |
| `SMTP_FROM` | No       | `CivicEye Alerts <alerts@yourdomain.com>`  |

\* Until SMTP is set up, the UI automatically falls back to opening the
citizen's own mail app with a fully pre-filled email — the feature works
in demos with zero configuration.

> **Gmail tip:** use an *App Password* (Google Account → Security →
> 2-Step Verification → App passwords), not your normal password.

### 3. Optional audit trail

Run `supabase/authority-reports.sql` in the Supabase SQL editor to create the
`authority_reports` table. Every escalation (email / WhatsApp / call tap /
mailto fallback) is then logged for admins. Skipping the migration is fine —
logging fails silently and the escalation itself still works.
