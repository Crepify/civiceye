# 🔐 Amrita Eye / CivicEye — Supabase Setup Guide

The app now requires **Supabase** for login and real data. Without keys it shows a
friendly "Connect Supabase" screen — so nothing breaks, but sign-in needs this setup.

**Time: ~5 minutes.**

---

## 1. Create a free Supabase project

1. Go to **https://supabase.com** → **Start your project** (sign in with GitHub or email).
2. **New project** → pick a name (e.g. `amrita-eye`), a strong database password, and a
   region close to you (Singapore or Mumbai for India).
3. Wait ~1 minute for provisioning, then open the project dashboard.

## 2. Run the schema

1. In your project dashboard, open **SQL Editor**.
2. Click **New query**, paste the entire contents of **`supabase/schema.sql`** from this repo.
3. Click **Run**. You should see "Success" with no errors.
4. This creates: `profiles`, `reports`, `report_votes` tables + RLS policies + the
   atomic `vote_on_report` function + the `report-photos` storage bucket + an
   auto-profile trigger on sign-up.

## 3. Enable email auth (for magic links + confirmations)

1. **Authentication → Providers → Email** → toggle **Enabled** on.
2. Under **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` (and later your Vercel URL)
   - **Redirect URLs**: add
     - `http://localhost:5173/auth/callback`
     - `https://<your-app>.vercel.app/auth/callback`
3. Optional but nice: disable **"Confirm email"** during testing so sign-ups log in
   instantly (Authentication → Providers → Email → Confirm email = off). For a real
   launch keep it on.

## 4. Copy the keys into the app

1. **Project Settings → API** (or the ⚙️ icon → API).
2. Copy **Project URL** → `VITE_SUPABASE_URL`
3. Copy **anon public key** → `VITE_SUPABASE_ANON_KEY`

```env
# .env  (local)
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

For **Vercel**: Project → Settings → Environment Variables → add both (with the
`VITE_` prefix) → **Redeploy**.

> ⚠️ The **anon key is public by design** — your data is protected by Row Level
> Security (RLS), not by the key. Never use the `service_role` key on the frontend.

## 5. Restart & verify

```bash
npm run dev
```

- Go to **/login** → the setup screen is gone → sign up with any email
  (`name@gmail.com` or your `@…amrita.edu` address).
- Check the **Authentication → Users** tab in Supabase — your user appears, and a
  `profiles` row was auto-created.
- Sign in with an **@…amrita.edu** email → the app rebrands to **Amrita Eye**
  (red/black/white/yellow, campus tagline).
- Submit a report → photo uploads to `report-photos` bucket, the row lands in
  `reports`, and it appears on **/map** instantly.

---

## What's protected how (RLS summary)

| Action | Rule |
|---|---|
| Read reports / profiles | Anyone (public good) |
| Create a report | Any signed-in user |
| Update / mark resolved / assign | Any signed-in user (prototype — tighten to staff later) |
| Delete a report | Only its author |
| Vote / confirm / reject | Signed-in user, **once per report per type** (unique key) |

Votes go through the `vote_on_report` Postgres function, which atomically inserts the
vote, updates counters, and auto-verifies a report at **3 confirmations** — no client
can cheat the count.
