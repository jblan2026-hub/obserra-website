begin;

-- Gate 37: dedicated FDACS student-record PII boundary hardening.
--
-- This migration belongs only in the isolated
-- "OBSERRA FDACS Student Records Production" Supabase project. It must never
-- be applied to the Academy, payments, applications, or CMMC evidence stores.
-- The boundary explicitly rejects CUI and payment-card data.

create extension if not exists pgcrypto with schema extensions;

create table public.fdacs_class_d_boundary_control (
  boundary_id smallint primary key default 1 check (boundary_id = 1),
  legal_owner text not null check (legal_owner = 'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC'),
  provider_project_ref text not null check (provider_project_ref = 'ggkxgjhsbgbifiqrhavr'),
  region text not null check (region = 'us-east-1'),
  purpose text not null check (purpose = 'fdacs_class_d_student_records'),
  classification text not null check (classification = 'regulated_student_pii_non_cui'),
  cui_processing_authorized boolean not null default false check (cui_processing_authorized = false),
  payment_data_authorized boolean not null default false check (payment_data_authorized = false),
  academy_data_authorized boolean not null default false check (academy_data_authorized = false),
  application_data_authorized boolean not null default false check (application_data_authorized = false),
  identity_document_images_authorized boolean not null default false check (identity_document_images_authorized = false),
  minimum_retention_years smallint not null default 2 check (minimum_retention_years = 2),
  operational_retention_years smallint not null default 3 check (operational_retention_years >= minimum_retention_years),
  automatic_deletion_enabled boolean not null default false check (automatic_deletion_enabled = false),
  authoritative_rule text not null check (authoritative_rule = 'F.A.C. 5N-1.140(5)'),
  authoritative_statute text not null check (authoritative_statute = 'F.S. 493.6132'),
  privacy_statute text not null check (privacy_statute = 'F.S. 501.171'),
  electronic_record_statute text not null check (electronic_record_statute = 'F.S. 668.50'),
  created_at timestamptz not null default now()
);

insert into public.fdacs_class_d_boundary_control (
  legal_owner,
  provider_project_ref,
  region,
  purpose,
  classification,
  operational_retention_years,
  authoritative_rule,
  authoritative_statute,
  privacy_statute,
  electronic_record_statute
) values (
  'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC',
  'ggkxgjhsbgbifiqrhavr',
  'us-east-1',
  'fdacs_class_d_student_records',
  'regulated_student_pii_non_cui',
  3,
  'F.A.C. 5N-1.140(5)',
  'F.S. 493.6132',
  'F.S. 501.171',
  'F.S. 668.50'
);

create table public.fdacs_class_d_activation_state (
  boundary_id smallint primary key references public.fdacs_class_d_boundary_control(boundary_id) on delete restrict,
  fdacs_ds_license_verified boolean not null default false,
  fdacs_online_method_accepted boolean not null default false,
  clerk_identity_verified boolean not null default false,
  pii_encryption_key_custody_verified boolean not null default false,
  backup_restore_test_verified boolean not null default false,
  ha_failover_test_verified boolean not null default false,
  investigator_access_test_verified boolean not null default false,
  production_runtime_authorized boolean not null default false,
  authorization_evidence_ref text,
  authorized_by text,
  authorized_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint fdacs_class_d_activation_fail_closed check (
    production_runtime_authorized = false or (
      fdacs_ds_license_verified and
      fdacs_online_method_accepted and
      clerk_identity_verified and
      pii_encryption_key_custody_verified and
      backup_restore_test_verified and
      ha_failover_test_verified and
      investigator_access_test_verified and
      char_length(trim(authorization_evidence_ref)) between 12 and 500 and
      char_length(trim(authorized_by)) between 3 and 255 and
      authorized_at is not null
    )
  )
);

insert into public.fdacs_class_d_activation_state (boundary_id) values (1);

create table public.fdacs_class_d_record_authorities (
  authority_id text primary key,
  authority_type text not null check (authority_type in ('rule','statute','official_form','official_guide')),
  title text not null check (char_length(title) between 3 and 300),
  official_url text not null check (official_url ~ '^https://'),
  effective_or_revision_date date,
  requirement_summary text not null check (char_length(requirement_summary) between 10 and 4000),
  captured_at timestamptz not null default now()
);

insert into public.fdacs_class_d_record_authorities (
  authority_id, authority_type, title, official_url, effective_or_revision_date, requirement_summary
) values
  (
    'FAC-5N-1.140-2024-11-28',
    'rule',
    'Security Officer, Recovery Agent and Private Investigative Intern School Curriculum; Examinations; Retention of Records',
    'https://www.flrules.org/gateway/ruleno.asp?id=5n-1.140',
    date '2024-11-28',
    'Maintain required course, instructor, attendance, examination, certificate, online-session, and security-protocol records for at least two years and make them reproducible, transmittable, and available to FDACS investigators.'
  ),
  (
    'FS-493.6132-2025',
    'statute',
    'Online training courses',
    'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499%2F0493%2FSections%2F0493.6132.html',
    null,
    'Maintain digital attendance, training-session, instructor, and security-protocol evidence and provide investigator access on request.'
  ),
  (
    'FS-501.171-2025',
    'statute',
    'Security of confidential personal information',
    'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599%2F0501%2FSections%2F0501.171.html',
    null,
    'Apply reasonable safeguards to electronic personal information and use reasonable secure-disposal measures after records are no longer retained.'
  ),
  (
    'FS-668.50-2025',
    'statute',
    'Uniform Electronic Transaction Act',
    'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699%2F0668%2FSections%2F0668.50.html',
    null,
    'Electronic signatures must be attributable to the signer; retained electronic records must accurately reflect the final record and remain accessible for later reference.'
  ),
  (
    'FDACS-16003-2023-05',
    'official_form',
    'Application for Class DS Security Officer or RS Recovery Agent School or Training Facility License',
    'https://forms.fdacs.gov/16003.pdf',
    date '2023-05-01',
    'Class DS applicants submit the application, fees, training curriculum, final examination, and fictitious-name evidence and identify Internet-based instruction when applicable.'
  ),
  (
    'FDACS-P-02188-2023-03',
    'official_guide',
    'Training Reporting for Class DS Schools',
    'https://licensing.fdacs.gov/forms/Training-Reporting-for-Class-DS-Schools.pdf',
    date '2023-03-01',
    'Use LIAS to report completed Class D training and generate the official certificate; preserve school copies of LIAS records and the current certificate.'
  );

create table public.fdacs_class_d_activation_evidence (
  event_sequence bigint generated always as identity primary key,
  gate_name text not null check (gate_name in (
    'fdacs_ds_license','fdacs_online_method','clerk_identity','pii_encryption_key_custody',
    'backup_restore_test','ha_failover_test','investigator_access_test','production_runtime'
  )),
  outcome text not null check (outcome in ('verified','invalidated','authorized','deauthorized')),
  evidence_ref text not null check (char_length(evidence_ref) between 12 and 500),
  evidence_sha256 text not null check (evidence_sha256 ~ '^[0-9a-f]{64}$'),
  actor_ref text not null check (char_length(actor_ref) between 3 and 255),
  correlation_id uuid not null,
  occurred_at timestamptz not null default now(),
  previous_event_sha256 text check (previous_event_sha256 is null or previous_event_sha256 ~ '^[0-9a-f]{64}$'),
  event_sha256 text not null unique check (event_sha256 ~ '^[0-9a-f]{64}$')
);

create table public.fdacs_class_d_protected_artifacts (
  artifact_id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.fdacs_class_d_enrollments(id) on delete restrict,
  idempotency_key text not null unique check (char_length(idempotency_key) between 12 and 200),
  artifact_type text not null check (artifact_type in (
    'course_material_manifest','reference_source_manifest','class_schedule','final_exam_master',
    'enrollment_record_snapshot','completion_evidence_package','session_attendance_log',
    'session_student_signature','signed_final_exam','student_completion_certificate',
    'instructor_qualification','instructor_license','security_protocol_evidence','inspection_export'
  )),
  classification text not null check (classification in (
    'internal_non_pii','internal_sensitive_non_pii','regulated_student_pii','regulated_personnel_pii'
  )),
  contains_cui boolean not null default false check (contains_cui = false),
  contains_payment_data boolean not null default false check (contains_payment_data = false),
  encryption_profile text not null check (encryption_profile = 'AES-256-GCM-APPLICATION-ENVELOPE-V1'),
  key_reference text not null check (char_length(key_reference) between 3 and 255),
  initialization_vector bytea not null check (octet_length(initialization_vector) = 12),
  encrypted_payload bytea not null check (octet_length(encrypted_payload) between 17 and 52428800),
  ciphertext_sha256 text not null check (ciphertext_sha256 ~ '^[0-9a-f]{64}$'),
  plaintext_sha256 text not null check (plaintext_sha256 ~ '^[0-9a-f]{64}$'),
  plaintext_size_bytes bigint not null check (plaintext_size_bytes between 1 and 52428800),
  content_type text not null check (content_type ~ '^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$'),
  source_system text not null check (char_length(source_system) between 2 and 200),
  retention_anchor_date date not null,
  minimum_retain_until date not null,
  operational_retain_until date not null,
  legal_hold_active boolean not null default false,
  automatic_deletion_enabled boolean not null default false check (automatic_deletion_enabled = false),
  correlation_id uuid not null,
  archived_by text not null check (char_length(archived_by) between 3 and 255),
  archived_at timestamptz not null default now(),
  previous_artifact_sha256 text check (previous_artifact_sha256 is null or previous_artifact_sha256 ~ '^[0-9a-f]{64}$'),
  artifact_record_sha256 text not null unique check (artifact_record_sha256 ~ '^[0-9a-f]{64}$'),
  constraint fdacs_class_d_artifact_ciphertext_digest check (
    ciphertext_sha256 = encode(extensions.digest(encrypted_payload, 'sha256'), 'hex')
  ),
  constraint fdacs_class_d_artifact_minimum_retention check (
    minimum_retain_until >= (retention_anchor_date + interval '2 years')::date and
    operational_retain_until >= minimum_retain_until
  )
);

create table public.fdacs_class_d_record_access_events (
  event_sequence bigint generated always as identity primary key,
  artifact_id uuid references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  enrollment_id uuid references public.fdacs_class_d_enrollments(id) on delete restrict,
  event_type text not null check (event_type in (
    'artifact_archived','artifact_accessed','inspection_manifest_accessed',
    'investigator_export_requested','investigator_export_completed','access_denied',
    'controlled_record_registered','completion_artifact_linked','identity_attendance_exported'
  )),
  actor_ref text not null check (char_length(actor_ref) between 3 and 255),
  actor_role text not null check (actor_role in ('system','school_admin','compliance_admin','fdacs_investigator')),
  purpose text not null check (char_length(purpose) between 3 and 500),
  request_reference text check (request_reference is null or char_length(request_reference) between 3 and 500),
  correlation_id uuid not null,
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object' and octet_length(event_metadata::text) <= 16384
  ),
  occurred_at timestamptz not null default now(),
  previous_event_sha256 text check (previous_event_sha256 is null or previous_event_sha256 ~ '^[0-9a-f]{64}$'),
  event_sha256 text not null unique check (event_sha256 ~ '^[0-9a-f]{64}$')
);

create table public.fdacs_class_d_course_files (
  course_file_id uuid primary key default gen_random_uuid(),
  course_id text not null check (course_id = 'florida-class-d-40-hour'),
  course_version text not null check (course_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  schedule_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  materials_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  references_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  final_exam_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  final_exam_version text not null check (char_length(final_exam_version) between 1 and 80),
  final_exam_sha256 text not null check (final_exam_sha256 ~ '^[0-9a-f]{64}$'),
  approved_by text not null check (char_length(approved_by) between 3 and 255),
  approved_at timestamptz not null,
  effective_from date not null,
  supersedes_course_file_id uuid references public.fdacs_class_d_course_files(course_file_id) on delete restrict,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (course_id, course_version)
);

create table public.fdacs_class_d_instructor_files (
  instructor_file_id uuid primary key default gen_random_uuid(),
  instructor_clerk_user_id text not null check (char_length(instructor_clerk_user_id) between 3 and 255),
  instructor_legal_name text not null check (char_length(instructor_legal_name) between 1 and 200),
  di_license_number text not null check (char_length(di_license_number) between 3 and 80),
  license_status text not null check (license_status in ('verified_active','expired_record_only','suspended','revoked')),
  license_verified_at timestamptz not null,
  license_expires_on date,
  qualification_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  license_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  verified_by text not null check (char_length(verified_by) between 3 and 255),
  supersedes_instructor_file_id uuid references public.fdacs_class_d_instructor_files(instructor_file_id) on delete restrict,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create table public.fdacs_class_d_session_signature_records (
  signature_record_id uuid primary key default gen_random_uuid(),
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  attendance_entry_id uuid not null references public.fdacs_class_d_attendance_entries(id) on delete restrict,
  signature_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  signature_method text not null check (signature_method = 'authenticated_electronic_signature'),
  signature_intent text not null check (signature_intent = 'I certify that I attended this class session and intend this electronic act as my signature.'),
  signer_clerk_user_id text not null check (char_length(signer_clerk_user_id) between 3 and 255),
  authentication_event_ref text not null check (char_length(authentication_event_ref) between 3 and 500),
  signed_at timestamptz not null,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (live_session_id, enrollment_id)
);

create table public.fdacs_class_d_signed_final_exam_records (
  signed_exam_record_id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null unique references public.fdacs_class_d_exam_attempts(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  score integer not null check (score between 0 and 170),
  passed boolean not null,
  signed_exam_artifact_id uuid not null references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  signer_clerk_user_id text not null check (char_length(signer_clerk_user_id) between 3 and 255),
  authentication_event_ref text not null check (char_length(authentication_event_ref) between 3 and 500),
  signed_at timestamptz not null,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  constraint fdacs_class_d_signed_exam_pass_consistency check (passed = (score >= 128))
);

alter table public.fdacs_class_d_completion_documents
  add column if not exists protected_artifact_id uuid
  references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict;

create index fdacs_class_d_artifacts_enrollment_idx
  on public.fdacs_class_d_protected_artifacts(enrollment_id, artifact_type, archived_at desc);
create index fdacs_class_d_artifacts_retention_idx
  on public.fdacs_class_d_protected_artifacts(operational_retain_until, legal_hold_active);
create index fdacs_class_d_access_events_artifact_idx
  on public.fdacs_class_d_record_access_events(artifact_id, occurred_at desc);
create index fdacs_class_d_access_events_enrollment_idx
  on public.fdacs_class_d_record_access_events(enrollment_id, occurred_at desc);
create index fdacs_class_d_activation_evidence_gate_idx
  on public.fdacs_class_d_activation_evidence(gate_name, occurred_at desc);
create index fdacs_class_d_instructor_files_license_idx
  on public.fdacs_class_d_instructor_files(di_license_number, license_verified_at desc);

create or replace function public.fdacs_class_d_reject_controlled_record_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'FDACS controlled records are append-only; corrections require a superseding record';
end;
$$;

create trigger fdacs_class_d_boundary_control_immutable
before update or delete on public.fdacs_class_d_boundary_control
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_record_authorities_immutable
before update or delete on public.fdacs_class_d_record_authorities
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_activation_evidence_immutable
before update or delete on public.fdacs_class_d_activation_evidence
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_protected_artifacts_immutable
before update or delete on public.fdacs_class_d_protected_artifacts
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_access_events_immutable
before update or delete on public.fdacs_class_d_record_access_events
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_course_files_immutable
before update or delete on public.fdacs_class_d_course_files
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_instructor_files_immutable
before update or delete on public.fdacs_class_d_instructor_files
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_session_signatures_immutable
before update or delete on public.fdacs_class_d_session_signature_records
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_signed_exams_immutable
before update or delete on public.fdacs_class_d_signed_final_exam_records
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();

create or replace function public.fdacs_class_d_append_activation_evidence(
  p_gate_name text,
  p_outcome text,
  p_evidence_ref text,
  p_evidence_sha256 text,
  p_actor_ref text,
  p_correlation_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_occurred_at timestamptz := clock_timestamp();
  v_previous text;
  v_hash text;
  v_canonical jsonb;
begin
  if p_gate_name not in (
    'fdacs_ds_license','fdacs_online_method','clerk_identity','pii_encryption_key_custody',
    'backup_restore_test','ha_failover_test','investigator_access_test','production_runtime'
  ) then raise exception 'invalid activation gate'; end if;
  if p_outcome not in ('verified','invalidated','authorized','deauthorized') then
    raise exception 'invalid activation evidence outcome';
  end if;
  if p_gate_name = 'production_runtime' and p_outcome not in ('authorized','deauthorized') then
    raise exception 'production runtime evidence must authorize or deauthorize';
  end if;
  if p_gate_name <> 'production_runtime' and p_outcome not in ('verified','invalidated') then
    raise exception 'activation-gate evidence must verify or invalidate';
  end if;
  if char_length(trim(coalesce(p_evidence_ref,''))) not between 12 and 500 then
    raise exception 'activation evidence reference is required';
  end if;
  if p_evidence_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'activation evidence SHA-256 is invalid'; end if;
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 then raise exception 'activation actor is required'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  perform pg_advisory_xact_lock(hashtext('public.fdacs_class_d_activation_evidence'));
  select event_sha256 into v_previous
  from public.fdacs_class_d_activation_evidence
  order by event_sequence desc
  limit 1;

  v_canonical := jsonb_build_object(
    'gateName',p_gate_name,'outcome',p_outcome,'evidenceRef',trim(p_evidence_ref),
    'evidenceSha256',p_evidence_sha256,'actorRef',trim(p_actor_ref),
    'correlationId',p_correlation_id,'occurredAt',v_occurred_at,
    'previousEventSha256',coalesce(v_previous,'GENESIS')
  );
  v_hash := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_activation_evidence (
    gate_name,outcome,evidence_ref,evidence_sha256,actor_ref,correlation_id,
    occurred_at,previous_event_sha256,event_sha256
  ) values (
    p_gate_name,p_outcome,trim(p_evidence_ref),p_evidence_sha256,trim(p_actor_ref),
    p_correlation_id,v_occurred_at,v_previous,v_hash
  );
  return v_hash;
end;
$$;

create or replace function public.fdacs_class_d_set_activation_gate(
  p_gate_name text,
  p_verified boolean,
  p_evidence_ref text,
  p_evidence_sha256 text,
  p_actor_ref text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_evidence_event_sha256 text;
begin
  if p_gate_name not in (
    'fdacs_ds_license','fdacs_online_method','clerk_identity','pii_encryption_key_custody',
    'backup_restore_test','ha_failover_test','investigator_access_test'
  ) then raise exception 'invalid activation gate'; end if;
  if p_verified is null then raise exception 'verified state is required'; end if;

  perform 1 from public.fdacs_class_d_activation_state where boundary_id = 1 for update;

  update public.fdacs_class_d_activation_state
  set fdacs_ds_license_verified = case when p_gate_name = 'fdacs_ds_license' then p_verified else fdacs_ds_license_verified end,
      fdacs_online_method_accepted = case when p_gate_name = 'fdacs_online_method' then p_verified else fdacs_online_method_accepted end,
      clerk_identity_verified = case when p_gate_name = 'clerk_identity' then p_verified else clerk_identity_verified end,
      pii_encryption_key_custody_verified = case when p_gate_name = 'pii_encryption_key_custody' then p_verified else pii_encryption_key_custody_verified end,
      backup_restore_test_verified = case when p_gate_name = 'backup_restore_test' then p_verified else backup_restore_test_verified end,
      ha_failover_test_verified = case when p_gate_name = 'ha_failover_test' then p_verified else ha_failover_test_verified end,
      investigator_access_test_verified = case when p_gate_name = 'investigator_access_test' then p_verified else investigator_access_test_verified end,
      production_runtime_authorized = case when p_verified then production_runtime_authorized else false end,
      authorization_evidence_ref = case when p_verified then authorization_evidence_ref else null end,
      authorized_by = case when p_verified then authorized_by else null end,
      authorized_at = case when p_verified then authorized_at else null end,
      updated_at = clock_timestamp()
  where boundary_id = 1;

  v_evidence_event_sha256 := public.fdacs_class_d_append_activation_evidence(
    p_gate_name,case when p_verified then 'verified' else 'invalidated' end,
    p_evidence_ref,p_evidence_sha256,p_actor_ref,p_correlation_id
  );

  return jsonb_build_object(
    'gateName',p_gate_name,'verified',p_verified,'runtimeAuthorized',
    (select production_runtime_authorized from public.fdacs_class_d_activation_state where boundary_id = 1),
    'evidenceEventSha256',v_evidence_event_sha256
  );
end;
$$;

create or replace function public.fdacs_class_d_authorize_production_runtime(
  p_authorization_evidence_ref text,
  p_authorization_evidence_sha256 text,
  p_authorized_by text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_state public.fdacs_class_d_activation_state%rowtype;
  v_evidence_event_sha256 text;
begin
  select * into v_state
  from public.fdacs_class_d_activation_state
  where boundary_id = 1
  for update;

  if not (
    v_state.fdacs_ds_license_verified and v_state.fdacs_online_method_accepted and
    v_state.clerk_identity_verified and v_state.pii_encryption_key_custody_verified and
    v_state.backup_restore_test_verified and v_state.ha_failover_test_verified and
    v_state.investigator_access_test_verified
  ) then raise exception 'all FDACS production activation gates must be verified'; end if;

  update public.fdacs_class_d_activation_state
  set production_runtime_authorized = true,
      authorization_evidence_ref = trim(p_authorization_evidence_ref),
      authorized_by = trim(p_authorized_by),
      authorized_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where boundary_id = 1;

  v_evidence_event_sha256 := public.fdacs_class_d_append_activation_evidence(
    'production_runtime','authorized',p_authorization_evidence_ref,
    p_authorization_evidence_sha256,p_authorized_by,p_correlation_id
  );

  return jsonb_build_object(
    'productionRuntimeAuthorized',true,
    'authorizedAt',(select authorized_at from public.fdacs_class_d_activation_state where boundary_id = 1),
    'evidenceEventSha256',v_evidence_event_sha256
  );
end;
$$;

create or replace function public.fdacs_class_d_deauthorize_production_runtime(
  p_evidence_ref text,
  p_evidence_sha256 text,
  p_actor_ref text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_evidence_event_sha256 text;
begin
  perform 1 from public.fdacs_class_d_activation_state where boundary_id = 1 for update;
  update public.fdacs_class_d_activation_state
  set production_runtime_authorized = false,
      authorization_evidence_ref = null,
      authorized_by = null,
      authorized_at = null,
      updated_at = clock_timestamp()
  where boundary_id = 1;

  v_evidence_event_sha256 := public.fdacs_class_d_append_activation_evidence(
    'production_runtime','deauthorized',p_evidence_ref,p_evidence_sha256,p_actor_ref,p_correlation_id
  );
  return jsonb_build_object(
    'productionRuntimeAuthorized',false,'evidenceEventSha256',v_evidence_event_sha256
  );
end;
$$;

create or replace function public.fdacs_class_d_append_access_event(
  p_artifact_id uuid,
  p_enrollment_id uuid,
  p_event_type text,
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_request_reference text,
  p_correlation_id uuid,
  p_event_metadata jsonb default '{}'::jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_occurred_at timestamptz := clock_timestamp();
  v_previous text;
  v_hash text;
  v_canonical jsonb;
begin
  if p_event_type not in (
    'artifact_archived','artifact_accessed','inspection_manifest_accessed',
    'investigator_export_requested','investigator_export_completed','access_denied',
    'controlled_record_registered','completion_artifact_linked','identity_attendance_exported'
  ) then raise exception 'invalid FDACS record access event type'; end if;
  if p_actor_role not in ('system','school_admin','compliance_admin','fdacs_investigator') then
    raise exception 'invalid FDACS record access actor role';
  end if;
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 then raise exception 'actor reference is required'; end if;
  if char_length(trim(coalesce(p_purpose,''))) not between 3 and 500 then raise exception 'access purpose is required'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;
  if p_event_metadata is null or jsonb_typeof(p_event_metadata) <> 'object' or octet_length(p_event_metadata::text) > 16384 then
    raise exception 'event metadata is invalid';
  end if;

  perform pg_advisory_xact_lock(hashtext('public.fdacs_class_d_record_access_events'));
  select event_sha256 into v_previous
  from public.fdacs_class_d_record_access_events
  order by event_sequence desc
  limit 1;

  v_canonical := jsonb_build_object(
    'artifactId', p_artifact_id,
    'enrollmentId', p_enrollment_id,
    'eventType', p_event_type,
    'actorRef', trim(p_actor_ref),
    'actorRole', p_actor_role,
    'purpose', trim(p_purpose),
    'requestReference', nullif(trim(coalesce(p_request_reference,'')),''),
    'correlationId', p_correlation_id,
    'metadata', p_event_metadata,
    'occurredAt', v_occurred_at,
    'previousEventSha256', coalesce(v_previous,'GENESIS')
  );
  v_hash := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_record_access_events (
    artifact_id,enrollment_id,event_type,actor_ref,actor_role,purpose,request_reference,
    correlation_id,event_metadata,occurred_at,previous_event_sha256,event_sha256
  ) values (
    p_artifact_id,p_enrollment_id,p_event_type,trim(p_actor_ref),p_actor_role,trim(p_purpose),
    nullif(trim(coalesce(p_request_reference,'')),''),p_correlation_id,p_event_metadata,
    v_occurred_at,v_previous,v_hash
  );
  return v_hash;
end;
$$;

create or replace function public.fdacs_class_d_archive_protected_artifact(
  p_enrollment_id uuid,
  p_idempotency_key text,
  p_artifact_type text,
  p_classification text,
  p_key_reference text,
  p_initialization_vector bytea,
  p_encrypted_payload bytea,
  p_plaintext_sha256 text,
  p_plaintext_size_bytes bigint,
  p_content_type text,
  p_source_system text,
  p_retention_anchor_date date,
  p_operational_retain_until date,
  p_legal_hold_active boolean,
  p_actor_ref text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_ciphertext_sha text;
  v_previous text;
  v_minimum date;
  v_record_sha text;
  v_archived_at timestamptz := clock_timestamp();
  v_canonical jsonb;
  v_existing public.fdacs_class_d_protected_artifacts%rowtype;
begin
  if p_artifact_type not in (
    'course_material_manifest','reference_source_manifest','class_schedule','final_exam_master',
    'enrollment_record_snapshot','completion_evidence_package','session_attendance_log',
    'session_student_signature','signed_final_exam','student_completion_certificate',
    'instructor_qualification','instructor_license','security_protocol_evidence','inspection_export'
  ) then raise exception 'unsupported FDACS protected artifact type'; end if;
  if p_classification not in (
    'internal_non_pii','internal_sensitive_non_pii','regulated_student_pii','regulated_personnel_pii'
  ) then raise exception 'unsupported artifact classification'; end if;
  if char_length(trim(coalesce(p_idempotency_key,''))) not between 12 and 200 then raise exception 'artifact idempotency key is invalid'; end if;
  if char_length(trim(coalesce(p_key_reference,''))) not between 3 and 255 then raise exception 'external encryption-key reference is required'; end if;
  if p_plaintext_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'plaintext SHA-256 is invalid'; end if;
  if octet_length(p_initialization_vector) <> 12 then raise exception 'AES-GCM initialization vector must be 12 bytes'; end if;
  if octet_length(p_encrypted_payload) not between 17 and 52428800 then raise exception 'encrypted artifact size is invalid'; end if;
  if p_plaintext_size_bytes not between 1 and 52428800 then raise exception 'plaintext artifact size is invalid'; end if;
  if p_content_type !~ '^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$' then raise exception 'content type is invalid'; end if;
  if char_length(trim(coalesce(p_source_system,''))) not between 2 and 200 then raise exception 'source system is required'; end if;
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 then raise exception 'actor reference is required'; end if;
  if p_retention_anchor_date is null then raise exception 'retention anchor date is required'; end if;
  if p_operational_retain_until is null then raise exception 'operational retention date is required'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  v_minimum := (p_retention_anchor_date + interval '2 years')::date;
  if p_operational_retain_until < v_minimum then raise exception 'operational retention cannot be shorter than the two-year minimum'; end if;
  v_ciphertext_sha := encode(extensions.digest(p_encrypted_payload,'sha256'),'hex');

  perform pg_advisory_xact_lock(hashtext('public.fdacs_class_d_protected_artifacts'));
  select * into v_existing
  from public.fdacs_class_d_protected_artifacts
  where idempotency_key = trim(p_idempotency_key);
  if found then
    if v_existing.enrollment_id is distinct from p_enrollment_id
       or v_existing.artifact_type <> p_artifact_type
       or v_existing.classification <> p_classification
       or v_existing.plaintext_sha256 <> p_plaintext_sha256 then
      raise exception 'artifact idempotency key is already bound to different content';
    end if;
    return jsonb_build_object(
      'artifactId',v_existing.artifact_id,'idempotencyKey',v_existing.idempotency_key,
      'ciphertextSha256',v_existing.ciphertext_sha256,'plaintextSha256',v_existing.plaintext_sha256,
      'recordSha256',v_existing.artifact_record_sha256,'minimumRetainUntil',v_existing.minimum_retain_until,
      'operationalRetainUntil',v_existing.operational_retain_until,'encrypted',true,'idempotentReplay',true
    );
  end if;

  select artifact_record_sha256 into v_previous
  from public.fdacs_class_d_protected_artifacts
  order by archived_at desc, artifact_id desc
  limit 1;

  v_canonical := jsonb_build_object(
    'artifactId',v_id,'enrollmentId',p_enrollment_id,'idempotencyKey',trim(p_idempotency_key),'artifactType',p_artifact_type,
    'classification',p_classification,'encryptionProfile','AES-256-GCM-APPLICATION-ENVELOPE-V1',
    'keyReference',trim(p_key_reference),'ivSha256',encode(extensions.digest(p_initialization_vector,'sha256'),'hex'),
    'ciphertextSha256',v_ciphertext_sha,'plaintextSha256',p_plaintext_sha256,
    'plaintextSizeBytes',p_plaintext_size_bytes,'contentType',lower(p_content_type),
    'sourceSystem',trim(p_source_system),'retentionAnchorDate',p_retention_anchor_date,
    'minimumRetainUntil',v_minimum,'operationalRetainUntil',p_operational_retain_until,
    'legalHoldActive',p_legal_hold_active,'correlationId',p_correlation_id,
    'archivedBy',trim(p_actor_ref),'archivedAt',v_archived_at,
    'previousArtifactSha256',coalesce(v_previous,'GENESIS')
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_protected_artifacts (
    artifact_id,enrollment_id,idempotency_key,artifact_type,classification,encryption_profile,key_reference,
    initialization_vector,encrypted_payload,ciphertext_sha256,plaintext_sha256,plaintext_size_bytes,
    content_type,source_system,retention_anchor_date,minimum_retain_until,operational_retain_until,
    legal_hold_active,correlation_id,archived_by,archived_at,previous_artifact_sha256,artifact_record_sha256
  ) values (
    v_id,p_enrollment_id,trim(p_idempotency_key),p_artifact_type,p_classification,'AES-256-GCM-APPLICATION-ENVELOPE-V1',trim(p_key_reference),
    p_initialization_vector,p_encrypted_payload,v_ciphertext_sha,p_plaintext_sha256,p_plaintext_size_bytes,
    lower(p_content_type),trim(p_source_system),p_retention_anchor_date,v_minimum,p_operational_retain_until,
    p_legal_hold_active,p_correlation_id,trim(p_actor_ref),v_archived_at,v_previous,v_record_sha
  );

  perform public.fdacs_class_d_append_access_event(
    v_id,p_enrollment_id,'artifact_archived',p_actor_ref,'system',
    'Preserve an FDACS controlled record',null,p_correlation_id,
    jsonb_build_object('artifactType',p_artifact_type,'ciphertextSha256',v_ciphertext_sha,'recordSha256',v_record_sha)
  );

  return jsonb_build_object(
    'artifactId',v_id,'idempotencyKey',trim(p_idempotency_key),'ciphertextSha256',v_ciphertext_sha,'plaintextSha256',p_plaintext_sha256,
    'recordSha256',v_record_sha,'minimumRetainUntil',v_minimum,
    'operationalRetainUntil',p_operational_retain_until,'encrypted',true,'idempotentReplay',false
  );
end;
$$;

create or replace function public.fdacs_class_d_require_protected_artifact(
  p_artifact_id uuid,
  p_expected_type text,
  p_expected_classification text,
  p_expected_enrollment_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_artifact public.fdacs_class_d_protected_artifacts%rowtype;
begin
  select * into v_artifact
  from public.fdacs_class_d_protected_artifacts
  where artifact_id = p_artifact_id;

  if not found then raise exception 'required protected artifact is unavailable'; end if;
  if v_artifact.artifact_type <> p_expected_type then raise exception 'protected artifact type does not match the controlled record'; end if;
  if v_artifact.classification <> p_expected_classification then raise exception 'protected artifact classification does not match the controlled record'; end if;
  if v_artifact.enrollment_id is distinct from p_expected_enrollment_id then raise exception 'protected artifact enrollment scope does not match the controlled record'; end if;
end;
$$;

create or replace function public.fdacs_class_d_register_course_file(
  p_course_version text,
  p_schedule_artifact_id uuid,
  p_materials_artifact_id uuid,
  p_references_artifact_id uuid,
  p_final_exam_artifact_id uuid,
  p_final_exam_version text,
  p_final_exam_sha256 text,
  p_approved_by text,
  p_approved_at timestamptz,
  p_effective_from date,
  p_supersedes_course_file_id uuid,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_created_at timestamptz := clock_timestamp();
  v_record_sha text;
  v_exam_plaintext_sha text;
  v_superseded public.fdacs_class_d_course_files%rowtype;
  v_canonical jsonb;
begin
  if p_course_version !~ '^[0-9]+\.[0-9]+\.[0-9]+$' then raise exception 'course version must use semantic versioning'; end if;
  if char_length(trim(coalesce(p_final_exam_version,''))) not between 1 and 80 then raise exception 'final exam version is required'; end if;
  if p_final_exam_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'final exam SHA-256 is invalid'; end if;
  if char_length(trim(coalesce(p_approved_by,''))) not between 3 and 255 then raise exception 'course-file approver is required'; end if;
  if p_approved_at is null or p_effective_from is null then raise exception 'course approval and effective dates are required'; end if;
  if p_approved_at > clock_timestamp() + interval '5 minutes' then raise exception 'course approval time cannot be in the future'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  perform public.fdacs_class_d_require_protected_artifact(p_schedule_artifact_id,'class_schedule','internal_sensitive_non_pii',null);
  perform public.fdacs_class_d_require_protected_artifact(p_materials_artifact_id,'course_material_manifest','internal_sensitive_non_pii',null);
  perform public.fdacs_class_d_require_protected_artifact(p_references_artifact_id,'reference_source_manifest','internal_sensitive_non_pii',null);
  perform public.fdacs_class_d_require_protected_artifact(p_final_exam_artifact_id,'final_exam_master','internal_sensitive_non_pii',null);

  select plaintext_sha256 into v_exam_plaintext_sha
  from public.fdacs_class_d_protected_artifacts
  where artifact_id = p_final_exam_artifact_id;
  if v_exam_plaintext_sha <> p_final_exam_sha256 then raise exception 'final exam digest does not match its protected artifact'; end if;

  if p_supersedes_course_file_id is not null then
    select * into v_superseded from public.fdacs_class_d_course_files where course_file_id = p_supersedes_course_file_id;
    if not found or v_superseded.course_id <> 'florida-class-d-40-hour' then raise exception 'superseded course file is unavailable'; end if;
  end if;

  v_canonical := jsonb_build_object(
    'courseFileId',v_id,'courseId','florida-class-d-40-hour','courseVersion',p_course_version,
    'scheduleArtifactId',p_schedule_artifact_id,'materialsArtifactId',p_materials_artifact_id,
    'referencesArtifactId',p_references_artifact_id,'finalExamArtifactId',p_final_exam_artifact_id,
    'finalExamVersion',trim(p_final_exam_version),'finalExamSha256',p_final_exam_sha256,
    'approvedBy',trim(p_approved_by),'approvedAt',p_approved_at,'effectiveFrom',p_effective_from,
    'supersedesCourseFileId',p_supersedes_course_file_id,'createdAt',v_created_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_course_files (
    course_file_id,course_id,course_version,schedule_artifact_id,materials_artifact_id,
    references_artifact_id,final_exam_artifact_id,final_exam_version,final_exam_sha256,
    approved_by,approved_at,effective_from,supersedes_course_file_id,record_sha256,created_at
  ) values (
    v_id,'florida-class-d-40-hour',p_course_version,p_schedule_artifact_id,p_materials_artifact_id,
    p_references_artifact_id,p_final_exam_artifact_id,trim(p_final_exam_version),p_final_exam_sha256,
    trim(p_approved_by),p_approved_at,p_effective_from,p_supersedes_course_file_id,v_record_sha,v_created_at
  );

  perform public.fdacs_class_d_append_access_event(
    null,null,'controlled_record_registered',p_approved_by,'compliance_admin',
    'Register the controlled FDACS course file',null,p_correlation_id,
    jsonb_build_object('recordType','course_file','recordId',v_id,'recordSha256',v_record_sha)
  );
  return jsonb_build_object('courseFileId',v_id,'recordSha256',v_record_sha);
end;
$$;

create or replace function public.fdacs_class_d_register_instructor_file(
  p_instructor_clerk_user_id text,
  p_instructor_legal_name text,
  p_di_license_number text,
  p_license_status text,
  p_license_verified_at timestamptz,
  p_license_expires_on date,
  p_qualification_artifact_id uuid,
  p_license_artifact_id uuid,
  p_verified_by text,
  p_supersedes_instructor_file_id uuid,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_created_at timestamptz := clock_timestamp();
  v_record_sha text;
  v_superseded public.fdacs_class_d_instructor_files%rowtype;
  v_canonical jsonb;
begin
  if char_length(trim(coalesce(p_instructor_clerk_user_id,''))) not between 3 and 255 then raise exception 'instructor identity is required'; end if;
  if char_length(trim(coalesce(p_instructor_legal_name,''))) not between 1 and 200 then raise exception 'instructor legal name is required'; end if;
  if char_length(trim(coalesce(p_di_license_number,''))) not between 3 and 80 then raise exception 'instructor license number is required'; end if;
  if p_license_status not in ('verified_active','expired_record_only','suspended','revoked') then raise exception 'invalid instructor license status'; end if;
  if p_license_verified_at is null or p_license_verified_at > clock_timestamp() + interval '5 minutes' then raise exception 'license verification time is invalid'; end if;
  if char_length(trim(coalesce(p_verified_by,''))) not between 3 and 255 then raise exception 'license verifier is required'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  perform public.fdacs_class_d_require_protected_artifact(p_qualification_artifact_id,'instructor_qualification','regulated_personnel_pii',null);
  perform public.fdacs_class_d_require_protected_artifact(p_license_artifact_id,'instructor_license','regulated_personnel_pii',null);

  if p_supersedes_instructor_file_id is not null then
    select * into v_superseded from public.fdacs_class_d_instructor_files where instructor_file_id = p_supersedes_instructor_file_id;
    if not found or v_superseded.instructor_clerk_user_id <> trim(p_instructor_clerk_user_id) then
      raise exception 'superseded instructor file is unavailable or belongs to another instructor';
    end if;
  end if;

  v_canonical := jsonb_build_object(
    'instructorFileId',v_id,'instructorClerkUserId',trim(p_instructor_clerk_user_id),
    'instructorLegalName',trim(p_instructor_legal_name),'diLicenseNumber',trim(p_di_license_number),
    'licenseStatus',p_license_status,'licenseVerifiedAt',p_license_verified_at,
    'licenseExpiresOn',p_license_expires_on,'qualificationArtifactId',p_qualification_artifact_id,
    'licenseArtifactId',p_license_artifact_id,'verifiedBy',trim(p_verified_by),
    'supersedesInstructorFileId',p_supersedes_instructor_file_id,'createdAt',v_created_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_instructor_files (
    instructor_file_id,instructor_clerk_user_id,instructor_legal_name,di_license_number,
    license_status,license_verified_at,license_expires_on,qualification_artifact_id,
    license_artifact_id,verified_by,supersedes_instructor_file_id,record_sha256,created_at
  ) values (
    v_id,trim(p_instructor_clerk_user_id),trim(p_instructor_legal_name),trim(p_di_license_number),
    p_license_status,p_license_verified_at,p_license_expires_on,p_qualification_artifact_id,
    p_license_artifact_id,trim(p_verified_by),p_supersedes_instructor_file_id,v_record_sha,v_created_at
  );

  perform public.fdacs_class_d_append_access_event(
    null,null,'controlled_record_registered',p_verified_by,'compliance_admin',
    'Register the controlled FDACS instructor file',null,p_correlation_id,
    jsonb_build_object('recordType','instructor_file','recordId',v_id,'recordSha256',v_record_sha)
  );
  return jsonb_build_object('instructorFileId',v_id,'recordSha256',v_record_sha);
end;
$$;

create or replace function public.fdacs_class_d_register_session_signature(
  p_live_session_id uuid,
  p_enrollment_id uuid,
  p_attendance_entry_id uuid,
  p_signature_artifact_id uuid,
  p_signer_clerk_user_id text,
  p_authentication_event_ref text,
  p_signed_at timestamptz,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_created_at timestamptz := clock_timestamp();
  v_record_sha text;
  v_enrollment_clerk_user_id text;
  v_enrollment_cohort_id uuid;
  v_attendance_enrollment_id uuid;
  v_attendance_day smallint;
  v_session_cohort_id uuid;
  v_session_day integer;
  v_session_started_at timestamptz;
  v_canonical jsonb;
begin
  select clerk_user_id,cohort_id into v_enrollment_clerk_user_id,v_enrollment_cohort_id
  from public.fdacs_class_d_enrollments where id = p_enrollment_id;
  if not found then raise exception 'enrollment is unavailable'; end if;

  select enrollment_id,day into v_attendance_enrollment_id,v_attendance_day
  from public.fdacs_class_d_attendance_entries where id = p_attendance_entry_id;
  if not found or v_attendance_enrollment_id <> p_enrollment_id then raise exception 'attendance entry does not belong to the enrollment'; end if;

  select cohort_id,day,started_at into v_session_cohort_id,v_session_day,v_session_started_at
  from public.fdacs_class_d_live_sessions where id = p_live_session_id;
  if not found or v_session_cohort_id <> v_enrollment_cohort_id or v_session_day <> v_attendance_day then
    raise exception 'live session does not match the enrollment attendance day';
  end if;
  if v_session_started_at is null then raise exception 'session signature cannot precede a started class session'; end if;
  if trim(coalesce(p_signer_clerk_user_id,'')) <> v_enrollment_clerk_user_id then raise exception 'session signature signer does not match the enrollment'; end if;
  if char_length(trim(coalesce(p_authentication_event_ref,''))) not between 3 and 500 then raise exception 'authentication event reference is required'; end if;
  if p_signed_at is null or p_signed_at < v_session_started_at - interval '5 minutes' or p_signed_at > clock_timestamp() + interval '5 minutes' then
    raise exception 'session signature time is invalid';
  end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  perform public.fdacs_class_d_require_protected_artifact(
    p_signature_artifact_id,'session_student_signature','regulated_student_pii',p_enrollment_id
  );

  v_canonical := jsonb_build_object(
    'signatureRecordId',v_id,'liveSessionId',p_live_session_id,'enrollmentId',p_enrollment_id,
    'attendanceEntryId',p_attendance_entry_id,'signatureArtifactId',p_signature_artifact_id,
    'signatureMethod','authenticated_electronic_signature',
    'signatureIntent','I certify that I attended this class session and intend this electronic act as my signature.',
    'signerClerkUserId',trim(p_signer_clerk_user_id),'authenticationEventRef',trim(p_authentication_event_ref),
    'signedAt',p_signed_at,'createdAt',v_created_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_session_signature_records (
    signature_record_id,live_session_id,enrollment_id,attendance_entry_id,signature_artifact_id,
    signature_method,signature_intent,signer_clerk_user_id,authentication_event_ref,signed_at,
    record_sha256,created_at
  ) values (
    v_id,p_live_session_id,p_enrollment_id,p_attendance_entry_id,p_signature_artifact_id,
    'authenticated_electronic_signature',
    'I certify that I attended this class session and intend this electronic act as my signature.',
    trim(p_signer_clerk_user_id),trim(p_authentication_event_ref),p_signed_at,v_record_sha,v_created_at
  );

  perform public.fdacs_class_d_append_access_event(
    p_signature_artifact_id,p_enrollment_id,'controlled_record_registered',p_signer_clerk_user_id,
    'system','Register the authenticated session signature',p_authentication_event_ref,p_correlation_id,
    jsonb_build_object('recordType','session_signature','recordId',v_id,'recordSha256',v_record_sha)
  );
  return jsonb_build_object('signatureRecordId',v_id,'recordSha256',v_record_sha);
end;
$$;

create or replace function public.fdacs_class_d_register_signed_final_exam(
  p_exam_attempt_id uuid,
  p_signed_exam_artifact_id uuid,
  p_signer_clerk_user_id text,
  p_authentication_event_ref text,
  p_signed_at timestamptz,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_created_at timestamptz := clock_timestamp();
  v_record_sha text;
  v_attempt public.fdacs_class_d_exam_attempts%rowtype;
  v_canonical jsonb;
begin
  select * into v_attempt from public.fdacs_class_d_exam_attempts where id = p_exam_attempt_id;
  if not found then raise exception 'exam attempt is unavailable'; end if;
  if v_attempt.status not in ('submitted','passed','failed') or v_attempt.submitted_at is null or v_attempt.score is null or v_attempt.passed is null then
    raise exception 'only a submitted and graded final exam can be signed';
  end if;
  if trim(coalesce(p_signer_clerk_user_id,'')) <> v_attempt.clerk_user_id then raise exception 'final-exam signer does not match the exam attempt'; end if;
  if char_length(trim(coalesce(p_authentication_event_ref,''))) not between 3 and 500 then raise exception 'authentication event reference is required'; end if;
  if p_signed_at is null or p_signed_at < v_attempt.submitted_at or p_signed_at > clock_timestamp() + interval '5 minutes' then raise exception 'final-exam signature time is invalid'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  perform public.fdacs_class_d_require_protected_artifact(
    p_signed_exam_artifact_id,'signed_final_exam','regulated_student_pii',v_attempt.enrollment_id
  );

  v_canonical := jsonb_build_object(
    'signedExamRecordId',v_id,'examAttemptId',p_exam_attempt_id,'enrollmentId',v_attempt.enrollment_id,
    'score',v_attempt.score,'passed',v_attempt.passed,'signedExamArtifactId',p_signed_exam_artifact_id,
    'signerClerkUserId',trim(p_signer_clerk_user_id),'authenticationEventRef',trim(p_authentication_event_ref),
    'signedAt',p_signed_at,'createdAt',v_created_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_signed_final_exam_records (
    signed_exam_record_id,exam_attempt_id,enrollment_id,score,passed,signed_exam_artifact_id,
    signer_clerk_user_id,authentication_event_ref,signed_at,record_sha256,created_at
  ) values (
    v_id,p_exam_attempt_id,v_attempt.enrollment_id,v_attempt.score,v_attempt.passed,p_signed_exam_artifact_id,
    trim(p_signer_clerk_user_id),trim(p_authentication_event_ref),p_signed_at,v_record_sha,v_created_at
  );

  perform public.fdacs_class_d_append_access_event(
    p_signed_exam_artifact_id,v_attempt.enrollment_id,'controlled_record_registered',p_signer_clerk_user_id,
    'system','Register the authenticated signed final exam',p_authentication_event_ref,p_correlation_id,
    jsonb_build_object('recordType','signed_final_exam','recordId',v_id,'recordSha256',v_record_sha)
  );
  return jsonb_build_object('signedExamRecordId',v_id,'recordSha256',v_record_sha);
end;
$$;

create or replace function public.fdacs_class_d_link_completion_document_artifact(
  p_completion_document_id uuid,
  p_protected_artifact_id uuid,
  p_actor_ref text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_document public.fdacs_class_d_completion_documents%rowtype;
  v_artifact public.fdacs_class_d_protected_artifacts%rowtype;
begin
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 then raise exception 'completion-document actor is required'; end if;
  if p_correlation_id is null then raise exception 'correlation ID is required'; end if;

  select * into v_document from public.fdacs_class_d_completion_documents
  where id = p_completion_document_id for update;
  if not found then raise exception 'completion document is unavailable'; end if;

  select * into v_artifact from public.fdacs_class_d_protected_artifacts
  where artifact_id = p_protected_artifact_id;
  if not found or v_artifact.artifact_type <> 'student_completion_certificate'
     or v_artifact.classification <> 'regulated_student_pii'
     or v_artifact.enrollment_id is distinct from v_document.enrollment_id then
    raise exception 'protected completion artifact does not match the completion document';
  end if;
  if v_document.sha256 is not null and v_document.sha256 <> v_artifact.plaintext_sha256 then
    raise exception 'completion document digest does not match the protected artifact';
  end if;
  if v_document.protected_artifact_id is not null and v_document.protected_artifact_id <> p_protected_artifact_id then
    raise exception 'completion document is already linked to a different protected artifact';
  end if;

  update public.fdacs_class_d_completion_documents
  set protected_artifact_id = p_protected_artifact_id,
      sha256 = coalesce(sha256,v_artifact.plaintext_sha256),
      updated_at = clock_timestamp()
  where id = p_completion_document_id;

  perform public.fdacs_class_d_append_access_event(
    p_protected_artifact_id,v_document.enrollment_id,'completion_artifact_linked',p_actor_ref,
    'compliance_admin','Link the encrypted completion artifact to its controlled record',null,p_correlation_id,
    jsonb_build_object('completionDocumentId',p_completion_document_id,'plaintextSha256',v_artifact.plaintext_sha256)
  );
  return jsonb_build_object(
    'completionDocumentId',p_completion_document_id,'protectedArtifactId',p_protected_artifact_id,
    'plaintextSha256',v_artifact.plaintext_sha256
  );
end;
$$;

create or replace function public.fdacs_class_d_get_protected_artifact(
  p_artifact_id uuid,
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_request_reference text,
  p_correlation_id uuid
)
returns table (
  artifact_id uuid,
  artifact_type text,
  classification text,
  encryption_profile text,
  key_reference text,
  initialization_vector bytea,
  encrypted_payload bytea,
  ciphertext_sha256 text,
  plaintext_sha256 text,
  plaintext_size_bytes bigint,
  content_type text,
  minimum_retain_until date,
  operational_retain_until date,
  legal_hold_active boolean,
  artifact_record_sha256 text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_artifact public.fdacs_class_d_protected_artifacts%rowtype;
begin
  select * into v_artifact from public.fdacs_class_d_protected_artifacts where artifact_id = p_artifact_id;
  if not found then
    perform public.fdacs_class_d_append_access_event(
      p_artifact_id,null,'access_denied',p_actor_ref,p_actor_role,p_purpose,p_request_reference,p_correlation_id,
      jsonb_build_object('reason','artifact_not_found')
    );
    raise exception 'FDACS protected artifact is unavailable';
  end if;

  perform public.fdacs_class_d_append_access_event(
    v_artifact.artifact_id,v_artifact.enrollment_id,'artifact_accessed',p_actor_ref,p_actor_role,
    p_purpose,p_request_reference,p_correlation_id,
    jsonb_build_object('artifactType',v_artifact.artifact_type,'ciphertextSha256',v_artifact.ciphertext_sha256)
  );

  return query select
    v_artifact.artifact_id,v_artifact.artifact_type,v_artifact.classification,v_artifact.encryption_profile,
    v_artifact.key_reference,v_artifact.initialization_vector,v_artifact.encrypted_payload,
    v_artifact.ciphertext_sha256,v_artifact.plaintext_sha256,v_artifact.plaintext_size_bytes,
    v_artifact.content_type,v_artifact.minimum_retain_until,v_artifact.operational_retain_until,
    v_artifact.legal_hold_active,v_artifact.artifact_record_sha256;
end;
$$;

create or replace function public.fdacs_class_d_inspection_manifest(
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_request_reference text,
  p_correlation_id uuid,
  p_enrollment_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_manifest jsonb;
begin
  if p_actor_role not in ('school_admin','compliance_admin','fdacs_investigator') then
    raise exception 'inspection manifest access is not authorized for this role';
  end if;
  if char_length(trim(coalesce(p_request_reference,''))) < 3 then raise exception 'inspection request reference is required'; end if;

  select jsonb_build_object(
    'schema','obserra.fdacs.class-d.inspection-manifest.v1',
    'legalOwner','OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC',
    'providerProjectRef','ggkxgjhsbgbifiqrhavr',
    'classification','regulated_student_pii_non_cui',
    'generatedAt',clock_timestamp(),
    'requestReference',trim(p_request_reference),
    'enrollmentScope',p_enrollment_id,
    'counts',jsonb_build_object(
      'artifacts',(select count(*) from public.fdacs_class_d_protected_artifacts a where p_enrollment_id is null or a.enrollment_id = p_enrollment_id),
      'attendanceEntries',(select count(*) from public.fdacs_class_d_attendance_entries a where p_enrollment_id is null or a.enrollment_id = p_enrollment_id),
      'sessionSignatures',(select count(*) from public.fdacs_class_d_session_signature_records s where p_enrollment_id is null or s.enrollment_id = p_enrollment_id),
      'examAttempts',(select count(*) from public.fdacs_class_d_exam_attempts e where p_enrollment_id is null or e.enrollment_id = p_enrollment_id),
      'signedFinalExams',(select count(*) from public.fdacs_class_d_signed_final_exam_records e where p_enrollment_id is null or e.enrollment_id = p_enrollment_id),
      'completionDocuments',(select count(*) from public.fdacs_class_d_completion_documents d where p_enrollment_id is null or d.enrollment_id = p_enrollment_id),
      'auditEvents',(select count(*) from public.fdacs_class_d_audit_events e where p_enrollment_id is null or e.enrollment_id = p_enrollment_id)
    ),
    'artifactCatalog',coalesce((
      select jsonb_agg(jsonb_build_object(
        'artifactId',a.artifact_id,'artifactType',a.artifact_type,'contentType',a.content_type,
        'ciphertextSha256',a.ciphertext_sha256,'plaintextSha256',a.plaintext_sha256,
        'minimumRetainUntil',a.minimum_retain_until,'operationalRetainUntil',a.operational_retain_until,
        'legalHoldActive',a.legal_hold_active,'recordSha256',a.artifact_record_sha256
      ) order by a.archived_at,a.artifact_id)
      from public.fdacs_class_d_protected_artifacts a
      where p_enrollment_id is null or a.enrollment_id = p_enrollment_id
    ),'[]'::jsonb)
  ) into v_manifest;

  perform public.fdacs_class_d_append_access_event(
    null,p_enrollment_id,
    case when p_actor_role = 'fdacs_investigator' then 'investigator_export_requested' else 'inspection_manifest_accessed' end,
    p_actor_ref,p_actor_role,p_purpose,p_request_reference,p_correlation_id,
    jsonb_build_object('enrollmentScope',p_enrollment_id,'manifestSha256',encode(extensions.digest(convert_to(v_manifest::text,'UTF8'),'sha256'),'hex'))
  );

  return v_manifest;
end;
$$;

create or replace function public.fdacs_class_d_boundary_health()
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'schemaVersion','fdacs-pii-boundary-v1',
    'legalOwner',control.legal_owner,
    'providerProjectRef',control.provider_project_ref,
    'region',control.region,
    'classification',control.classification,
    'cuiProcessingAuthorized',control.cui_processing_authorized,
    'paymentDataAuthorized',control.payment_data_authorized,
    'academyDataAuthorized',control.academy_data_authorized,
    'applicationDataAuthorized',control.application_data_authorized,
    'identityDocumentImagesAuthorized',control.identity_document_images_authorized,
    'minimumRetentionYears',control.minimum_retention_years,
    'operationalRetentionYears',control.operational_retention_years,
    'automaticDeletionEnabled',control.automatic_deletion_enabled,
    'productionRuntimeAuthorized',state.production_runtime_authorized,
    'activationGates',jsonb_build_object(
      'fdacsDsLicenseVerified',state.fdacs_ds_license_verified,
      'fdacsOnlineMethodAccepted',state.fdacs_online_method_accepted,
      'clerkIdentityVerified',state.clerk_identity_verified,
      'piiEncryptionKeyCustodyVerified',state.pii_encryption_key_custody_verified,
      'backupRestoreTestVerified',state.backup_restore_test_verified,
      'haFailoverTestVerified',state.ha_failover_test_verified,
      'investigatorAccessTestVerified',state.investigator_access_test_verified
    ),
    'tableCounts',jsonb_build_object(
      'public',(select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'),
      'fdacs',(select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE' and table_name like 'fdacs_class_d_%'),
      'nonFdacs',(select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE' and table_name not like 'fdacs_class_d_%')
    ),
    'browserTablePrivileges',(select count(*) from information_schema.role_table_grants where table_schema='public' and table_name like 'fdacs_class_d_%' and grantee in ('anon','authenticated')),
    'fdacsTablesWithoutForcedRls',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname like 'fdacs_class_d_%' and not c.relforcerowsecurity),
    'estimatedRegulatedRows',(select coalesce(sum(n_live_tup),0)::bigint from pg_stat_user_tables where schemaname='public' and relname like 'fdacs_class_d_%')
  )
  from public.fdacs_class_d_boundary_control control
  join public.fdacs_class_d_activation_state state using (boundary_id);
$$;

-- No browser role may read or mutate the regulated boundary. Direct DELETE,
-- TRUNCATE, REFERENCES, and TRIGGER privileges are also removed from the
-- service role; controlled correction uses versioned/superseding records.
do $$
declare
  table_record record;
begin
  for table_record in
    select schemaname, tablename from pg_tables
    where schemaname = 'public' and tablename like 'fdacs_class_d_%'
  loop
    execute format('alter table %I.%I enable row level security', table_record.schemaname, table_record.tablename);
    execute format('alter table %I.%I force row level security', table_record.schemaname, table_record.tablename);
    execute format('revoke all on table %I.%I from public, anon, authenticated', table_record.schemaname, table_record.tablename);
    execute format('revoke delete, truncate, references, trigger on table %I.%I from service_role', table_record.schemaname, table_record.tablename);
  end loop;
end;
$$;

revoke create on schema public from public, anon, authenticated, service_role;

revoke all on table public.fdacs_class_d_boundary_control from service_role;
revoke all on table public.fdacs_class_d_activation_state from service_role;
revoke all on table public.fdacs_class_d_record_authorities from service_role;
revoke all on table public.fdacs_class_d_activation_evidence from service_role;
revoke all on table public.fdacs_class_d_protected_artifacts from service_role;
revoke all on table public.fdacs_class_d_record_access_events from service_role;
revoke all on table public.fdacs_class_d_course_files from service_role;
revoke all on table public.fdacs_class_d_instructor_files from service_role;
revoke all on table public.fdacs_class_d_session_signature_records from service_role;
revoke all on table public.fdacs_class_d_signed_final_exam_records from service_role;
revoke all on sequence public.fdacs_class_d_record_access_events_event_sequence_seq from public, anon, authenticated, service_role;
revoke all on sequence public.fdacs_class_d_activation_evidence_event_sequence_seq from public, anon, authenticated, service_role;

revoke all on function public.fdacs_class_d_reject_controlled_record_mutation() from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_append_activation_evidence(text,text,text,text,text,uuid) from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_set_activation_gate(text,boolean,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_authorize_production_runtime(text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_deauthorize_production_runtime(text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_append_access_event(uuid,uuid,text,text,text,text,text,uuid,jsonb) from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_archive_protected_artifact(uuid,text,text,text,text,bytea,bytea,text,bigint,text,text,date,date,boolean,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_require_protected_artifact(uuid,text,text,uuid) from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_register_course_file(text,uuid,uuid,uuid,uuid,text,text,text,timestamptz,date,uuid,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_register_instructor_file(text,text,text,text,timestamptz,date,uuid,uuid,text,uuid,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_register_session_signature(uuid,uuid,uuid,uuid,text,text,timestamptz,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_register_signed_final_exam(uuid,uuid,text,text,timestamptz,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_link_completion_document_artifact(uuid,uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_get_protected_artifact(uuid,text,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_inspection_manifest(text,text,text,text,uuid,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_boundary_health() from public, anon, authenticated;

grant execute on function public.fdacs_class_d_set_activation_gate(text,boolean,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_authorize_production_runtime(text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_deauthorize_production_runtime(text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_archive_protected_artifact(uuid,text,text,text,text,bytea,bytea,text,bigint,text,text,date,date,boolean,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_register_course_file(text,uuid,uuid,uuid,uuid,text,text,text,timestamptz,date,uuid,uuid) to service_role;
grant execute on function public.fdacs_class_d_register_instructor_file(text,text,text,text,timestamptz,date,uuid,uuid,text,uuid,uuid) to service_role;
grant execute on function public.fdacs_class_d_register_session_signature(uuid,uuid,uuid,uuid,text,text,timestamptz,uuid) to service_role;
grant execute on function public.fdacs_class_d_register_signed_final_exam(uuid,uuid,text,text,timestamptz,uuid) to service_role;
grant execute on function public.fdacs_class_d_link_completion_document_artifact(uuid,uuid,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_get_protected_artifact(uuid,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_inspection_manifest(text,text,text,text,uuid,uuid) to service_role;
grant execute on function public.fdacs_class_d_boundary_health() to service_role;

comment on table public.fdacs_class_d_boundary_control is
  'Immutable provider and legal boundary for the isolated OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC FDACS student-record project; CUI, payment, Academy, and application data are prohibited.';
comment on table public.fdacs_class_d_protected_artifacts is
  'Application-envelope-encrypted FDACS controlled artifacts. Encryption keys are never stored in this database.';
comment on table public.fdacs_class_d_record_access_events is
  'Append-only SHA-256 chained access ledger for controlled record and investigator access.';
comment on table public.fdacs_class_d_activation_evidence is
  'Append-only SHA-256 chained evidence for each fail-closed production activation gate and every runtime authorization change.';
comment on function public.fdacs_class_d_inspection_manifest(text,text,text,text,uuid,uuid) is
  'Produces a reproducible/transmittable FDACS inspection inventory and records every request without granting unrestricted database access.';

commit;
