begin;

-- Gate 38: exact-release, owner-only real-identity UAT.
--
-- This profile exercises the production implementation and live hosted
-- providers on a Vercel Preview deployment. It is deliberately non-credit,
-- expires in at most fourteen days, cannot coexist with database production
-- authorization, and can never create completion or LIAS records.

alter table public.fdacs_class_d_cohorts
  add column execution_profile text not null default 'production',
  add column uat_expires_at timestamptz,
  add column release_commit_sha text,
  add column authorization_evidence_sha256 text;

alter table public.fdacs_class_d_cohorts
  add constraint fdacs_class_d_cohort_execution_profile_check
  check (execution_profile in ('production','owner_uat_noncredit')),
  add constraint fdacs_class_d_cohort_execution_shape_check
  check (
    (
      execution_profile = 'production' and
      uat_expires_at is null and
      release_commit_sha is null and
      authorization_evidence_sha256 is null
    ) or (
      execution_profile = 'owner_uat_noncredit' and
      uat_expires_at is not null and
      release_commit_sha ~ '^[0-9a-f]{40}$' and
      authorization_evidence_sha256 ~ '^[0-9a-f]{64}$'
    )
  );

create unique index fdacs_class_d_owner_uat_release_idx
  on public.fdacs_class_d_cohorts(release_commit_sha)
  where execution_profile = 'owner_uat_noncredit';

alter table public.fdacs_class_d_enrollments
  add column execution_profile text not null default 'production',
  add column training_credit_eligible boolean not null default true;

alter table public.fdacs_class_d_enrollments
  add constraint fdacs_class_d_enrollment_execution_profile_check
  check (execution_profile in ('production','owner_uat_noncredit')),
  add constraint fdacs_class_d_enrollment_credit_shape_check
  check (
    (execution_profile = 'production' and training_credit_eligible = true) or
    (execution_profile = 'owner_uat_noncredit' and training_credit_eligible = false)
  );

alter table public.fdacs_class_d_identity_verification_sessions
  add column execution_profile text,
  add column release_commit_sha text;

update public.fdacs_class_d_identity_verification_sessions
set execution_profile = case
  when provider_livemode then 'production'
  else 'synthetic_acceptance'
end
where execution_profile is null;

alter table public.fdacs_class_d_identity_verification_sessions
  alter column execution_profile set default 'production',
  alter column execution_profile set not null,
  add constraint fdacs_class_d_identity_session_execution_profile_check
  check (execution_profile in ('production','synthetic_acceptance','owner_uat_noncredit')),
  add constraint fdacs_class_d_identity_session_execution_shape_check
  check (
    (execution_profile = 'production' and provider_livemode = true and
      (release_commit_sha is null or release_commit_sha ~ '^[0-9a-f]{40}$')) or
    (execution_profile = 'synthetic_acceptance' and provider_livemode = false and
      (release_commit_sha is null or release_commit_sha ~ '^[0-9a-f]{40}$')) or
    (execution_profile = 'owner_uat_noncredit' and provider_livemode = true and
      release_commit_sha ~ '^[0-9a-f]{40}$')
  );

create or replace function public.fdacs_class_d_validate_cohort_execution_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.execution_profile = 'owner_uat_noncredit' then
    if new.uat_expires_at is null
       or new.uat_expires_at <= clock_timestamp()
       or new.uat_expires_at > clock_timestamp() + interval '14 days' then
      raise exception 'owner UAT cohort expiry must be in the future and no more than fourteen days away';
    end if;
    if new.release_commit_sha !~ '^[0-9a-f]{40}$'
       or new.authorization_evidence_sha256 !~ '^[0-9a-f]{64}$' then
      raise exception 'owner UAT cohort requires exact-release and authorization-evidence digests';
    end if;
  elsif new.uat_expires_at is not null
     or new.release_commit_sha is not null
     or new.authorization_evidence_sha256 is not null then
    raise exception 'production cohorts cannot carry owner UAT authorization fields';
  end if;

  if tg_op = 'UPDATE' and (
    old.execution_profile is distinct from new.execution_profile or
    old.uat_expires_at is distinct from new.uat_expires_at or
    old.release_commit_sha is distinct from new.release_commit_sha or
    old.authorization_evidence_sha256 is distinct from new.authorization_evidence_sha256
  ) and exists (
    select 1 from public.fdacs_class_d_enrollments e where e.cohort_id = old.id
  ) then
    raise exception 'cohort execution authorization is immutable after enrollment';
  end if;
  return new;
end;
$$;

create trigger fdacs_class_d_validate_cohort_execution_profile
before insert or update of execution_profile,uat_expires_at,release_commit_sha,authorization_evidence_sha256
on public.fdacs_class_d_cohorts
for each row execute function public.fdacs_class_d_validate_cohort_execution_profile();

create or replace function public.fdacs_class_d_validate_enrollment_execution_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_cohort_profile text;
begin
  select c.execution_profile into v_cohort_profile
  from public.fdacs_class_d_cohorts c
  where c.id = new.cohort_id;
  if v_cohort_profile is null then raise exception 'enrollment cohort is unavailable'; end if;
  if new.execution_profile <> v_cohort_profile then
    raise exception 'enrollment execution profile must match its cohort';
  end if;
  if (new.execution_profile = 'production') is distinct from new.training_credit_eligible then
    raise exception 'training-credit eligibility does not match the enrollment execution profile';
  end if;
  return new;
end;
$$;

create trigger fdacs_class_d_validate_enrollment_execution_profile
before insert or update of cohort_id,execution_profile,training_credit_eligible
on public.fdacs_class_d_enrollments
for each row execute function public.fdacs_class_d_validate_enrollment_execution_profile();

create or replace function public.fdacs_class_d_create_owner_uat_cohort(
  p_release_commit_sha text,
  p_expires_at timestamptz,
  p_authorization_evidence_sha256 text,
  p_actor_ref text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cohort_id uuid;
  v_code text;
begin
  if lower(trim(coalesce(p_release_commit_sha,''))) !~ '^[0-9a-f]{40}$' then
    raise exception 'owner UAT release must be an exact Git commit SHA';
  end if;
  if lower(trim(coalesce(p_authorization_evidence_sha256,''))) !~ '^[0-9a-f]{64}$' then
    raise exception 'owner UAT authorization evidence SHA-256 is required';
  end if;
  if p_expires_at is null
     or p_expires_at <= clock_timestamp()
     or p_expires_at > clock_timestamp() + interval '14 days' then
    raise exception 'owner UAT expiry must be in the future and no more than fourteen days away';
  end if;
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 or p_correlation_id is null then
    raise exception 'authorized owner UAT actor and correlation ID are required';
  end if;
  if exists (
    select 1 from public.fdacs_class_d_activation_state a
    where a.boundary_id = 1 and a.production_runtime_authorized = true
  ) then raise exception 'owner UAT cannot be prepared while production runtime authorization is active'; end if;

  select c.id into v_cohort_id
  from public.fdacs_class_d_cohorts c
  where c.execution_profile = 'owner_uat_noncredit'
    and c.release_commit_sha = lower(trim(p_release_commit_sha))
  for update;
  if found then
    if not exists (
      select 1 from public.fdacs_class_d_cohorts c
      where c.id = v_cohort_id
        and c.status = 'scheduled'
        and c.uat_expires_at = p_expires_at
        and c.authorization_evidence_sha256 = lower(trim(p_authorization_evidence_sha256))
    ) then raise exception 'owner UAT cohort already exists with different or inactive authorization evidence'; end if;
    return v_cohort_id;
  end if;

  v_code := 'OWNER-UAT-' || upper(substr(trim(p_release_commit_sha),1,12));
  insert into public.fdacs_class_d_cohorts (
    cohort_code,start_date,end_date,instructor_clerk_user_ids,capacity,status,
    created_by_clerk_user_id,execution_profile,uat_expires_at,release_commit_sha,
    authorization_evidence_sha256
  ) values (
    v_code,current_date,least(current_date + 4,p_expires_at::date),'{}'::text[],1,'scheduled',
    trim(p_actor_ref),'owner_uat_noncredit',p_expires_at,lower(trim(p_release_commit_sha)),
    lower(trim(p_authorization_evidence_sha256))
  ) returning id into v_cohort_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'school_admin',trim(p_actor_ref),null,'cohort',v_cohort_id,
    'owner_uat_noncredit_cohort_scheduled',p_correlation_id,
    jsonb_build_object(
      'executionProfile','owner_uat_noncredit','releaseCommitSha',lower(trim(p_release_commit_sha)),
      'expiresAt',p_expires_at,'authorizationEvidenceSha256',lower(trim(p_authorization_evidence_sha256)),
      'capacity',1,'trainingCreditEligible',false,'productionRuntimeAuthorized',false
    )
  );
  return v_cohort_id;
end;
$$;

create or replace function public.fdacs_class_d_create_pre_enrollment(
  p_clerk_user_id text,
  p_legal_name text,
  p_date_of_birth date,
  p_cohort_id uuid,
  p_policy_version text,
  p_acknowledgments jsonb,
  p_execution_profile text,
  p_runtime_release_sha text,
  p_authorization_evidence_sha256 text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_identity_id uuid;
  v_identity_status text;
  v_existing_name text;
  v_existing_dob date;
  v_enrollment_id uuid;
  v_existing_enrollment public.fdacs_class_d_enrollments%rowtype;
  v_cohort public.fdacs_class_d_cohorts%rowtype;
  v_code text;
  v_enrollment_count integer;
  v_training_credit_eligible boolean;
begin
  if char_length(trim(coalesce(p_clerk_user_id,''))) not between 3 and 255 then
    raise exception 'authenticated learner identity is required';
  end if;
  if char_length(trim(coalesce(p_legal_name,''))) not between 1 and 200 then
    raise exception 'legal name is invalid';
  end if;
  if p_date_of_birth is null or p_date_of_birth >= current_date then
    raise exception 'date of birth is invalid';
  end if;
  if p_policy_version <> '2026-08-13-v2' then
    raise exception 'unsupported enrollment policy version';
  end if;
  if p_execution_profile not in ('production','owner_uat_noncredit') then
    raise exception 'unsupported enrollment execution profile';
  end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;
  if jsonb_typeof(p_acknowledgments) <> 'array'
     or jsonb_array_length(p_acknowledgments) <> 6
     or not (p_acknowledgments @> '["training-not-license","identity-accuracy","attendance-40-hours","exam-separate-controlled","records-privacy","academic-integrity"]'::jsonb) then
    raise exception 'all required acknowledgments must be accepted';
  end if;

  select * into v_cohort
  from public.fdacs_class_d_cohorts c
  where c.id = p_cohort_id
  for update;
  if not found or v_cohort.status <> 'scheduled' then
    raise exception 'cohort is not open for controlled pre-enrollment';
  end if;
  if v_cohort.execution_profile <> p_execution_profile then
    raise exception 'cohort execution profile does not match the controlled runtime';
  end if;

  if p_execution_profile = 'owner_uat_noncredit' then
    if exists (
      select 1 from public.fdacs_class_d_activation_state a
      where a.boundary_id = 1 and a.production_runtime_authorized = true
    ) then raise exception 'owner UAT cannot run while production runtime authorization is active'; end if;
    if v_cohort.uat_expires_at <= clock_timestamp()
       or lower(trim(coalesce(p_runtime_release_sha,''))) !~ '^[0-9a-f]{40}$'
       or lower(trim(p_runtime_release_sha)) <> v_cohort.release_commit_sha
       or lower(trim(coalesce(p_authorization_evidence_sha256,''))) !~ '^[0-9a-f]{64}$'
       or lower(trim(p_authorization_evidence_sha256)) <> v_cohort.authorization_evidence_sha256 then
      raise exception 'owner UAT cohort is expired or not bound to the exact deployed release and authorization evidence';
    end if;
    v_training_credit_eligible := false;
  else
    if lower(trim(coalesce(p_runtime_release_sha,''))) !~ '^[0-9a-f]{40}$' then
      raise exception 'production pre-enrollment requires an exact deployed release SHA';
    end if;
    if not exists (
      select 1 from public.fdacs_class_d_activation_state a
      where a.boundary_id = 1 and a.production_runtime_authorized = true
    ) then raise exception 'production pre-enrollment requires controlled production authorization'; end if;
    v_training_credit_eligible := true;
  end if;

  select count(*) into v_enrollment_count
  from public.fdacs_class_d_enrollments e
  where e.cohort_id = p_cohort_id and e.status <> 'withdrawn';

  select id,identity_status,legal_name,date_of_birth
    into v_identity_id,v_identity_status,v_existing_name,v_existing_dob
  from public.fdacs_class_d_student_identities
  where clerk_user_id = trim(p_clerk_user_id)
  for update;

  if v_identity_id is null then
    insert into public.fdacs_class_d_student_identities (
      clerk_user_id,legal_name,date_of_birth,identity_status
    ) values (
      trim(p_clerk_user_id),trim(p_legal_name),p_date_of_birth,'pending'
    ) returning id into v_identity_id;
  elsif v_identity_status = 'verified' then
    if v_existing_name <> trim(p_legal_name) or v_existing_dob <> p_date_of_birth then
      raise exception 'verified identity fields cannot be changed by the learner';
    end if;
  elsif v_identity_status = 'rejected' then
    raise exception 'identity record requires administrator review before resubmission';
  else
    update public.fdacs_class_d_student_identities
    set legal_name = trim(p_legal_name),date_of_birth = p_date_of_birth,
        identity_status = 'pending',verification_reference = null,verified_at = null,
        verified_by_clerk_user_id = null
    where id = v_identity_id;
  end if;

  select * into v_existing_enrollment
  from public.fdacs_class_d_enrollments e
  where e.student_identity_id = v_identity_id and e.cohort_id = p_cohort_id
  for update;

  if not found then
    if v_enrollment_count >= v_cohort.capacity then raise exception 'controlled cohort capacity is full'; end if;
    insert into public.fdacs_class_d_enrollments (
      student_identity_id,clerk_user_id,cohort_id,status,created_by_clerk_user_id,
      execution_profile,training_credit_eligible
    ) values (
      v_identity_id,trim(p_clerk_user_id),p_cohort_id,'pending_identity',trim(p_clerk_user_id),
      p_execution_profile,v_training_credit_eligible
    ) returning id into v_enrollment_id;
  else
    if v_existing_enrollment.clerk_user_id <> trim(p_clerk_user_id)
       or v_existing_enrollment.execution_profile <> p_execution_profile
       or v_existing_enrollment.training_credit_eligible <> v_training_credit_eligible then
      raise exception 'existing enrollment is bound to a different controlled execution profile';
    end if;
    v_enrollment_id := v_existing_enrollment.id;
  end if;

  for v_code in select jsonb_array_elements_text(p_acknowledgments)
  loop
    insert into public.fdacs_class_d_student_acknowledgments (
      enrollment_id,clerk_user_id,acknowledgment_code,policy_version,correlation_id
    ) values (
      v_enrollment_id,trim(p_clerk_user_id),v_code,p_policy_version,p_correlation_id
    ) on conflict (enrollment_id,acknowledgment_code,policy_version) do nothing;
  end loop;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values
  (
    'student',trim(p_clerk_user_id),v_enrollment_id,'identity',v_identity_id,
    'identity_submitted_for_verification',p_correlation_id,
    jsonb_build_object('identityStatus','pending','executionProfile',p_execution_profile)
  ),
  (
    'student',trim(p_clerk_user_id),v_enrollment_id,'enrollment',v_enrollment_id,
    'pre_enrollment_submitted',p_correlation_id,
    jsonb_build_object(
      'cohortId',p_cohort_id,'policyVersion',p_policy_version,
      'executionProfile',p_execution_profile,'runtimeReleaseSha',lower(trim(p_runtime_release_sha)),
      'trainingCreditEligible',v_training_credit_eligible
    )
  ),
  (
    'student',trim(p_clerk_user_id),v_enrollment_id,'acknowledgment',v_enrollment_id,
    'required_acknowledgments_accepted',p_correlation_id,
    jsonb_build_object('policyVersion',p_policy_version,'count',6)
  );

  return v_enrollment_id;
end;
$$;

create or replace function public.fdacs_class_d_register_identity_verification_session(
  p_enrollment_id uuid,
  p_provider_session_id text,
  p_provider_livemode boolean,
  p_execution_profile text,
  p_runtime_release_sha text,
  p_consent_version text,
  p_consented_at timestamptz,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_enrollment public.fdacs_class_d_enrollments%rowtype;
  v_cohort public.fdacs_class_d_cohorts%rowtype;
  v_release_sha text;
begin
  select * into v_enrollment
  from public.fdacs_class_d_enrollments e
  where e.id = p_enrollment_id and e.clerk_user_id = trim(p_actor_clerk_user_id)
    and e.status in ('pending_identity','pending_entitlement')
  for update;
  if not found then raise exception 'identity-verification enrollment is unavailable or does not belong to the authenticated student'; end if;
  select * into v_cohort from public.fdacs_class_d_cohorts c where c.id = v_enrollment.cohort_id;
  if not found then raise exception 'identity-verification cohort is unavailable'; end if;
  if p_provider_session_id !~ '^vs_[A-Za-z0-9_]{8,255}$' then raise exception 'Stripe Identity session reference is invalid'; end if;
  if char_length(trim(coalesce(p_consent_version,''))) not between 3 and 80 or p_consented_at is null then raise exception 'identity-verification consent evidence is required'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;
  if p_execution_profile not in ('production','synthetic_acceptance','owner_uat_noncredit') then raise exception 'identity execution profile is invalid'; end if;
  v_release_sha := nullif(lower(trim(coalesce(p_runtime_release_sha,''))),'');
  if v_release_sha is not null and v_release_sha !~ '^[0-9a-f]{40}$' then raise exception 'identity runtime release SHA is invalid'; end if;

  if p_execution_profile = 'owner_uat_noncredit' then
    if v_enrollment.execution_profile <> 'owner_uat_noncredit'
       or v_enrollment.training_credit_eligible
       or v_cohort.execution_profile <> 'owner_uat_noncredit'
       or v_cohort.uat_expires_at <= clock_timestamp()
       or not p_provider_livemode
       or v_release_sha is null
       or v_release_sha <> v_cohort.release_commit_sha
       or v_cohort.authorization_evidence_sha256 !~ '^[0-9a-f]{64}$'
       or exists (
         select 1 from public.fdacs_class_d_activation_state a
         where a.boundary_id = 1 and a.production_runtime_authorized = true
       ) then raise exception 'live owner UAT identity verification is not authorized for this exact-release non-credit enrollment'; end if;
  elsif p_execution_profile = 'production' then
    if v_enrollment.execution_profile <> 'production' or not v_enrollment.training_credit_eligible
       or not p_provider_livemode or v_release_sha is null
       or not exists (
         select 1 from public.fdacs_class_d_activation_state a
         where a.boundary_id = 1 and a.production_runtime_authorized = true
       ) then raise exception 'live production identity verification requires controlled production authorization'; end if;
  else
    if p_provider_livemode then raise exception 'synthetic acceptance identity verification must use provider test mode'; end if;
  end if;

  select verification_session_id into v_id
  from public.fdacs_class_d_identity_verification_sessions
  where provider_session_id = p_provider_session_id;
  if found then
    if not exists (
      select 1 from public.fdacs_class_d_identity_verification_sessions s
      where s.verification_session_id = v_id and s.enrollment_id = p_enrollment_id
        and s.created_by_clerk_user_id = trim(p_actor_clerk_user_id)
        and s.execution_profile = p_execution_profile
        and s.release_commit_sha is not distinct from v_release_sha
    ) then raise exception 'identity verification session is already bound to different controlled evidence'; end if;
    return v_id;
  end if;

  insert into public.fdacs_class_d_identity_verification_sessions (
    enrollment_id,provider,provider_session_id,purpose,provider_livemode,consent_version,
    consented_at,correlation_id,created_by_clerk_user_id,execution_profile,release_commit_sha
  ) values (
    p_enrollment_id,'stripe_identity',p_provider_session_id,'initial_photo_id_and_matching_selfie',
    p_provider_livemode,trim(p_consent_version),p_consented_at,p_correlation_id,
    trim(p_actor_clerk_user_id),p_execution_profile,v_release_sha
  ) returning verification_session_id into v_id;
  return v_id;
end;
$$;

create or replace function public.fdacs_class_d_student_identity_verification_status(
  p_actor_clerk_user_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if char_length(trim(coalesce(p_actor_clerk_user_id,''))) not between 3 and 255 then
    raise exception 'authenticated student identity is required';
  end if;

  select jsonb_build_object(
    'enrollmentId',e.id,'enrollmentStatus',e.status,'executionProfile',e.execution_profile,
    'trainingCreditEligible',e.training_credit_eligible,'identityStatus',i.identity_status,
    'verificationSessionId',s.verification_session_id,'provider','stripe_identity',
    'providerStatus',s.status,'documentCheckStatus',s.document_check_status,
    'selfieCheckStatus',s.selfie_check_status,'providerLivemode',s.provider_livemode,
    'consentVersion',s.consent_version,'consentedAt',s.consented_at,
    'providerVerifiedAt',s.verified_at,
    'instructorAttestationRecorded',exists (
      select 1 from public.fdacs_class_d_instructor_identity_attestations a where a.enrollment_id = e.id
    ),
    'instructionalAccessGranted',(
      i.identity_status = 'verified' and e.status in ('enrolled','in_progress','instruction_complete','exam_eligible')
    )
  ) into v_result
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_student_identities i on i.id = e.student_identity_id
  left join lateral (
    select x.* from public.fdacs_class_d_identity_verification_sessions x
    where x.enrollment_id = e.id
    order by x.created_at desc,x.verification_session_id desc limit 1
  ) s on true
  where e.clerk_user_id = trim(p_actor_clerk_user_id)
  order by e.created_at desc limit 1;

  return coalesce(v_result,jsonb_build_object('enrollmentId',null));
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
set search_path = ''
as $$
declare
  v_identity_status text;
  v_review_id uuid;
  v_ack_count integer;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then raise exception 'enrollment review requires school or compliance administration'; end if;
  if p_outcome not in ('approved_pending_entitlement','needs_information','rejected') then raise exception 'unsupported enrollment review outcome'; end if;
  if p_policy_version not in ('2026-08-13-v1','2026-08-13-v2') then raise exception 'unsupported enrollment policy version'; end if;
  if p_review_note is not null and char_length(p_review_note) > 4000 then raise exception 'review note is too long'; end if;

  select i.identity_status into v_identity_status
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_student_identities i on i.id = e.student_identity_id
  where e.id = p_enrollment_id
  for update of e,i;
  if v_identity_status is null then raise exception 'enrollment not found'; end if;

  if p_outcome = 'approved_pending_entitlement' then
    if v_identity_status <> 'verified' then raise exception 'verified identity is required before enrollment approval'; end if;
    select count(*) into v_ack_count
    from public.fdacs_class_d_student_acknowledgments
    where enrollment_id = p_enrollment_id and policy_version = p_policy_version;
    if v_ack_count <> 6 then raise exception 'all required learner acknowledgments are required before enrollment approval'; end if;
    update public.fdacs_class_d_enrollments set status = 'pending_entitlement',updated_at = clock_timestamp()
    where id = p_enrollment_id and status = 'pending_identity';
    if not found then raise exception 'enrollment is not eligible for approval'; end if;
  elsif p_outcome = 'rejected' then
    update public.fdacs_class_d_enrollments set status = 'withdrawn',updated_at = clock_timestamp()
    where id = p_enrollment_id and status in ('pending_identity','pending_entitlement');
    if not found then raise exception 'enrollment is not eligible for rejection'; end if;
  else
    update public.fdacs_class_d_enrollments set status = 'pending_identity',updated_at = clock_timestamp()
    where id = p_enrollment_id and status in ('pending_identity','pending_entitlement');
    if not found then raise exception 'enrollment is not eligible for information request'; end if;
  end if;

  insert into public.fdacs_class_d_enrollment_reviews (
    enrollment_id,outcome,review_note,reviewed_by_clerk_user_id,correlation_id
  ) values (
    p_enrollment_id,p_outcome,p_review_note,trim(p_actor_clerk_user_id),p_correlation_id
  ) returning id into v_review_id;
  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    p_actor_role,trim(p_actor_clerk_user_id),p_enrollment_id,'enrollment_review',v_review_id,
    'enrollment_reviewed',p_correlation_id,jsonb_build_object('outcome',p_outcome,'policyVersion',p_policy_version)
  );
  return v_review_id;
end;
$$;

create or replace function public.fdacs_class_d_activate_owner_uat_enrollment(
  p_enrollment_id uuid,
  p_release_commit_sha text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment public.fdacs_class_d_enrollments%rowtype;
  v_cohort public.fdacs_class_d_cohorts%rowtype;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then raise exception 'owner UAT enrollment activation requires school or compliance administration'; end if;
  if char_length(trim(coalesce(p_actor_clerk_user_id,''))) not between 3 and 255 or p_correlation_id is null then raise exception 'authorized actor and correlation ID are required'; end if;
  select * into v_enrollment from public.fdacs_class_d_enrollments e where e.id = p_enrollment_id for update;
  if not found or v_enrollment.execution_profile <> 'owner_uat_noncredit'
     or v_enrollment.training_credit_eligible or v_enrollment.status <> 'pending_entitlement' then
    raise exception 'non-credit owner UAT enrollment is not eligible for activation';
  end if;
  select * into v_cohort from public.fdacs_class_d_cohorts c where c.id = v_enrollment.cohort_id;
  if not found or v_cohort.execution_profile <> 'owner_uat_noncredit'
     or v_cohort.status <> 'scheduled' or v_cohort.uat_expires_at <= clock_timestamp()
     or lower(trim(coalesce(p_release_commit_sha,''))) <> v_cohort.release_commit_sha then
    raise exception 'owner UAT cohort is unavailable, expired, or bound to another release';
  end if;
  if exists (
    select 1 from public.fdacs_class_d_activation_state a where a.boundary_id = 1 and a.production_runtime_authorized = true
  ) then raise exception 'owner UAT cannot be activated while production runtime authorization is active'; end if;
  if not exists (
    select 1 from public.fdacs_class_d_identity_verification_sessions s
    where s.enrollment_id = p_enrollment_id and s.execution_profile = 'owner_uat_noncredit'
      and s.provider_livemode = true and s.status = 'verified'
      and s.document_check_status = 'verified' and s.selfie_check_status = 'verified'
      and s.release_commit_sha = v_cohort.release_commit_sha
  ) then raise exception 'verified live provider identity evidence is required'; end if;
  if not exists (
    select 1 from public.fdacs_class_d_instructor_identity_attestations a
    join public.fdacs_class_d_identity_verification_sessions s on s.verification_session_id = a.verification_session_id
    where a.enrollment_id = p_enrollment_id and a.evidence_mode = 'live'
      and a.instructor_clerk_user_id <> v_enrollment.clerk_user_id
      and s.execution_profile = 'owner_uat_noncredit'
  ) then raise exception 'a distinct assigned Class DI instructor live identity attestation is required'; end if;

  update public.fdacs_class_d_enrollments
  set status = 'enrolled',entitlement_reference = 'owner-uat-noncredit:' || v_cohort.release_commit_sha,
      updated_at = clock_timestamp()
  where id = p_enrollment_id;
  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    p_actor_role,trim(p_actor_clerk_user_id),p_enrollment_id,'enrollment',p_enrollment_id,
    'owner_uat_noncredit_access_activated',p_correlation_id,
    jsonb_build_object(
      'executionProfile','owner_uat_noncredit','releaseCommitSha',v_cohort.release_commit_sha,
      'trainingCreditEligible',false,'completionAndLiasProhibited',true
    )
  );
  return jsonb_build_object(
    'enrollmentId',p_enrollment_id,'status','enrolled','executionProfile','owner_uat_noncredit',
    'trainingCreditEligible',false,'releaseCommitSha',v_cohort.release_commit_sha
  );
end;
$$;

create or replace function public.fdacs_class_d_completion_readiness(p_enrollment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_identity_verified boolean := false;
  v_enrollment_status text;
  v_execution_profile text;
  v_training_credit_eligible boolean := false;
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
  select (i.identity_status = 'verified'),e.status,e.execution_profile,e.training_credit_eligible
    into v_identity_verified,v_enrollment_status,v_execution_profile,v_training_credit_eligible
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_student_identities i on i.id = e.student_identity_id
  where e.id = p_enrollment_id;
  if v_enrollment_status is null then raise exception 'enrollment not found'; end if;

  select count(*) into v_module_complete_count from public.fdacs_class_d_module_progress
  where enrollment_id = p_enrollment_id and status = 'complete' and learning_check_passed = true;
  select coalesce(sum(instructional_presence_seconds),0) into v_instruction_seconds
  from public.fdacs_class_d_live_time_totals where enrollment_id = p_enrollment_id;
  select coalesce(sum(certified_minutes),0) into v_makeup_minutes
  from public.fdacs_class_d_makeup_assignments where enrollment_id = p_enrollment_id and status = 'certified';
  v_total_minutes := floor(v_instruction_seconds / 60.0)::integer + v_makeup_minutes::integer;

  with live_by_day as (
    select day,floor(coalesce(sum(instructional_presence_seconds),0) / 60.0)::integer as minutes
    from public.fdacs_class_d_live_time_totals where enrollment_id = p_enrollment_id group by day
  ), makeup_by_day as (
    select training_day as day,coalesce(sum(certified_minutes),0)::integer as minutes
    from public.fdacs_class_d_makeup_assignments
    where enrollment_id = p_enrollment_id and status = 'certified' group by training_day
  ), days as (select generate_series(1,5) as day)
  select count(*) into v_days_ready from days d
  left join live_by_day l on l.day = d.day
  left join makeup_by_day m on m.day = d.day
  where coalesce(l.minutes,0) + coalesce(m.minutes,0) >= 480;

  select id into v_passed_attempt_id from public.fdacs_class_d_exam_attempts
  where enrollment_id = p_enrollment_id and status = 'passed' and passed = true and score >= 128
  order by submitted_at desc nulls last,started_at desc limit 1;
  select count(*) into v_open_security_count from public.fdacs_class_d_live_time_totals
  where enrollment_id = p_enrollment_id and presence_state = 'absent_challenge';
  select count(*) into v_open_exam_count from public.fdacs_class_d_exam_attempts
  where enrollment_id = p_enrollment_id and status in ('in_progress','interrupted');
  select count(*) into v_open_remediation_count from public.fdacs_class_d_remediation_records
  where enrollment_id = p_enrollment_id and completed_at is null;
  select id into v_existing_completion_id from public.fdacs_class_d_completion_records
  where enrollment_id = p_enrollment_id and status <> 'voided' limit 1;

  return jsonb_build_object(
    'enrollmentId',p_enrollment_id,'identityVerified',v_identity_verified,
    'enrollmentStatus',v_enrollment_status,'executionProfile',v_execution_profile,
    'trainingCreditEligible',v_training_credit_eligible,
    'noncreditCompletionProhibited',not v_training_credit_eligible,
    'moduleChecksComplete',v_module_complete_count = 18,'completedModuleCount',v_module_complete_count,
    'verifiedInstructionalMinutes',v_total_minutes,'instructionalHoursSatisfied',v_total_minutes >= 2400,
    'fiveTrainingDaysSatisfied',v_days_ready = 5,'trainingDaysSatisfied',v_days_ready,
    'passedExamAttemptId',v_passed_attempt_id,'examPassed',v_passed_attempt_id is not null,
    'openSecurityIssues',v_open_security_count,'openExamAttempts',v_open_exam_count,
    'openRemediationItems',v_open_remediation_count,'existingCompletionId',v_existing_completion_id,
    'ready',
      v_training_credit_eligible and v_execution_profile = 'production'
      and v_identity_verified and v_enrollment_status not in ('withdrawn','failed')
      and v_module_complete_count = 18 and v_total_minutes >= 2400 and v_days_ready = 5
      and v_passed_attempt_id is not null and v_open_security_count = 0
      and v_open_exam_count = 0 and v_open_remediation_count = 0 and v_existing_completion_id is null
  );
end;
$$;

create or replace function public.fdacs_class_d_reject_noncredit_completion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.fdacs_class_d_enrollments e
    where e.id = new.enrollment_id and e.execution_profile = 'production' and e.training_credit_eligible = true
  ) then raise exception 'non-credit owner UAT enrollment cannot create completion or LIAS records'; end if;
  return new;
end;
$$;

create trigger fdacs_class_d_completion_noncredit_guard
before insert on public.fdacs_class_d_completion_records
for each row execute function public.fdacs_class_d_reject_noncredit_completion();
create trigger fdacs_class_d_lias_noncredit_guard
before insert on public.fdacs_class_d_lias_reporting_queue
for each row execute function public.fdacs_class_d_reject_noncredit_completion();

create or replace function public.fdacs_class_d_reject_student_self_attestation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.fdacs_class_d_enrollments e
    where e.id = new.enrollment_id and e.clerk_user_id = new.instructor_clerk_user_id
  ) then raise exception 'a student cannot act as their own Class DI identity or attendance verifier'; end if;
  return new;
end;
$$;

create trigger fdacs_class_d_identity_self_attestation_guard
before insert on public.fdacs_class_d_instructor_identity_attestations
for each row execute function public.fdacs_class_d_reject_student_self_attestation();
create trigger fdacs_class_d_daily_identity_self_attestation_guard
before insert on public.fdacs_class_d_daily_identity_checkins
for each row execute function public.fdacs_class_d_reject_student_self_attestation();
create trigger fdacs_class_d_daily_attendance_self_attestation_guard
before insert on public.fdacs_class_d_daily_attendance_attestations
for each row execute function public.fdacs_class_d_reject_student_self_attestation();

revoke all on function public.fdacs_class_d_create_pre_enrollment(text,text,date,uuid,text,jsonb,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_register_identity_verification_session(uuid,text,boolean,text,timestamptz,text,uuid)
  from public,anon,authenticated,service_role;

revoke all on function public.fdacs_class_d_validate_cohort_execution_profile()
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_validate_enrollment_execution_profile()
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_reject_noncredit_completion()
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_reject_student_self_attestation()
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_create_owner_uat_cohort(text,timestamptz,text,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_create_pre_enrollment(text,text,date,uuid,text,jsonb,text,text,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_register_identity_verification_session(uuid,text,boolean,text,text,text,timestamptz,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_student_identity_verification_status(text)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_review_enrollment(uuid,text,text,text,text,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_activate_owner_uat_enrollment(uuid,text,text,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_completion_readiness(uuid)
  from public,anon,authenticated,service_role;

grant execute on function public.fdacs_class_d_create_owner_uat_cohort(text,timestamptz,text,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_create_pre_enrollment(text,text,date,uuid,text,jsonb,text,text,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_register_identity_verification_session(uuid,text,boolean,text,text,text,timestamptz,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_student_identity_verification_status(text)
  to service_role;
grant execute on function public.fdacs_class_d_review_enrollment(uuid,text,text,text,text,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_activate_owner_uat_enrollment(uuid,text,text,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_completion_readiness(uuid)
  to service_role;

comment on column public.fdacs_class_d_enrollments.training_credit_eligible is
  'False for the exact-release owner UAT profile; database completion and LIAS guards enforce this boundary.';
comment on function public.fdacs_class_d_create_owner_uat_cohort(text,timestamptz,text,text,uuid) is
  'Creates one capacity-one, exact-release, expiring, non-credit owner UAT cohort while production authorization remains false.';
comment on function public.fdacs_class_d_activate_owner_uat_enrollment(uuid,text,text,text,uuid) is
  'Activates non-credit owner UAT course access only after live Stripe Identity evidence and a distinct assigned Class DI instructor attestation.';

commit;
