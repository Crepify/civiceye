# CivicEye — Report-to-Real-Authorities Guide

**Goal:** when a citizen clicks "Report to authority", the consolidated report
(title, category, severity, location, map link, evidence photo, description,
citizen reply-to) is actually DELIVERED to the real department — by email (with
a proper sender so it doesn't land in spam), and optionally WhatsApp/SMS.

The plumbing already exists in the app:

| Layer | File | Status |
|---|---|---|
| UI button + channel picker | `src/components/ReportToAuthority.tsx` | ✅ built |
| Escalation logic + logging | `src/services/authorityService.ts` | ✅ built |
| Server email gateway (nodemailer, allow-listed recipients) | `api/report-authority.js` | ✅ built |
| Delivery log table | `supabase/authority-reports.sql` | ✅ built |
| Authority directory | `src/data/authorities.ts` | ⚠️ **placeholders** — your job to fill |

So your job is **3 things**: (1) real contact data, (2) a working email sender,
(3) per-department routing. Everything else works.

---

## Phase 0 — Collect REAL contacts (the part nobody can do for you)

Authorities are public, but you must **verify** each one (numbers/emails change
and wrong ones = embarrassment at judging). Sources: official websites,
helplines, RTI replies, your college's public-works contacts.

Known-stable public helplines (Bengaluru — verify before shipping):

| Department | Known helpline | Notes |
|---|---|---|
| BESCOM (power / street lights) | **1912** | 24×7; also online at bescom.karnataka.gov.in |
| BWSSB (water / sewerage) | **19145** | Cauvery complaints; verify current |
| BBMP (roads, garbage, sanitation) | **1533** | BBMP citizen helpline; also the "Samparka" portal + **Namma Bengaluru** app |
| Bengaluru Traffic Police | **103** | traffic; active on X @blrcitytraffic |
| Tree felling / parks (BBMP) | ward office / 1533 | forest cell |

**How to find department emails** (official): open the department's website →
"Contact Us" / "Grievance" → note the exact address. Many municipal depts publish
a ward-level or zone-level email; use the one that maps to *your* campus/city.

**Fill `src/data/authorities.ts`** — replace every placeholder:

```ts
{
  id: 'bbmp-42',
  name: 'BBMP Ward 42 Control Room',
  department: 'Roads & Infrastructure',
  color: '#f59e0b',
  scope: 'city',
  categories: ['pothole', 'broken-road', 'sidewalk', 'manhole', 'other'],
  email: 'REAL-DEPT-EMAIL@bbmp.gov.in',      // ← real
  phone: '+91XXXXXXXXXX',                     // ← real
  whatsapp: ['91XXXXXXXXXX'],                 // ← real (if they accept)
  address: 'BBMP Ward 42 Office, …',
  hours: 'Mon–Sat 9:30–17:30',
},
```

> **Server-side override (recommended):** on Vercel set
> `AUTHORITY_EMAIL_BBMP_42=real@bbmp.gov.in` etc. The server reads the env first,
> so the public bundle never contains the real addresses — and you don't email a
> placeholder by accident. (The function is `emailFor()` in `api/report-authority.js`.)

---

## Phase 1 — A sender that actually delivers (email)

A `.gov` inbox is aggressive with spam filters. Free tiers that work:

| Provider | Free tier | Why |
|---|---|---|
| **Resend** (recommended) | 100 emails/day, 3,000/mo | Simple SMTP, great deliverability, easy DKIM |
| **Brevo** (ex-Sendinblue) | 300/day | Solid, India-friendly |
| **SendGrid** | 100/day | Popular |
| **EmailJS** | 200/mo | Already integrated client-side (`VITE_EMAILJS_*`) |

**Setup (Resend as the example):**
1. resend.com → sign up → **API Keys** → create an SMTP key.
2. **Add & verify a domain** you own (e.g. `civiceye.in`) — Resend gives you DNS
   records; add **SPF, DKIM, DMARC** at your DNS host. This is THE step that keeps
   mail out of spam.
3. On **Vercel → Settings → Environment Variables** add:
   ```
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_USER=resend
   SMTP_PASS=<the SMTP key>
   SMTP_FROM="CivicEye <alerts@civiceye.in>"
   ```
4. Redeploy. Done — the existing `api/report-authority.js` picks these up
   automatically (it reads `SMTP_HOST/PORT/USER/PASS/FROM`).

**Verify deliverability:** send yourself a test report → check it arrives, isn't
in spam, and looks like the branded HTML card. Also send to a real dept address
and confirm no bounce.

---

## Phase 2 — Routing & testing

1. **Map categories → departments** already in `authorities.ts` (`categories:`
   per authority). Adjust so the right dept gets the right issue:
   - pothole/broken-road/manhole/sidewalk → BBMP ward
   - garbage/illegal-dumping → BBMP SWM
   - water-leakage/sewage → BWSSB
   - street-light → BESCOM
   - traffic-signal/accident → Traffic Police
   - fallen-tree → Forest/Tree cell
2. **Test the full flow:** report → "Report to authority" → pick channel → the
   server email fires, `authority_reports` logs a row, citizen sees
   `✅ Delivered (ref ESC-…)`.
3. **Reply-to:** the citizen's email is set as `replyTo`, so the department can
   reply directly to the reporter — nice demo.

---

## Phase 3 — Go beyond email (the channels that actually get responses)

In India, WhatsApp and SMS often get faster attention than email:

| Channel | How | Cost | Status in app |
|---|---|---|---|
| **WhatsApp Business API** | Via Meta-approved providers: **AiSensy / WATI / Twilio** (₹~1–3/message; requires approved template + business number) | paid | deep-link fallback already works |
| **WhatsApp click-to-chat** | `wa.me/<number>?text=…` — opens WhatsApp with the pre-filled report | free | ✅ already implemented (`whatsAppLinks()`) |
| **SMS gateway** | **Msg91 / Fast2SMS / Twilio** (₹0.2–0.5/sms, needs DLT registration in India for bulk) | paid | ✅ deep-link fallback (`smsLink()`) |
| **Official portals** | Pre-fill links: BBMP **Namma Bengaluru** app, **Swachhata** app (garbage), **CPGRAMS** (central) | free | not wired — nice add-on |
| **X / Twitter** | Pre-filled tweet @ the dept's handle (many respond publicly) | free | not wired — nice add-on |

For a hackathon, the free path (email + WhatsApp/SMS deep links) is enough to
*prove* the pipeline. For a real product you'd add the paid WhatsApp/SMS
providers behind the existing `channel` abstraction in `authorityService.ts`.

---

## Phase 4 — Make it credible (judging + honesty)

- **Audit trail:** `authority_reports` table already logs every escalation
  (channel, authority, reporter, timestamp). Show this in the admin panel as
  "Escalations delivered" — it's your proof it works.
- **SLA + reference:** every email carries `ESC-…` ref + "SLA 7 working days".
- **Honest caveat for the demo:** a real government department will NOT fix a
  pothole because a student app emailed them (they have their own pipelines,
  queues, and spam filters). Position the demo honestly: "we built the
  citizen→authority delivery pipeline with real channels; a pilot with a ward
  office would wire it into their existing intake."
- If you actually want to pilot: email/visit your **local BBMP ward office or
  campus public-works office**, show the app, ask for the *official* intake
  email/WhatsApp, set the env override, and demo a real delivery on the spot.
  That one pilot beats any slide.

---

## Quick start checklist

```bash
# 1. Fill real contacts in src/data/authorities.ts (Phase 0)
# 2. Verify a domain + get SMTP creds (Phase 1)
# 3. Vercel env: SMTP_HOST/PORT/USER/PASS/FROM + AUTHORITY_EMAIL_<ID> overrides
# 4. Redeploy, test: report → escalate → email arrives → authority_reports row
# 5. (Optional) wire WhatsApp/SMS providers into authorityService.ts channel
```

**Need the code for a specific piece?** Ask for: WhatsApp Business API wiring,
SMS gateway wiring, portal deep links, or an "Escalations" admin view on top of
`authority_reports` — I can implement any of them.

---

## Bonus (already implemented) — redirect citizen to the official portal

After a citizen submits a report, the success screen now shows a card:
*"Also file it officially with BBMP Ward 42 ↗"* — it auto-redirects to the
department's official complaint portal (countdown, cancelable, or open in a new
tab). Routing is automatic per category via `portalUrl` in
`src/data/authorities.ts` (e.g. a pothole → BBMP Samparka).

- Each city authority has a `portalUrl` (BBMP Samparka, BWSSB, BESCOM, City
  Police, BBMP main). **Verify these URLs are current** — civic portals change.
- Campus authorities have no `portalUrl` → the card is hidden for them.
- To add a portal for an authority, just set `portalUrl` in `authorities.ts` —
  the card appears automatically.
