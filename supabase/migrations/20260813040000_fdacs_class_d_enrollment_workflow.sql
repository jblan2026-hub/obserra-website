begin;

create table if not exists public.fdacs_class_d_student_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  clerk_user_id text not null,
  acknowledgment_code text not null check (acknowledgment_code in (
    'training-not-license',
    'identity-accuracy',
    'attendance-40-hours',
    'exam-separate-controlled',
    'records-privacy',
    'academic-integrity'
  )),
  policy_version text not null check (char_length(policy_version) between 1 and 80),
  accepted_at timestamptz not null default now(),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  unique (enrollment_id, acknowledgment_code, policy_version)
);

create table if not exists public.fdacs_class_d_enrollment_reviews (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  outcome text not null check (outcome in ('approved_pending_entitlement','needs_information','rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 4000),
  reviewed_by_clerk_user_id text not null,
  reviewed_at timestamptz not null default now(),
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_ack_enrollment_idx
  on public.fdacs_class_d_student_acknowledgments(enrollment_id, policy_version, acknowledgment_code);
create index if not exists fdacs_class_d_review_enrollment_idx
  on public.fdacs_class_d_enrollment_reviews(enrollment_id, reviewed_at);

alter table public.fdacs_class_d_audit_events
  drop constraint if exists fdacs_class_d_audit_events_entity_type_check;
alter table public.fdacs_class_d_audit_events
  add constraint fdacs_class_d_audit_events_entity_type_check
  check (entity_type in (
    'identity','enrollment','cohort','attendance','instruction_time','module_progress',
    'learning_check','remediation','record_hold','acknowledgment','enrollment_review',
    'exam','completion','lias'
  ));

create or replace function public.fdacs_class_d_create_pre_enrollment(
  p_clerk_user_id text,
  p_legal_name text,
  p_date_of_birth date,
  p_cohort_id uuid,
  p_policy_version text,
  p_acknowledgments jsonb,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identity_id uuid;
  v_identity_status text;
  v_existing_name text;
  v_existing_dob date;
  v_enrollment_id uuid;
  v_existing_enrollment uuid;
  v_cohort_status text;
  v_code text;
begin
  if p_clerk_user_id is null or char_length(trim(p_clerk_user_id)) < 3 then
    raise exception 'authenticated learner identity is required';
  end if;
  if p_legal_name is null or char_length(trim(p_legal_name)) < 1 or char_length(trim(p_legal_name)) > 200 then
    raise exception 'legal name is invalid';
  end if;
  if p_date_of_birth is null or p_date_of_birth >= current_date then
    raise exception 'date of birth is invalid';
  end if;
  if p_policy_version <> '2026-08-13-v1' then
    raise exception 'unsupported enrollment policy version';
  end if;
  if jsonb_typeof(p_acknowledgments) <> 'array'
     or jsonb_array_length(p_acknowledgments) <> 6
     or not (p_acknowledgments @> '["training-not-license","identity-accuracy","attendance-40-hours","exam-separate-controlled","records-privacy","academic-integrity"]'::jsonb) then
    raise exception 'all required acknowledgments must be accepted';
  end if;

  select status into v_cohort_status
  from public.fdacs_class_d_cohorts
  where id = p_cohort_id;
  if v_cohort_status is distinct from 'scheduled' then
    raise exception 'cohort is not open for controlled pre-enrollment';
  end if;

  select id, identity_status, legal_name, date_of_birth
    into v_identity_id, v_identity_status, v_existing_name, v_existing_dob
  from public.fdacs_class_d_student_identities
  where clerk_user_id = p_clerk_user_id
  for update;

  if v_identity_id is null then
    insert into public.fdacs_class_d_student_identities (
      clerk_user_id, legal_name, date_of_birth, identity_status
    ) values (
      p_clerk_user_id, trim(p_legal_name), p_date_of_birth, 'pending'
    ) returning id into v_identity_id;
  elsif v_identity_status = 'verified' then
    if v_existing_name <> trim(p_legal_name) or v_existing_dob <> p_date_of_birth then
      raise exception 'verified identity fields cannot be changed by the learner';
    end if;
  elsif v_identity_status = 'rejected' then
    raise exception 'identity record requires administrator review before resubmission';
  else
    update public.fdacs_class_d_student_identities
      set legal_name = trim(p_legal_name),
          date_of_birth = p_date_of_birth,
          identity_status = 'pending',
          verification_reference = null,
          verified_at = null,
          verified_by_clerk_user_id = null
    where id = v_identity_id;
  end if;

  select id into v_existing_enrollment
  from public.fdacs_class_d_enrollments
  where student_identity_id = v_identity_id and cohort_id = p_cohort_id
  for update;

  if v_existing_enrollment is null then
    insert into public.fdacs_class_d_enrollments (
      student_identity_id,
      clerk_user_id,
      cohort_id,
      status,
      created_by_clerk_user_id
    ) values (
      v_identity_id,
      p_clerk_user_id,
      p_cohort_id,
      'pending_identity',
      p_clerk_user_id
    ) returning id into v_enrollment_id;
  else
    v_enrollment_id := v_existing_enrollment;
  end if;

  for v_code in select jsonb_array_elements_text(p_acknowledgments)
  loop
    insert into public.fdacs_class_d_student_acknowledgments (
      enrollment_id,
      clerk_user_id,
      acknowledgment_code,
      policy_version,
      correlation_id
    ) values (
      v_enrollment_id,
      p_clerk_user_id,
      v_code,
      p_policy_version,
      p_correlation_id
    ) on conflict (enrollment_id, acknowledgment_code, policy_version) do nothing;
  end loop;

  insert into public.fdacs_class_d_audit_events (
    actor_role,
    actor_clerk_user_id,
    enrollment_id,
    entity_type,
    entity_id,
    action,
    correlation_id,
    metadata
  ) values (
    'student',
    p_clerk_user_id,
    v_enrollment_id,
    'identity',
    v_identity_id,
    'identity_submitted_for_verification',
    p_correlation_id,
    jsonb_build_object('identityStatus', 'pending')
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,
    actor_clerk_user_id,
    enrollment_id,
    entity_type,
    entity_id,
    action,
    correlation_id,
    metadata
  ) values (
    'student',
    p_clerk_user_id,
    v_enrollment_id,
    'enrollment',
    v_enrollment_id,
    'pre_enrollment_submitted',
    p_correlation_id,
    jsonb_build_object('cohortId', p_cohort_id, 'policyVersion', p_policy_version)
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,
    actor_clerk_user_id,
    enrollment_id,
    entity_type,
    entity_id,
    action,
    correlation_id,
    metadata
  ) values (
    'student',
    p_clerk_user_id,
    v_enrollment_id,
    'acknowledgment',
    v_enrollment_id,
    'required_acknowledgments_accepted',
    p_correlation_id,
    jsonb_build_object('policyVersion', p_policy_version, 'count', 6)
  );

  return v_enrollment_id;
end;
$$;

create or replace function public.fdacs_class_d_set_identity_verification(
  p_student_identity_id uuid,
  p_status text,
  p_verification_reference text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment_id uuid;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then
    raise exception 'identity verification requires school or compliance administration';
  end if;
  if p_status not in ('pending','verified','rejected') then
    raise exception 'unsupported identity verification status';
  end if;
  if p_status = 'verified' and (p_verification_reference is null or char_length(trim(p_verification_reference)) < 3) then
    raise exception 'verification reference is required for verified identity';
  end if;
  if p_verification_reference is not null and char_length(p_verification_reference) > 500 then
    raise exception 'verification reference is too long';
  end if;

  update public.fdacs_class_d_student_identities
    set identity_status = p_status,
        verification_reference = case when p_status = 'verified' then trim(p_verification_reference) else p_verification_reference end,
        verified_at = case when p_status = 'verified' then now() else null end,
        verified_by_clerk_user_id = case when p_status = 'verified' then p_actor_clerk_user_id else null end
  where id = p_student_identity_id;

  if not found then
    raise exception 'student identity record not found';
  end if;

  select id into v_enrollment_id
  from public.fdacs_class_d_enrollments
  where student_identity_id = p_student_identity_id
  order by created_at desc
  limit 1;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type,
    entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, v_enrollment_id, 'identity',
    p_student_identity_id, 'identity_verification_status_changed', p_correlation_id,
    jsonb_build_object('identityStatus', p_status)
  );
end;
$$;

create or replace function public.fdacs_class_d_assign_cohort(
  p_enrollment_id uuid,
  p_cohort_id uuid,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_cohort_status text;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then
    raise exception 'cohort assignment requires school or compliance administration';
  end if;
  select status into v_status from public.fdacs_class_d_enrollments where id = p_enrollment_id for update;
  if v_status not in ('pending_identity','pending_entitlement') then
    raise exception 'cohort cannot be changed after regulated enrollment begins';
  end if;
  if exists (select 1 from public.fdacs_class_d_attendance_entries where enrollment_id = p_enrollment_id)
     or exists (select 1 from public.fdacs_class_d_instruction_time_entries where enrollment_id = p_enrollment_id) then
    raise exception 'cohort cannot be changed after attendance or instructional evidence exists';
  end if;
  select status into v_cohort_status from public.fdacs_class_d_cohorts where id = p_cohort_id;
  if v_cohort_status not in ('scheduled','active') then
    raise exception 'target cohort is not available for assignment';
  end if;

  update public.fdacs_class_d_enrollments set cohort_id = p_cohort_id where id = p_enrollment_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type,
    entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, p_enrollment_id, 'enrollment',
    p_enrollment_id, 'cohort_assigned', p_correlation_id,
    jsonb_build_object('cohortId', p_cohort_id)
  );
end;
$$;

create or replace function public.fdacs_class_d_review_enrollment(
  p_enrollment_id uuid,
  p_outcome text,
  p_review_note text,
  p_policy_version text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identity_status text;
  v_review_id uuid;
  v_ack_count integer;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then
    raise exception 'enrollment review requires school or compliance administration';
  end if;
  if p_outcome not in ('approved_pending_entitlement','needs_information','rejected') then
    raise exception 'unsupported enrollment review outcome';
  end if;
  if p_policy_version <> '2026-08-13-v1' then
    raise exception 'unsupported enrollment policy version';
  end if;
  if p_review_note is not null and char_length(p_review_note) > 4000 then
    raise exception 'review note is too long';
  end if;

  select i.identity_status into v_identity_status
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_student_identities i on i.id = e.student_identity_id
  where e.id = p_enrollment_id
  for update of e, i;

  if v_identity_status is null then
    raise exception 'enrollment not found';
  end if;

  if p_outcome = 'approved_pending_entitlement' then
    if v_identity_status <> 'verified' then
      raise exception 'verified identity is required before enrollment approval';
    end if;

    select count(*) into v_ack_count
    from public.fdacs_class_d_student_acknowledgments
    where enrollment_id = p_enrollment_id and policy_version = p_policy_version;
    if v_ack_count <> 6 then
      raise exception 'all required learner acknowledgments are required before enrollment approval';
    end if;

    update public.fdacs_class_d_enrollments
      set status = 'pending_entitlement'
    where id = p_enrollment_id and status = 'pending_identity';
    if not found then
      raise exception 'enrollment is not eligible for approval';
    end if;
  elsif p_outcome = 'rejected' then
    update public.fdacs_class_d_enrollments
      set status = 'withdrawn'
    where id = p_enrollment_id and status in ('pending_identity','pending_entitlement');
    if not found then
      raise exception 'enrollment is not eligible for rejection';
    end if;
  else
    update public.fdacs_class_d_enrollments
      set status = 'pending_identity'
    where id = p_enrollment_id and status in ('pending_identity','pending_entitlement');
    if not found then
      raise exception 'enrollment is not eligible for information request';
    end if;
  end if;

  insert into public.fdacs_class_d_enrollment_reviews (
    enrollment_id, outcome, review_note, reviewed_by_clerk_user_id, correlation_id
  ) values (
    p_enrollment_id, p_outcome, p_review_note, p_actor_clerk_user_id, p_correlation_id
  ) returning id into v_review_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type,
    entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, p_enrollment_id, 'enrollment_review',
    v_review_id, 'enrollment_reviewed', p_correlation_id,
    jsonb_build_object('outcome', p_outcome, 'policyVersion', p_policy_version)
  );

  return v_review_id;
end;
$$;

alter table public.fdacs_class_d_student_acknowledgments enable row level security;
alter table public.fdacs_class_d_student_acknowledgments force row level security;
alter table public.fdacs_class_d_enrollment_reviews enable row level security;
alter table public.fdacs_class_d_enrollment_reviews force row level security;

revoke all on table public.fdacs_class_d_student_acknowledgments from public, anon, authenticated;
revoke all on table public.fdacs_class_d_enrollment_reviews from public, anon, authenticated;

grant select, insert on table public.fdacs_class_d_student_acknowledgments to service_role;
grant select, insert on table public.fdacs_class_d_enrollment_reviews to service_role;

revoke all on function public.fdacs_class_d_create_pre_enrollment(text,text,date,uuid,text,jsonb,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_set_identity_verification(uuid,text,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_assign_cohort(uuid,uuid,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_review_enrollment(uuid,text,text,text,text,text,uuid) from public, anon, authenticated;

grant execute on function public.fdacs_class_d_create_pre_enrollment(text,text,date,uuid,text,jsonb,uuid) to service_role;
grant execute on function public.fdacs_class_d_set_identity_verification(uuid,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_assign_cohort(uuid,uuid,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_review_enrollment(uuid,text,text,text,text,text,uuid) to service_role;

comment on table public.fdacs_class_d_student_acknowledgments is 'Versioned learner acknowledgments for the Florida Class D regulated enrollment workflow.';
comment on table public.fdacs_class_d_enrollment_reviews is 'School/compliance administrative review history for Florida Class D regulated pre-enrollments.';

commit;
