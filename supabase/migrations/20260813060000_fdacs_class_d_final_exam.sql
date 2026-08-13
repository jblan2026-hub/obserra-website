begin;

create table if not exists public.fdacs_class_d_exam_banks (
  id uuid primary key default gen_random_uuid(),
  course_id text not null default 'florida-class-d-40-hour',
  version text not null,
  status text not null check (status in ('draft','division_submitted','division_approved','retired')),
  division_approval_reference text,
  question_count integer not null default 0 check (question_count >= 0),
  required_question_count integer not null default 170 check (required_question_count = 170),
  passing_score integer not null default 128 check (passing_score = 128),
  minimum_exam_seconds integer not null default 7200 check (minimum_exam_seconds >= 7200),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (course_id, version)
);

create table if not exists public.fdacs_class_d_exam_questions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.fdacs_class_d_exam_banks(id) on delete restrict,
  subject_code text not null,
  question_type text not null check (question_type in ('multiple_choice','true_false')),
  prompt text not null,
  choices jsonb not null,
  correct_choice_key text not null,
  rationale text,
  display_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (bank_id, display_order)
);

create table if not exists public.fdacs_class_d_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  bank_id uuid not null references public.fdacs_class_d_exam_banks(id) on delete restrict,
  clerk_user_id text not null,
  status text not null check (status in ('in_progress','submitted','passed','failed','invalidated')) default 'in_progress',
  started_at timestamptz not null default now(),
  earliest_submit_at timestamptz not null,
  submitted_at timestamptz,
  score integer check (score between 0 and 170),
  passed boolean,
  randomized_question_ids uuid[] not null,
  current_question_index integer not null default 0 check (current_question_index >= 0),
  browser_instance_id text not null,
  clerk_session_id text not null,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdacs_class_d_exam_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.fdacs_class_d_exam_attempts(id) on delete restrict,
  question_id uuid not null references public.fdacs_class_d_exam_questions(id) on delete restrict,
  selected_choice_key text,
  answered_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create unique index if not exists fdacs_class_d_one_active_exam_attempt_idx
  on public.fdacs_class_d_exam_attempts(enrollment_id)
  where status = 'in_progress';

create index if not exists fdacs_class_d_exam_attempt_enrollment_idx
  on public.fdacs_class_d_exam_attempts(enrollment_id, started_at desc);
create index if not exists fdacs_class_d_exam_response_attempt_idx
  on public.fdacs_class_d_exam_responses(attempt_id);

alter table public.fdacs_class_d_exam_banks enable row level security;
alter table public.fdacs_class_d_exam_banks force row level security;
alter table public.fdacs_class_d_exam_questions enable row level security;
alter table public.fdacs_class_d_exam_questions force row level security;
alter table public.fdacs_class_d_exam_attempts enable row level security;
alter table public.fdacs_class_d_exam_attempts force row level security;
alter table public.fdacs_class_d_exam_responses enable row level security;
alter table public.fdacs_class_d_exam_responses force row level security;

revoke all on table public.fdacs_class_d_exam_banks from public, anon, authenticated;
revoke all on table public.fdacs_class_d_exam_questions from public, anon, authenticated;
revoke all on table public.fdacs_class_d_exam_attempts from public, anon, authenticated;
revoke all on table public.fdacs_class_d_exam_responses from public, anon, authenticated;
grant all on table public.fdacs_class_d_exam_banks to service_role;
grant all on table public.fdacs_class_d_exam_questions to service_role;
grant all on table public.fdacs_class_d_exam_attempts to service_role;
grant all on table public.fdacs_class_d_exam_responses to service_role;

create or replace function public.fdacs_class_d_validate_exam_bank(p_bank_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_bad_subject text;
begin
  select count(*) into v_total
  from public.fdacs_class_d_exam_questions
  where bank_id = p_bank_id and active = true;

  if v_total <> 170 then
    raise exception 'approved exam bank must contain exactly 170 active questions';
  end if;

  select subject_code into v_bad_subject
  from public.fdacs_class_d_exam_questions
  where bank_id = p_bank_id and active = true
  group by subject_code
  having count(*) filter (where question_type = 'true_false') * 2 > count(*)
  limit 1;

  if v_bad_subject is not null then
    raise exception 'true/false questions exceed 50 percent in subject area %', v_bad_subject;
  end if;
end;
$$;

revoke execute on function public.fdacs_class_d_validate_exam_bank(uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_validate_exam_bank(uuid) to service_role;

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
    earliest_submit_at, randomized_question_ids, correlation_id
  ) values (
    p_enrollment_id, v_bank_id, p_clerk_user_id, p_clerk_session_id, p_browser_instance_id,
    now() + interval '2 hours', v_question_ids, p_correlation_id
  ) returning id into v_attempt_id;

  insert into public.fdacs_class_d_exam_responses (attempt_id, question_id)
  select v_attempt_id, unnest(v_question_ids);

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'student', p_clerk_user_id, p_enrollment_id, 'exam', v_attempt_id, 'exam_attempt_started', p_correlation_id,
    jsonb_build_object('bankId', v_bank_id, 'questionCount', 170, 'earliestSubmitAt', now() + interval '2 hours')
  );

  return v_attempt_id;
end;
$$;

revoke execute on function public.fdacs_class_d_start_exam_attempt(uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_start_exam_attempt(uuid,text,text,text,uuid) to service_role;

create or replace function public.fdacs_class_d_submit_exam_attempt(
  p_attempt_id uuid,
  p_clerk_user_id text,
  p_correlation_id uuid
)
returns table(score integer, passed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.fdacs_class_d_exam_attempts%rowtype;
  v_score integer;
begin
  select * into v_attempt
  from public.fdacs_class_d_exam_attempts
  where id = p_attempt_id
  for update;

  if v_attempt.id is null or v_attempt.clerk_user_id <> p_clerk_user_id then
    raise exception 'exam attempt not found';
  end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'exam attempt is not active';
  end if;
  if now() < v_attempt.earliest_submit_at then
    raise exception 'minimum two-hour examination duration has not elapsed';
  end if;

  select count(*) into v_score
  from public.fdacs_class_d_exam_responses r
  join public.fdacs_class_d_exam_questions q on q.id = r.question_id
  where r.attempt_id = p_attempt_id
    and r.selected_choice_key is not null
    and r.selected_choice_key = q.correct_choice_key;

  update public.fdacs_class_d_exam_attempts
  set submitted_at = now(), score = v_score, passed = (v_score >= 128),
      status = case when v_score >= 128 then 'passed' else 'failed' end,
      updated_at = now()
  where id = p_attempt_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'student', p_clerk_user_id, v_attempt.enrollment_id, 'exam', p_attempt_id, 'exam_attempt_submitted', p_correlation_id,
    jsonb_build_object('score', v_score, 'passed', v_score >= 128)
  );

  return query select v_score, (v_score >= 128);
end;
$$;

revoke execute on function public.fdacs_class_d_submit_exam_attempt(uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_submit_exam_attempt(uuid,text,uuid) to service_role;

commit;
