# 📧 Free SMTP setup (fixes "no verification email" + rate limits)

Supabase's **built-in email sender is capped at ~2–3 emails per hour per project**. That's
why confirmation / magic-link emails stop arriving and sign-ups start failing with
"too many attempts" (the limit resets hourly, not minutely).

**Connecting a free SMTP provider removes that cap** and lets you send branded emails
from your own address. Pick one of the options below — **Option A (Resend) is the
easiest to start with.**

---

## Option A — Resend (recommended: 100 emails/day free, no card)

1. Go to **https://resend.com** → **Sign up** (GitHub or email).
2. Copy your **API Key**: Dashboard → *API Keys* → *Create API Key* → copy the `re_…` key.
   (Skip domain verification for testing — you can send from their shared
   `onboarding@resend.dev` address, though emails land in spam sometimes.)
3. **In Supabase:**
   - **Project Settings → Authentication → SMTP Settings**
   - Toggle **"Enable custom SMTP"** on and fill:
     - **Host:** `smtp.resend.com`
     - **Port:** `465`
     - **Username:** `resend`
     - **Password:** your `re_…` API key
     - **Sender email:** `Amrita Eye <onboarding@resend.dev>` (or your verified domain address)
     - **Sender name:** `Amrita Eye`
   - **Save.**
4. **Test:** go to **Authentication → Users → ⋯ → Resend confirmation** on a pending user,
   or just sign up a fresh account — the email should arrive in seconds.
5. *(Optional, removes spam-folder risk)* In Resend: **Domains → Add Domain** → add your
   domain → follow the DNS records (3 TXT + 1 CNAME) → verify → use
   `Amrita Eye <mailer@yourdomain.com>` as the sender.

---

## Option B — Brevo (ex-Sendinblue: 300 emails/day free)

1. Sign up at **https://www.brevo.com** → verify your sender email (they email you a code).
2. **SMTP & API → SMTP settings**: reveal your **SMTP key** (looks like `xsmtpsib-…`).
3. In Supabase SMTP settings:
   - **Host:** `smtp-relay.brevo.com`
   - **Port:** `587`
   - **Username:** your Brevo **login email**
   - **Password:** your **SMTP key**
   - **Sender:** `Amrita Eye <your-verified-email>`
4. Save → test with a resend.

---

## Option C — Zoho Mail (free 5 GB mailbox, 1 user)

1. Sign up for a free **Zoho Mail** account (you get `you@yourdomain.com`; a domain is
   required — free options: buy a cheap domain, or use their subdomain hosting flow).
2. In Zoho: **Settings → Mail Accounts → IMAP/POP/SMTP → SMTP** → enable, note the server.
3. Supabase SMTP settings:
   - **Host:** `smtp.zoho.com` · **Port:** `465`
   - **Username:** your full Zoho email · **Password:** your Zoho password (or an app-specific one)
   - **Sender:** `Amrita Eye <you@yourdomain.com>`

---

## Option D — Gmail (quickest for testing, personal sender)

> Works fine for a prototype; emails show "sent via" Gmail and have sending limits
> (~100/day, and strict spam rules). Needs 2-step verification.

1. Turn on **2-Step Verification** on your Google account.
2. Google Account → **Security → App passwords** → create one for "Mail" → copy the 16-char password.
3. Supabase SMTP settings:
   - **Host:** `smtp.gmail.com` · **Port:** `465`
   - **Username:** your full Gmail address · **Password:** the app password
   - **Sender:** `Amrita Eye <your@gmail.com>`

---

## After enabling SMTP

- **Existing stuck users:** Supabase → **Authentication → Users → ⋯ → Resend confirmation** — it now goes through your SMTP.
- **Rate limits:** you can also raise them at **Authentication → Rate Limits** (e.g. sign-up 60/hr → 600/hr), but SMTP is the real fix for delivery.
- **Everything uses it automatically:** confirmation emails, magic links, and password resets all flow through the same SMTP — no code changes needed.

---

## ⚠️ Quick troubleshooting

| Symptom | Fix |
| --- | --- |
| Emails land in spam | Verify your domain in the provider (Option A step 5); use a real sender domain, not `@gmail.com`/shared address. |
| "SMTP connection failed" in Supabase | Double-check port (465 = SSL, 587 = STARTTLS) and that the username isn't an API key. |
| Still rate-limited | The hourly cap is per provider: Resend 100/day, Brevo 300/day — plenty for a prototype. |
| Magic-link says "invalid link" | Make sure `auth/callback` is in **Authentication → URL Configuration → Redirect URLs**, and `VITE_APP_URL` matches your domain. |
