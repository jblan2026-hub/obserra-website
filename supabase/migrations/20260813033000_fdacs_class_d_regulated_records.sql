begin;

create table if not exists public.fdacs_class_d_cohorts (
  id uuid primary key default gen_random_uuid(),
  cohort_code text not null unique check (char_length(cohort_code) between 3 and 80),
  start_date date not null,
  end_date date not null,
  instructor_clerk_user_ids text[] not null default '{}'::text[],
  capacity integer not null check (capacity between 1 and 500),
  status text not null default 'draft' check (status in ('draft','scheduled','active','closed','cancelled')),
  created_by_clerk_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.fdacs_class_d_student_identities (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  legal_name text not null check (char_length(legal_name) between 1 and 200),
  date_of_birth date not null,
  identity_status text not null default 'unverified' check (identity_status in ('unverified','pending','verified','rejected')),
  verification_reference text,
  verified_at timestamptz,
  verified_by_clerk_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdacs_class_d_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_identity_id uuid not null references public.fdacs_class_d_student_identities(id) on delete restrict,
  clerk_user_id text not null,
  course_id text not null default 'florida-class-d-40-hour' check (course_id = 'florida-class-d-40-hour'),
  cohort_id uuid not null references public.fdacs_class_d_cohorts(id) on delete restrict,
  status text not null default 'pending_identity' check (status in ('pending_identity','pending_entitlement','enrolled','in_progress','instruction_complete','exam_eligible','completed','failed','withdrawn')),
  entitlement_reference text,
  enrolled_at timestamptz not null default now(),
  retention_review_after date,
  created_by_clerk_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_identity_id, cohort_id)
);

create table if not exists public.fdacs_class_d_attendance_entries (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  day smallint not null check (day between 1 and 5),
  status text not null check (status in ('present','partial','absent','makeup_required','made_up')),
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  instructional_minutes_credited integer not null default 0 check (instructional_minutes_credited between 0 and 480),
  attested_by_clerk_user_id text not null,
  idempotency_key text not null unique check (char_length(idempotency_key) between 12 and 180),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  check (checked_out_at is null or checked_in_at is null or checked_out_at >= checked_in_at)
);

create table if not exists public.fdacs_class_d_instruction_time_entries (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  module_id smallint not null check (module_id between 1 and 18),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  credited_minutes integer not null check (credited_minutes between 1 and 480),
  source text not null check (source in ('lms_session','instructor_attested_makeup')),
  recorded_by_clerk_user_id text not null,
  idempotency_key text not null unique check (char_length(idempotency_key) between 12 and 180),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  check (ended_at >= started_at)
);

create table if not exists public.fdacs_class_d_module_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  module_id smallint not null check (module_id between 1 and 18),
  status text not null default 'locked' check (status in ('locked','available','in_progress','remediation_required','complete')),
  instructional_minutes_credited integer not null default 0 check (instructional_minutes_credited between 0 and 480),
  learning_check_passed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (enrollment_id, module_id)
);

create table if not exists public.fdacs_class_d_learning_check_results (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  module_id smallint not null check (module_id between 1 and 18),
  attempt integer not null check (attempt >= 1),
  score_percent numeric(5,2) not null check (score_percent between 0 and 100),
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  idempotency_key text not null unique check (char_length(idempotency_key) between 12 and 180),
  correlation_id uuid not null,
  unique (enrollment_id, module_id, attempt)
);

create table if not exists public.fdacs_class_d_remediation_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  module_id smallint not null check (module_id between 1 and 18),
  reason text not null check (char_length(reason) between 1 and 4000),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  approved_by_clerk_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdacs_class_d_record_holds (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  hold_type text not null check (hold_type in ('inspection','legal','regulatory','administrative')),
  reason text not null check (char_length(reason) between 1 and 4000),
  placed_by_clerk_user_id text not null,
  placed_at timestamptz not null default now(),
  released_at timestamptz,
  released_by_clerk_user_id text,
  check (released_at is null or released_at >= placed_at)
);

create table if not exists public.fdacs_class_d_audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_role text not null check (actor_role in ('student','instructor','school_admin','compliance_admin','system')),
  actor_clerk_user_id text not null,
  enrollment_id uuid references public.fdacs_class_d_enrollments(id) on delete restrict,
  entity_type text not null check (entity_type in ('identity','enrollment','cohort','attendance','instruction_time','module_progress','learning_check','remediation','record_hold','exam','completion','lias')),
  entity_id uuid not null,
  action text not null check (char_length(action) between 1 and 160),
  correlation_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_enrollments_clerk_idx on public.fdacs_class_d_enrollments(clerk_user_id);
create index if not exists fdacs_class_d_enrollments_cohort_idx on public.fdacs_class_d_enrollments(cohort_id, status);
create index if not exists fdacs_class_d_attendance_enrollment_idx on public.fdacs_class_d_attendance_entries(enrollment_id, day, created_at);
create index if not exists fdacs_class_d_instruction_time_enrollment_idx on public.fdacs_class_d_instruction_time_entries(enrollment_id, module_id, created_at);
create index if not exists fdacs_class_d_module_progress_enrollment_idx on public.fdacs_class_d_module_progress(enrollment_id, module_id);
create index if not exists fdacs_class_d_learning_check_enrollment_idx on public.fdacs_class_d_learning_check_results(enrollment_id, module_id, attempt);
create index if not exists fdacs_class_d_remediation_enrollment_idx on public.fdacs_class_d_remediation_records(enrollment_id, module_id, completed_at);
create index if not exists fdacs_class_d_audit_enrollment_idx on public.fdacs_class_d_audit_events(enrollment_id, occurred_at);
create index if not exists fdacs_class_d_audit_correlation_idx on public.fdacs_class_d_audit_events(correlation_id, occurred_at);
create index if not exists fdacs_class_d_holds_enrollment_idx on public.fdacs_class_d_record_holds(enrollment_id, released_at);

create or replace function public.fdacs_class_d_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.fdacs_class_d_reject_audit_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'fdacs_class_d_audit_events is append-only';
end;
$$;

create or replace function public.fdacs_class_d_record_attendance(
  p_enrollment_id uuid,
  p_day smallint,
  p_status text,
  p_checked_in_at timestamptz,
  p_checked_out_at timestamptz,
  p_instructional_minutes_credited integer,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_idempotency_key text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
  v_entry_id uuid;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin','system') then
    raise exception 'unauthorized actor role';
  end if;

  select id into v_existing
  from public.fdacs_class_d_attendance_entries
  where idempotency_key = p_idempotency_key;

  if v_existing is not null then
    return v_existing;
  end if;

  insert into public.fdacs_class_d_attendance_entries (
    enrollment_id, day, status, checked_in_at, checked_out_at,
    instructional_minutes_credited, attested_by_clerk_user_id,
    idempotency_key, correlation_id
  ) values (
    p_enrollment_id, p_day, p_status, p_checked_in_at, p_checked_out_at,
    p_instructional_minutes_credited, p_actor_clerk_user_id,
    p_idempotency_key, p_correlation_id
  ) returning id into v_entry_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type,
    entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, p_enrollment_id, 'attendance',
    v_entry_id, 'attendance_recorded', p_correlation_id,
    jsonb_build_object('day', p_day, 'status', p_status, 'instructionalMinutesCredited', p_instructional_minutes_credited)
  );

  return v_entry_id;
end;
$$;

create or replace function public.fdacs_class_d_record_instruction_time(
  p_enrollment_id uuid,
  p_module_id smallint,
  p_started_at timestamptz,
  p_ended_at timestamptz,
  p_credited_minutes integer,
  p_source text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_idempotency_key text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
  v_entry_id uuid;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin','system') then
    raise exception 'unauthorized actor role';
  end if;

  select id into v_existing
  from public.fdacs_class_d_instruction_time_entries
  where idempotency_key = p_idempotency_key;

  if v_existing is not null then
    return v_existing;
  end if;

  insert into public.fdacs_class_d_instruction_time_entries (
    enrollment_id, module_id, started_at, ended_at, credited_minutes,
    source, recorded_by_clerk_user_id, idempotency_key, correlation_id
  ) values (
    p_enrollment_id, p_module_id, p_started_at, p_ended_at, p_credited_minutes,
    p_source, p_actor_clerk_user_id, p_idempotency_key, p_correlation_id
  ) returning id into v_entry_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type,
    entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, p_enrollment_id, 'instruction_time',
    v_entry_id, 'instruction_time_recorded', p_correlation_id,
    jsonb_build_object('moduleId', p_module_id, 'creditedMinutes', p_credited_minutes, 'source', p_source)
  );

  return v_entry_id;
end;
$$;

drop trigger if exists fdacs_class_d_cohorts_touch_updated_at on public.fdacs_class_d_cohorts;
create trigger fdacs_class_d_cohorts_touch_updated_at before update on public.fdacs_class_d_cohorts for each row execute function public.fdacs_class_d_touch_updated_at();
drop trigger if exists fdacs_class_d_identities_touch_updated_at on public.fdacs_class_d_student_identities;
create trigger fdacs_class_d_identities_touch_updated_at before update on public.fdacs_class_d_student_identities for each row execute function public.fdacs_class_d_touch_updated_at();
drop trigger if exists fdacs_class_d_enrollments_touch_updated_at on public.fdacs_class_d_enrollments;
create trigger fdacs_class_d_enrollments_touch_updated_at before update on public.fdacs_class_d_enrollments for each row execute function public.fdacs_class_d_touch_updated_at();
drop trigger if exists fdacs_class_d_module_progress_touch_updated_at on public.fdacs_class_d_module_progress;
create trigger fdacs_class_d_module_progress_touch_updated_at before update on public.fdacs_class_d_module_progress for each row execute function public.fdacs_class_d_touch_updated_at();
drop trigger if exists fdacs_class_d_remediation_touch_updated_at on public.fdacs_class_d_remediation_records;
create trigger fdacs_class_d_remediation_touch_updated_at before update on public.fdacs_class_d_remediation_records for each row execute function public.fdacs_class_d_touch_updated_at();
drop trigger if exists fdacs_class_d_audit_immutable on public.fdacs_class_d_audit_events;
create trigger fdacs_class_d_audit_immutable before update or delete on public.fdacs_class_d_audit_events for each row execute function public.fdacs_class_d_reject_audit_mutation();

alter table public.fdacs_class_d_cohorts enable row level security;
alter table public.fdacs_class_d_cohorts force row level security;
alter table public.fdacs_class_d_student_identities enable row level security;
alter table public.fdacs_class_d_student_identities force row level security;
alter table public.fdacs_class_d_enrollments enable row level security;
alter table public.fdacs_class_d_enrollments force row level security;
alter table public.fdacs_class_d_attendance_entries enable row level security;
alter table public.fdacs_class_d_attendance_entries force row level security;
alter table public.fdacs_class_d_instruction_time_entries enable row level security;
alter table public.fdacs_class_d_instruction_time_entries force row level security;
alter table public.fdacs_class_d_module_progress enable row level security;
alter table public.fdacs_class_d_module_progress force row level security;
alter table public.fdacs_class_d_learning_check_results enable row level security;
alter table public.fdacs_class_d_learning_check_results force row level security;
alter table public.fdacs_class_d_remediation_records enable row level security;
alter table public.fdacs_class_d_remediation_records force row level security;
alter table public.fdacs_class_d_record_holds enable row level security;
alter table public.fdacs_class_d_record_holds force row level security;
alter table public.fdacs_class_d_audit_events enable row level security;
alter table public.fdacs_class_d_audit_events force row level security;

revoke all on table public.fdacs_class_d_cohorts from public, anon, authenticated;
revoke all on table public.fdacs_class_d_student_identities from public, anon, authenticated;
revoke all on table public.fdacs_class_d_enrollments from public, anon, authenticated;
revoke all on table public.fdacs_class_d_attendance_entries from public, anon, authenticated;
revoke all on table public.fdacs_class_d_instruction_time_entries from public, anon, authenticated;
revoke all on table public.fdacs_class_d_module_progress from public, anon, authenticated;
revoke all on table public.fdacs_class_d_learning_check_results from public, anon, authenticated;
revoke all on table public.fdacs_class_d_remediation_records from public, anon, authenticated;
revoke all on table public.fdacs_class_d_record_holds from public, anon, authenticated;
revoke all on table public.fdacs_class_d_audit_events from public, anon, authenticated;

revoke all on function public.fdacs_class_d_touch_updated_at() from public, anon, authenticated;
revoke all on function public.fdacs_class_d_reject_audit_mutation() from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_attendance(uuid,smallint,text,timestamptz,timestamptz,integer,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_instruction_time(uuid,smallint,timestamptz,timestamptz,integer,text,text,text,text,uuid) from public, anon, authenticated;

grant select, insert, update on table public.fdacs_class_d_cohorts to service_role;
grant select, insert, update on table public.fdacs_class_d_student_identities to service_role;
grant select, insert, update on table public.fdacs_class_d_enrollments to service_role;
grant select, insert on table public.fdacs_class_d_attendance_entries to service_role;
grant select, insert on table public.fdacs_class_d_instruction_time_entries to service_role;
grant select, insert, update on table public.fdacs_class_d_module_progress to service_role;
grant select, insert on table public.fdacs_class_d_learning_check_results to service_role;
grant select, insert, update on table public.fdacs_class_d_remediation_records to service_role;
grant select, insert, update on table public.fdacs_class_d_record_holds to service_role;
grant select, insert on table public.fdacs_class_d_audit_events to service_role;
grant execute on function public.fdacs_class_d_record_attendance(uuid,smallint,text,timestamptz,timestamptz,integer,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_record_instruction_time(uuid,smallint,timestamptz,timestamptz,integer,text,text,text,text,uuid) to service_role;

comment on table public.fdacs_class_d_student_identities is 'Restricted Florida Class D regulated identity record. No identity-document binaries are stored here.';
comment on table public.fdacs_class_d_audit_events is 'Append-only audit ledger for Florida Class D regulated training operations.';
comment on table public.fdacs_class_d_record_holds is 'Inspection, legal, regulatory, or administrative record holds. Retention duration remains policy-controlled and is not hard-coded here.';

commit;
