begin;

-- Dedicated FDACS investigator-audit boundary.
--
-- This migration belongs only in Supabase project ggkxgjhsbgbifiqrhavr
-- (OBSERRA FDACS Student Records Production). It records and verifies the
-- production evidence needed to satisfy the immediate-production and
-- reproducible/transmittable record obligations in F.A.C. 5N-1.140(5), while
-- keeping the student-PII boundary separate from Academy, payments,
-- Applications, and the general CMMC evidence archive.

create table public.fdacs_class_d_record_authority_snapshots (
  snapshot_id uuid primary key default gen_random_uuid(),
  authority_id text not null references public.fdacs_class_d_record_authorities(authority_id) on delete restrict,
  exact_version text not null check (char_length(exact_version) between 3 and 120),
  official_url text not null check (official_url ~ '^https://'),
  effective_or_revision_date date,
  retrieved_on date not null,
  requirement_snapshot jsonb not null check (
    jsonb_typeof(requirement_snapshot) = 'object' and
    octet_length(requirement_snapshot::text) between 20 and 32768
  ),
  requirement_snapshot_sha256 text not null unique check (requirement_snapshot_sha256 ~ '^[0-9a-f]{64}$'),
  recorded_at timestamptz not null default now()
);

insert into public.fdacs_class_d_record_authority_snapshots (
  authority_id, exact_version, official_url, effective_or_revision_date,
  retrieved_on, requirement_snapshot, requirement_snapshot_sha256
)
select
  source.authority_id,
  source.exact_version,
  source.official_url,
  source.effective_or_revision_date,
  date '2026-08-14',
  source.requirement_snapshot,
  encode(extensions.digest(convert_to(jsonb_build_object(
    'authorityId',source.authority_id,
    'exactVersion',source.exact_version,
    'officialUrl',source.official_url,
    'effectiveOrRevisionDate',source.effective_or_revision_date,
    'retrievedOn',date '2026-08-14',
    'requirements',source.requirement_snapshot
  )::text,'UTF8'),'sha256'),'hex')
from (values
  (
    'FAC-5N-1.140-2024-11-28',
    'Final adopted rule effective 2024-11-28',
    'https://www.flrules.org/gateway/ruleno.asp?id=5n-1.140',
    date '2024-11-28',
    jsonb_build_object(
      'minimumRetentionYears',2,
      'immediateInvestigatorProduction',true,
      'electronicRecordsMustBeReproducibleOrTransmittable',true,
      'photoIdIdentityVerifiedByInstructor',true,
      'dailyAttendanceVerifiedByInstructorAndDigitallyLogged',true,
      'records',jsonb_build_array(
        'class schedule with date, time, location, and instructor',
        'course materials and reference sources',
        'original final examination with grade and student signature',
        'class-session attendance log with student signature',
        'completion certificate or equivalent record',
        'instructor qualification and license file',
        'online attendance, training-session, instructor, and security-protocol evidence'
      ),
      'fallbackWhenElectronicRecordsUnavailable','Explain immediately and provide within three business days'
    )
  ),
  (
    'FS-493.6132-2025',
    '2025 Florida Statutes, section 493.6132',
    'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499%2F0493%2FSections%2F0493.6132.html',
    null::date,
    jsonb_build_object(
      'digitalAttendanceLogRequired',true,
      'trainingSessionAndInstructorRecordsRequired',true,
      'securityProtocolProofRequired',true,
      'investigatorAccessOnRequest',true,
      'divisionLiveCourseAccessRequired',true,
      'singleDeviceAccessRequired',true,
      'activeParticipationChallengesRequired',true,
      'randomizedOnlineTestsRequired',true
    )
  )
) as source(authority_id,exact_version,official_url,effective_or_revision_date,requirement_snapshot);

-- A CMMC mapping is the controlled security-protocol description for the
-- FDACS database. A final protected package and exact technical results are
-- required before it can be reported as verified proof of operation. Human
-- review is independently pending and never changes the technical result.
create table public.fdacs_class_d_security_protocol_evidence (
  protocol_evidence_id uuid primary key default gen_random_uuid(),
  protected_artifact_id uuid not null unique references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  cmmc_system_id text not null check (cmmc_system_id = 'SYS-FDACS-DATABASE'),
  cmmc_bundle_id text not null unique check (char_length(cmmc_bundle_id) between 8 and 240),
  exact_release_commit_sha text not null check (exact_release_commit_sha ~ '^[0-9a-f]{40}$'),
  package_sha256 text not null check (package_sha256 ~ '^[0-9a-f]{64}$'),
  machine_mapping_sha256 text not null check (machine_mapping_sha256 ~ '^[0-9a-f]{64}$'),
  human_extract_sha256 text not null check (human_extract_sha256 ~ '^[0-9a-f]{64}$'),
  authority_profile_sha256 text not null check (authority_profile_sha256 ~ '^[0-9a-f]{64}$'),
  rev2_objective_count integer not null check (rev2_objective_count = 320),
  rev3_objective_count integer not null check (rev3_objective_count = 510),
  mapped_objective_count integer not null check (mapped_objective_count > 0),
  technical_passed integer not null check (technical_passed >= 0),
  technical_failed integer not null check (technical_failed >= 0),
  technical_not_tested integer not null check (technical_not_tested >= 0),
  technical_disposition text not null check (technical_disposition in ('passed','failed','pending_evidence')),
  human_disposition text not null default 'pending' check (human_disposition = 'pending'),
  pending_human_is_technical_failure boolean not null default false check (pending_human_is_technical_failure = false),
  assessment_finding text not null default 'not_assessed' check (assessment_finding = 'not_assessed'),
  evidence_origin text not null check (evidence_origin = 'product_supplied_evidence'),
  registered_by text not null check (char_length(registered_by) between 3 and 255),
  correlation_id uuid not null,
  record_sha256 text not null unique check (record_sha256 ~ '^[0-9a-f]{64}$'),
  registered_at timestamptz not null default now(),
  constraint fdacs_class_d_security_protocol_count_reconciliation check (
    mapped_objective_count = technical_passed + technical_failed + technical_not_tested
  ),
  constraint fdacs_class_d_security_protocol_disposition_shape check (
    (technical_disposition = 'passed' and technical_failed = 0 and technical_not_tested = 0) or
    (technical_disposition = 'failed' and technical_failed > 0) or
    (technical_disposition = 'pending_evidence' and technical_failed = 0 and technical_not_tested > 0)
  )
);

-- Every generation, finalization, delivery, or failure is a separate immutable
-- event. Exact export payloads are archived through the existing application-
-- envelope encryption function; this ledger stores only hashes and metadata.
create table public.fdacs_class_d_investigator_audit_exports (
  event_sequence bigint generated always as identity primary key,
  export_id uuid not null,
  event_type text not null check (event_type in ('generated','finalized','delivered','failed')),
  enrollment_id uuid references public.fdacs_class_d_enrollments(id) on delete restrict,
  export_schema text not null check (export_schema = 'obserra.fdacs.class-d.investigator-audit.v2'),
  request_reference text not null check (char_length(request_reference) between 3 and 500),
  actor_ref text not null check (char_length(actor_ref) between 3 and 255),
  actor_role text not null check (actor_role in ('school_admin','compliance_admin','fdacs_investigator')),
  purpose text not null check (char_length(purpose) between 3 and 500),
  payload_sha256 text check (payload_sha256 is null or payload_sha256 ~ '^[0-9a-f]{64}$'),
  protected_artifact_id uuid references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  outcome_detail text check (outcome_detail is null or char_length(outcome_detail) between 3 and 1000),
  correlation_id uuid not null,
  occurred_at timestamptz not null default now(),
  previous_event_sha256 text check (previous_event_sha256 is null or previous_event_sha256 ~ '^[0-9a-f]{64}$'),
  event_sha256 text not null unique check (event_sha256 ~ '^[0-9a-f]{64}$'),
  unique (export_id,event_type),
  constraint fdacs_class_d_investigator_export_event_shape check (
    (event_type = 'generated' and payload_sha256 is not null and protected_artifact_id is null) or
    (event_type in ('finalized','delivered') and payload_sha256 is not null and protected_artifact_id is not null) or
    (event_type = 'failed' and protected_artifact_id is null)
  )
);

create unique index fdacs_class_d_investigator_final_artifact_idx
  on public.fdacs_class_d_investigator_audit_exports(protected_artifact_id)
  where event_type = 'finalized';
create index fdacs_class_d_investigator_export_scope_idx
  on public.fdacs_class_d_investigator_audit_exports(enrollment_id,event_sequence desc);

create trigger fdacs_class_d_authority_snapshots_immutable
before update or delete on public.fdacs_class_d_record_authority_snapshots
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_security_protocol_evidence_immutable
before update or delete on public.fdacs_class_d_security_protocol_evidence
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();
create trigger fdacs_class_d_investigator_audit_exports_immutable
before update or delete on public.fdacs_class_d_investigator_audit_exports
for each row execute function public.fdacs_class_d_reject_controlled_record_mutation();

create or replace function public.fdacs_class_d_append_investigator_export_event(
  p_export_id uuid,
  p_event_type text,
  p_enrollment_id uuid,
  p_request_reference text,
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_payload_sha256 text,
  p_protected_artifact_id uuid,
  p_outcome_detail text,
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
  v_event_sha text;
  v_canonical jsonb;
begin
  if p_export_id is null or p_correlation_id is null then raise exception 'export and correlation identifiers are required'; end if;
  if p_event_type not in ('generated','finalized','delivered','failed') then raise exception 'investigator export event type is invalid'; end if;
  if p_actor_role not in ('school_admin','compliance_admin','fdacs_investigator') then raise exception 'investigator export actor role is unauthorized'; end if;
  if char_length(trim(coalesce(p_request_reference,''))) not between 3 and 500 then raise exception 'investigator request reference is required'; end if;
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 then raise exception 'investigator export actor is required'; end if;
  if char_length(trim(coalesce(p_purpose,''))) not between 3 and 500 then raise exception 'investigator export purpose is required'; end if;
  if p_payload_sha256 is not null and p_payload_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'investigator export payload digest is invalid'; end if;

  perform pg_advisory_xact_lock(hashtext('public.fdacs_class_d_investigator_audit_exports'));
  select event_sha256 into v_previous
  from public.fdacs_class_d_investigator_audit_exports
  order by event_sequence desc
  limit 1;

  v_canonical := jsonb_build_object(
    'exportId',p_export_id,'eventType',p_event_type,'enrollmentId',p_enrollment_id,
    'exportSchema','obserra.fdacs.class-d.investigator-audit.v2',
    'requestReference',trim(p_request_reference),'actorRef',trim(p_actor_ref),
    'actorRole',p_actor_role,'purpose',trim(p_purpose),'payloadSha256',p_payload_sha256,
    'protectedArtifactId',p_protected_artifact_id,
    'outcomeDetail',nullif(trim(coalesce(p_outcome_detail,'')),''),
    'correlationId',p_correlation_id,'occurredAt',v_occurred_at,
    'previousEventSha256',coalesce(v_previous,'GENESIS')
  );
  v_event_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_investigator_audit_exports (
    export_id,event_type,enrollment_id,export_schema,request_reference,actor_ref,
    actor_role,purpose,payload_sha256,protected_artifact_id,outcome_detail,
    correlation_id,occurred_at,previous_event_sha256,event_sha256
  ) values (
    p_export_id,p_event_type,p_enrollment_id,'obserra.fdacs.class-d.investigator-audit.v2',
    trim(p_request_reference),trim(p_actor_ref),p_actor_role,trim(p_purpose),
    p_payload_sha256,p_protected_artifact_id,nullif(trim(coalesce(p_outcome_detail,'')),''),
    p_correlation_id,v_occurred_at,v_previous,v_event_sha
  );
  return v_event_sha;
end;
$$;

create or replace function public.fdacs_class_d_register_security_protocol_evidence(
  p_protected_artifact_id uuid,
  p_cmmc_bundle_id text,
  p_exact_release_commit_sha text,
  p_package_sha256 text,
  p_machine_mapping_sha256 text,
  p_human_extract_sha256 text,
  p_authority_profile_sha256 text,
  p_mapped_objective_count integer,
  p_technical_passed integer,
  p_technical_failed integer,
  p_technical_not_tested integer,
  p_registered_by text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_registered_at timestamptz := clock_timestamp();
  v_disposition text;
  v_record_sha text;
  v_canonical jsonb;
  v_artifact public.fdacs_class_d_protected_artifacts%rowtype;
begin
  select * into v_artifact from public.fdacs_class_d_protected_artifacts where artifact_id = p_protected_artifact_id;
  if not found or v_artifact.artifact_type <> 'security_protocol_evidence'
     or v_artifact.classification <> 'internal_sensitive_non_pii'
     or v_artifact.enrollment_id is not null then
    raise exception 'CMMC security-protocol evidence requires a non-PII protected security-protocol artifact';
  end if;
  if p_package_sha256 !~ '^[0-9a-f]{64}$' or v_artifact.plaintext_sha256 <> p_package_sha256 then
    raise exception 'security-protocol package digest does not match the protected artifact';
  end if;
  if p_machine_mapping_sha256 !~ '^[0-9a-f]{64}$' or p_human_extract_sha256 !~ '^[0-9a-f]{64}$'
     or p_authority_profile_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'security-protocol component digest is invalid'; end if;
  if p_exact_release_commit_sha !~ '^[0-9a-f]{40}$' then raise exception 'security-protocol evidence must bind an exact release commit'; end if;
  if char_length(trim(coalesce(p_cmmc_bundle_id,''))) not between 8 and 240 then raise exception 'CMMC bundle identifier is required'; end if;
  if char_length(trim(coalesce(p_registered_by,''))) not between 3 and 255 or p_correlation_id is null then
    raise exception 'security-protocol registrar and correlation ID are required';
  end if;
  if p_mapped_objective_count <= 0 or p_mapped_objective_count <> p_technical_passed + p_technical_failed + p_technical_not_tested then
    raise exception 'security-protocol objective counts do not reconcile';
  end if;
  v_disposition := case
    when p_technical_failed > 0 then 'failed'
    when p_technical_not_tested > 0 then 'pending_evidence'
    else 'passed'
  end;
  v_canonical := jsonb_build_object(
    'protocolEvidenceId',v_id,'protectedArtifactId',p_protected_artifact_id,
    'cmmcSystemId','SYS-FDACS-DATABASE','cmmcBundleId',trim(p_cmmc_bundle_id),
    'exactReleaseCommitSha',p_exact_release_commit_sha,'packageSha256',p_package_sha256,
    'machineMappingSha256',p_machine_mapping_sha256,'humanExtractSha256',p_human_extract_sha256,
    'authorityProfileSha256',p_authority_profile_sha256,'rev2ObjectiveCount',320,
    'rev3ObjectiveCount',510,'mappedObjectiveCount',p_mapped_objective_count,
    'technicalPassed',p_technical_passed,'technicalFailed',p_technical_failed,
    'technicalNotTested',p_technical_not_tested,'technicalDisposition',v_disposition,
    'humanDisposition','pending','pendingHumanIsTechnicalFailure',false,
    'assessmentFinding','not_assessed','evidenceOrigin','product_supplied_evidence',
    'registeredBy',trim(p_registered_by),'correlationId',p_correlation_id,
    'registeredAt',v_registered_at
  );
  v_record_sha := encode(extensions.digest(convert_to(v_canonical::text,'UTF8'),'sha256'),'hex');

  insert into public.fdacs_class_d_security_protocol_evidence (
    protocol_evidence_id,protected_artifact_id,cmmc_system_id,cmmc_bundle_id,
    exact_release_commit_sha,package_sha256,machine_mapping_sha256,human_extract_sha256,
    authority_profile_sha256,rev2_objective_count,rev3_objective_count,mapped_objective_count,
    technical_passed,technical_failed,technical_not_tested,technical_disposition,
    human_disposition,pending_human_is_technical_failure,assessment_finding,evidence_origin,
    registered_by,correlation_id,record_sha256,registered_at
  ) values (
    v_id,p_protected_artifact_id,'SYS-FDACS-DATABASE',trim(p_cmmc_bundle_id),
    p_exact_release_commit_sha,p_package_sha256,p_machine_mapping_sha256,p_human_extract_sha256,
    p_authority_profile_sha256,320,510,p_mapped_objective_count,
    p_technical_passed,p_technical_failed,p_technical_not_tested,v_disposition,
    'pending',false,'not_assessed','product_supplied_evidence',trim(p_registered_by),
    p_correlation_id,v_record_sha,v_registered_at
  );

  perform public.fdacs_class_d_append_access_event(
    p_protected_artifact_id,null,'controlled_record_registered',p_registered_by,'compliance_admin',
    'Register exact-revision CMMC security-protocol evidence for the FDACS database',
    trim(p_cmmc_bundle_id),p_correlation_id,
    jsonb_build_object('recordType','security_protocol_evidence','recordId',v_id,
      'recordSha256',v_record_sha,'technicalDisposition',v_disposition,'humanDisposition','pending')
  );
  return jsonb_build_object(
    'protocolEvidenceId',v_id,'recordSha256',v_record_sha,
    'technicalDisposition',v_disposition,'humanDisposition','pending',
    'pendingHumanIsTechnicalFailure',false,'assessmentFinding','not_assessed'
  );
end;
$$;

create or replace function public.fdacs_class_d_verify_activation_evidence_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_row record;
  v_previous text := null;
  v_expected text;
  v_count bigint := 0;
  v_failures bigint := 0;
begin
  for v_row in select * from public.fdacs_class_d_activation_evidence order by event_sequence loop
    v_count := v_count + 1;
    v_expected := encode(extensions.digest(convert_to(jsonb_build_object(
      'gateName',v_row.gate_name,'outcome',v_row.outcome,'evidenceRef',v_row.evidence_ref,
      'evidenceSha256',v_row.evidence_sha256,'actorRef',v_row.actor_ref,
      'correlationId',v_row.correlation_id,'occurredAt',v_row.occurred_at,
      'previousEventSha256',coalesce(v_row.previous_event_sha256,'GENESIS')
    )::text,'UTF8'),'sha256'),'hex');
    if v_row.previous_event_sha256 is distinct from v_previous or v_row.event_sha256 <> v_expected then v_failures := v_failures + 1; end if;
    v_previous := v_row.event_sha256;
  end loop;
  return jsonb_build_object('chain','activation_evidence','valid',v_failures=0,'recordCount',v_count,'failureCount',v_failures,'headSha256',v_previous);
end;
$$;

create or replace function public.fdacs_class_d_verify_record_access_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_row record;
  v_previous text := null;
  v_expected text;
  v_count bigint := 0;
  v_failures bigint := 0;
begin
  for v_row in select * from public.fdacs_class_d_record_access_events order by event_sequence loop
    v_count := v_count + 1;
    v_expected := encode(extensions.digest(convert_to(jsonb_build_object(
      'artifactId',v_row.artifact_id,'enrollmentId',v_row.enrollment_id,
      'eventType',v_row.event_type,'actorRef',v_row.actor_ref,'actorRole',v_row.actor_role,
      'purpose',v_row.purpose,'requestReference',v_row.request_reference,
      'correlationId',v_row.correlation_id,'metadata',v_row.event_metadata,
      'occurredAt',v_row.occurred_at,'previousEventSha256',coalesce(v_row.previous_event_sha256,'GENESIS')
    )::text,'UTF8'),'sha256'),'hex');
    if v_row.previous_event_sha256 is distinct from v_previous or v_row.event_sha256 <> v_expected then v_failures := v_failures + 1; end if;
    v_previous := v_row.event_sha256;
  end loop;
  return jsonb_build_object('chain','record_access','valid',v_failures=0,'recordCount',v_count,'failureCount',v_failures,'headSha256',v_previous);
end;
$$;

create or replace function public.fdacs_class_d_verify_identity_provider_event_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_row record;
  v_previous text := null;
  v_expected text;
  v_count bigint := 0;
  v_failures bigint := 0;
begin
  for v_row in select * from public.fdacs_class_d_identity_verification_events order by event_sequence loop
    v_count := v_count + 1;
    v_expected := encode(extensions.digest(convert_to(jsonb_build_object(
      'verificationSessionId',v_row.verification_session_id,'providerEventId',v_row.provider_event_id,
      'status',v_row.status,'documentCheckStatus',v_row.document_check_status,
      'selfieCheckStatus',v_row.selfie_check_status,'providerErrorCode',v_row.provider_error_code,
      'providerOccurredAt',v_row.provider_occurred_at,'correlationId',v_row.correlation_id,
      'previousEventSha256',coalesce(v_row.previous_event_sha256,'GENESIS')
    )::text,'UTF8'),'sha256'),'hex');
    if v_row.previous_event_sha256 is distinct from v_previous or v_row.event_sha256 <> v_expected then v_failures := v_failures + 1; end if;
    v_previous := v_row.event_sha256;
  end loop;
  return jsonb_build_object('chain','identity_provider_events','valid',v_failures=0,'recordCount',v_count,'failureCount',v_failures,'headSha256',v_previous);
end;
$$;

create or replace function public.fdacs_class_d_verify_protected_artifact_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_row record;
  v_previous text := null;
  v_expected text;
  v_ciphertext_sha text;
  v_count bigint := 0;
  v_failures bigint := 0;
begin
  for v_row in select * from public.fdacs_class_d_protected_artifacts order by archived_at,artifact_id loop
    v_count := v_count + 1;
    v_ciphertext_sha := encode(extensions.digest(v_row.encrypted_payload,'sha256'),'hex');
    v_expected := encode(extensions.digest(convert_to(jsonb_build_object(
      'artifactId',v_row.artifact_id,'enrollmentId',v_row.enrollment_id,
      'idempotencyKey',v_row.idempotency_key,'artifactType',v_row.artifact_type,
      'classification',v_row.classification,'encryptionProfile',v_row.encryption_profile,
      'keyReference',v_row.key_reference,
      'ivSha256',encode(extensions.digest(v_row.initialization_vector,'sha256'),'hex'),
      'ciphertextSha256',v_row.ciphertext_sha256,'plaintextSha256',v_row.plaintext_sha256,
      'plaintextSizeBytes',v_row.plaintext_size_bytes,'contentType',v_row.content_type,
      'sourceSystem',v_row.source_system,'retentionAnchorDate',v_row.retention_anchor_date,
      'minimumRetainUntil',v_row.minimum_retain_until,'operationalRetainUntil',v_row.operational_retain_until,
      'legalHoldActive',v_row.legal_hold_active,'correlationId',v_row.correlation_id,
      'archivedBy',v_row.archived_by,'archivedAt',v_row.archived_at,
      'previousArtifactSha256',coalesce(v_row.previous_artifact_sha256,'GENESIS')
    )::text,'UTF8'),'sha256'),'hex');
    if v_row.previous_artifact_sha256 is distinct from v_previous
       or v_row.artifact_record_sha256 <> v_expected
       or v_row.ciphertext_sha256 <> v_ciphertext_sha then v_failures := v_failures + 1; end if;
    v_previous := v_row.artifact_record_sha256;
  end loop;
  return jsonb_build_object('chain','protected_artifacts','valid',v_failures=0,'recordCount',v_count,'failureCount',v_failures,'headSha256',v_previous);
end;
$$;

create or replace function public.fdacs_class_d_verify_investigator_export_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_row record;
  v_previous text := null;
  v_expected text;
  v_count bigint := 0;
  v_failures bigint := 0;
begin
  for v_row in select * from public.fdacs_class_d_investigator_audit_exports order by event_sequence loop
    v_count := v_count + 1;
    v_expected := encode(extensions.digest(convert_to(jsonb_build_object(
      'exportId',v_row.export_id,'eventType',v_row.event_type,'enrollmentId',v_row.enrollment_id,
      'exportSchema',v_row.export_schema,'requestReference',v_row.request_reference,
      'actorRef',v_row.actor_ref,'actorRole',v_row.actor_role,'purpose',v_row.purpose,
      'payloadSha256',v_row.payload_sha256,'protectedArtifactId',v_row.protected_artifact_id,
      'outcomeDetail',v_row.outcome_detail,'correlationId',v_row.correlation_id,
      'occurredAt',v_row.occurred_at,
      'previousEventSha256',coalesce(v_row.previous_event_sha256,'GENESIS')
    )::text,'UTF8'),'sha256'),'hex');
    if v_row.previous_event_sha256 is distinct from v_previous or v_row.event_sha256 <> v_expected then v_failures := v_failures + 1; end if;
    v_previous := v_row.event_sha256;
  end loop;
  return jsonb_build_object('chain','investigator_exports','valid',v_failures=0,'recordCount',v_count,'failureCount',v_failures,'headSha256',v_previous);
end;
$$;

create or replace function public.fdacs_class_d_generate_investigator_audit_export(
  p_enrollment_id uuid,
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_request_reference text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_export_id uuid := gen_random_uuid();
  v_generated_at timestamptz := clock_timestamp();
  v_payload jsonb;
  v_payload_sha text;
  v_identity_evidence jsonb;
  v_event_sha text;
begin
  if p_actor_role not in ('school_admin','compliance_admin','fdacs_investigator') then raise exception 'FDACS investigator audit access is unauthorized'; end if;
  if char_length(trim(coalesce(p_actor_ref,''))) not between 3 and 255 then raise exception 'FDACS audit actor is required'; end if;
  if char_length(trim(coalesce(p_purpose,''))) not between 3 and 500 then raise exception 'FDACS audit purpose is required'; end if;
  if char_length(trim(coalesce(p_request_reference,''))) not between 3 and 500 then raise exception 'FDACS investigator request reference is required'; end if;
  if p_correlation_id is null then raise exception 'FDACS audit correlation ID is required'; end if;
  if p_enrollment_id is not null and not exists (select 1 from public.fdacs_class_d_enrollments where id=p_enrollment_id) then
    raise exception 'FDACS audit enrollment scope is unavailable';
  end if;

  if p_enrollment_id is not null then
    v_identity_evidence := public.fdacs_class_d_identity_attendance_evidence_export(
      p_enrollment_id,p_actor_ref,p_actor_role,p_purpose,p_correlation_id
    );
  end if;

  select jsonb_build_object(
    'schema','obserra.fdacs.class-d.investigator-audit.v2',
    'exportId',v_export_id,
    'legalOwner','OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC',
    'providerProjectRef','ggkxgjhsbgbifiqrhavr',
    'classification',case when p_enrollment_id is null then 'internal_sensitive_non_pii' else 'regulated_student_pii' end,
    'generatedAt',v_generated_at,
    'requestReference',trim(p_request_reference),
    'enrollmentScope',p_enrollment_id,
    'authorities',coalesce((select jsonb_agg(jsonb_build_object(
      'authorityId',s.authority_id,'exactVersion',s.exact_version,'officialUrl',s.official_url,
      'effectiveOrRevisionDate',s.effective_or_revision_date,'retrievedOn',s.retrieved_on,
      'requirementSnapshotSha256',s.requirement_snapshot_sha256,'requirements',s.requirement_snapshot
    ) order by s.authority_id) from public.fdacs_class_d_record_authority_snapshots s),'[]'::jsonb),
    'retention',jsonb_build_object(
      'minimumYears',2,'operationalYears',3,'automaticDeletionEnabled',false,
      'legalHoldSupported',true,'source','F.A.C. 5N-1.140(5)'
    ),
    'securityProtocolEvidence',coalesce((select jsonb_agg(jsonb_build_object(
      'protocolEvidenceId',e.protocol_evidence_id,'cmmcSystemId',e.cmmc_system_id,
      'cmmcBundleId',e.cmmc_bundle_id,'exactReleaseCommitSha',e.exact_release_commit_sha,
      'packageSha256',e.package_sha256,'machineMappingSha256',e.machine_mapping_sha256,
      'humanExtractSha256',e.human_extract_sha256,'authorityProfileSha256',e.authority_profile_sha256,
      'mappedObjectiveCount',e.mapped_objective_count,'technicalPassed',e.technical_passed,
      'technicalFailed',e.technical_failed,'technicalNotTested',e.technical_not_tested,
      'technicalDisposition',e.technical_disposition,'humanDisposition',e.human_disposition,
      'pendingHumanIsTechnicalFailure',e.pending_human_is_technical_failure,
      'assessmentFinding',e.assessment_finding,'recordSha256',e.record_sha256,
      'registeredAt',e.registered_at
    ) order by e.registered_at,e.protocol_evidence_id) from public.fdacs_class_d_security_protocol_evidence e),'[]'::jsonb),
    'integrity',jsonb_build_object(
      'activationEvidence',public.fdacs_class_d_verify_activation_evidence_chain(),
      'recordAccess',public.fdacs_class_d_verify_record_access_chain(),
      'identityProviderEvents',public.fdacs_class_d_verify_identity_provider_event_chain(),
      'protectedArtifacts',public.fdacs_class_d_verify_protected_artifact_chain(),
      'investigatorExports',public.fdacs_class_d_verify_investigator_export_chain()
    ),
    'boundaryHealth',public.fdacs_class_d_boundary_health(),
    'archiveHealth',public.fdacs_class_d_record_archive_health(),
    'recordCounts',jsonb_build_object(
      'studentIdentities',(select count(*) from public.fdacs_class_d_student_identities),
      'enrollments',(select count(*) from public.fdacs_class_d_enrollments),
      'attendanceEntries',(select count(*) from public.fdacs_class_d_attendance_entries),
      'liveSessions',(select count(*) from public.fdacs_class_d_live_sessions),
      'identityVerificationSessions',(select count(*) from public.fdacs_class_d_identity_verification_sessions),
      'instructorIdentityAttestations',(select count(*) from public.fdacs_class_d_instructor_identity_attestations),
      'dailyIdentityCheckins',(select count(*) from public.fdacs_class_d_daily_identity_checkins),
      'dailyAttendanceAttestations',(select count(*) from public.fdacs_class_d_daily_attendance_attestations),
      'examAttempts',(select count(*) from public.fdacs_class_d_exam_attempts),
      'completionRecords',(select count(*) from public.fdacs_class_d_completion_records),
      'completionDocuments',(select count(*) from public.fdacs_class_d_completion_documents),
      'protectedArtifacts',(select count(*) from public.fdacs_class_d_protected_artifacts),
      'recordAccessEvents',(select count(*) from public.fdacs_class_d_record_access_events),
      'investigatorExportEvents',(select count(*) from public.fdacs_class_d_investigator_audit_exports)
    ),
    'studentRecord',case when p_enrollment_id is null then null else (
      select jsonb_build_object(
        'enrollment',jsonb_build_object(
          'enrollmentId',e.id,'courseId',e.course_id,'cohortId',e.cohort_id,
          'status',e.status,'enrolledAt',e.enrolled_at,'retentionReviewAfter',e.retention_review_after
        ),
        'identity',jsonb_build_object(
          'studentIdentityId',i.id,'legalName',i.legal_name,'dateOfBirth',i.date_of_birth,
          'identityStatus',i.identity_status,'verificationReference',i.verification_reference,
          'verifiedAt',i.verified_at
        ),
        'cohort',(select to_jsonb(c)-'instructor_clerk_user_ids'-'created_by_clerk_user_id' from public.fdacs_class_d_cohorts c where c.id=e.cohort_id),
        'liveSessions',coalesce((select jsonb_agg(to_jsonb(s)-'instructor_clerk_user_id' order by s.day,s.scheduled_start_at,s.id)
          from public.fdacs_class_d_live_sessions s where s.cohort_id=e.cohort_id),'[]'::jsonb),
        'attendanceEntries',coalesce((select jsonb_agg(to_jsonb(a)-'attested_by_clerk_user_id' order by a.day,a.created_at,a.id)
          from public.fdacs_class_d_attendance_entries a where a.enrollment_id=e.id),'[]'::jsonb),
        'instructionTimeEntries',coalesce((select jsonb_agg(to_jsonb(t)-'recorded_by_clerk_user_id' order by t.started_at,t.id)
          from public.fdacs_class_d_instruction_time_entries t where t.enrollment_id=e.id),'[]'::jsonb),
        'moduleProgress',coalesce((select jsonb_agg(to_jsonb(m) order by m.module_id)
          from public.fdacs_class_d_module_progress m where m.enrollment_id=e.id),'[]'::jsonb),
        'learningChecks',coalesce((select jsonb_agg(to_jsonb(l) order by l.module_id,l.attempt)
          from public.fdacs_class_d_learning_check_results l where l.enrollment_id=e.id),'[]'::jsonb),
        'examAttempts',coalesce((select jsonb_agg(jsonb_build_object(
          'examAttemptId',x.id,'status',x.status,'startedAt',x.started_at,
          'earliestSubmitAt',x.earliest_submit_at,'submittedAt',x.submitted_at,
          'score',x.score,'passed',x.passed,'monitoringStatus',x.monitoring_status,
          'interruptedAt',x.interrupted_at,'interruptionReason',x.interruption_reason,
          'invalidatedAt',x.invalidated_at,'invalidationReason',x.invalidation_reason,
          'correlationId',x.correlation_id
        ) order by x.started_at,x.id) from public.fdacs_class_d_exam_attempts x where x.enrollment_id=e.id),'[]'::jsonb),
        'completionRecords',coalesce((select jsonb_agg(to_jsonb(c)-'approved_by_clerk_user_id' order by c.approved_at,c.id)
          from public.fdacs_class_d_completion_records c where c.enrollment_id=e.id),'[]'::jsonb),
        'completionDocuments',coalesce((select jsonb_agg(to_jsonb(d)-'storage_bucket'-'storage_object_key'-'render_payload'-'issued_by_clerk_user_id' order by d.created_at,d.id)
          from public.fdacs_class_d_completion_documents d where d.enrollment_id=e.id),'[]'::jsonb),
        'recordHolds',coalesce((select jsonb_agg(to_jsonb(h)-'placed_by_clerk_user_id'-'released_by_clerk_user_id' order by h.placed_at,h.id)
          from public.fdacs_class_d_record_holds h where h.enrollment_id=e.id),'[]'::jsonb),
        'protectedArtifactCatalog',coalesce((select jsonb_agg(jsonb_build_object(
          'artifactId',a.artifact_id,'artifactType',a.artifact_type,'classification',a.classification,
          'ciphertextSha256',a.ciphertext_sha256,'plaintextSha256',a.plaintext_sha256,
          'minimumRetainUntil',a.minimum_retain_until,'operationalRetainUntil',a.operational_retain_until,
          'legalHoldActive',a.legal_hold_active,'recordSha256',a.artifact_record_sha256,'archivedAt',a.archived_at
        ) order by a.archived_at,a.artifact_id) from public.fdacs_class_d_protected_artifacts a where a.enrollment_id=e.id),'[]'::jsonb),
        'recordAccessEvents',coalesce((select jsonb_agg(jsonb_build_object(
          'eventSequence',a.event_sequence,'eventType',a.event_type,'actorRole',a.actor_role,
          'purpose',a.purpose,'requestReference',a.request_reference,'correlationId',a.correlation_id,
          'occurredAt',a.occurred_at,'previousEventSha256',a.previous_event_sha256,'eventSha256',a.event_sha256
        ) order by a.event_sequence) from public.fdacs_class_d_record_access_events a where a.enrollment_id=e.id),'[]'::jsonb),
        'identityAndDailyAttendanceEvidence',v_identity_evidence
      )
      from public.fdacs_class_d_enrollments e
      join public.fdacs_class_d_student_identities i on i.id=e.student_identity_id
      where e.id=p_enrollment_id
    ) end,
    'exclusions',jsonb_build_object(
      'identityDocumentImages',true,'selfieImages',true,'biometricTemplates',true,
      'authenticationSecrets',true,'paymentCardData',true,'examQuestions',true,'examAnswers',true,
      'applicationsWorkstreamData',true,'cui',true
    ),
    'artifactState','generated_unarchived',
    'findingEligibility',jsonb_build_object(
      'eligibleAsFinalFdacsRecordEvidence',false,
      'reason','The exact payload must first be application-envelope encrypted, archived, and finalized against its SHA-256 digest.',
      'cmmcAssessmentFinding','not_assessed'
    )
  ) into v_payload;

  v_payload_sha := encode(extensions.digest(convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  v_event_sha := public.fdacs_class_d_append_investigator_export_event(
    v_export_id,'generated',p_enrollment_id,p_request_reference,p_actor_ref,p_actor_role,
    p_purpose,v_payload_sha,null,'Exact payload generated; protected archival is required',p_correlation_id
  );
  perform public.fdacs_class_d_append_access_event(
    null,p_enrollment_id,'investigator_export_requested',p_actor_ref,p_actor_role,p_purpose,
    p_request_reference,p_correlation_id,
    jsonb_build_object('exportId',v_export_id,'payloadSha256',v_payload_sha,
      'exportSchema','obserra.fdacs.class-d.investigator-audit.v2')
  );
  return jsonb_build_object(
    'exportId',v_export_id,'payloadSha256',v_payload_sha,'payload',v_payload,
    'exportEventSha256',v_event_sha,'archivalRequired',true,
    'eligibleAsFinalFdacsRecordEvidence',false
  );
end;
$$;

create or replace function public.fdacs_class_d_finalize_investigator_audit_export(
  p_export_id uuid,
  p_protected_artifact_id uuid,
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_request_reference text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_generated public.fdacs_class_d_investigator_audit_exports%rowtype;
  v_artifact public.fdacs_class_d_protected_artifacts%rowtype;
  v_event_sha text;
  v_expected_classification text;
begin
  select * into v_generated from public.fdacs_class_d_investigator_audit_exports
  where export_id=p_export_id and event_type='generated';
  if not found then raise exception 'generated FDACS investigator export is unavailable'; end if;
  if exists (select 1 from public.fdacs_class_d_investigator_audit_exports where export_id=p_export_id and event_type='finalized') then
    raise exception 'FDACS investigator export is already finalized';
  end if;
  if p_actor_role not in ('school_admin','compliance_admin','fdacs_investigator') then raise exception 'FDACS investigator export finalization is unauthorized'; end if;
  if trim(p_request_reference) <> v_generated.request_reference then raise exception 'FDACS investigator request reference does not match generation'; end if;
  select * into v_artifact from public.fdacs_class_d_protected_artifacts where artifact_id=p_protected_artifact_id;
  if not found or v_artifact.artifact_type <> 'inspection_export'
     or v_artifact.enrollment_id is distinct from v_generated.enrollment_id
     or v_artifact.plaintext_sha256 <> v_generated.payload_sha256 then
    raise exception 'protected inspection export does not match the generated FDACS payload';
  end if;
  v_expected_classification := case
    when v_generated.enrollment_id is null then 'internal_sensitive_non_pii'
    else 'regulated_student_pii'
  end;
  if v_artifact.classification <> v_expected_classification then
    raise exception 'protected inspection export classification does not match its scope';
  end if;
  if v_artifact.minimum_retain_until < (v_artifact.retention_anchor_date + interval '2 years')::date
     or v_artifact.automatic_deletion_enabled then raise exception 'protected inspection export retention is invalid'; end if;

  v_event_sha := public.fdacs_class_d_append_investigator_export_event(
    p_export_id,'finalized',v_generated.enrollment_id,p_request_reference,p_actor_ref,p_actor_role,
    p_purpose,v_generated.payload_sha256,p_protected_artifact_id,
    'Exact payload digest matched the encrypted protected artifact',p_correlation_id
  );
  perform public.fdacs_class_d_append_access_event(
    p_protected_artifact_id,v_generated.enrollment_id,'investigator_export_completed',
    p_actor_ref,p_actor_role,p_purpose,p_request_reference,p_correlation_id,
    jsonb_build_object('exportId',p_export_id,'payloadSha256',v_generated.payload_sha256,
      'artifactRecordSha256',v_artifact.artifact_record_sha256,'exportEventSha256',v_event_sha)
  );
  return jsonb_build_object(
    'exportId',p_export_id,'payloadSha256',v_generated.payload_sha256,
    'protectedArtifactId',p_protected_artifact_id,
    'artifactRecordSha256',v_artifact.artifact_record_sha256,
    'exportEventSha256',v_event_sha,
    'minimumRetainUntil',v_artifact.minimum_retain_until,
    'operationalRetainUntil',v_artifact.operational_retain_until,
    'eligibleAsFinalFdacsRecordEvidence',true,
    'cmmcAssessmentFinding','not_assessed'
  );
end;
$$;

create or replace function public.fdacs_class_d_record_investigator_export_delivery(
  p_export_id uuid,
  p_actor_ref text,
  p_actor_role text,
  p_purpose text,
  p_request_reference text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_final public.fdacs_class_d_investigator_audit_exports%rowtype;
  v_event_sha text;
begin
  select * into v_final from public.fdacs_class_d_investigator_audit_exports
  where export_id=p_export_id and event_type='finalized';
  if not found then raise exception 'only a finalized FDACS investigator export can be delivered'; end if;
  if trim(p_request_reference) <> v_final.request_reference then raise exception 'FDACS investigator request reference does not match finalization'; end if;
  v_event_sha := public.fdacs_class_d_append_investigator_export_event(
    p_export_id,'delivered',v_final.enrollment_id,p_request_reference,p_actor_ref,p_actor_role,
    p_purpose,v_final.payload_sha256,v_final.protected_artifact_id,
    'Final protected export delivered through the controlled investigator-access process',p_correlation_id
  );
  return jsonb_build_object('exportId',p_export_id,'delivered',true,'deliveryEventSha256',v_event_sha);
end;
$$;

create or replace function public.fdacs_class_d_investigator_audit_health()
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'schema','obserra.fdacs.class-d.investigator-audit-health.v1',
    'legalOwner','OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC',
    'providerProjectRef','ggkxgjhsbgbifiqrhavr',
    'minimumRetentionYears',2,
    'automaticDeletionEnabled',false,
    'authoritySnapshotCount',(select count(*) from public.fdacs_class_d_record_authority_snapshots),
    'securityProtocolEvidenceCount',(select count(*) from public.fdacs_class_d_security_protocol_evidence),
    'securityProtocolTechnicalPassedCount',(select count(*) from public.fdacs_class_d_security_protocol_evidence where technical_disposition='passed'),
    'humanReviewDisposition','pending',
    'pendingHumanIsTechnicalFailure',false,
    'exportCounts',jsonb_build_object(
      'generated',(select count(*) from public.fdacs_class_d_investigator_audit_exports where event_type='generated'),
      'finalized',(select count(*) from public.fdacs_class_d_investigator_audit_exports where event_type='finalized'),
      'delivered',(select count(*) from public.fdacs_class_d_investigator_audit_exports where event_type='delivered'),
      'failed',(select count(*) from public.fdacs_class_d_investigator_audit_exports where event_type='failed'),
      'awaitingFinalization',(select count(*) from public.fdacs_class_d_investigator_audit_exports g
        where g.event_type='generated' and not exists (
          select 1 from public.fdacs_class_d_investigator_audit_exports f
          where f.export_id=g.export_id and f.event_type='finalized'
        ))
    ),
    'chains',jsonb_build_object(
      'activationEvidence',public.fdacs_class_d_verify_activation_evidence_chain(),
      'recordAccess',public.fdacs_class_d_verify_record_access_chain(),
      'identityProviderEvents',public.fdacs_class_d_verify_identity_provider_event_chain(),
      'protectedArtifacts',public.fdacs_class_d_verify_protected_artifact_chain(),
      'investigatorExports',public.fdacs_class_d_verify_investigator_export_chain()
    ),
    'browserTablePrivileges',(select count(*) from information_schema.role_table_grants
      where table_schema='public' and table_name in (
        'fdacs_class_d_record_authority_snapshots','fdacs_class_d_security_protocol_evidence',
        'fdacs_class_d_investigator_audit_exports'
      ) and grantee in ('anon','authenticated')),
    'findingEligibility',jsonb_build_object(
      'finalizedHashedExportsOnly',true,
      'exactRevisionSecurityProtocolEvidenceOnly',true,
      'assessorDeterminationsStoredHere',false
    )
  );
$$;

alter table public.fdacs_class_d_record_authority_snapshots enable row level security;
alter table public.fdacs_class_d_record_authority_snapshots force row level security;
alter table public.fdacs_class_d_security_protocol_evidence enable row level security;
alter table public.fdacs_class_d_security_protocol_evidence force row level security;
alter table public.fdacs_class_d_investigator_audit_exports enable row level security;
alter table public.fdacs_class_d_investigator_audit_exports force row level security;

revoke all on table public.fdacs_class_d_record_authority_snapshots from public,anon,authenticated,service_role;
revoke all on table public.fdacs_class_d_security_protocol_evidence from public,anon,authenticated,service_role;
revoke all on table public.fdacs_class_d_investigator_audit_exports from public,anon,authenticated,service_role;
revoke all on sequence public.fdacs_class_d_investigator_audit_exports_event_sequence_seq from public,anon,authenticated,service_role;

revoke all on function public.fdacs_class_d_append_investigator_export_event(uuid,text,uuid,text,text,text,text,text,uuid,text,uuid) from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_register_security_protocol_evidence(uuid,text,text,text,text,text,text,integer,integer,integer,integer,text,uuid) from public,anon,authenticated;
revoke all on function public.fdacs_class_d_verify_activation_evidence_chain() from public,anon,authenticated;
revoke all on function public.fdacs_class_d_verify_record_access_chain() from public,anon,authenticated;
revoke all on function public.fdacs_class_d_verify_identity_provider_event_chain() from public,anon,authenticated;
revoke all on function public.fdacs_class_d_verify_protected_artifact_chain() from public,anon,authenticated;
revoke all on function public.fdacs_class_d_verify_investigator_export_chain() from public,anon,authenticated;
revoke all on function public.fdacs_class_d_generate_investigator_audit_export(uuid,text,text,text,text,uuid) from public,anon,authenticated;
revoke all on function public.fdacs_class_d_finalize_investigator_audit_export(uuid,uuid,text,text,text,text,uuid) from public,anon,authenticated;
revoke all on function public.fdacs_class_d_record_investigator_export_delivery(uuid,text,text,text,text,uuid) from public,anon,authenticated;
revoke all on function public.fdacs_class_d_investigator_audit_health() from public,anon,authenticated;

grant execute on function public.fdacs_class_d_register_security_protocol_evidence(uuid,text,text,text,text,text,text,integer,integer,integer,integer,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_verify_activation_evidence_chain() to service_role;
grant execute on function public.fdacs_class_d_verify_record_access_chain() to service_role;
grant execute on function public.fdacs_class_d_verify_identity_provider_event_chain() to service_role;
grant execute on function public.fdacs_class_d_verify_protected_artifact_chain() to service_role;
grant execute on function public.fdacs_class_d_verify_investigator_export_chain() to service_role;
grant execute on function public.fdacs_class_d_generate_investigator_audit_export(uuid,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_finalize_investigator_audit_export(uuid,uuid,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_record_investigator_export_delivery(uuid,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_investigator_audit_health() to service_role;

comment on table public.fdacs_class_d_investigator_audit_exports is
  'Dedicated immutable FDACS investigator-export audit ledger. Payloads remain in the isolated PII boundary and become final evidence only after exact SHA-256 matching to an application-envelope-encrypted protected artifact.';
comment on table public.fdacs_class_d_security_protocol_evidence is
  'Exact-release CMMC SYS-FDACS-DATABASE mapping and technical test disposition used as FDACS proof of security protocols. Human review remains pending and independent; this table stores no assessor finding.';
comment on function public.fdacs_class_d_generate_investigator_audit_export(uuid,text,text,text,text,uuid) is
  'Generates a reproducible/transmittable FDACS audit payload, records its SHA-256, and fails closed as non-final until protected archival is completed.';

commit;
