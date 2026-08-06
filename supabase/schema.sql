-- ===================================================================
-- Amrita Eye / CivicEye — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query → Run
-- SAFE TO RE-RUN: every object is guarded with IF NOT EXISTS /
-- DROP POLICY IF EXISTS, so you can run the whole file again anytime.
--
-- MIGRATION (only if you ran the schema before the "security" category):
-- Run this once to allow the new campus "Suspicious Activity" category:
--   alter table public.reports drop constraint reports_category_check;
--   alter table public.reports add constraint reports_category_check
--     check (category in ('pothole','broken-road','garbage','sidewalk',
--       'manhole','fallen-tree','street-light','water-leakage','sewage',
--       'illegal-dumping','traffic-signal','accident','security','other'));
-- ===================================================================

-- ---------- Profiles (one row per auth user) ------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  is_amrita  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select using (true);

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update"  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, is_amrita)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    (new.email ilike '%@%.amrita.edu' or new.email ilike '%@amrita.edu')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Reports -------------------------------------------------
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  code          text unique default 'CE-' || upper(substr(md5(random()::text), 1, 8)),
  user_id       uuid references auth.users(id) on delete set null,
  author_name   text not null default 'Anonymous',
  title         text not null,
  description   text not null,
  category      text not null check (category in
    ('pothole','broken-road','garbage','sidewalk','manhole','fallen-tree',
     'street-light','water-leakage','sewage','illegal-dumping',
     'traffic-signal','accident','security','other')),
  severity      text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status        text not null default 'pending' check (status in
    ('pending','verified','in-progress','resolved','rejected')),
  lat           double precision not null,
  lng           double precision not null,
  location_name text,
  photo_url     text,
  ai            jsonb,
  upvotes       int not null default 0,
  downvotes     int not null default 0,
  confirms      int not null default 0,
  rejects       int not null default 0,
  verified      boolean not null default false,
  assigned_to   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists reports_status_idx  on public.reports (status);
create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_created_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

drop policy if exists "reports public read"   on public.reports;
create policy "reports public read"   on public.reports for select using (true);

drop policy if exists "reports auth insert"   on public.reports;
create policy "reports auth insert"   on public.reports for insert with check (auth.uid() is not null);

drop policy if exists "reports auth update"   on public.reports;
create policy "reports auth update"   on public.reports for update using (auth.uid() is not null);

drop policy if exists "reports owner delete"  on public.reports;
create policy "reports owner delete"  on public.reports for delete using (auth.uid() = user_id);

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists reports_touch on public.reports;
create trigger reports_touch before update on public.reports
  for each row execute function public.touch_updated_at();

-- ---------- Votes (one vote per user per report per type) -----------
create table if not exists public.report_votes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  report_id  uuid not null references public.reports(id) on delete cascade,
  vote_type  text not null check (vote_type in ('up','down','confirm','reject')),
  created_at timestamptz not null default now(),
  primary key (user_id, report_id, vote_type)
);

alter table public.report_votes enable row level security;
drop policy if exists "votes auth all" on public.report_votes;
create policy "votes auth all" on public.report_votes for all using (auth.uid() = user_id);

-- Atomic vote: inserts one-per-user, updates counters, auto-verifies
create or replace function public.vote_on_report(p_report uuid, p_vote text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_inserted boolean := false;
  v_row      public.reports%rowtype;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  begin
    insert into public.report_votes (user_id, report_id, vote_type)
    values (v_user, p_report, p_vote);
    v_inserted := true;
  exception when unique_violation then
    v_inserted := false;
  end;

  if v_inserted then
    update public.reports set
      upvotes   = upvotes   + (p_vote = 'up')::int,
      downvotes = downvotes + (p_vote = 'down')::int,
      confirms  = confirms  + (p_vote = 'confirm')::int,
      rejects   = rejects   + (p_vote = 'reject')::int,
      verified  = verified or (confirms + (p_vote = 'confirm')::int) >= 3,
      status    = case when (confirms + (p_vote = 'confirm')::int) >= 3
                       then 'verified' else status end,
      updated_at = now()
    where id = p_report
    returning * into v_row;
  else
    select * into v_row from public.reports where id = p_report;
  end if;

  return to_jsonb(v_row);
end;
$$;

-- ---------- Storage bucket for report photos ------------------------
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

-- ===================================================================
-- REVIEW SYSTEM
-- Users review reports; other users agree/disagree with each review.
-- ===================================================================

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid references public.reports(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null default 'Anonymous',
  content     text not null check (char_length(content) between 2 and 600),
  agrees      int not null default 0,
  disagrees   int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists reviews_report_idx on public.reviews (report_id, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "reviews public read"  on public.reviews;
create policy "reviews public read"  on public.reviews for select using (true);

drop policy if exists "reviews auth insert"  on public.reviews;
create policy "reviews auth insert"  on public.reviews for insert with check (auth.uid() is not null);

drop policy if exists "reviews owner delete" on public.reviews;
create policy "reviews owner delete" on public.reviews for delete using (auth.uid() = user_id);

-- One vote (agree/disagree) per user per review
create table if not exists public.review_votes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  review_id  uuid not null references public.reviews(id) on delete cascade,
  vote_type  text not null check (vote_type in ('agree','disagree')),
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);

alter table public.review_votes enable row level security;
drop policy if exists "review_votes auth all" on public.review_votes;
create policy "review_votes auth all" on public.review_votes for all using (auth.uid() = user_id);

-- Atomic agree/disagree vote (one per user, updates counters)
create or replace function public.vote_on_review(p_review uuid, p_vote text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_inserted boolean := false;
  v_row      public.reviews%rowtype;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  begin
    insert into public.review_votes (user_id, review_id, vote_type)
    values (v_user, p_review, p_vote);
    v_inserted := true;
  exception when unique_violation then
    v_inserted := false;
  end;

  if v_inserted then
    update public.reviews set
      agrees     = agrees + (p_vote = 'agree')::int,
      disagrees  = disagrees + (p_vote = 'disagree')::int,
      updated_at = now()
    where id = p_review
    returning * into v_row;
  else
    select * into v_row from public.reviews where id = p_review;
  end if;

  return to_jsonb(v_row);
end;
$$;

-- ===================================================================
-- After running this: enable "Email" provider in Authentication →
-- Providers (for magic links + confirmations), then add redirect
-- URLs:  http://localhost:5173/auth/callback  and
--         https://<your-app>.vercel.app/auth/callback
-- For reliable email, follow SMTP_SETUP.md (free SMTP = no hourly cap).
-- ===================================================================
