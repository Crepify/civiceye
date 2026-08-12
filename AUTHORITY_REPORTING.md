# 📮 Authority Reporting — what was built & what you need to do

The simulated "Report to Authority" is now **real**: citizens can escalate any
report straight to the responsible department by email (server-sent), WhatsApp,
or phone — and they always see the authority's public contact card.

## How it works now

1. A citizen opens a report → **"Report to authority"** (also offered right
   after submitting a new report).
2. The app resolves the responsible office automatically from the report's
   **category + scope** (city govt dept ↔ campus office), shows the contact
   card (email / phone / hours / address), and lets the citizen add a note.
3. **"Email report package"** → `POST /api/report-authority` emails a
   formatted package (details, evidence-photo link, GPS + Google Maps link,
   citizen's reply-to) to the authority's inbox.
4. If SMTP isn't configured on Vercel yet, the same screen falls back to
   opening the citizen's mail app with everything pre-filled — **the feature
   is fully demoable today with zero setup**.
5. Every escalation (any channel) is logged to Supabase `authority_reports`
   (optional audit trail — run the SQL below).

Routing examples: pothole → BBMP Ward 42 · garbage → BBMP SWM · water leak →
BWSSB · street light → BESCOM · traffic signal → Traffic Police · campus
issues → Amrita Estate / Facilities / Security.
(The Dashboard "Assign to…" dropdown now shows only the authorities of the
active brand too.)

## ⏭️ 3 things you need to do

### 1. Put in the real contacts  *(the numbers/emails you said you'll share)*
Edit **`src/data/authorities.ts`** — every `email`, `phone`, `whatsapp`,
`address` has a `// TODO` marker. One file, ~9 entries.

### 2. Turn on real email delivery on Vercel
Project → **Settings → Environment Variables** (Production):

```
SMTP_HOST=smtp.gmail.com          (or Resend/SES/any SMTP)
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=<gmail APP password>    (Security → App passwords, NOT your login pw)
SMTP_FROM=CivicEye Alerts <you@gmail.com>

# one per authority — the actual inbox that receives escalations:
AUTHORITY_EMAIL_BBMP_42=ward42@bbmp.gov.in
AUTHORITY_EMAIL_BBMP_SWM=swm@bbmp.gov.in
AUTHORITY_EMAIL_BWSSB=helpdesk@bwssb.karnataka.gov.in
AUTHORITY_EMAIL_BESCOM=...
AUTHORITY_EMAIL_TRAFFIC_POLICE=...
AUTHORITY_EMAIL_FOREST_DEPT=...
AUTHORITY_EMAIL_AMRITA_ESTATE=estate@amrita.edu
AUTHORITY_EMAIL_AMRITA_FACILITIES=...
AUTHORITY_EMAIL_AMRITA_SECURITY=...
```
The recipient **only** comes from this allow-list (or the directory file) —
users can never turn the endpoint into a spam relay. Details in `ENVIRONMENT.md`.

### 3. (Optional) audit trail
Supabase → SQL Editor → run **`supabase/authority-reports.sql`**.
Without it everything still works; logging just skips silently.

## Files touched

| File | Change |
| --- | --- |
| `api/report-authority.js` | **New** — Vercel serverless email gateway (nodemailer) |
| `src/data/authorities.ts` | Rewritten — real depts + contacts + category routing + link helpers |
| `src/components/ReportToAuthority.tsx` | Rewritten — compose → send → done/fallback modal |
| `src/components/AuthorityContactCard.tsx` | **New** — reusable contact card |
| `src/services/authorityService.ts` | **New** — payload builder, API client, mailto/WhatsApp fallbacks, Supabase logging |
| `src/types/index.ts` | `Authority` extended (email/phone/whatsapp/scope/categories), `AuthorityEscalation` added |
| `src/pages/ReportDetails.tsx` | Passes the real report; contact card + contactable "Handled by" |
| `src/pages/ReportPage.tsx` | Success screen passes the created report |
| `src/pages/Dashboard.tsx` | Assign dropdown filtered to the active brand's authorities |
| `supabase/authority-reports.sql` | **New** — escalation audit table (RLS: users insert own, admins read) |
| `ENVIRONMENT.md` | Setup docs for all of the above |

## Verify

```bash
npm install && npm run typecheck && npm run build   # all green
# demo the mailto fallback: open any report → "Report to authority"
# after step 2: send a real test escalation to your own inbox
```

(The API handler was smoke-tested: 405/400/503/502/200 paths all behave,
email lands with the right To/From/Reply-To.)
