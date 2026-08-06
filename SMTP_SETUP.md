# 📧 Optional: Free SMTP setup (for your own sender name + more capacity)

**You don't need this to run the app** — it uses Supabase's built-in email by default
(~30 emails/hour, and confirmation emails may land in spam — the login page warns users
to check their junk folder).

This guide is for when you want your **own sender address** (e.g. `Amrita Eye
<noreply@yourdomain.com>`) and a higher send limit. Pick an option below — **Option A
(Resend)** is the easiest.

---

## Option A — Resend (recommended: 100 emails/day free, no card)

### Part 1 — Create your Resend account & get the API key

1. Go to **https://resend.com** → **Get Started**.
2. **Sign up** — easiest with GitHub, or with your email. You land on the dashboard.
3. Left sidebar → **API Keys** → **Create API Key** (top right).
4. In the dialog:
   - **Name:** `supabase-smtp`
   - **Permission:** `Full access` (or `Sending access`)
   - **Domain:** `All domains`
5. Click **Add**.
6. **Copy the key immediately** — it starts with `re_` (e.g. `re_1234567890…`). Resend only
   shows it once. If you lose it, delete and recreate.

> ⚠️ The key is a secret — never commit it to GitHub or put it in the frontend `.env`.
> It goes only into Supabase's SMTP settings (Part 3).

### Part 2 — (Recommended) Verify your own domain

Without a domain you can send from Resend's shared `onboarding@resend.dev` address — it
works, but emails may land in spam. Verifying a domain fixes that.

1. Sidebar → **Domains** → **Add Domain**.
2. Enter a domain you own (e.g. `civiceye.com`) → **Add**.
3. Resend shows **3 TXT + 1 CNAME** DNS records — copy them.
4. At your domain registrar (GoDaddy, Namecheap, Cloudflare…), add those records.
5. Back in Resend, click **Verify** (DNS can take minutes–hour).

> 🎓 No domain? Skip this for now and use the shared sender. For a student project you can
> also grab a free domain (e.g. Freenom) if you want your own.

### Part 3 — Connect it to Supabase

1. Supabase dashboard → **Project Settings** (gear) → **Authentication**.
2. Scroll to **SMTP Settings** → toggle **Enable custom SMTP** ON.
3. Fill exactly:

| Field | Value |
|---|---|
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | your `re_…` API key from Part 1 |
| **Sender email** | `Amrita Eye <onboarding@resend.dev>` (no domain) or `Amrita Eye <noreply@yourdomain.com>` (verified domain) |
| **Sender name** | `Amrita Eye` |

4. **Save.**

> **Port tip:** Supabase expects `465` (SSL). If you see "connection failed", try `587`.

### Part 4 — Test it

1. Supabase → **Authentication → Users** → find an unconfirmed user (e.g. your Amrita email).
2. Click **⋯ → Resend confirmation**.
3. Check the inbox — it should arrive in seconds (check spam too with the shared sender).
4. Click the link → `/auth/callback` opens → you're signed in.

Or sign up a brand-new account → confirm → signed in.

### Part 5 — Verify the rate limit is gone

- Resend free plan: **100 emails/day** — plenty for a prototype.
- Supabase's sign-up rate limits still apply (**Authentication → Rate Limits**): bump
  e.g. sign-up `60/hr → 600/hr`, email-send `2/hr → 50/hr` if needed.
- All emails (confirmations, magic links, password resets) now flow through Resend
  automatically — no code changes.

---

## Option B — Brevo (ex-Sendinblue: 300 emails/day free)

1. Sign up at **https://www.brevo.com** → verify your sender email (they email a code).
2. **SMTP & API → SMTP settings**: reveal your **SMTP key** (`xsmtpsib-…`).
3. In Supabase SMTP settings:
   - **Host:** `smtp-relay.brevo.com`
   - **Port:** `587`
   - **Username:** your Brevo **login email**
   - **Password:** your **SMTP key**
   - **Sender:** `Amrita Eye <your-verified-email>`
4. Save → test with a resend.

## Option C — Zoho Mail (free 5 GB mailbox, 1 user)

1. Sign up for a free **Zoho Mail** account (`you@yourdomain.com`; a domain is required).
2. Zoho → **Settings → Mail Accounts → IMAP/POP/SMTP → SMTP** → enable, note the server.
3. Supabase SMTP settings:
   - **Host:** `smtp.zoho.com` · **Port:** `465`
   - **Username:** your full Zoho email · **Password:** your Zoho password (or app-specific)
   - **Sender:** `Amrita Eye <you@yourdomain.com>`

## Option D — Gmail (quickest for testing, personal sender)

> Works for a prototype; emails show "sent via" Gmail (~100/day, stricter spam rules).

1. Turn on **2-Step Verification** on the Google account.
2. Google Account → **Security → App passwords** → create one for "Mail" → copy the 16-char password.
3. Supabase SMTP settings:
   - **Host:** `smtp.gmail.com` · **Port:** `465`
   - **Username:** your full Gmail address · **Password:** the app password
   - **Sender:** `Amrita Eye <your@gmail.com>`

---

## After enabling SMTP

- **Existing stuck users:** Authentication → Users → ⋯ → **Resend confirmation** — now via SMTP.
- **Rate limits:** also raise at **Authentication → Rate Limits** (SMTP is the real fix for delivery).
- **Everything uses it automatically:** confirmations, magic links, password resets — no code changes.

## ⚠️ Troubleshooting

| Symptom | Fix |
| --- | --- |
| Emails land in spam | Verify your domain in the provider (Part 2); use a real sender domain. |
| "SMTP connection failed" in Supabase | Double-check port (465 = SSL, 587 = STARTTLS) and that username isn't an API key. |
| `invalid API key` | Keys start with `re_` — copy the full value, no spaces. |
| Amrita email never arrives | Some college mail systems block external mail — check spam/quarantine; test the flow with a personal email first. |
| Still `{}` / rate-limit errors | Wait for the hourly window to reset, then sign up fresh — with SMTP on it will succeed. |
| Magic link says "invalid link" | Make sure `auth/callback` is in **Authentication → URL Configuration → Redirect URLs**, and `VITE_APP_URL` matches your domain. |

---

## Free domain setup (Option 2 — full guide)

The testing restriction means `onboarding@resend.dev` can only send to the email you
registered with Resend. To send to ANYONE, verify a domain and use it as the sender.

> ⚠️ `is-a.dev` does NOT work for this: Resend needs a DKIM record on a sub-label
> (`resend._domainkey.yourdomain`), which is-a.dev can't create. Use deSEC / eu.org /
> a bought domain instead.

### Pick a domain

| Option | Cost | Setup time | Notes |
| --- | --- | --- | --- |
| **deSEC → `yourname.dedyn.io`** | Free | ~10 min, instant | Full DNS incl. sub-labels — recommended free option |
| **eu.org → `yourname.eu.org`** | Free | Days (approval) | Full DNS |
| **Bought .com** | $8–12/yr | 10 min | Best email deliverability (free subdomains hit spam filters more) |

### Steps

1. **resend.com → Domains → Add Domain** → enter e.g. `civiceye.dedyn.io` → pick region → Add.
   Resend now lists the DNS records: TXT (verification), TXT (SPF `v=spf1 include:amazonses.com ~all`),
   TXT (DKIM, name `resend._domainkey`), optional MX. **Copy them all.**
2. **desec.io → Register** → **Register subdomain** → type `civiceye` → you get `civiceye.dedyn.io`.
3. In deSEC, **Add record** for each Resend record:
   - TXT `@` = SPF value
   - TXT (name Resend gave) = verification value
   - TXT `resend._domainkey` = DKIM `p=…` value
   - (optional) MX priority 10 → `feedback-smtp.us-east-1.amazonses.com`
4. Back in **Resend → Domains** → wait for **all green** (minutes–~1h).
5. **Supabase → Authentication → SMTP Settings** → Sender email: `noreply@civiceye.dedyn.io`,
   Sender name: `Amrita Eye` → **Save** → **Send test email** (test Gmail first).
6. Supabase → **Authentication → Users → ⋯ → Resend confirmation** on your Amrita email.
   (Some college mail servers block external mail — check spam/quarantine; test with Gmail first.)

### Why free subdomains can still hit spam

Gmail/Outlook weigh sender reputation; `.dedyn.io`/`.eu.org` suffixes start with lower
trust than a real domain. SPF + DKIM (which Resend sets up) help a lot. For a serious
launch, a ~$10/yr domain is the reliable upgrade.
