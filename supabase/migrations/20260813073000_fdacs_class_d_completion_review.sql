begin;

create table if not exists public.fdacs_class_d_completion_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.fdacs_class_d_enrollments(id) on delete restrict,
  status text not null default 'approved' check (status in ('approved','lias_prepared','lias_reported','voided')),
  passed_exam_attempt_id uuid not null references public.fdacs_class_d_exam_attempts(id) on delete restrict,
  verified_instructional_minutes integer not null check (verified_instructional_minutes >= 2400),
  completion_evidence jsonb not null,
  approved_by_clerk_user_id text not null,
  approved_at timestamptz not null default now(),
  review_note text not null check (char_length(trim(review_note)) between 3 and 4000),
  correlation_id uuid not null,
  retention_review_after date not null default (current_date + interval '3 years')::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdacs_class_d_completion_reviews (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  outcome text not null check (outcome in ('approved','not_ready')),
  readiness_snapshot jsonb not null,
  review_note text not null check (char_length(trim(review_note)) between 3 and 4000),
  reviewed_by_clerk_user_id text not null,
  reviewed_at timestamptz not null default now(),
  correlation_id uuid not null
);

create table if not exists public.fdacs_class_d_lias_reporting_queue (
  id uuid primary key default gen_random_uuid(),
  completion_record_id uuid not null unique references public.fdacs_class_d_completion_records(id) on delete restrict,
  enrollment_id uuid not null unique references public.fdacs_class_d_enrollments(id) on delete restrict,
  status text not null default 'prepared' check (status in ('prepared','submitted','confirmed','exception','cancelled')),
  prepared_at timestamptz not null default now(),
  prepared_by_clerk_user_id text not null,
  submission_reference text,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  exception_note text,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_completion_review_enrollment_idx
  on public.fdacs_class_d_completion_reviews(enrollment_id, reviewed_at desc);
create index if not exists fdacs_class_d_lias_queue_status_idx
  on public.fdacs_class_d_lias_reporting_queue(status, prepared_at);

alter table public.fdacs_class_d_completion_records enable row level security;
alter table public.fdacs_class_d_completion_records force row level security;
alter table public.fdacs_class_d_completion_reviews enable row level security;
alter table public.fdacs_class_d_completion_reviews force row level security;
alter table public.fdacs_class_d_lias_reporting_queue enable row level security;
alter table public.fdacs_class_d_lias_reporting_queue force row level security;

revoke all on table public.fdacs_class_d_completion_records from public, anon, authenticated;
revoke all on table public.fdacs_class_d_completion_reviews from public, anon, authenticated;
revoke all on table public.fdacs_class_d_lias_reporting_queue from public, anon, authenticated;
grant all on table public.fdacs_class_d_completion_records to service_role;
grant all on table public.fdacs_class_d_completion_reviews to service_role;
grant all on table public.fdacs_class_d_lias_reporting_queue to service_role;

create or replace function public.fdacs_class_d_completion_readiness(p_enrollment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identity_verified boolean := false;
  v_enrollment_status text;
  v_module_complete_count integer := 0;
  v_instruction_seconds bigint := 0;
  v_makeup_minutes bigint := 0;
  v_total_minutes integer := 0;
  v_days_ready integer := 0;
  v_passed_attempt_id uuid;
  v_open_security_count integer := 0;
  v_open_exam_count integer := 0;
  v_open_remediation_count integer := 0;
  v_existing_completion_id uuid;
begin
  select (i.identity_status = 'verified'), e.status
    into v_identity_verified, v_enrollment_status
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_student_identities i on i.id = e.student_identity_id
  where e.id = p_enrollment_id;

  if v_enrollment_status is null then
    raise exception 'enrollment not found';
  end if;

  select count(*) into v_module_complete_count
  from public.fdacs_class_d_module_progress
  where enrollment_id = p_enrollment_id
    and status = 'complete'
    and learning_check_passed = true;

  select coalesce(sum(instructional_presence_seconds), 0)
    into v_instruction_seconds
  from public.fdacs_class_d_live_time_totals
  where enrollment_id = p_enrollment_id;

  select coalesce(sum(certified_minutes), 0)
    into v_makeup_minutes
  from public.fdacs_class_d_makeup_assignments
  where enrollment_id = p_enrollment_id and status = 'certified';

  v_total_minutes := floor(v_instruction_seconds / 60.0)::integer + v_makeup_minutes::integer;

  with live_by_day as (
    select day, floor(coalesce(sum(instructional_presence_seconds), 0) / 60.0)::integer as minutes
    from public.fdacs_class_d_live_time_totals
    where enrollment_id = p_enrollment_id
    group by day
  ), makeup_by_day as (
    select training_day as day, coalesce(sum(certified_minutes), 0)::integer as minutes
    from public.fdacs_class_d_makeup_assignments
    where enrollment_id = p_enrollment_id and status = 'certified'
    group by training_day
  ), days as (
    select generate_series(1,5) as day
  )
  select count(*) into v_days_ready
  from days d
  left join live_by_day l on l.day = d.day
  left join makeup_by_day m on m.day = d.day
  where coalesce(l.minutes,0) + coalesce(m.minutes,0) >= 480;

  select id into v_passed_attempt_id
  from public.fdacs_class_d_exam_attempts
  where enrollment_id = p_enrollment_id and status = 'passed' and passed = true and score >= 128
  order by submitted_at desc nulls last, started_at desc
  limit 1;

  select count(*) into v_open_security_count
  from public.fdacs_class_d_live_time_totals
  where enrollment_id = p_enrollment_id and presence_state = 'absent_challenge';

  select count(*) into v_open_exam_count
  from public.fdacs_class_d_exam_attempts
  where enrollment_id = p_enrollment_id and status in ('in_progress','interrupted');

  select count(*) into v_open_remediation_count
  from public.fdacs_class_d_remediation_records
  where enrollment_id = p_enrollment_id and completed_at is null;

  select id into v_existing_completion_id
  from public.fdacs_class_d_completion_records
  where enrollment_id = p_enrollment_id and status <> 'voided'
  limit 1;

  return jsonb_build_object(
    'enrollmentId', p_enrollment_id,
    'identityVerified', v_identity_verified,
    'enrollmentStatus', v_enrollment_status,
    'moduleChecksComplete', v_module_complete_count = 18,
    'completedModuleCount', v_module_complete_count,
    'verifiedInstructionalMinutes', v_total_minutes,
    'instructionalHoursSatisfied', v_total_minutes >= 2400,
    'fiveTrainingDaysSatisfied', v_days_ready = 5,
    'trainingDaysSatisfied', v_days_ready,
    'passedExamAttemptId', v_passed_attempt_id,
    'examPassed', v_passed_attempt_id is not null,
    'openSecurityIssues', v_open_security_count,
    'openExamAttempts', v_open_exam_count,
    'openRemediationItems', v_open_remediation_count,
    'existingCompletionId', v_existing_completion_id,
    'ready',
      v_identity_verified
      and v_enrollment_status not in ('withdrawn','failed')
      and v_module_complete_count = 18
      and v_total_minutes >= 2400
      and v_days_ready = 5
      and v_passed_attempt_id is not null
      and v_open_security_count = 0
      and v_open_exam_count = 0
      and v_open_remediation_count = 0
      and v_existing_completion_id is null
  );
end;
$$;

revoke execute on function public.fdacs_class_d_completion_readiness(uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_completion_readiness(uuid) to service_role;

create or replace function public.fdacs_class_d_approve_completion(
  p_enrollment_id uuid,
  p_actor_clerk_user_id text,
  p_review_note text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_readiness jsonb;
  v_completion_id uuid;
  v_exam_attempt_id uuid;
  v_minutes integer;
begin
  perform 1 from public.fdacs_class_d_enrollments where id = p_enrollment_id for update;
  if not found then raise exception 'enrollment not found'; end if;
  if p_actor_clerk_user_id is null or char_length(trim(p_actor_clerk_user_id)) < 3 then
    raise exception 'authorized completion reviewer identity is required';
  end if;
  if p_review_note is null or char_length(trim(p_review_note)) < 3 then
    raise exception 'completion review note is required';
  end if;

  v_readiness := public.fdacs_class_d_completion_readiness(p_enrollment_id);

  insert into public.fdacs_class_d_completion_reviews (
    enrollment_id, outcome, readiness_snapshot, review_note,
    reviewed_by_clerk_user_id, correlation_id
  ) values (
    p_enrollment_id,
    case when coalesce((v_readiness->>'ready')::boolean,false) then 'approved' else 'not_ready' end,
    v_readiness, trim(p_review_note), p_actor_clerk_user_id, p_correlation_id
  );

  if not coalesce((v_readiness->>'ready')::boolean,false) then
    raise exception 'enrollment is not ready for successful completion';
  end if;

  v_exam_attempt_id := (v_readiness->>'passedExamAttemptId')::uuid;
  v_minutes := (v_readiness->>'verifiedInstructionalMinutes')::integer;

  insert into public.fdacs_class_d_completion_records (
    enrollment_id, passed_exam_attempt_id, verified_instructional_minutes,
    completion_evidence, approved_by_clerk_user_id, review_note, correlation_id
  ) values (
    p_enrollment_id, v_exam_attempt_id, v_minutes,
    v_readiness, p_actor_clerk_user_id, trim(p_review_note), p_correlation_id
  ) returning id into v_completion_id;

  update public.fdacs_class_d_enrollments
  set status = 'completed', updated_at = now(),
      retention_review_after = greatest(coalesce(retention_review_after, current_date), (current_date + interval '3 years')::date)
  where id = p_enrollment_id;

  insert into public.fdacs_class_d_lias_reporting_queue (
    completion_record_id, enrollment_id, prepared_by_clerk_user_id, correlation_id
  ) values (
    v_completion_id, p_enrollment_id, p_actor_clerk_user_id, p_correlation_id
  );

  update public.fdacs_class_d_completion_records
  set status = 'lias_prepared', updated_at = now()
  where id = v_completion_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id,
    action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, p_enrollment_id, 'completion', v_completion_id,
    'successful_completion_approved', p_correlation_id,
    jsonb_build_object('passedExamAttemptId', v_exam_attempt_id, 'verifiedInstructionalMinutes', v_minutes)
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id,
    action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, p_enrollment_id, 'lias', v_completion_id,
    'lias_reporting_prepared', p_correlation_id,
    jsonb_build_object('executionMode', 'manual_queue_only')
  );

  return v_completion_id;
end;
$$;

revoke execute on function public.fdacs_class_d_approve_completion(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_approve_completion(uuid,text,text,uuid) to service_role;

commit;
