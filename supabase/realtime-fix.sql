-- ===================================================================
-- CivicEye — Enable Supabase Realtime for the `reports` table
-- ===================================================================
-- FIXES: "confirmations from another user don't update my screen."
--
-- The app now subscribes to live changes on `reports` (see
-- src/context/ReportsContext.tsx). For that subscription to receive
-- events, the table must be in the `supabase_realtime` publication.
--
-- EASIER ALTERNATIVE (no SQL needed):
--   Supabase Dashboard → Database → Replication → click the
--   `supabase_realtime` publication → toggle ON the `reports` table →
--   Save. That does exactly what this script does.
--
-- HOW TO RUN THIS FILE:
--   Supabase Dashboard → SQL Editor → New query → paste → Run.
--   Safe to run more than once (idempotent).
-- ===================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;
end $$;

-- Sanity check — should return a row for `reports` after running:
select * from pg_publication_tables
where pubname = 'supabase_realtime' and tablename = 'reports';
