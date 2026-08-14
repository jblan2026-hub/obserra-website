begin;

-- FDACS identity and daily-attendance evidence boundary.
-- F.A.C. 5N-1.140(1)(f)5 requires identity verification by the instructor
-- using U.S. state/federal photo identification. Paragraph (1)(f)6 requires
-- instructor-verified daily attendance in a digital log. Provider facial
-- matching supports, but never replaces, the licensed DI attestation.

create table public.fdacs_class_d_identity_verification_sessions (
  verification_session_id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  provider text not null check (provider = 'stripe_identity'),
  provider_session_id text not null unique check (provider_session_id ~ '^vs_[A-Za-z0-9_]{8,255}$'),
  purpose text not null check (purpose = 'initial_photo_id_and_matching_selfie'),
  status text not null default 'requires_input' check (status in ('requires_input','processing','verified','canceled','redacted')),
  document_check_status text not null default 'pending' check (document_check_status in ('pending','verified','unverified')),
  selfie_check_status text not null default 'pending' check (selfie_check_status in ('pending','verified','unverified')),
  provider_report_ref text check (provider_report_ref is null or char_length(provider_report_ref) between 3 and 255),
  provider_error_code text check (provider_error_code is null or provider_error_code ~ '^[a-z0-9_]{3,100}$'),
  provider_livemode boolean not null,
  consent_version text not null check (char_length(consent_version) between 3 and 80),
  consented_at timestamptz not null,
  identity_images_copied_to_lms boolean not null default false check (identity_images_copied_to_lms = false),
  biometric_template_stored_by_lms boolean not null default false check (biometric_template_stored_by_lms = false),
  verified_at timestamptz,
  correlation_id uuid not null,
  created_by_clerk_user_id text not null check (char_length(created_by_clerk_user_id) between 3 and 255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fdacs_class_d_identity_provider_verified_shape check (
    status <> 'verified' or (
      document_check_status = 'verified' and selfie_check_status = 'verified' and
      provider_report_ref is not null and verified_at is not null
    )
  )
);

create unique index fdacs_class_d_one_verified_identity_session_idx
  on public.fdacs_class_d_identity_verification_sessions(enrollment_id)
  where status = 'verified';

create table public.fdacs_class_d_identity_verification_events (
  event_sequence bigint generated always as identity primary key,
  verification_session_id uuid not null references public.fdacs_class_d_identity_verification_sessions(verification_session_id) on delete restrict,
  provider_event_id text not null unique check (char_length(provider_event_id) between 8 and 255),
  status text not null check (status in ('requires_input','processing','verified','canceled','redacted')),
  document_check_status text not null check (document_check_status in ('pending','verified','unverified')),
  selfie_check_status text not null check (selfie_check_status in ('pending','verified','unverified')),
  provider_error_code text check (provider_error_code is null or provider_error_code ~ '^[a-z0-9_]{3,100}$'),
  provider_occurred_at timestamptz not null,
  correlation_id uuid not null,
  recorded_at timestamptz not null default now(),
  previous_event_sha256 text check (previous_event_sha256 is null or previous_event_sha256 ~ '^[0-9a-f]{64}$'),
  event_sha256 text not null unique check (event_sha256 ~ '^[0-9a-f]{64}$')
);

create table public.fdacs_class_d_instructor_identity_attestations (
  identity_attestation_id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  verification_session_id uuid not null references public.fdacs_class_d_identity_verification_sessions(verification_session_id) on delete restrict,
  instructor_file_id uuid not null references public.fdacs_class_d_instructor_files(instructor_file_id) on delete restrict,
  evidence_mode text not null check (evidence_mode in ('live','synthetic_acceptance')),
  acceptance_run_id uuid references public.fdacs_class_d_acceptance_runs(id) on delete restrict,
  observed_photo_id_type text not null check (observed_photo_id_type in ('state_driver_license','state_identification_card','us_passport','federal_photo_identification')),
  issuing_jurisdiction text not null check (issuing_jurisdiction ~ '^[A-Z]{2,3}$'),
  photo_id_observed_live boolean not null check (photo_id_observed_live = true),
  live_face_matched_photo_id boolean not null check (live_face_matched_photo_id = true),
  provider_document_verified boolean not null check (provider_document_verified = true),
  provider_selfie_matched boolean not null check (provider_selfie_matched = true),
  instructor_clerk_user_id text not null check (char_length(instructor_clerk_user_id) between 3 and 255),
  instructor_license_number_snapshot text not null check (char_length(instructor_license_number_snapshot) between 3 and 80),
  attestation_text text not null check (
    attestation_text = 'I attest that I am the assigned Class DI instructor, I observed the student and the student''s U.S. state or federal issued photo identification, and I verified that the live student matches that identification.'
  ),
  attested_at timestamptz not null,
  correlation_id uuid not null,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (enrollment_id),
  constraint fdacs_class_d_identity_attestation_mode_shape check (
    (evidence_mode = 'live' and acceptance_run_id is null) or
    (evidence_mode = 'synthetic_acceptance' and acceptance_run_id is not null)
  )
);

create table public.fdacs_class_d_daily_identity_checkins (
  daily_identity_checkin_id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  cohort_id uuid not null references public.fdacs_class_d_cohorts(id) on delete restrict,
  training_day smallint not null check (training_day between 1 and 5),
  anchor_live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  identity_attestation_id uuid not null references public.fdacs_class_d_instructor_identity_attestations(identity_attestation_id) on delete restrict,
  instructor_file_id uuid not null references public.fdacs_class_d_instructor_files(instructor_file_id) on delete restrict,
  live_student_observed boolean not null check (live_student_observed = true),
  live_face_matched_verified_student boolean not null check (live_face_matched_verified_student = true),
  instructor_clerk_user_id text not null check (char_length(instructor_clerk_user_id) between 3 and 255),
  instructor_license_number_snapshot text not null check (char_length(instructor_license_number_snapshot) between 3 and 80),
  attestation_text text not null check (
    attestation_text = 'I attest that I am the assigned Class DI instructor, I observed this student live before instruction today, and I verified the student against the controlled identity record.'
  ),
  attested_at timestamptz not null,
  correlation_id uuid not null,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (enrollment_id, cohort_id, training_day)
);

create table public.fdacs_class_d_daily_attendance_attestations (
  daily_attestation_id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  cohort_id uuid not null references public.fdacs_class_d_cohorts(id) on delete restrict,
  training_day smallint not null check (training_day between 1 and 5),
  anchor_live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  attendance_entry_id uuid not null references public.fdacs_class_d_attendance_entries(id) on delete restrict,
  daily_identity_checkin_id uuid not null references public.fdacs_class_d_daily_identity_checkins(daily_identity_checkin_id) on delete restrict,
  identity_attestation_id uuid not null references public.fdacs_class_d_instructor_identity_attestations(identity_attestation_id) on delete restrict,
  instructor_file_id uuid not null references public.fdacs_class_d_instructor_files(instructor_file_id) on delete restrict,
  live_student_observed boolean not null check (live_student_observed = true),
  live_face_matched_verified_student boolean not null check (live_face_matched_verified_student = true),
  attendance_verified boolean not null check (attendance_verified = true),
  instructor_clerk_user_id text not null check (char_length(instructor_clerk_user_id) between 3 and 255),
  instructor_license_number_snapshot text not null check (char_length(instructor_license_number_snapshot) between 3 and 80),
  attestation_text text not null check (
    attestation_text = 'I attest that I am the assigned Class DI instructor, I observed this student live today, verified the student against the controlled identity record, and verified the student''s daily attendance.'
  ),
  attested_at timestamptz not null,
  correlation_id uuid not null,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (enrollment_id, cohort_id, training_day),
  unique (attendance_entry_id)
);

create index fdacs_class_d_identity_events_session_idx
  on public.fdacs_class_d_identity_verification_events(verification_session_id,event_sequence);
create index fdacs_class_d_daily_attestations_session_idx
  on public.fdacs_class_d_daily_attendance_attestations(anchor_live_session_id,training_day);
create index fdacs_class_d_daily_identity_checkins_session_idx
  on public.fdacs_class_d_daily_identity_checkins(anchor_live_session_id,training_day);

create or replace function public.fdacs_class_d_reject_identity_evidence_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'FDACS identity and attendance evidence is append-only';
end;
$$;

create trigger fdacs_class_d_identity_events_immutable
before update or delete on public.fdacs_class_d_identity_verification_events
for each row execute function public.fdacs_class_d_reject_identity_evidence_mutation();
create trigger fdacs_class_d_instructor_identity_attestations_immutable
before update or delete on public.fdacs_class_d_instructor_identity_attestations
for each row execute function public.fdacs_class_d_reject_identity_evidence_mutation();
create trigger fdacs_class_d_daily_identity_checkins_immutable
before update or delete on public.fdacs_class_d_daily_identity_checkins
for each row execute function public.fdacs_class_d_reject_identity_evidence_mutation();
create trigger fdacs_class_d_daily_attendance_attestations_immutable
before update or delete on public.fdacs_class_d_daily_attendance_attestations
for each row execute function public.fdacs_class_d_reject_identity_evidence_mutation();

create or replace function public.fdacs_class_d_register_identity_verification_session(
  p_enrollment_id uuid,
  p_provider_session_id text,
  p_provider_livemode boolean,
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
begin
  if not exists (
    select 1 from public.fdacs_class_d_enrollments e
    where e.id = p_enrollment_id and e.clerk_user_id = p_actor_clerk_user_id
      and e.status in ('pending_identity','pending_entitlement')
  ) then raise exception 'identity-verification enrollment is unavailable or does not belong to the authenticated student'; end if;
  if p_provider_session_id !~ '^vs_[A-Za-z0-9_]{8,255}$' then raise exception 'Stripe Identity session reference is invalid'; end if;
  if char_length(trim(coalesce(p_consent_version,''))) not between 3 and 80 or p_consented_at is null then raise exception 'identity-verification consent evidence is required'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;
  if p_provider_livemode and not exists (
    select 1 from public.fdacs_class_d_activation_state a
    where a.boundary_id = 1 and a.production_runtime_authorized = true
  ) then raise exception 'live identity verification is unavailable until controlled production activation'; end if;

  select verification_session_id into v_id
  from public.fdacs_class_d_identity_verification_sessions
  where provider_session_id = p_provider_session_id;
  if found then
    if not exists (
      select 1 from public.fdacs_class_d_identity_verification_sessions s
      join public.fdacs_class_d_enrollments e on e.id = s.enrollment_id
      where s.verification_session_id = v_id
        and s.enrollment_id = p_enrollment_id
        and e.clerk_user_id = p_actor_clerk_user_id
    ) then raise exception 'identity verification session is already bound to a different enrollment'; end if;
    return v_id;
  end if;

  insert into public.fdacs_class_d_identity_verification_sessions (
    enrollment_id,provider,provider_session_id,purpose,provider_livemode,consent_version,
    consented_at,correlation_id,created_by_clerk_user_id
  ) values (
    p_enrollment_id,'stripe_identity',p_provider_session_id,'initial_photo_id_and_matching_selfie',
    p_provider_livemode,trim(p_consent_version),p_consented_at,p_correlation_id,p_actor_clerk_user_id
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
    'enrollmentId',e.id,
    'enrollmentStatus',e.status,
    'identityStatus',i.identity_status,
    'verificationSessionId',s.verification_session_id,
    'provider','stripe_identity',
    'providerStatus',s.status,
    'documentCheckStatus',s.document_check_status,
    'selfieCheckStatus',s.selfie_check_status,
    'providerLivemode',s.provider_livemode,
    'consentVersion',s.consent_version,
    'consentedAt',s.consented_at,
    'providerVerifiedAt',s.verified_at,
    'instructorAttestationRecorded',exists (
      select 1 from public.fdacs_class_d_instructor_identity_attestations a
      where a.enrollment_id = e.id
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
    order by x.created_at desc, x.verification_session_id desc
    limit 1
  ) s on true
  where e.clerk_user_id = trim(p_actor_clerk_user_id)
  order by e.created_at desc
  limit 1;

  return coalesce(v_result,jsonb_build_object('enrollmentId',null));
end;
$$;

create or replace function public.fdacs_class_d_instructor_identity_review_context(
  p_enrollment_id uuid,
  p_live_session_id uuid,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context jsonb;
  v_instructor_file_id uuid;
begin
  if p_enrollment_id is null or p_live_session_id is null or p_correlation_id is null then raise exception 'enrollment, live-session, and correlation identifiers are required'; end if;
  if char_length(trim(coalesce(p_actor_clerk_user_id,''))) not between 3 and 255 then raise exception 'authenticated instructor identity is required'; end if;

  select f.instructor_file_id into v_instructor_file_id
  from public.fdacs_class_d_instructor_files f
  where f.instructor_clerk_user_id = trim(p_actor_clerk_user_id)
    and f.license_status = 'verified_active'
    and (f.license_expires_on is null or f.license_expires_on >= current_date)
    and exists (
      select 1
      from public.fdacs_class_d_enrollments e
      join public.fdacs_class_d_live_sessions s on s.cohort_id = e.cohort_id
      where e.id = p_enrollment_id
        and s.id = p_live_session_id
        and s.instructor_clerk_user_id = trim(p_actor_clerk_user_id)
        and s.status in ('scheduled','live','break','ended')
    )
  order by f.license_verified_at desc, f.created_at desc
  limit 1;
  if v_instructor_file_id is null then raise exception 'assigned active Class DI instructor evidence is required'; end if;

  select jsonb_build_object(
    'enrollmentId',e.id,
    'cohortId',e.cohort_id,
    'anchorLiveSessionId',ls.id,
    'trainingDay',ls.day,
    'studentLegalName',i.legal_name,
    'identityStatus',i.identity_status,
    'verificationSessionId',s.verification_session_id,
    'providerStatus',s.status,
    'documentCheckStatus',s.document_check_status,
    'selfieCheckStatus',s.selfie_check_status,
    'providerLivemode',s.provider_livemode,
    'providerVerifiedAt',s.verified_at,
    'instructorFileId',v_instructor_file_id,
    'existingIdentityAttestationId',a.identity_attestation_id,
    'existingDailyIdentityCheckinId',d.daily_identity_checkin_id
  ) into v_context
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_student_identities i on i.id = e.student_identity_id
  join public.fdacs_class_d_live_sessions ls on ls.id = p_live_session_id and ls.cohort_id = e.cohort_id
  join lateral (
    select x.* from public.fdacs_class_d_identity_verification_sessions x
    where x.enrollment_id = e.id and x.status = 'verified'
    order by x.verified_at desc, x.created_at desc
    limit 1
  ) s on true
  left join public.fdacs_class_d_instructor_identity_attestations a on a.enrollment_id = e.id
  left join public.fdacs_class_d_daily_identity_checkins d
    on d.enrollment_id = e.id and d.cohort_id = e.cohort_id and d.training_day = ls.day
  where e.id = p_enrollment_id;
  if v_context is null then raise exception 'verified provider identity evidence is unavailable'; end if;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'instructor',trim(p_actor_clerk_user_id),p_enrollment_id,'identity',p_enrollment_id,
    'instructor_identity_review_context_accessed',p_correlation_id,
    jsonb_build_object('instructorFileId',v_instructor_file_id,'liveSessionId',p_live_session_id,'minimumNecessary',true)
  );
  return v_context;
end;
$$;

create or replace function public.fdacs_class_d_record_identity_verification_outcome(
  p_provider_event_id text,
  p_provider_session_id text,
  p_status text,
  p_document_check_status text,
  p_selfie_check_status text,
  p_provider_report_ref text,
  p_provider_error_code text,
  p_provider_occurred_at timestamptz,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.fdacs_class_d_identity_verification_sessions%rowtype;
  v_previous text;
  v_event_sha text;
  v_canonical jsonb;
  v_existing text;
begin
  select event_sha256 into v_existing
  from public.fdacs_class_d_identity_verification_events
  where provider_event_id = p_provider_event_id;
  if found then return jsonb_build_object('idempotentReplay',true,'eventSha256',v_existing); end if;

  select * into v_session
  from public.fdacs_class_d_identity_verification_sessions
  where provider_session_id = p_provider_session_id
  for update;
  if not found then raise exception 'identity verification session is unavailable'; end if;
  if p_status not in ('requires_input','processing','verified','canceled','redacted') then raise exception 'identity provider status is invalid'; end if;
  if p_document_check_status not in ('pending','verified','unverified') or p_selfie_check_status not in ('pending','verified','unverified') then
    raise exception 'identity verification check status is invalid';
  end if;
  if p_status = 'verified' and (
    p_document_check_status <> 'verified' or p_selfie_check_status <> 'verified' or
    char_length(trim(coalesce(p_provider_report_ref,''))) < 3
  ) then raise exception 'verified identity requires verified document and matching-selfie evidence'; end if;
  if p_provider_error_code is not null and p_provider_error_code !~ '^[a-z0-9_]{3,100}$' then raise exception 'identity provider error code is invalid'; end if;
  if p_provider_occurred_at is null or p_correlation_id is null then raise exception 'provider event time and correlation ID are required'; end if;

  perform pg_advisory_xact_lock(hashtext('public.fdacs_class_d_identity_verification_events'));
  select event_sha256 into v_previous
  from public.fdacs_class_d_identity_verification_events
  order by event_sequence desc limit 1;
  v_canonical := jsonb_build_object(
    'verificationSessionId',v_session.verification_session_id,'providerEventId',p_provider_event_id,
    'status',p_status,'documentCheckStatus',p_document_check_status,
    'selfieCheckStatus',p_selfie_check_status,'providerErrorCode',p_provider_error_code,
    'providerOccurredAt',p_provider_occurred_at,'correlationId',p_correlation_id,
    'previousEventSha256',coalesce(v_previous,'GENESIS')
  );
  v_event_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_identity_verification_events (
    verification_session_id,provider_event_id,status,document_check_status,selfie_check_status,
    provider_error_code,provider_occurred_at,correlation_id,previous_event_sha256,event_sha256
  ) values (
    v_session.verification_session_id,p_provider_event_id,p_status,p_document_check_status,
    p_selfie_check_status,p_provider_error_code,p_provider_occurred_at,p_correlation_id,v_previous,v_event_sha
  );

  update public.fdacs_class_d_identity_verification_sessions
  set status = p_status,
      document_check_status = p_document_check_status,
      selfie_check_status = p_selfie_check_status,
      provider_report_ref = nullif(trim(coalesce(p_provider_report_ref,'')),''),
      provider_error_code = p_provider_error_code,
      verified_at = case when p_status = 'verified' then p_provider_occurred_at else verified_at end,
      updated_at = clock_timestamp()
  where verification_session_id = v_session.verification_session_id;

  return jsonb_build_object(
    'idempotentReplay',false,'verificationSessionId',v_session.verification_session_id,
    'status',p_status,'eventSha256',v_event_sha
  );
end;
$$;

create or replace function public.fdacs_class_d_record_instructor_identity_attestation(
  p_enrollment_id uuid,
  p_verification_session_id uuid,
  p_instructor_file_id uuid,
  p_observed_photo_id_type text,
  p_issuing_jurisdiction text,
  p_actor_clerk_user_id text,
  p_attested_at timestamptz,
  p_acceptance_run_id uuid,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_session public.fdacs_class_d_identity_verification_sessions%rowtype;
  v_instructor public.fdacs_class_d_instructor_files%rowtype;
  v_identity_id uuid;
  v_mode text;
  v_record_sha text;
  v_created_at timestamptz := clock_timestamp();
  v_canonical jsonb;
begin
  select * into v_session from public.fdacs_class_d_identity_verification_sessions
  where verification_session_id = p_verification_session_id and enrollment_id = p_enrollment_id;
  if not found or v_session.status <> 'verified' or v_session.document_check_status <> 'verified' or v_session.selfie_check_status <> 'verified' then
    raise exception 'verified government-ID and matching-selfie provider evidence is required';
  end if;
  select * into v_instructor from public.fdacs_class_d_instructor_files where instructor_file_id = p_instructor_file_id;
  if not found or v_instructor.instructor_clerk_user_id <> p_actor_clerk_user_id
     or v_instructor.license_status <> 'verified_active'
     or (v_instructor.license_expires_on is not null and v_instructor.license_expires_on < p_attested_at::date) then
    raise exception 'assigned active Class DI instructor evidence is required';
  end if;
  if p_observed_photo_id_type not in ('state_driver_license','state_identification_card','us_passport','federal_photo_identification') then
    raise exception 'U.S. state or federal photo-identification type is invalid';
  end if;
  if upper(trim(coalesce(p_issuing_jurisdiction,''))) !~ '^[A-Z]{2,3}$' then raise exception 'photo-identification issuing jurisdiction is invalid'; end if;
  if p_attested_at is null or p_attested_at > clock_timestamp() + interval '5 minutes' then raise exception 'identity attestation time is invalid'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  if v_session.provider_livemode then
    if p_acceptance_run_id is not null then raise exception 'live identity evidence cannot be attached to a synthetic acceptance run'; end if;
    v_mode := 'live';
  else
    if not exists (
      select 1 from public.fdacs_class_d_acceptance_runs r
      where r.id = p_acceptance_run_id and r.synthetic_identity_confirmed = true
        and r.environment_type in ('development','sandbox','staging','uat')
    ) then raise exception 'test-mode identity evidence requires an authorized synthetic acceptance run'; end if;
    v_mode := 'synthetic_acceptance';
  end if;

  select student_identity_id into v_identity_id from public.fdacs_class_d_enrollments where id = p_enrollment_id for update;
  if not found then raise exception 'enrollment is unavailable'; end if;

  v_canonical := jsonb_build_object(
    'identityAttestationId',v_id,'enrollmentId',p_enrollment_id,
    'verificationSessionId',p_verification_session_id,'instructorFileId',p_instructor_file_id,
    'evidenceMode',v_mode,'acceptanceRunId',p_acceptance_run_id,
    'observedPhotoIdType',p_observed_photo_id_type,
    'issuingJurisdiction',upper(trim(p_issuing_jurisdiction)),
    'photoIdObservedLive',true,'liveFaceMatchedPhotoId',true,
    'providerDocumentVerified',true,'providerSelfieMatched',true,
    'instructorClerkUserId',p_actor_clerk_user_id,
    'instructorLicenseNumberSnapshot',v_instructor.di_license_number,
    'attestedAt',p_attested_at,'correlationId',p_correlation_id,'createdAt',v_created_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_instructor_identity_attestations (
    identity_attestation_id,enrollment_id,verification_session_id,instructor_file_id,evidence_mode,
    acceptance_run_id,observed_photo_id_type,issuing_jurisdiction,photo_id_observed_live,
    live_face_matched_photo_id,provider_document_verified,provider_selfie_matched,
    instructor_clerk_user_id,instructor_license_number_snapshot,attestation_text,
    attested_at,correlation_id,record_sha256,created_at
  ) values (
    v_id,p_enrollment_id,p_verification_session_id,p_instructor_file_id,v_mode,p_acceptance_run_id,
    p_observed_photo_id_type,upper(trim(p_issuing_jurisdiction)),true,true,true,true,
    p_actor_clerk_user_id,v_instructor.di_license_number,
    'I attest that I am the assigned Class DI instructor, I observed the student and the student''s U.S. state or federal issued photo identification, and I verified that the live student matches that identification.',
    p_attested_at,p_correlation_id,v_record_sha,v_created_at
  );

  update public.fdacs_class_d_student_identities
  set identity_status = 'verified',
      verification_reference = 'stripe_identity:' || v_session.provider_session_id,
      verified_at = p_attested_at,
      verified_by_clerk_user_id = p_actor_clerk_user_id,
      updated_at = clock_timestamp()
  where id = v_identity_id;

  update public.fdacs_class_d_enrollments
  set status = case when status = 'pending_identity' then 'pending_entitlement' else status end,
      updated_at = clock_timestamp()
  where id = p_enrollment_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'instructor',p_actor_clerk_user_id,p_enrollment_id,'identity_attestation',v_id,
    'photo_id_and_live_student_verified_by_di_instructor',p_correlation_id,
    jsonb_build_object('evidenceMode',v_mode,'observedPhotoIdType',p_observed_photo_id_type,'recordSha256',v_record_sha)
  );
  return jsonb_build_object('identityAttestationId',v_id,'evidenceMode',v_mode,'recordSha256',v_record_sha);
end;
$$;

create or replace function public.fdacs_class_d_record_daily_identity_checkin(
  p_enrollment_id uuid,
  p_anchor_live_session_id uuid,
  p_identity_attestation_id uuid,
  p_instructor_file_id uuid,
  p_actor_clerk_user_id text,
  p_attested_at timestamptz,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_enrollment public.fdacs_class_d_enrollments%rowtype;
  v_session public.fdacs_class_d_live_sessions%rowtype;
  v_identity_attestation public.fdacs_class_d_instructor_identity_attestations%rowtype;
  v_instructor public.fdacs_class_d_instructor_files%rowtype;
  v_existing public.fdacs_class_d_daily_identity_checkins%rowtype;
  v_record_sha text;
  v_created_at timestamptz := clock_timestamp();
  v_canonical jsonb;
begin
  select * into v_enrollment from public.fdacs_class_d_enrollments where id = p_enrollment_id;
  if not found or v_enrollment.status not in ('enrolled','in_progress','instruction_complete','exam_eligible') then
    raise exception 'student is not eligible for a daily identity check-in';
  end if;
  select * into v_session from public.fdacs_class_d_live_sessions where id = p_anchor_live_session_id;
  if not found or v_session.cohort_id <> v_enrollment.cohort_id or v_session.status not in ('scheduled','live','break') then
    raise exception 'daily identity check-in session does not match the active enrollment';
  end if;
  select * into v_identity_attestation from public.fdacs_class_d_instructor_identity_attestations
  where identity_attestation_id = p_identity_attestation_id and enrollment_id = p_enrollment_id;
  if not found then raise exception 'controlled instructor identity attestation is required'; end if;
  select * into v_instructor from public.fdacs_class_d_instructor_files where instructor_file_id = p_instructor_file_id;
  if not found or v_instructor.instructor_clerk_user_id <> p_actor_clerk_user_id
     or v_instructor.instructor_clerk_user_id <> v_session.instructor_clerk_user_id
     or v_instructor.di_license_number <> v_session.instructor_license_number
     or v_instructor.license_status <> 'verified_active'
     or (v_instructor.license_expires_on is not null and v_instructor.license_expires_on < p_attested_at::date) then
    raise exception 'daily check-in must be verified by the assigned active Class DI instructor';
  end if;
  if p_attested_at is null or p_attested_at > clock_timestamp() + interval '5 minutes' then raise exception 'daily identity check-in time is invalid'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  select * into v_existing from public.fdacs_class_d_daily_identity_checkins
  where enrollment_id = p_enrollment_id and cohort_id = v_enrollment.cohort_id and training_day = v_session.day;
  if found then
    if v_existing.identity_attestation_id <> p_identity_attestation_id
       or v_existing.instructor_file_id <> p_instructor_file_id then
      raise exception 'daily identity check-in is already bound to different controlled evidence';
    end if;
    return jsonb_build_object(
      'dailyIdentityCheckinId',v_existing.daily_identity_checkin_id,
      'trainingDay',v_existing.training_day,'recordSha256',v_existing.record_sha256,
      'idempotentReplay',true
    );
  end if;

  v_canonical := jsonb_build_object(
    'dailyIdentityCheckinId',v_id,'enrollmentId',p_enrollment_id,'cohortId',v_enrollment.cohort_id,
    'trainingDay',v_session.day,'anchorLiveSessionId',p_anchor_live_session_id,
    'identityAttestationId',p_identity_attestation_id,'instructorFileId',p_instructor_file_id,
    'liveStudentObserved',true,'liveFaceMatchedVerifiedStudent',true,
    'instructorClerkUserId',p_actor_clerk_user_id,
    'instructorLicenseNumberSnapshot',v_instructor.di_license_number,
    'attestedAt',p_attested_at,'correlationId',p_correlation_id,'createdAt',v_created_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_daily_identity_checkins (
    daily_identity_checkin_id,enrollment_id,cohort_id,training_day,anchor_live_session_id,
    identity_attestation_id,instructor_file_id,live_student_observed,
    live_face_matched_verified_student,instructor_clerk_user_id,
    instructor_license_number_snapshot,attestation_text,attested_at,correlation_id,
    record_sha256,created_at
  ) values (
    v_id,p_enrollment_id,v_enrollment.cohort_id,v_session.day,p_anchor_live_session_id,
    p_identity_attestation_id,p_instructor_file_id,true,true,p_actor_clerk_user_id,
    v_instructor.di_license_number,
    'I attest that I am the assigned Class DI instructor, I observed this student live before instruction today, and I verified the student against the controlled identity record.',
    p_attested_at,p_correlation_id,v_record_sha,v_created_at
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'instructor',p_actor_clerk_user_id,p_enrollment_id,'daily_identity_checkin',v_id,
    'pre_instruction_daily_student_identity_verified_by_di_instructor',p_correlation_id,
    jsonb_build_object('trainingDay',v_session.day,'recordSha256',v_record_sha)
  );
  return jsonb_build_object(
    'dailyIdentityCheckinId',v_id,'trainingDay',v_session.day,
    'recordSha256',v_record_sha,'idempotentReplay',false
  );
end;
$$;

create or replace function public.fdacs_class_d_record_daily_attendance_attestation(
  p_enrollment_id uuid,
  p_anchor_live_session_id uuid,
  p_attendance_entry_id uuid,
  p_identity_attestation_id uuid,
  p_instructor_file_id uuid,
  p_actor_clerk_user_id text,
  p_attested_at timestamptz,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_enrollment public.fdacs_class_d_enrollments%rowtype;
  v_session public.fdacs_class_d_live_sessions%rowtype;
  v_attendance public.fdacs_class_d_attendance_entries%rowtype;
  v_identity_attestation public.fdacs_class_d_instructor_identity_attestations%rowtype;
  v_daily_checkin public.fdacs_class_d_daily_identity_checkins%rowtype;
  v_instructor public.fdacs_class_d_instructor_files%rowtype;
  v_existing public.fdacs_class_d_daily_attendance_attestations%rowtype;
  v_record_sha text;
  v_created_at timestamptz := clock_timestamp();
  v_canonical jsonb;
begin
  select * into v_enrollment from public.fdacs_class_d_enrollments where id = p_enrollment_id;
  if not found or v_enrollment.status not in ('enrolled','in_progress','instruction_complete','exam_eligible') then
    raise exception 'student is not eligible for daily attendance verification';
  end if;
  select * into v_session from public.fdacs_class_d_live_sessions where id = p_anchor_live_session_id;
  if not found or v_session.cohort_id <> v_enrollment.cohort_id or v_session.status not in ('live','break','ended') then
    raise exception 'daily attendance session does not match the active enrollment';
  end if;
  select * into v_attendance from public.fdacs_class_d_attendance_entries where id = p_attendance_entry_id;
  if not found or v_attendance.enrollment_id <> p_enrollment_id or v_attendance.day <> v_session.day then
    raise exception 'daily attendance entry does not match the student and training day';
  end if;
  select * into v_identity_attestation from public.fdacs_class_d_instructor_identity_attestations
  where identity_attestation_id = p_identity_attestation_id and enrollment_id = p_enrollment_id;
  if not found then raise exception 'controlled instructor identity attestation is required'; end if;
  select * into v_daily_checkin from public.fdacs_class_d_daily_identity_checkins
  where enrollment_id = p_enrollment_id and cohort_id = v_enrollment.cohort_id
    and training_day = v_session.day and identity_attestation_id = p_identity_attestation_id;
  if not found then raise exception 'pre-instruction daily identity check-in is required'; end if;
  select * into v_instructor from public.fdacs_class_d_instructor_files where instructor_file_id = p_instructor_file_id;
  if not found or v_instructor.instructor_clerk_user_id <> p_actor_clerk_user_id
     or v_instructor.instructor_clerk_user_id <> v_session.instructor_clerk_user_id
     or v_instructor.di_license_number <> v_session.instructor_license_number
     or v_instructor.license_status <> 'verified_active'
     or (v_instructor.license_expires_on is not null and v_instructor.license_expires_on < p_attested_at::date) then
    raise exception 'daily attendance must be verified by the assigned active Class DI instructor';
  end if;
  if p_attested_at is null or p_attested_at > clock_timestamp() + interval '5 minutes' then raise exception 'daily attendance attestation time is invalid'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  select * into v_existing from public.fdacs_class_d_daily_attendance_attestations
  where enrollment_id = p_enrollment_id and cohort_id = v_enrollment.cohort_id and training_day = v_session.day;
  if found then
    if v_existing.attendance_entry_id <> p_attendance_entry_id
       or v_existing.daily_identity_checkin_id <> v_daily_checkin.daily_identity_checkin_id
       or v_existing.instructor_file_id <> p_instructor_file_id then
      raise exception 'daily attendance attestation is already bound to different controlled evidence';
    end if;
    return jsonb_build_object(
      'dailyAttestationId',v_existing.daily_attestation_id,
      'trainingDay',v_existing.training_day,'recordSha256',v_existing.record_sha256,
      'idempotentReplay',true
    );
  end if;

  v_canonical := jsonb_build_object(
    'dailyAttestationId',v_id,'enrollmentId',p_enrollment_id,'cohortId',v_enrollment.cohort_id,
    'trainingDay',v_session.day,'anchorLiveSessionId',p_anchor_live_session_id,
    'attendanceEntryId',p_attendance_entry_id,'identityAttestationId',p_identity_attestation_id,
    'dailyIdentityCheckinId',v_daily_checkin.daily_identity_checkin_id,
    'instructorFileId',p_instructor_file_id,'liveStudentObserved',true,
    'liveFaceMatchedVerifiedStudent',true,'attendanceVerified',true,
    'instructorClerkUserId',p_actor_clerk_user_id,
    'instructorLicenseNumberSnapshot',v_instructor.di_license_number,
    'attestedAt',p_attested_at,'correlationId',p_correlation_id,'createdAt',v_created_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_daily_attendance_attestations (
    daily_attestation_id,enrollment_id,cohort_id,training_day,anchor_live_session_id,
    attendance_entry_id,daily_identity_checkin_id,identity_attestation_id,instructor_file_id,live_student_observed,
    live_face_matched_verified_student,attendance_verified,instructor_clerk_user_id,
    instructor_license_number_snapshot,attestation_text,attested_at,correlation_id,
    record_sha256,created_at
  ) values (
    v_id,p_enrollment_id,v_enrollment.cohort_id,v_session.day,p_anchor_live_session_id,
    p_attendance_entry_id,v_daily_checkin.daily_identity_checkin_id,p_identity_attestation_id,p_instructor_file_id,true,true,true,
    p_actor_clerk_user_id,v_instructor.di_license_number,
    'I attest that I am the assigned Class DI instructor, I observed this student live today, verified the student against the controlled identity record, and verified the student''s daily attendance.',
    p_attested_at,p_correlation_id,v_record_sha,v_created_at
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'instructor',p_actor_clerk_user_id,p_enrollment_id,'daily_attendance_attestation',v_id,
    'daily_live_student_and_attendance_verified_by_di_instructor',p_correlation_id,
    jsonb_build_object('trainingDay',v_session.day,'attendanceEntryId',p_attendance_entry_id,'recordSha256',v_record_sha)
  );
  return jsonb_build_object(
    'dailyAttestationId',v_id,'trainingDay',v_session.day,
    'recordSha256',v_record_sha,'idempotentReplay',false
  );
end;
$$;

create or replace function public.fdacs_class_d_identity_attendance_evidence_export(
  p_enrollment_id uuid,
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_actor_role not in ('system','school_admin','compliance_admin','fdacs_investigator') then raise exception 'identity-attendance export role is unauthorized'; end if;
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 then raise exception 'identity-attendance export actor is required'; end if;
  if char_length(trim(coalesce(p_purpose,''))) not between 3 and 500 then raise exception 'identity-attendance export purpose is required'; end if;
  if p_enrollment_id is null or p_correlation_id is null then raise exception 'identity-attendance export identifiers are required'; end if;
  if not exists (select 1 from public.fdacs_class_d_enrollments where id = p_enrollment_id) then raise exception 'enrollment is unavailable'; end if;

  select jsonb_build_object(
    'schema','obserra.fdacs.class-d.identity-attendance-evidence.v1',
    'generatedAt',clock_timestamp(),
    'enrollmentId',p_enrollment_id,
    'automatedIdentitySessions',coalesce((
      select jsonb_agg(jsonb_build_object(
        'verificationSessionId',s.verification_session_id,'provider',s.provider,
        'providerSessionId',s.provider_session_id,'purpose',s.purpose,'status',s.status,
        'documentCheckStatus',s.document_check_status,'selfieCheckStatus',s.selfie_check_status,
        'providerReportRef',s.provider_report_ref,'providerLivemode',s.provider_livemode,
        'consentVersion',s.consent_version,'consentedAt',s.consented_at,'verifiedAt',s.verified_at,
        'identityImagesCopiedToLms',s.identity_images_copied_to_lms,
        'biometricTemplateStoredByLms',s.biometric_template_stored_by_lms,
        'correlationId',s.correlation_id,'createdAt',s.created_at,'updatedAt',s.updated_at
      ) order by s.created_at,s.verification_session_id)
      from public.fdacs_class_d_identity_verification_sessions s
      where s.enrollment_id = p_enrollment_id
    ),'[]'::jsonb),
    'providerEvents',coalesce((
      select jsonb_agg(jsonb_build_object(
        'eventSequence',e.event_sequence,'verificationSessionId',e.verification_session_id,
        'providerEventId',e.provider_event_id,'status',e.status,
        'documentCheckStatus',e.document_check_status,'selfieCheckStatus',e.selfie_check_status,
        'providerErrorCode',e.provider_error_code,'providerOccurredAt',e.provider_occurred_at,
        'correlationId',e.correlation_id,'recordedAt',e.recorded_at,
        'previousEventSha256',e.previous_event_sha256,'eventSha256',e.event_sha256
      ) order by e.event_sequence)
      from public.fdacs_class_d_identity_verification_events e
      join public.fdacs_class_d_identity_verification_sessions s on s.verification_session_id = e.verification_session_id
      where s.enrollment_id = p_enrollment_id
    ),'[]'::jsonb),
    'instructorIdentityAttestations',coalesce((
      select jsonb_agg(to_jsonb(a) - 'instructor_clerk_user_id' order by a.attested_at,a.identity_attestation_id)
      from public.fdacs_class_d_instructor_identity_attestations a where a.enrollment_id = p_enrollment_id
    ),'[]'::jsonb),
    'dailyIdentityCheckins',coalesce((
      select jsonb_agg(to_jsonb(d) - 'instructor_clerk_user_id' order by d.training_day,d.attested_at)
      from public.fdacs_class_d_daily_identity_checkins d where d.enrollment_id = p_enrollment_id
    ),'[]'::jsonb),
    'dailyAttendanceAttestations',coalesce((
      select jsonb_agg(to_jsonb(a) - 'instructor_clerk_user_id' order by a.training_day,a.attested_at)
      from public.fdacs_class_d_daily_attendance_attestations a where a.enrollment_id = p_enrollment_id
    ),'[]'::jsonb),
    'sessionSignatures',coalesce((
      select jsonb_agg(to_jsonb(s) - 'signer_clerk_user_id' order by s.signed_at,s.signature_record_id)
      from public.fdacs_class_d_session_signature_records s where s.enrollment_id = p_enrollment_id
    ),'[]'::jsonb),
    'signedFinalExaminations',coalesce((
      select jsonb_agg(to_jsonb(x) - 'signer_clerk_user_id' order by x.signed_at,x.signed_exam_record_id)
      from public.fdacs_class_d_signed_final_exam_records x where x.enrollment_id = p_enrollment_id
    ),'[]'::jsonb),
    'exclusions',jsonb_build_object(
      'identityDocumentImages',true,'selfieImages',true,'biometricTemplates',true,
      'examQuestions',true,'examAnswers',true,'paymentCardData',true,'authenticationSecrets',true
    )
  ) into v_result;

  perform public.fdacs_class_d_append_access_event(
    null,p_enrollment_id,'identity_attendance_exported',p_actor_ref,p_actor_role,p_purpose,
    null,p_correlation_id,jsonb_build_object('schema','obserra.fdacs.class-d.identity-attendance-evidence.v1')
  );
  return v_result;
end;
$$;

-- Replace the live-class lease function so instructional access is impossible
-- until the assigned DI instructor has signed today's controlled attestation.
create or replace function public.fdacs_class_d_acquire_device_lease(
  p_live_session_id uuid,
  p_clerk_user_id text,
  p_clerk_session_id text,
  p_browser_instance_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid;
  v_cohort_id uuid;
  v_training_day integer;
  v_lease_id uuid;
  v_existing public.fdacs_class_d_device_leases%rowtype;
begin
  select e.id,e.cohort_id,s.day into v_enrollment_id,v_cohort_id,v_training_day
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_live_sessions s on s.cohort_id = e.cohort_id
  where s.id = p_live_session_id
    and e.clerk_user_id = p_clerk_user_id
    and e.status in ('enrolled','in_progress','instruction_complete','exam_eligible')
    and s.status in ('live','break');
  if v_enrollment_id is null then raise exception 'student is not eligible for this live session'; end if;

  if not exists (
    select 1 from public.fdacs_class_d_daily_identity_checkins a
    where a.enrollment_id = v_enrollment_id and a.cohort_id = v_cohort_id
      and a.training_day = v_training_day and a.live_student_observed = true
      and a.attested_at >= clock_timestamp() - interval '18 hours'
  ) then raise exception 'assigned Class DI instructor pre-instruction daily identity check-in is required before instructional access'; end if;

  select * into v_existing
  from public.fdacs_class_d_device_leases
  where enrollment_id = v_enrollment_id and released_at is null
  for update;

  if v_existing.id is not null then
    if v_existing.last_heartbeat_at >= clock_timestamp() - interval '150 seconds' then
      if v_existing.clerk_session_id = p_clerk_session_id and v_existing.browser_instance_id = p_browser_instance_id then
        update public.fdacs_class_d_device_leases set last_heartbeat_at = clock_timestamp() where id = v_existing.id;
        return v_existing.id;
      end if;
      raise exception 'student already has an active Class D training device';
    end if;
    update public.fdacs_class_d_device_leases
    set released_at = clock_timestamp(),release_reason = 'stale_device_lease'
    where id = v_existing.id;
  end if;

  insert into public.fdacs_class_d_device_leases (
    enrollment_id,live_session_id,clerk_session_id,browser_instance_id
  ) values (
    v_enrollment_id,p_live_session_id,p_clerk_session_id,p_browser_instance_id
  ) returning id into v_lease_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'student',p_clerk_user_id,v_enrollment_id,'device_lease',v_lease_id,
    'single_device_lease_acquired_after_daily_di_identity_checkin',p_correlation_id,
    jsonb_build_object('trainingDay',v_training_day,'dailyIdentityCheckinVerified',true)
  );
  return v_lease_id;
end;
$$;

create or replace function public.fdacs_class_d_require_completion_identity_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_live_identity_count integer;
  v_daily_identity_days integer;
  v_daily_attestation_days integer;
  v_required_session_count integer;
  v_session_signature_count integer;
begin
  select count(*) into v_live_identity_count
  from public.fdacs_class_d_instructor_identity_attestations a
  where a.enrollment_id = new.enrollment_id and a.evidence_mode = 'live';
  if v_live_identity_count <> 1 then
    raise exception 'one live DI-instructor photo-identification attestation is required before completion';
  end if;

  select count(distinct training_day) into v_daily_identity_days
  from public.fdacs_class_d_daily_identity_checkins a
  where a.enrollment_id = new.enrollment_id and a.live_student_observed = true;
  if v_daily_identity_days <> 5 then
    raise exception 'five DI-instructor-verified pre-instruction daily identity check-ins are required before completion';
  end if;

  select count(distinct training_day) into v_daily_attestation_days
  from public.fdacs_class_d_daily_attendance_attestations a
  where a.enrollment_id = new.enrollment_id and a.attendance_verified = true;
  if v_daily_attestation_days <> 5 then
    raise exception 'five DI-instructor-verified daily attendance attestations are required before completion';
  end if;

  select count(*) into v_required_session_count
  from public.fdacs_class_d_live_sessions s
  join public.fdacs_class_d_enrollments e on e.cohort_id = s.cohort_id
  where e.id = new.enrollment_id and s.status = 'ended';

  select count(*) into v_session_signature_count
  from public.fdacs_class_d_session_signature_records r
  join public.fdacs_class_d_live_sessions s on s.id = r.live_session_id
  where r.enrollment_id = new.enrollment_id and s.status = 'ended';

  if v_required_session_count = 0 or v_session_signature_count <> v_required_session_count then
    raise exception 'an authenticated student signature is required for every completed class session before completion';
  end if;

  if not exists (
    select 1 from public.fdacs_class_d_signed_final_exam_records x
    where x.enrollment_id = new.enrollment_id
      and x.exam_attempt_id = new.passed_exam_attempt_id
      and x.passed = true
  ) then
    raise exception 'the passed final examination must have an authenticated student signature before completion';
  end if;
  return new;
end;
$$;

create trigger fdacs_class_d_completion_identity_evidence_guard
before insert on public.fdacs_class_d_completion_records
for each row execute function public.fdacs_class_d_require_completion_identity_evidence();

-- Repair the cumulative audit-event vocabulary. Several prior feature
-- migrations replaced this constraint with a narrower list and could reject
-- otherwise valid observer, scheduling, polling, quality, or retention events.
alter table public.fdacs_class_d_audit_events
  drop constraint if exists fdacs_class_d_audit_events_entity_type_check;
alter table public.fdacs_class_d_audit_events
  add constraint fdacs_class_d_audit_events_entity_type_check
  check (entity_type in (
    'identity','identity_attestation','daily_identity_checkin','daily_attendance_attestation',
    'enrollment','cohort','cohort_schedule','attendance','instruction_time',
    'live_session','device_lease','presence','presence_challenge','live_interaction','live_poll',
    'module_progress','learning_check','remediation','record_hold','acknowledgment',
    'enrollment_review','observer_access','exam','completion','completion_document','lias',
    'quality_case','retention_review'
  ));

alter table public.fdacs_class_d_identity_verification_sessions enable row level security;
alter table public.fdacs_class_d_identity_verification_sessions force row level security;
alter table public.fdacs_class_d_identity_verification_events enable row level security;
alter table public.fdacs_class_d_identity_verification_events force row level security;
alter table public.fdacs_class_d_instructor_identity_attestations enable row level security;
alter table public.fdacs_class_d_instructor_identity_attestations force row level security;
alter table public.fdacs_class_d_daily_identity_checkins enable row level security;
alter table public.fdacs_class_d_daily_identity_checkins force row level security;
alter table public.fdacs_class_d_daily_attendance_attestations enable row level security;
alter table public.fdacs_class_d_daily_attendance_attestations force row level security;

revoke all on table public.fdacs_class_d_identity_verification_sessions from public, anon, authenticated, service_role;
revoke all on table public.fdacs_class_d_identity_verification_events from public, anon, authenticated, service_role;
revoke all on table public.fdacs_class_d_instructor_identity_attestations from public, anon, authenticated, service_role;
revoke all on table public.fdacs_class_d_daily_identity_checkins from public, anon, authenticated, service_role;
revoke all on table public.fdacs_class_d_daily_attendance_attestations from public, anon, authenticated, service_role;
revoke all on sequence public.fdacs_class_d_identity_verification_events_event_sequence_seq from public, anon, authenticated, service_role;

-- Disable the legacy manual status setter. Automated provider evidence plus
-- the assigned instructor's attestation is now the only verification path.
revoke all on function public.fdacs_class_d_set_identity_verification(uuid,text,text,text,text,uuid)
  from public, anon, authenticated, service_role;

revoke all on function public.fdacs_class_d_reject_identity_evidence_mutation()
  from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_register_identity_verification_session(uuid,text,boolean,text,timestamptz,text,uuid)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_student_identity_verification_status(text)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_instructor_identity_review_context(uuid,uuid,text,uuid)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_identity_verification_outcome(text,text,text,text,text,text,text,timestamptz,uuid)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_instructor_identity_attestation(uuid,uuid,uuid,text,text,text,timestamptz,uuid,uuid)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_daily_identity_checkin(uuid,uuid,uuid,uuid,text,timestamptz,uuid)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_daily_attendance_attestation(uuid,uuid,uuid,uuid,uuid,text,timestamptz,uuid)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_identity_attendance_evidence_export(uuid,text,text,text,uuid)
  from public, anon, authenticated;
revoke all on function public.fdacs_class_d_require_completion_identity_evidence()
  from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_acquire_device_lease(uuid,text,text,text,uuid)
  from public, anon, authenticated;

grant execute on function public.fdacs_class_d_register_identity_verification_session(uuid,text,boolean,text,timestamptz,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_student_identity_verification_status(text)
  to service_role;
grant execute on function public.fdacs_class_d_instructor_identity_review_context(uuid,uuid,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_record_identity_verification_outcome(text,text,text,text,text,text,text,timestamptz,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_record_instructor_identity_attestation(uuid,uuid,uuid,text,text,text,timestamptz,uuid,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_record_daily_identity_checkin(uuid,uuid,uuid,uuid,text,timestamptz,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_record_daily_attendance_attestation(uuid,uuid,uuid,uuid,uuid,text,timestamptz,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_identity_attendance_evidence_export(uuid,text,text,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_acquire_device_lease(uuid,text,text,text,uuid)
  to service_role;

comment on table public.fdacs_class_d_identity_verification_sessions is
  'Stripe Identity session references and outcomes only. No ID images, selfies, or biometric templates are copied into this database.';
comment on table public.fdacs_class_d_instructor_identity_attestations is
  'Immutable assigned-Class-DI attestation satisfying instructor government-photo-ID verification; provider matching is supporting evidence only.';
comment on table public.fdacs_class_d_daily_identity_checkins is
  'Immutable pre-instruction daily live identity check-ins required before the single-device instructional lease can be issued.';
comment on table public.fdacs_class_d_daily_attendance_attestations is
  'Immutable end-of-day Class DI attendance attestations bound to the server-derived attendance ledger.';
comment on function public.fdacs_class_d_record_identity_verification_outcome(text,text,text,text,text,text,text,timestamptz,uuid) is
  'Records idempotent, hash-chained Stripe Identity webhook outcomes without retrieving or storing identity images.';

commit;
