begin;

create or replace function public.fdacs_class_d_add_business_days(p_start_date date, p_business_days integer)
returns date
language plpgsql
immutable
set search_path = public
as $$
declare
  v_date date := p_start_date;
  v_added integer := 0;
begin
  if p_business_days < 0 then
    raise exception 'business day count must be nonnegative';
  end if;
  while v_added < p_business_days loop
    v_date := v_date + 1;
    if extract(isodow from v_date) between 1 and 5 then
      v_added := v_added + 1;
    end if;
  end loop;
  return v_date;
end;
$$;

alter table public.fdacs_class_d_lias_reporting_queue
  add column if not exists reporting_due_on date,
  add column if not exists submitted_by_clerk_user_id text,
  add column if not exists confirmed_by_clerk_user_id text,
  add column if not exists certificate_reference text,
  add column if not exists exception_at timestamptz,
  add column if not exists exception_by_clerk_user_id text,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by_clerk_user_id text,
  add column if not exists resolution_note text;

update public.fdacs_class_d_lias_reporting_queue
set reporting_due_on = public.fdacs_class_d_add_business_days(prepared_at::date, 3)
where reporting_due_on is null;

alter table public.fdacs_class_d_lias_reporting_queue
  alter column reporting_due_on set not null;

create table if not exists public.fdacs_class_d_lias_workflow_events (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.fdacs_class_d_lias_reporting_queue(id) on delete restrict,
  completion_record_id uuid not null references public.fdacs_class_d_completion_records(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  event_type text not null check (event_type in ('prepared','submitted','confirmed','exception_opened','exception_resolved')),
  actor_clerk_user_id text not null,
  event_note text,
  submission_reference text,
  certificate_reference text,
  correlation_id uuid not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists fdacs_class_d_lias_workflow_queue_idx
  on public.fdacs_class_d_lias_workflow_events(queue_id, occurred_at, id);
create index if not exists fdacs_class_d_lias_workflow_enrollment_idx
  on public.fdacs_class_d_lias_workflow_events(enrollment_id, occurred_at, id);
create index if not exists fdacs_class_d_lias_due_idx
  on public.fdacs_class_d_lias_reporting_queue(status, reporting_due_on, prepared_at);

alter table public.fdacs_class_d_lias_workflow_events enable row level security;
alter table public.fdacs_class_d_lias_workflow_events force row level security;
revoke all on table public.fdacs_class_d_lias_workflow_events from public, anon, authenticated;
grant all on table public.fdacs_class_d_lias_workflow_events to service_role;

create or replace function public.fdacs_class_d_reject_lias_workflow_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'fdacs_class_d_lias_workflow_events is append-only';
end;
$$;

drop trigger if exists fdacs_class_d_lias_workflow_events_append_only on public.fdacs_class_d_lias_workflow_events;
create trigger fdacs_class_d_lias_workflow_events_append_only
before update or delete on public.fdacs_class_d_lias_workflow_events
for each row execute function public.fdacs_class_d_reject_lias_workflow_mutation();

create or replace function public.fdacs_class_d_mark_lias_submitted(
  p_queue_id uuid,
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
  v_queue public.fdacs_class_d_lias_reporting_queue%rowtype;
begin
  select * into v_queue from public.fdacs_class_d_lias_reporting_queue where id = p_queue_id for update;
  if v_queue.id is null then raise exception 'LIAS queue record not found'; end if;
  if v_queue.status not in ('prepared','exception') then raise exception 'LIAS queue record is not eligible for submission'; end if;
  if p_actor_clerk_user_id is null or char_length(trim(p_actor_clerk_user_id)) < 3 then raise exception 'authorized staff identity is required'; end if;
  if p_submission_reference is null or char_length(trim(p_submission_reference)) < 3 or char_length(trim(p_submission_reference)) > 500 then raise exception 'LIAS submission reference is required'; end if;

  update public.fdacs_class_d_lias_reporting_queue
  set status = 'submitted',
      submission_reference = trim(p_submission_reference),
      submitted_at = now(),
      submitted_by_clerk_user_id = p_actor_clerk_user_id,
      exception_note = null,
      exception_at = null,
      exception_by_clerk_user_id = null,
      resolved_at = case when v_queue.status = 'exception' then now() else resolved_at end,
      resolved_by_clerk_user_id = case when v_queue.status = 'exception' then p_actor_clerk_user_id else resolved_by_clerk_user_id end,
      resolution_note = case when v_queue.status = 'exception' then 'Exception resolved by successful LIAS submission.' else resolution_note end,
      updated_at = now()
  where id = p_queue_id;

  insert into public.fdacs_class_d_lias_workflow_events (
    queue_id, completion_record_id, enrollment_id, event_type, actor_clerk_user_id,
    event_note, submission_reference, correlation_id, metadata
  ) values (
    p_queue_id, v_queue.completion_record_id, v_queue.enrollment_id, 'submitted', p_actor_clerk_user_id,
    'Successful completion reported manually through LIAS.', trim(p_submission_reference), p_correlation_id,
    jsonb_build_object('reportingDueOn', v_queue.reporting_due_on, 'executionMode', 'manual_queue_only')
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, v_queue.enrollment_id, 'lias', p_queue_id,
    'lias_submission_recorded', p_correlation_id,
    jsonb_build_object('submissionReference', trim(p_submission_reference), 'reportingDueOn', v_queue.reporting_due_on)
  );
end;
$$;

create or replace function public.fdacs_class_d_confirm_lias_certificate(
  p_queue_id uuid,
  p_actor_clerk_user_id text,
  p_certificate_reference text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue public.fdacs_class_d_lias_reporting_queue%rowtype;
begin
  select * into v_queue from public.fdacs_class_d_lias_reporting_queue where id = p_queue_id for update;
  if v_queue.id is null then raise exception 'LIAS queue record not found'; end if;
  if v_queue.status <> 'submitted' then raise exception 'LIAS submission must be recorded before certificate confirmation'; end if;
  if p_certificate_reference is null or char_length(trim(p_certificate_reference)) < 3 or char_length(trim(p_certificate_reference)) > 500 then raise exception 'certificate reference is required'; end if;

  update public.fdacs_class_d_lias_reporting_queue
  set status = 'confirmed', certificate_reference = trim(p_certificate_reference), confirmed_at = now(),
      confirmed_by_clerk_user_id = p_actor_clerk_user_id, updated_at = now()
  where id = p_queue_id;

  update public.fdacs_class_d_completion_records
  set status = 'lias_reported', updated_at = now()
  where id = v_queue.completion_record_id and status = 'lias_prepared';

  insert into public.fdacs_class_d_lias_workflow_events (
    queue_id, completion_record_id, enrollment_id, event_type, actor_clerk_user_id,
    event_note, submission_reference, certificate_reference, correlation_id
  ) values (
    p_queue_id, v_queue.completion_record_id, v_queue.enrollment_id, 'confirmed', p_actor_clerk_user_id,
    'LIAS-generated FDACS-16103 certificate reference confirmed.', v_queue.submission_reference,
    trim(p_certificate_reference), p_correlation_id
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, v_queue.enrollment_id, 'lias', p_queue_id,
    'lias_certificate_confirmed', p_correlation_id,
    jsonb_build_object('certificateReference', trim(p_certificate_reference))
  );
end;
$$;

create or replace function public.fdacs_class_d_open_lias_exception(
  p_queue_id uuid,
  p_actor_clerk_user_id text,
  p_exception_note text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue public.fdacs_class_d_lias_reporting_queue%rowtype;
begin
  select * into v_queue from public.fdacs_class_d_lias_reporting_queue where id = p_queue_id for update;
  if v_queue.id is null then raise exception 'LIAS queue record not found'; end if;
  if v_queue.status in ('confirmed','cancelled') then raise exception 'LIAS queue record cannot enter exception state'; end if;
  if p_exception_note is null or char_length(trim(p_exception_note)) < 3 or char_length(trim(p_exception_note)) > 4000 then raise exception 'documented LIAS exception note is required'; end if;

  update public.fdacs_class_d_lias_reporting_queue
  set status = 'exception', exception_note = trim(p_exception_note), exception_at = now(),
      exception_by_clerk_user_id = p_actor_clerk_user_id, updated_at = now()
  where id = p_queue_id;

  insert into public.fdacs_class_d_lias_workflow_events (
    queue_id, completion_record_id, enrollment_id, event_type, actor_clerk_user_id,
    event_note, submission_reference, certificate_reference, correlation_id
  ) values (
    p_queue_id, v_queue.completion_record_id, v_queue.enrollment_id, 'exception_opened', p_actor_clerk_user_id,
    trim(p_exception_note), v_queue.submission_reference, v_queue.certificate_reference, p_correlation_id
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, v_queue.enrollment_id, 'lias', p_queue_id,
    'lias_exception_opened', p_correlation_id, jsonb_build_object('exceptionNote', trim(p_exception_note))
  );
end;
$$;

revoke execute on function public.fdacs_class_d_add_business_days(date,integer) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_add_business_days(date,integer) to service_role;
revoke execute on function public.fdacs_class_d_mark_lias_submitted(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_mark_lias_submitted(uuid,text,text,uuid) to service_role;
revoke execute on function public.fdacs_class_d_confirm_lias_certificate(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_confirm_lias_certificate(uuid,text,text,uuid) to service_role;
revoke execute on function public.fdacs_class_d_open_lias_exception(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_open_lias_exception(uuid,text,text,uuid) to service_role;

commit;
