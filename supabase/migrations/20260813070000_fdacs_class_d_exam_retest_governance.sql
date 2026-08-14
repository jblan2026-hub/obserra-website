begin;

create table if not exists public.fdacs_class_d_exam_retest_authorizations (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  failed_attempt_id uuid not null references public.fdacs_class_d_exam_attempts(id) on delete restrict,
  status text not null default 'authorized' check (status in ('authorized','consumed','revoked')),
  remediation_summary text not null check (char_length(trim(remediation_summary)) between 3 and 4000),
  authorization_note text not null check (char_length(trim(authorization_note)) between 3 and 4000),
  authorized_by_clerk_user_id text not null,
  authorized_at timestamptz not null default now(),
  consumed_by_attempt_id uuid references public.fdacs_class_d_exam_attempts(id) on delete restrict,
  consumed_at timestamptz,
  revoked_by_clerk_user_id text,
  revoked_at timestamptz,
  revocation_reason text check (revocation_reason is null or char_length(trim(revocation_reason)) between 3 and 4000),
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.fdacs_class_d_exam_attempts
  add column if not exists retest_authorization_id uuid references public.fdacs_class_d_exam_retest_authorizations(id) on delete restrict;

create unique index if not exists fdacs_class_d_one_open_retest_authorization_idx
  on public.fdacs_class_d_exam_retest_authorizations(enrollment_id)
  where status = 'authorized';
create index if not exists fdacs_class_d_retest_failed_attempt_idx
  on public.fdacs_class_d_exam_retest_authorizations(failed_attempt_id, authorized_at desc);

alter table public.fdacs_class_d_exam_retest_authorizations enable row level security;
alter table public.fdacs_class_d_exam_retest_authorizations force row level security;
revoke all on table public.fdacs_class_d_exam_retest_authorizations from public, anon, authenticated;
grant all on table public.fdacs_class_d_exam_retest_authorizations to service_role;

create or replace function public.fdacs_class_d_authorize_exam_retest(
  p_enrollment_id uuid,
  p_failed_attempt_id uuid,
  p_actor_clerk_user_id text,
  p_remediation_summary text,
  p_authorization_note text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.fdacs_class_d_exam_attempts%rowtype;
  v_id uuid;
begin
  select * into v_attempt
  from public.fdacs_class_d_exam_attempts
  where id = p_failed_attempt_id and enrollment_id = p_enrollment_id
  for update;

  if v_attempt.id is null or v_attempt.status <> 'failed' or v_attempt.passed is distinct from false then
    raise exception 'retest authorization requires a preserved failed examination attempt';
  end if;
  if p_actor_clerk_user_id is null or char_length(trim(p_actor_clerk_user_id)) < 3 then
    raise exception 'authorized staff identity is required';
  end if;
  if p_remediation_summary is null or char_length(trim(p_remediation_summary)) < 3 then
    raise exception 'documented remediation is required before retest authorization';
  end if;
  if p_authorization_note is null or char_length(trim(p_authorization_note)) < 3 then
    raise exception 'retest authorization note is required';
  end if;

  if exists (
    select 1 from public.fdacs_class_d_exam_retest_authorizations
    where enrollment_id = p_enrollment_id and status = 'authorized'
  ) then
    raise exception 'an active retest authorization already exists for this enrollment';
  end if;

  insert into public.fdacs_class_d_exam_retest_authorizations (
    enrollment_id, failed_attempt_id, remediation_summary, authorization_note,
    authorized_by_clerk_user_id, correlation_id
  ) values (
    p_enrollment_id, p_failed_attempt_id, trim(p_remediation_summary), trim(p_authorization_note),
    p_actor_clerk_user_id, p_correlation_id
  ) returning id into v_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id,
    action, correlation_id, metadata
  ) values (
    'school_admin', p_actor_clerk_user_id, p_enrollment_id, 'exam', v_id,
    'exam_retest_authorized', p_correlation_id,
    jsonb_build_object('failedAttemptId', p_failed_attempt_id, 'failedScore', v_attempt.score)
  );

  return v_id;
end;
$$;

revoke execute on function public.fdacs_class_d_authorize_exam_retest(uuid,uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_authorize_exam_retest(uuid,uuid,text,text,text,uuid) to service_role;

create or replace function public.fdacs_class_d_revoke_exam_retest(
  p_authorization_id uuid,
  p_actor_clerk_user_id text,
  p_reason text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth public.fdacs_class_d_exam_retest_authorizations%rowtype;
begin
  select * into v_auth
  from public.fdacs_class_d_exam_retest_authorizations
  where id = p_authorization_id
  for update;

  if v_auth.id is null or v_auth.status <> 'authorized' then
    raise exception 'active retest authorization was not found';
  end if;
  if p_reason is null or char_length(trim(p_reason)) < 3 then
    raise exception 'retest revocation reason is required';
  end if;

  update public.fdacs_class_d_exam_retest_authorizations
  set status = 'revoked', revoked_by_clerk_user_id = p_actor_clerk_user_id,
      revoked_at = now(), revocation_reason = trim(p_reason)
  where id = p_authorization_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id,
    action, correlation_id, metadata
  ) values (
    'school_admin', p_actor_clerk_user_id, v_auth.enrollment_id, 'exam', p_authorization_id,
    'exam_retest_authorization_revoked', p_correlation_id,
    jsonb_build_object('failedAttemptId', v_auth.failed_attempt_id, 'reason', trim(p_reason))
  );
end;
$$;

revoke execute on function public.fdacs_class_d_revoke_exam_retest(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_revoke_exam_retest(uuid,text,text,uuid) to service_role;

create or replace function public.fdacs_class_d_start_exam_attempt(
  p_enrollment_id uuid,
  p_clerk_user_id text,
  p_clerk_session_id text,
  p_browser_instance_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bank_id uuid;
  v_bank_status text;
  v_question_ids uuid[];
  v_attempt_id uuid;
  v_enrollment_user text;
  v_enrollment_status text;
  v_instruction_seconds bigint;
  v_prior_failed_count integer;
  v_retest_authorization_id uuid;
begin
  select clerk_user_id, status into v_enrollment_user, v_enrollment_status
  from public.fdacs_class_d_enrollments
  where id = p_enrollment_id
  for update;

  if v_enrollment_user is distinct from p_clerk_user_id then
    raise exception 'exam enrollment identity mismatch';
  end if;
  if v_enrollment_status in ('withdrawn','rejected') then
    raise exception 'enrollment is not eligible for examination';
  end if;

  select coalesce(sum(instructional_presence_seconds), 0) into v_instruction_seconds
  from public.fdacs_class_d_live_time_totals
  where enrollment_id = p_enrollment_id;

  select v_instruction_seconds + coalesce(sum(certified_minutes), 0) * 60 into v_instruction_seconds
  from public.fdacs_class_d_makeup_assignments
  where enrollment_id = p_enrollment_id and status = 'certified';

  if coalesce(v_instruction_seconds, 0) < 144000 then
    raise exception '40 instructional hours must be verified before examination';
  end if;

  select count(*) into v_prior_failed_count
  from public.fdacs_class_d_exam_attempts
  where enrollment_id = p_enrollment_id and status = 'failed';

  if v_prior_failed_count > 0 then
    select id into v_retest_authorization_id
    from public.fdacs_class_d_exam_retest_authorizations
    where enrollment_id = p_enrollment_id and status = 'authorized'
    order by authorized_at asc
    limit 1
    for update;

    if v_retest_authorization_id is null then
      raise exception 'documented remediation and staff retest authorization are required after a failed examination';
    end if;
  end if;

  select id, status into v_bank_id, v_bank_status
  from public.fdacs_class_d_exam_banks
  where course_id = 'florida-class-d-40-hour' and status = 'division_approved'
  order by approved_at desc nulls last, created_at desc
  limit 1;

  if v_bank_id is null or v_bank_status <> 'division_approved' then
    raise exception 'no division-approved examination bank is active';
  end if;

  perform public.fdacs_class_d_validate_exam_bank(v_bank_id);

  select array_agg(id order by random()) into v_question_ids
  from public.fdacs_class_d_exam_questions
  where bank_id = v_bank_id and active = true;

  insert into public.fdacs_class_d_exam_attempts (
    enrollment_id, bank_id, clerk_user_id, clerk_session_id, browser_instance_id,
    earliest_submit_at, randomized_question_ids, correlation_id, retest_authorization_id
  ) values (
    p_enrollment_id, v_bank_id, p_clerk_user_id, p_clerk_session_id, p_browser_instance_id,
    now() + interval '2 hours', v_question_ids, p_correlation_id, v_retest_authorization_id
  ) returning id into v_attempt_id;

  if v_retest_authorization_id is not null then
    update public.fdacs_class_d_exam_retest_authorizations
    set status = 'consumed', consumed_by_attempt_id = v_attempt_id, consumed_at = now()
    where id = v_retest_authorization_id and status = 'authorized';
  end if;

  insert into public.fdacs_class_d_exam_responses (attempt_id, question_id)
  select v_attempt_id, unnest(v_question_ids);

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'student', p_clerk_user_id, p_enrollment_id, 'exam', v_attempt_id, 'exam_attempt_started', p_correlation_id,
    jsonb_build_object('bankId', v_bank_id, 'questionCount', 170, 'earliestSubmitAt', now() + interval '2 hours', 'retestAuthorizationId', v_retest_authorization_id)
  );

  return v_attempt_id;
end;
$$;

revoke execute on function public.fdacs_class_d_start_exam_attempt(uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_start_exam_attempt(uuid,text,text,text,uuid) to service_role;

commit;
