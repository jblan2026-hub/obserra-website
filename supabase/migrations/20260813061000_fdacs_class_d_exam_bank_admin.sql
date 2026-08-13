begin;

create table if not exists public.fdacs_class_d_exam_bank_imports (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid references public.fdacs_class_d_exam_banks(id) on delete restrict,
  version text not null,
  source_reference text not null,
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  imported_question_count integer not null default 0 check (imported_question_count >= 0),
  validation_status text not null default 'pending' check (validation_status in ('pending','validated','rejected')),
  validation_summary jsonb not null default '{}'::jsonb,
  imported_by_clerk_user_id text not null,
  imported_at timestamptz not null default now(),
  correlation_id uuid not null,
  unique (source_sha256)
);

create index if not exists fdacs_class_d_exam_bank_import_bank_idx
  on public.fdacs_class_d_exam_bank_imports(bank_id, imported_at desc);

alter table public.fdacs_class_d_exam_bank_imports enable row level security;
alter table public.fdacs_class_d_exam_bank_imports force row level security;
revoke all on table public.fdacs_class_d_exam_bank_imports from public, anon, authenticated;
grant all on table public.fdacs_class_d_exam_bank_imports to service_role;

create or replace function public.fdacs_class_d_mark_exam_bank_submitted(
  p_bank_id uuid,
  p_actor_clerk_user_id text,
  p_submission_reference text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status
  from public.fdacs_class_d_exam_banks
  where id = p_bank_id
  for update;

  if v_status is null then
    raise exception 'exam bank not found';
  end if;
  if v_status <> 'draft' then
    raise exception 'only a draft exam bank may be marked submitted';
  end if;

  perform public.fdacs_class_d_validate_exam_bank(p_bank_id);

  update public.fdacs_class_d_exam_banks
  set status = 'division_submitted',
      division_approval_reference = null
  where id = p_bank_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, 'exam', p_bank_id,
    'exam_bank_marked_division_submitted', p_correlation_id,
    jsonb_build_object('submissionReference', p_submission_reference)
  );
end;
$$;

create or replace function public.fdacs_class_d_mark_exam_bank_approved(
  p_bank_id uuid,
  p_actor_clerk_user_id text,
  p_approval_reference text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status
  from public.fdacs_class_d_exam_banks
  where id = p_bank_id
  for update;

  if v_status is null then
    raise exception 'exam bank not found';
  end if;
  if v_status <> 'division_submitted' then
    raise exception 'exam bank must be division-submitted before approval is recorded';
  end if;
  if p_approval_reference is null or char_length(trim(p_approval_reference)) < 3 then
    raise exception 'division approval reference is required';
  end if;

  perform public.fdacs_class_d_validate_exam_bank(p_bank_id);

  update public.fdacs_class_d_exam_banks
  set status = 'retired'
  where course_id = 'florida-class-d-40-hour'
    and status = 'division_approved'
    and id <> p_bank_id;

  update public.fdacs_class_d_exam_banks
  set status = 'division_approved',
      division_approval_reference = trim(p_approval_reference),
      approved_at = now()
  where id = p_bank_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, 'exam', p_bank_id,
    'exam_bank_division_approval_recorded', p_correlation_id,
    jsonb_build_object('approvalReference', trim(p_approval_reference))
  );
end;
$$;

revoke execute on function public.fdacs_class_d_mark_exam_bank_submitted(uuid,text,text,uuid) from public, anon, authenticated;
revoke execute on function public.fdacs_class_d_mark_exam_bank_approved(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_mark_exam_bank_submitted(uuid,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_mark_exam_bank_approved(uuid,text,text,uuid) to service_role;

commit;
