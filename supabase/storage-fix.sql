-- ===================================================================
-- HOTFIX: report photo upload fails with
--   "new row violates row-level security policy"
--
-- Cause: the `report-photos` bucket was created but no RLS policies on
-- storage.objects were ever defined, so Supabase rejects ALL uploads.
--
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (drop policy if exists guards).
-- ===================================================================

-- Make sure the bucket exists and is public (idempotent).
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do update set public = true;

-- 1. Anyone can VIEW report photos (they're shown on public report pages).
drop policy if exists "report photos public read" on storage.objects;
create policy "report photos public read"
  on storage.objects for select
  using (bucket_id = 'report-photos');

-- 2. Signed-in users UPLOAD photos, but only into their own folder:
--    the upload path is "<their-user-id>/<timestamp>.jpg" and this check
--    enforces exactly that.
drop policy if exists "report photos auth insert" on storage.objects;
create policy "report photos auth insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Owners can replace or delete their own photos.
drop policy if exists "report photos owner update" on storage.objects;
create policy "report photos owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "report photos owner delete" on storage.objects;
create policy "report photos owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- Sanity check: run this afterwards ------------------------
-- It should return 4 rows for storage.objects + the reports policies.
select schemaname, tablename, policyname, cmd
from pg_policies
where (schemaname = 'storage' and tablename = 'objects')
   or (schemaname = 'public'  and tablename = 'reports')
order by tablename, policyname;
