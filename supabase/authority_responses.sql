-- Apply this migration to an existing Supabase project after schema.sql.
alter table public.reports
  add column if not exists authority_verification_status text not null default 'none',
  add column if not exists authority_replied_at timestamptz,
  add column if not exists authority_reply_from text,
  add column if not exists authority_reply_subject text,
  add column if not exists authority_reply_reference text;

do $$
begin
  alter table public.reports
    add constraint reports_authority_verification_status_check
    check (authority_verification_status in ('none','needs_review','automated_resolved','admin_approved','admin_rejected'));
exception when duplicate_object then null;
end $$;

create index if not exists reports_authority_verification_idx
  on public.reports (authority_verification_status);

create table if not exists public.authority_responses (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  message_id text unique,
  sender_email text not null,
  subject text not null default '',
  body text not null default '',
  validation_status text not null default 'needs_review',
  validation_reason text,
  admin_review_status text not null default 'pending',
  received_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

do $$
begin
  alter table public.authority_responses
    add constraint authority_responses_validation_status_check
    check (validation_status in ('accepted','needs_review','rejected'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.authority_responses
    add constraint authority_responses_admin_review_status_check
    check (admin_review_status in ('pending','approved','rejected'));
exception when duplicate_object then null;
end $$;

alter table public.authority_responses enable row level security;
drop policy if exists "authority responses admin read" on public.authority_responses;
create policy "authority responses admin read"
  on public.authority_responses for select using (public.is_admin());
drop policy if exists "authority responses admin update" on public.authority_responses;
create policy "authority responses admin update"
  on public.authority_responses for update using (public.is_admin()) with check (public.is_admin());

-- Both writes succeed together. A retry or a second reviewer cannot apply the
-- same reply again, and rejecting a reply does not reopen an unrelated fix.
create or replace function public.review_authority_response(p_response_id uuid, p_approved boolean)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  reply public.authority_responses%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_approved is null then raise exception 'Review decision required'; end if;
  select * into reply from public.authority_responses where id = p_response_id for update;
  if not found then raise exception 'Reply not found'; end if;
  if reply.admin_review_status <> 'pending' then raise exception 'Reply already reviewed'; end if;

  update public.reports set
    status = case when p_approved then 'resolved' else status end,
    authority_verification_status = case when p_approved then 'admin_approved' else 'admin_rejected' end,
    authority_replied_at = reply.received_at,
    authority_reply_from = reply.sender_email,
    authority_reply_subject = reply.subject
  where id = reply.report_id;

  update public.authority_responses set
    admin_review_status = case when p_approved then 'approved' else 'rejected' end,
    reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_response_id;
end;
$$;

revoke all on function public.review_authority_response(uuid, boolean) from public;
grant execute on function public.review_authority_response(uuid, boolean) to authenticated;
