-- Persistent Amrita route graph versions. AdminRouteEditor also keeps a
-- local copy so a map remains usable while this optional migration is being
-- installed. Run after schema.sql.
create table if not exists public.campus_route_versions (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  network jsonb not null,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists campus_route_versions_published_idx
  on public.campus_route_versions (published, created_at desc);

alter table public.campus_route_versions
  add column if not exists version integer not null default 1;

alter table public.campus_route_versions enable row level security;

drop policy if exists "campus routes public read published" on public.campus_route_versions;
create policy "campus routes public read published"
  on public.campus_route_versions for select
  using (published = true and (public.is_amrita_user() or public.is_admin()));

drop policy if exists "campus routes admin insert" on public.campus_route_versions;
create policy "campus routes admin insert"
  on public.campus_route_versions for insert
  with check (public.is_admin());

drop policy if exists "campus routes admin update" on public.campus_route_versions;
create policy "campus routes admin update"
  on public.campus_route_versions for update
  using (public.is_admin()) with check (public.is_admin());
