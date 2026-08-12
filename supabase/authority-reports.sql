-- ===================================================================
-- CivicEye / Amrita Eye — Authority escalation log
-- Run this in your Supabase project: SQL Editor → New query → Run
-- Safe to re-run (IF NOT EXISTS guards).
--
-- Every time a citizen escalates a report to an authority (email,
-- WhatsApp, phone tap or mailto fallback), the app inserts one row
-- here so admins have an audit trail of what was sent where.
-- ===================================================================

create table if not exists public.authority_reports (
  id              uuid primary key default gen_random_uuid(),
  report_id       uuid null,                       -- may not exist in mock mode
  report_code     text null,
  authority_id    text not null,                   -- e.g. 'bbmp-42', 'amrita-estate'
  authority_email text not null,
  channel         text not null default 'email',   -- 'email' | 'whatsapp' | 'phone' | 'mailto'
  reporter_id     uuid null,
  reporter_email  text null,
  message         text null,                       -- optional citizen note
  created_at      timestamptz not null default now()
);

alter table if exists public.authority_reports add column if not exists report_code text;
alter table if exists public.authority_reports add column if not exists channel text not null default 'email';
alter table if exists public.authority_reports add column if not exists reporter_id uuid;
alter table if exists public.authority_reports add column if not exists reporter_email text;
alter table if exists public.authority_reports add column if not exists message text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'authority_reports_channel_check') then
    alter table public.authority_reports
      add constraint authority_reports_channel_check
      check (channel in ('email','whatsapp','phone','mailto'));
  end if;
end $$;

-- Helpful indexes for the admin audit view.
create index if not exists authority_reports_report_idx    on public.authority_reports (report_id);
create index if not exists authority_reports_authority_idx on public.authority_reports (authority_id);
create index if not exists authority_reports_created_idx   on public.authority_reports (created_at desc);

alter table public.authority_reports enable row level security;

-- Any signed-in user may log their own escalation…
drop policy if exists "authority_reports_insert_own" on public.authority_reports;
create policy "authority_reports_insert_own"
  on public.authority_reports for insert
  to authenticated
  with check (reporter_id = auth.uid() or reporter_id is null);

-- …and only admins can read the audit trail.
drop policy if exists "authority_reports_admin_read" on public.authority_reports;
create policy "authority_reports_admin_read"
  on public.authority_reports for select
  to authenticated
  using (public.is_admin());
