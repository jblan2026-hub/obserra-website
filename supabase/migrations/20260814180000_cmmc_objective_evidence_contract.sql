-- Gate 37: objective-level, exact-revision CMMC evidence contract.
--
-- Existing v1 rows, if any, remain immutable legacy records and are never
-- finding-eligible. New writes must use cmmc_archive_evidence_v2 and supply the
-- complete governing-source, system, objective, ownership, test, scope, and
-- claim-boundary contract. This archive remains PUBLIC/INTERNAL_NON_CUI only.

alter table public.cmmc_evidence_archive
  add column if not exists evidence_contract_version text not null default 'legacy.v1',
  add column if not exists bundle_state text,
  add column if not exists authority_profile_id text,
  add column if not exists authority_profile_sha256 text,
  add column if not exists evidence_schema_sha256 text,
  add column if not exists mapping_source_sha256 text,
  add column if not exists generator_sha256 text,
  add column if not exists machine_readable_artifact_path text,
  add column if not exists machine_readable_artifact_sha256 text,
  add column if not exists human_readable_extract_path text,
  add column if not exists human_readable_extract_sha256 text,
  add column if not exists paired_digest_manifest_path text,
  add column if not exists paired_digest_manifest_sha256 text,
  add column if not exists baseline_authority_ids text[],
  add column if not exists system_ids text[],
  add column if not exists objective_ids text[],
  add column if not exists evidence_origin text,
  add column if not exists artifact_state text,
  add column if not exists artifact_owner_legal_name text,
  add column if not exists artifact_owner_role text,
  add column if not exists scope_statement text,
  add column if not exists claim_boundary text,
  add column if not exists target_revision_sha text,
  add column if not exists test_method text,
  add column if not exists test_result text,
  add column if not exists test_result_sha256 text,
  add column if not exists technical_result_state text,
  add column if not exists human_assessment_state text,
  add column if not exists pending_human_review_is_failure boolean not null default false,
  add column if not exists operational_disposition text,
  add column if not exists finding_eligible boolean not null default false,
  add column if not exists assessment_finding text not null default 'not_assessed';

alter table public.cmmc_evidence_archive
  add column if not exists evidence_contract jsonb;

alter table public.cmmc_evidence_archive
  drop constraint if exists cmmc_evidence_archive_controls;

alter table public.cmmc_evidence_archive
  add constraint cmmc_evidence_archive_controls check (
    cardinality(control_ids) between 1 and 207 and array_position(control_ids, null) is null
  );

alter table public.cmmc_evidence_archive
  drop constraint if exists cmmc_evidence_archive_v2_contract;

alter table public.cmmc_evidence_archive
  add constraint cmmc_evidence_archive_v2_contract check (
    (
      evidence_contract_version = 'legacy.v1' and
      finding_eligible = false and
      assessment_finding = 'not_assessed'
    ) or (
      evidence_contract_version = 'obserra.cmmc.evidence.v2' and
      jsonb_typeof(evidence_contract) = 'object' and
      bundle_state in ('final_release_evidence', 'final_assessor_import') and
      authority_profile_id ~ '^[a-z0-9][a-z0-9._:-]{7,199}$' and
      authority_profile_sha256 ~ '^[0-9a-f]{64}$' and
      evidence_schema_sha256 ~ '^[0-9a-f]{64}$' and
      mapping_source_sha256 ~ '^[0-9a-f]{64}$' and
      generator_sha256 ~ '^[0-9a-f]{64}$' and
      machine_readable_artifact_path = 'docs/compliance/CMMC-SYSTEM-EVIDENCE.json' and
      machine_readable_artifact_sha256 ~ '^[0-9a-f]{64}$' and
      human_readable_extract_path = 'docs/compliance/CMMC-SYSTEM-EVIDENCE.md' and
      human_readable_extract_sha256 ~ '^[0-9a-f]{64}$' and
      machine_readable_artifact_sha256 <> human_readable_extract_sha256 and
      paired_digest_manifest_path = 'docs/compliance/CMMC-SYSTEM-EVIDENCE.sha256' and
      paired_digest_manifest_sha256 ~ '^[0-9a-f]{64}$' and
      cardinality(baseline_authority_ids) between 4 and 12 and
      array_position(baseline_authority_ids, null) is null and
      cardinality(system_ids) between 1 and 100 and
      array_position(system_ids, null) is null and
      cardinality(objective_ids) between 1 and 10000 and
      array_position(objective_ids, null) is null and
      evidence_origin in (
        'product_supplied_evidence',
        'organization_evidence',
        'assessor_determination',
        'customer_responsibility'
      ) and
      artifact_state = 'final' and
      (
        (evidence_origin = 'assessor_determination' and char_length(artifact_owner_legal_name) between 2 and 300) or
        (evidence_origin <> 'assessor_determination' and artifact_owner_legal_name = 'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC')
      ) and
      char_length(artifact_owner_role) between 2 and 200 and
      char_length(scope_statement) between 10 and 4000 and
      char_length(claim_boundary) between 10 and 4000 and
      target_revision_sha ~ '^[0-9a-f]{40}$' and
      release_sha = target_revision_sha and
      test_method in ('examine', 'interview', 'test') and
      test_result in ('passed', 'failed', 'not_run', 'not_applicable') and
      (test_result_sha256 is null or test_result_sha256 ~ '^[0-9a-f]{64}$') and
      technical_result_state in ('not_tested', 'passed', 'failed', 'not_applicable') and
      human_assessment_state in ('pending', 'completed', 'not_required') and
      pending_human_review_is_failure = false and
      operational_disposition in (
        'operational_technical_controls_active',
        'operational_with_pending_human_review',
        'fail_closed_pending_mandatory_prerequisite',
        'not_operational',
        'scope_dependent'
      ) and
      assessment_finding in ('not_assessed', 'met', 'not_met', 'not_applicable') and
      (
        finding_eligible = false or (
          test_result = 'passed' and
          test_result_sha256 is not null and
          technical_result_state = 'passed'
        )
      ) and
      (
        evidence_origin = 'assessor_determination' or
        assessment_finding = 'not_assessed'
      ) and
      (
        evidence_origin <> 'assessor_determination' or (
          bundle_state = 'final_assessor_import' and
          human_assessment_state = 'completed'
        )
      )
    )
  );

create index if not exists cmmc_evidence_archive_objective_ids_idx
  on public.cmmc_evidence_archive using gin (objective_ids)
  where evidence_contract_version = 'obserra.cmmc.evidence.v2';
create index if not exists cmmc_evidence_archive_system_ids_idx
  on public.cmmc_evidence_archive using gin (system_ids)
  where evidence_contract_version = 'obserra.cmmc.evidence.v2';
create index if not exists cmmc_evidence_archive_target_revision_idx
  on public.cmmc_evidence_archive (target_revision_sha, archived_at desc)
  where evidence_contract_version = 'obserra.cmmc.evidence.v2';

drop function if exists public.cmmc_archive_evidence(
  text,
  text[],
  text,
  text,
  text,
  bytea,
  text,
  timestamptz,
  text,
  text,
  jsonb,
  text,
  uuid
);

create or replace function public.cmmc_archive_evidence_v2(
  p_evidence_ref text,
  p_control_ids text[],
  p_title text,
  p_artifact_name text,
  p_content_type text,
  p_artifact_base64 text,
  p_source_system text,
  p_source_created_at timestamptz,
  p_actor_ref text,
  p_evidence_contract jsonb,
  p_release_sha text,
  p_evidence_metadata jsonb default '{}'::jsonb,
  p_classification text default 'internal_non_cui',
  p_correlation_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_archive_id uuid;
  v_archived_at timestamptz := clock_timestamp();
  v_payload bytea;
  v_artifact_sha256 text;
  v_previous_chain_sha256 text;
  v_chain_sha256 text;
  v_existing public.cmmc_evidence_archive%rowtype;
  v_canonical jsonb;
  v_baseline_authority_ids text[];
  v_system_ids text[];
  v_objective_ids text[];
  v_finding_eligible boolean;
  v_pending_human_review_is_failure boolean;
  v_package jsonb;
  v_machine_file jsonb;
  v_human_file jsonb;
  v_manifest_file jsonb;
  v_expected_manifest text;
begin
  if p_evidence_ref is null or p_evidence_ref !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,199}$' then
    raise exception 'CMMC evidence reference is invalid';
  end if;
  if p_control_ids is null or cardinality(p_control_ids) not between 1 and 207 or
     array_position(p_control_ids, null) is not null or
     exists (
       select 1 from unnest(p_control_ids) as control_id
       where control_id !~ '^(3\.([1-9]|1[0-4])\.[0-9]+|03\.(0[1-9]|1[0-7])\.[0-9]{2})$'
     ) or
     cardinality(p_control_ids) <> (select count(distinct control_id) from unnest(p_control_ids) as control_id) then
    raise exception 'CMMC evidence control identifiers are invalid';
  end if;
  if char_length(trim(coalesce(p_title, ''))) not between 3 and 300 then
    raise exception 'CMMC evidence title is invalid';
  end if;
  if char_length(trim(coalesce(p_artifact_name, ''))) not between 1 and 255 then
    raise exception 'CMMC evidence artifact name is invalid';
  end if;
  if p_content_type is null or lower(p_content_type) !~ '^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$' then
    raise exception 'CMMC evidence content type is invalid';
  end if;
  if p_artifact_base64 is null or char_length(p_artifact_base64) not between 4 and 13981016 or
     p_artifact_base64 !~ '^[A-Za-z0-9+/]+={0,2}$' then
    raise exception 'CMMC evidence artifact base64 is invalid';
  end if;
  begin
    v_payload := decode(p_artifact_base64, 'base64');
  exception when others then
    raise exception 'CMMC evidence artifact base64 cannot be decoded';
  end;
  if octet_length(v_payload) not between 1 and 10485760 then
    raise exception 'CMMC evidence artifact must contain between 1 byte and 10 MiB';
  end if;
  begin
    v_package := convert_from(v_payload, 'UTF8')::jsonb;
  exception when others then
    raise exception 'CMMC evidence package must be valid UTF-8 JSON';
  end;
  if char_length(trim(coalesce(p_source_system, ''))) not between 2 and 200 then
    raise exception 'CMMC evidence source system is invalid';
  end if;
  if p_source_created_at is null or p_source_created_at > clock_timestamp() + interval '5 minutes' then
    raise exception 'CMMC evidence source timestamp is invalid';
  end if;
  if char_length(trim(coalesce(p_actor_ref, ''))) not between 3 and 255 then
    raise exception 'CMMC evidence actor reference is invalid';
  end if;
  if p_release_sha is null or p_release_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'CMMC evidence release SHA is invalid';
  end if;
  if p_evidence_metadata is null or jsonb_typeof(p_evidence_metadata) <> 'object' or
     octet_length(p_evidence_metadata::text) > 65536 then
    raise exception 'CMMC evidence metadata is invalid';
  end if;
  if p_classification not in ('public', 'internal_non_cui') then
    raise exception 'CUI and secret-class evidence are not authorized for this archive';
  end if;
  if p_evidence_contract is null or jsonb_typeof(p_evidence_contract) <> 'object' or
     octet_length(p_evidence_contract::text) > 262144 then
    raise exception 'CMMC evidence contract is invalid';
  end if;

  if jsonb_typeof(p_evidence_contract -> 'baselineAuthorityIds') <> 'array' or
     jsonb_typeof(p_evidence_contract -> 'systemIds') <> 'array' or
     jsonb_typeof(p_evidence_contract -> 'objectiveIds') <> 'array' then
    raise exception 'CMMC evidence contract authority, system, and objective mappings are required';
  end if;
  v_baseline_authority_ids := array(select jsonb_array_elements_text(p_evidence_contract -> 'baselineAuthorityIds'));
  v_system_ids := array(select jsonb_array_elements_text(p_evidence_contract -> 'systemIds'));
  v_objective_ids := array(select jsonb_array_elements_text(p_evidence_contract -> 'objectiveIds'));
  if cardinality(v_baseline_authority_ids) not between 4 and 12 or
     cardinality(v_baseline_authority_ids) <> (select count(distinct value) from unnest(v_baseline_authority_ids) as value) or
     not v_baseline_authority_ids @> array[
       '32-cfr-part-170-2026-08-12',
       'dod-cmmc-l2-assessment-guide-v2.13-2024-09',
       'nist-sp-800-171r2-upd1',
       'nist-sp-800-171a-june-2018'
     ]::text[] then
    raise exception 'CMMC evidence baseline authority mappings are invalid';
  end if;
  if cardinality(v_system_ids) not between 1 and 100 or
     cardinality(v_system_ids) <> (select count(distinct value) from unnest(v_system_ids) as value) or
     exists (select 1 from unnest(v_system_ids) as value where value !~ '^SYS-[A-Z0-9-]{2,40}$') then
    raise exception 'CMMC evidence system mappings are invalid';
  end if;
  if cardinality(v_objective_ids) not between 1 and 10000 or
     cardinality(v_objective_ids) <> (select count(distinct value) from unnest(v_objective_ids) as value) or
     exists (select 1 from unnest(v_objective_ids) as value where char_length(value) not between 3 and 100) then
    raise exception 'CMMC evidence objective mappings are invalid';
  end if;

  if p_evidence_contract ->> 'pendingHumanReviewIsFailure' not in ('true', 'false') or
     p_evidence_contract ->> 'findingEligible' not in ('true', 'false') then
    raise exception 'CMMC evidence boolean dispositions are invalid';
  end if;
  v_pending_human_review_is_failure := (p_evidence_contract ->> 'pendingHumanReviewIsFailure')::boolean;
  v_finding_eligible := (p_evidence_contract ->> 'findingEligible')::boolean;
  if v_pending_human_review_is_failure then
    raise exception 'Pending human review cannot be recorded as a technical failure';
  end if;
  if p_evidence_contract ->> 'evidenceContractVersion' <> 'obserra.cmmc.evidence.v2' or
     p_evidence_contract ->> 'bundleState' not in ('final_release_evidence', 'final_assessor_import') or
     p_evidence_contract ->> 'authorityProfileId' !~ '^[a-z0-9][a-z0-9._:-]{7,199}$' or
     p_evidence_contract ->> 'authorityProfileSha256' !~ '^[0-9a-f]{64}$' or
     p_evidence_contract ->> 'evidenceSchemaSha256' !~ '^[0-9a-f]{64}$' or
     p_evidence_contract ->> 'mappingSourceSha256' !~ '^[0-9a-f]{64}$' or
     p_evidence_contract ->> 'generatorSha256' !~ '^[0-9a-f]{64}$' or
     p_evidence_contract ->> 'machineReadableArtifactPath' <> 'docs/compliance/CMMC-SYSTEM-EVIDENCE.json' or
     p_evidence_contract ->> 'machineReadableArtifactSha256' !~ '^[0-9a-f]{64}$' or
     p_evidence_contract ->> 'humanReadableExtractPath' <> 'docs/compliance/CMMC-SYSTEM-EVIDENCE.md' or
     p_evidence_contract ->> 'humanReadableExtractSha256' !~ '^[0-9a-f]{64}$' or
     p_evidence_contract ->> 'machineReadableArtifactSha256' = p_evidence_contract ->> 'humanReadableExtractSha256' or
     p_evidence_contract ->> 'pairedDigestManifestPath' <> 'docs/compliance/CMMC-SYSTEM-EVIDENCE.sha256' or
     p_evidence_contract ->> 'pairedDigestManifestSha256' !~ '^[0-9a-f]{64}$' or
     p_evidence_contract ->> 'evidenceOrigin' not in (
       'product_supplied_evidence',
       'organization_evidence',
       'assessor_determination',
       'customer_responsibility'
     ) or
     p_evidence_contract ->> 'artifactState' <> 'final' or
     char_length(p_evidence_contract ->> 'artifactOwnerRole') not between 2 and 200 or
     char_length(p_evidence_contract ->> 'scopeStatement') not between 10 and 4000 or
     char_length(p_evidence_contract ->> 'claimBoundary') not between 10 and 4000 or
     p_evidence_contract ->> 'targetRevisionSha' <> p_release_sha or
     p_evidence_contract ->> 'testMethod' not in ('examine', 'interview', 'test') or
     p_evidence_contract ->> 'testResult' not in ('passed', 'failed', 'not_run', 'not_applicable') or
     p_evidence_contract ->> 'technicalResultState' not in ('not_tested', 'passed', 'failed', 'not_applicable') or
     p_evidence_contract ->> 'humanAssessmentState' not in ('pending', 'completed', 'not_required') or
     p_evidence_contract ->> 'operationalDisposition' not in (
       'operational_technical_controls_active',
       'operational_with_pending_human_review',
       'fail_closed_pending_mandatory_prerequisite',
       'not_operational',
       'scope_dependent'
     ) or
     p_evidence_contract ->> 'assessmentFinding' not in ('not_assessed', 'met', 'not_met', 'not_applicable') then
    raise exception 'CMMC evidence contract required fields are invalid';
  end if;
  if p_evidence_contract ->> 'evidenceOrigin' <> 'assessor_determination' and
     p_evidence_contract ->> 'artifactOwnerLegalName' <> 'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC' then
    raise exception 'Non-assessor evidence must use the complete OBSERRA legal owner name';
  end if;
  if p_evidence_contract ->> 'evidenceOrigin' = 'assessor_determination' and
     char_length(p_evidence_contract ->> 'artifactOwnerLegalName') not between 2 and 300 then
    raise exception 'Assessor evidence must identify its assessor legal owner';
  end if;
  if p_evidence_contract ? 'testResultSha256' and
     p_evidence_contract ->> 'testResultSha256' is not null and
     p_evidence_contract ->> 'testResultSha256' !~ '^[0-9a-f]{64}$' then
    raise exception 'CMMC evidence test-result hash is invalid';
  end if;
  if v_finding_eligible and (
     p_evidence_contract ->> 'testResult' <> 'passed' or
     p_evidence_contract ->> 'technicalResultState' <> 'passed' or
     p_evidence_contract ->> 'testResultSha256' !~ '^[0-9a-f]{64}$') then
    raise exception 'Finding-eligible evidence requires a passed exact-revision technical result and result hash';
  end if;
  if p_evidence_contract ->> 'evidenceOrigin' <> 'assessor_determination' and
     p_evidence_contract ->> 'assessmentFinding' <> 'not_assessed' then
    raise exception 'Only an assessor determination may record an assessment finding';
  end if;
  if p_evidence_contract ->> 'evidenceOrigin' = 'assessor_determination' and (
     p_evidence_contract ->> 'bundleState' <> 'final_assessor_import' or
     p_evidence_contract ->> 'humanAssessmentState' <> 'completed') then
    raise exception 'Assessor evidence requires a completed final assessor import';
  end if;

  if v_package ->> 'schemaVersion' <> '1.0' or
     v_package ->> 'packageState' <> 'final' or
     v_package ->> 'legalOwner' <> 'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC' or
     v_package ->> 'releaseSha' <> p_release_sha or
     v_package ->> 'classification' <> 'internal_non_cui' or
     coalesce((v_package ->> 'containsCui')::boolean, true) or
     coalesce((v_package ->> 'containsPersonalData')::boolean, true) or
     coalesce((v_package ->> 'containsPaymentData')::boolean, true) or
     coalesce((v_package ->> 'containsSecretMaterial')::boolean, true) or
     v_package ->> 'retentionMode' <> 'indefinite' or
     coalesce((v_package ->> 'automaticDeletionEnabled')::boolean, true) or
     jsonb_typeof(v_package -> 'files') <> 'array' then
    raise exception 'CMMC evidence package envelope is invalid';
  end if;

  select item into v_machine_file
  from jsonb_array_elements(v_package -> 'files') as item
  where item ->> 'path' = p_evidence_contract ->> 'machineReadableArtifactPath';
  select item into v_human_file
  from jsonb_array_elements(v_package -> 'files') as item
  where item ->> 'path' = p_evidence_contract ->> 'humanReadableExtractPath';
  select item into v_manifest_file
  from jsonb_array_elements(v_package -> 'files') as item
  where item ->> 'path' = p_evidence_contract ->> 'pairedDigestManifestPath';

  if v_machine_file is null or v_human_file is null or v_manifest_file is null or
     v_machine_file ->> 'mediaType' <> 'application/json' or
     v_human_file ->> 'mediaType' <> 'text/markdown' or
     v_manifest_file ->> 'mediaType' <> 'text/plain' or
     v_machine_file ->> 'encoding' <> 'base64' or
     v_human_file ->> 'encoding' <> 'base64' or
     v_manifest_file ->> 'encoding' <> 'base64' or
     v_machine_file ->> 'sha256' <> p_evidence_contract ->> 'machineReadableArtifactSha256' or
     v_human_file ->> 'sha256' <> p_evidence_contract ->> 'humanReadableExtractSha256' or
     v_manifest_file ->> 'sha256' <> p_evidence_contract ->> 'pairedDigestManifestSha256' then
    raise exception 'CMMC evidence machine/human artifact pair is incomplete or mismatched';
  end if;

  begin
    if encode(extensions.digest(decode(v_machine_file ->> 'content', 'base64'), 'sha256'), 'hex') <>
         p_evidence_contract ->> 'machineReadableArtifactSha256' or
       encode(extensions.digest(decode(v_human_file ->> 'content', 'base64'), 'sha256'), 'hex') <>
         p_evidence_contract ->> 'humanReadableExtractSha256' or
       encode(extensions.digest(decode(v_manifest_file ->> 'content', 'base64'), 'sha256'), 'hex') <>
         p_evidence_contract ->> 'pairedDigestManifestSha256' then
      raise exception 'CMMC evidence machine/human artifact content hash verification failed';
    end if;
    v_expected_manifest :=
      (p_evidence_contract ->> 'machineReadableArtifactSha256') || '  CMMC-SYSTEM-EVIDENCE.json' || chr(10) ||
      (p_evidence_contract ->> 'humanReadableExtractSha256') || '  CMMC-SYSTEM-EVIDENCE.md' || chr(10);
    if left(
         convert_from(decode(v_manifest_file ->> 'content', 'base64'), 'UTF8'),
         char_length(v_expected_manifest)
       ) <> v_expected_manifest then
      raise exception 'CMMC evidence paired digest manifest does not bind the machine and human views';
    end if;
  exception when invalid_text_representation or character_not_in_repertoire then
    raise exception 'CMMC evidence paired files contain invalid base64 or UTF-8';
  end;

  v_artifact_sha256 := encode(extensions.digest(v_payload, 'sha256'), 'hex');

  perform pg_advisory_xact_lock(hashtext('public.cmmc_evidence_archive'));
  select * into v_existing
  from public.cmmc_evidence_archive
  where evidence_ref = p_evidence_ref;

  if found then
    if v_existing.artifact_sha256 <> v_artifact_sha256 or
       v_existing.target_revision_sha <> p_release_sha or
       v_existing.evidence_contract_version <> 'obserra.cmmc.evidence.v2' then
      raise exception 'CMMC evidence reference already exists with a different artifact, revision, or contract';
    end if;
    return jsonb_build_object(
      'archiveId', v_existing.archive_id,
      'evidenceRef', v_existing.evidence_ref,
      'artifactSha256', v_existing.artifact_sha256,
      'chainSha256', v_existing.chain_sha256,
      'retentionMode', v_existing.retention_mode,
      'legalHoldActive', v_existing.legal_hold_active,
      'findingEligible', v_existing.finding_eligible,
      'archivedAt', v_existing.archived_at,
      'idempotentReplay', true
    );
  end if;

  select chain_sha256 into v_previous_chain_sha256
  from public.cmmc_evidence_archive
  order by sequence_id desc
  limit 1;

  v_archive_id := gen_random_uuid();
  v_canonical := jsonb_build_object(
    'archiveId', v_archive_id,
    'evidenceRef', p_evidence_ref,
    'controlIds', p_control_ids,
    'title', trim(p_title),
    'artifactName', trim(p_artifact_name),
    'contentType', lower(p_content_type),
    'artifactSha256', v_artifact_sha256,
    'classification', p_classification,
    'sourceSystem', trim(p_source_system),
    'sourceCreatedAt', p_source_created_at,
    'actorRef', trim(p_actor_ref),
    'releaseSha', p_release_sha,
    'correlationId', p_correlation_id,
    'metadata', p_evidence_metadata,
    'evidenceContract', p_evidence_contract,
    'retentionMode', 'indefinite',
    'legalHoldActive', true,
    'archivedAt', v_archived_at,
    'previousChainSha256', coalesce(v_previous_chain_sha256, 'GENESIS')
  );
  v_chain_sha256 := encode(
    extensions.digest(convert_to(v_canonical::text, 'UTF8'), 'sha256'),
    'hex'
  );

  insert into public.cmmc_evidence_archive (
    archive_id,
    evidence_ref,
    control_ids,
    title,
    artifact_name,
    content_type,
    artifact_payload,
    artifact_sha256,
    classification,
    source_system,
    source_created_at,
    actor_ref,
    release_sha,
    correlation_id,
    evidence_metadata,
    retention_mode,
    retain_until,
    legal_hold_active,
    automatic_deletion_enabled,
    destruction_authority,
    archived_at,
    previous_chain_sha256,
    chain_sha256,
    evidence_contract_version,
    bundle_state,
    authority_profile_id,
    authority_profile_sha256,
    evidence_schema_sha256,
    mapping_source_sha256,
    generator_sha256,
    machine_readable_artifact_path,
    machine_readable_artifact_sha256,
    human_readable_extract_path,
    human_readable_extract_sha256,
    paired_digest_manifest_path,
    paired_digest_manifest_sha256,
    baseline_authority_ids,
    system_ids,
    objective_ids,
    evidence_origin,
    artifact_state,
    artifact_owner_legal_name,
    artifact_owner_role,
    scope_statement,
    claim_boundary,
    target_revision_sha,
    test_method,
    test_result,
    test_result_sha256,
    technical_result_state,
    human_assessment_state,
    pending_human_review_is_failure,
    operational_disposition,
    finding_eligible,
    assessment_finding,
    evidence_contract
  ) values (
    v_archive_id,
    p_evidence_ref,
    p_control_ids,
    trim(p_title),
    trim(p_artifact_name),
    lower(p_content_type),
    v_payload,
    v_artifact_sha256,
    p_classification,
    trim(p_source_system),
    p_source_created_at,
    trim(p_actor_ref),
    p_release_sha,
    p_correlation_id,
    p_evidence_metadata,
    'indefinite',
    null,
    true,
    false,
    'none',
    v_archived_at,
    v_previous_chain_sha256,
    v_chain_sha256,
    'obserra.cmmc.evidence.v2',
    p_evidence_contract ->> 'bundleState',
    p_evidence_contract ->> 'authorityProfileId',
    p_evidence_contract ->> 'authorityProfileSha256',
    p_evidence_contract ->> 'evidenceSchemaSha256',
    p_evidence_contract ->> 'mappingSourceSha256',
    p_evidence_contract ->> 'generatorSha256',
    p_evidence_contract ->> 'machineReadableArtifactPath',
    p_evidence_contract ->> 'machineReadableArtifactSha256',
    p_evidence_contract ->> 'humanReadableExtractPath',
    p_evidence_contract ->> 'humanReadableExtractSha256',
    p_evidence_contract ->> 'pairedDigestManifestPath',
    p_evidence_contract ->> 'pairedDigestManifestSha256',
    v_baseline_authority_ids,
    v_system_ids,
    v_objective_ids,
    p_evidence_contract ->> 'evidenceOrigin',
    p_evidence_contract ->> 'artifactState',
    p_evidence_contract ->> 'artifactOwnerLegalName',
    p_evidence_contract ->> 'artifactOwnerRole',
    p_evidence_contract ->> 'scopeStatement',
    p_evidence_contract ->> 'claimBoundary',
    p_evidence_contract ->> 'targetRevisionSha',
    p_evidence_contract ->> 'testMethod',
    p_evidence_contract ->> 'testResult',
    nullif(p_evidence_contract ->> 'testResultSha256', ''),
    p_evidence_contract ->> 'technicalResultState',
    p_evidence_contract ->> 'humanAssessmentState',
    v_pending_human_review_is_failure,
    p_evidence_contract ->> 'operationalDisposition',
    v_finding_eligible,
    p_evidence_contract ->> 'assessmentFinding',
    p_evidence_contract
  );

  perform public.cmmc_append_evidence_event(
    v_archive_id,
    'archived',
    trim(p_actor_ref),
    'Final exact-revision CMMC evidence package archived under indefinite retention',
    jsonb_build_object(
      'evidenceRef', p_evidence_ref,
      'releaseSha', p_release_sha,
      'artifactSha256', v_artifact_sha256,
      'authorityProfileSha256', p_evidence_contract ->> 'authorityProfileSha256',
      'systemCount', cardinality(v_system_ids),
      'objectiveCount', cardinality(v_objective_ids),
      'findingEligible', v_finding_eligible
    )
  );

  return jsonb_build_object(
    'archiveId', v_archive_id,
    'evidenceRef', p_evidence_ref,
    'artifactSha256', v_artifact_sha256,
    'chainSha256', v_chain_sha256,
    'retentionMode', 'indefinite',
    'legalHoldActive', true,
    'findingEligible', v_finding_eligible,
    'archivedAt', v_archived_at,
    'idempotentReplay', false
  );
end;
$$;

create or replace function public.cmmc_list_evidence_v2(
  p_actor_ref text,
  p_access_purpose text,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  archive_id uuid,
  sequence_id bigint,
  evidence_ref text,
  title text,
  artifact_name text,
  artifact_size_bytes bigint,
  artifact_sha256 text,
  classification text,
  source_system text,
  source_created_at timestamptz,
  target_revision_sha text,
  authority_profile_id text,
  authority_profile_sha256 text,
  evidence_schema_sha256 text,
  mapping_source_sha256 text,
  generator_sha256 text,
  machine_readable_artifact_path text,
  machine_readable_artifact_sha256 text,
  human_readable_extract_path text,
  human_readable_extract_sha256 text,
  paired_digest_manifest_path text,
  paired_digest_manifest_sha256 text,
  baseline_authority_ids text[],
  system_ids text[],
  objective_ids text[],
  evidence_origin text,
  artifact_state text,
  artifact_owner_legal_name text,
  artifact_owner_role text,
  test_method text,
  test_result text,
  test_result_sha256 text,
  technical_result_state text,
  human_assessment_state text,
  pending_human_review_is_failure boolean,
  operational_disposition text,
  finding_eligible boolean,
  assessment_finding text,
  retention_mode text,
  legal_hold_active boolean,
  archived_at timestamptz,
  previous_chain_sha256 text,
  chain_sha256 text,
  evidence_contract jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(trim(coalesce(p_actor_ref, ''))) not between 3 and 255 or
     char_length(trim(coalesce(p_access_purpose, ''))) not between 3 and 500 then
    raise exception 'CMMC evidence catalog actor or purpose is invalid';
  end if;
  if p_limit not between 1 and 500 or p_offset < 0 then
    raise exception 'CMMC evidence catalog pagination is invalid';
  end if;

  perform public.cmmc_append_evidence_event(
    null,
    'catalog_read',
    trim(p_actor_ref),
    trim(p_access_purpose),
    jsonb_build_object('contractVersion', 'obserra.cmmc.evidence.v2', 'limit', p_limit, 'offset', p_offset)
  );

  return query
    select
      archive.archive_id,
      archive.sequence_id,
      archive.evidence_ref,
      archive.title,
      archive.artifact_name,
      archive.artifact_size_bytes,
      archive.artifact_sha256,
      archive.classification,
      archive.source_system,
      archive.source_created_at,
      archive.target_revision_sha,
      archive.authority_profile_id,
      archive.authority_profile_sha256,
      archive.evidence_schema_sha256,
      archive.mapping_source_sha256,
      archive.generator_sha256,
      archive.machine_readable_artifact_path,
      archive.machine_readable_artifact_sha256,
      archive.human_readable_extract_path,
      archive.human_readable_extract_sha256,
      archive.paired_digest_manifest_path,
      archive.paired_digest_manifest_sha256,
      archive.baseline_authority_ids,
      archive.system_ids,
      archive.objective_ids,
      archive.evidence_origin,
      archive.artifact_state,
      archive.artifact_owner_legal_name,
      archive.artifact_owner_role,
      archive.test_method,
      archive.test_result,
      archive.test_result_sha256,
      archive.technical_result_state,
      archive.human_assessment_state,
      archive.pending_human_review_is_failure,
      archive.operational_disposition,
      archive.finding_eligible,
      archive.assessment_finding,
      archive.retention_mode,
      archive.legal_hold_active,
      archive.archived_at,
      archive.previous_chain_sha256,
      archive.chain_sha256,
      archive.evidence_contract
    from public.cmmc_evidence_archive as archive
    where archive.evidence_contract_version = 'obserra.cmmc.evidence.v2'
    order by archive.sequence_id desc
    limit p_limit offset p_offset;
end;
$$;

create or replace function public.cmmc_verify_evidence_archive_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_record public.cmmc_evidence_archive%rowtype;
  v_expected_previous text := null;
  v_expected_chain text;
  v_payload_sha text;
  v_canonical jsonb;
  v_checked bigint := 0;
begin
  for v_record in
    select * from public.cmmc_evidence_archive order by sequence_id
  loop
    v_checked := v_checked + 1;
    v_payload_sha := encode(extensions.digest(v_record.artifact_payload, 'sha256'), 'hex');
    if v_payload_sha <> v_record.artifact_sha256 then
      return jsonb_build_object(
        'schemaVersion', 'cmmc-evidence-chain-verification-v2',
        'verified', false,
        'checkedRecords', v_checked,
        'failedSequenceId', v_record.sequence_id,
        'failure', 'artifact_sha256_mismatch'
      );
    end if;
    if v_record.previous_chain_sha256 is distinct from v_expected_previous then
      return jsonb_build_object(
        'schemaVersion', 'cmmc-evidence-chain-verification-v2',
        'verified', false,
        'checkedRecords', v_checked,
        'failedSequenceId', v_record.sequence_id,
        'failure', 'previous_chain_sha256_mismatch'
      );
    end if;

    if v_record.evidence_contract_version = 'obserra.cmmc.evidence.v2' then
      v_canonical := jsonb_build_object(
        'archiveId', v_record.archive_id,
        'evidenceRef', v_record.evidence_ref,
        'controlIds', v_record.control_ids,
        'title', v_record.title,
        'artifactName', v_record.artifact_name,
        'contentType', v_record.content_type,
        'artifactSha256', v_record.artifact_sha256,
        'classification', v_record.classification,
        'sourceSystem', v_record.source_system,
        'sourceCreatedAt', v_record.source_created_at,
        'actorRef', v_record.actor_ref,
        'releaseSha', v_record.release_sha,
        'correlationId', v_record.correlation_id,
        'metadata', v_record.evidence_metadata,
        'evidenceContract', v_record.evidence_contract,
        'retentionMode', v_record.retention_mode,
        'legalHoldActive', v_record.legal_hold_active,
        'archivedAt', v_record.archived_at,
        'previousChainSha256', coalesce(v_record.previous_chain_sha256, 'GENESIS')
      );
    else
      v_canonical := jsonb_build_object(
        'archiveId', v_record.archive_id,
        'evidenceRef', v_record.evidence_ref,
        'controlIds', v_record.control_ids,
        'title', v_record.title,
        'artifactName', v_record.artifact_name,
        'contentType', v_record.content_type,
        'artifactSha256', v_record.artifact_sha256,
        'classification', v_record.classification,
        'sourceSystem', v_record.source_system,
        'sourceCreatedAt', v_record.source_created_at,
        'actorRef', v_record.actor_ref,
        'releaseSha', v_record.release_sha,
        'correlationId', v_record.correlation_id,
        'metadata', v_record.evidence_metadata,
        'retentionMode', v_record.retention_mode,
        'legalHoldActive', v_record.legal_hold_active,
        'archivedAt', v_record.archived_at,
        'previousChainSha256', coalesce(v_record.previous_chain_sha256, 'GENESIS')
      );
    end if;
    v_expected_chain := encode(
      extensions.digest(convert_to(v_canonical::text, 'UTF8'), 'sha256'),
      'hex'
    );
    if v_expected_chain <> v_record.chain_sha256 then
      return jsonb_build_object(
        'schemaVersion', 'cmmc-evidence-chain-verification-v2',
        'verified', false,
        'checkedRecords', v_checked,
        'failedSequenceId', v_record.sequence_id,
        'failure', 'chain_sha256_mismatch'
      );
    end if;
    v_expected_previous := v_record.chain_sha256;
  end loop;

  return jsonb_build_object(
    'schemaVersion', 'cmmc-evidence-chain-verification-v2',
    'verified', true,
    'checkedRecords', v_checked,
    'chainHeadSha256', v_expected_previous,
    'retentionMode', 'indefinite',
    'automaticDeletionEnabled', false
  );
end;
$$;

create or replace function public.cmmc_verify_evidence_event_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_record public.cmmc_evidence_archive_events%rowtype;
  v_expected_previous text := null;
  v_expected_event text;
  v_canonical jsonb;
  v_checked bigint := 0;
begin
  for v_record in
    select * from public.cmmc_evidence_archive_events order by event_sequence
  loop
    v_checked := v_checked + 1;
    if v_record.previous_event_sha256 is distinct from v_expected_previous then
      return jsonb_build_object(
        'schemaVersion', 'cmmc-evidence-event-chain-verification-v2',
        'verified', false,
        'checkedEvents', v_checked,
        'failedEventSequence', v_record.event_sequence,
        'failure', 'previous_event_sha256_mismatch'
      );
    end if;
    v_canonical := jsonb_build_object(
      'archiveId', coalesce(v_record.archive_id::text, 'catalog'),
      'eventType', v_record.event_type,
      'actorRef', v_record.actor_ref,
      'purpose', v_record.purpose,
      'eventAt', v_record.event_at,
      'metadata', v_record.event_metadata,
      'previousEventSha256', coalesce(v_record.previous_event_sha256, 'GENESIS')
    );
    v_expected_event := encode(
      extensions.digest(convert_to(v_canonical::text, 'UTF8'), 'sha256'),
      'hex'
    );
    if v_expected_event <> v_record.event_sha256 then
      return jsonb_build_object(
        'schemaVersion', 'cmmc-evidence-event-chain-verification-v2',
        'verified', false,
        'checkedEvents', v_checked,
        'failedEventSequence', v_record.event_sequence,
        'failure', 'event_sha256_mismatch'
      );
    end if;
    v_expected_previous := v_record.event_sha256;
  end loop;

  return jsonb_build_object(
    'schemaVersion', 'cmmc-evidence-event-chain-verification-v2',
    'verified', true,
    'checkedEvents', v_checked,
    'eventChainHeadSha256', v_expected_previous,
    'appendOnly', true
  );
end;
$$;

create or replace function public.cmmc_evidence_archive_health()
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'schemaVersion', 'cmmc-evidence-archive-v2',
    'operational', true,
    'retentionMode', 'indefinite',
    'legalHoldEnforced', true,
    'automaticDeletionEnabled', false,
    'cuiAccepted', false,
    'recordCount', count(*),
    'v2RecordCount', count(*) filter (where evidence_contract_version = 'obserra.cmmc.evidence.v2'),
    'legacyRecordCount', count(*) filter (where evidence_contract_version = 'legacy.v1'),
    'findingEligibleRecordCount', count(*) filter (where finding_eligible),
    'humanPendingRecordCount', count(*) filter (where human_assessment_state = 'pending'),
    'artifactBytes', coalesce(sum(artifact_size_bytes), 0),
    'latestArchivedAt', max(archived_at),
    'chainHeadSha256', (array_agg(chain_sha256 order by sequence_id desc))[1]
  )
  from public.cmmc_evidence_archive;
$$;

revoke all on function public.cmmc_archive_evidence_v2(
  text,
  text[],
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  jsonb,
  text,
  jsonb,
  text,
  uuid
) from public, anon, authenticated;
revoke all on function public.cmmc_list_evidence_v2(text, text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.cmmc_verify_evidence_archive_chain()
  from public, anon, authenticated;
revoke all on function public.cmmc_verify_evidence_event_chain()
  from public, anon, authenticated;
revoke all on function public.cmmc_evidence_archive_health()
  from public, anon, authenticated;

grant execute on function public.cmmc_archive_evidence_v2(
  text,
  text[],
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  jsonb,
  text,
  jsonb,
  text,
  uuid
) to service_role;
grant execute on function public.cmmc_list_evidence_v2(text, text, integer, integer)
  to service_role;
grant execute on function public.cmmc_verify_evidence_archive_chain()
  to service_role;
grant execute on function public.cmmc_verify_evidence_event_chain()
  to service_role;
grant execute on function public.cmmc_evidence_archive_health()
  to service_role;

comment on table public.cmmc_evidence_archive is
  'Append-only, indefinite-retention PUBLIC/INTERNAL_NON_CUI CMMC evidence. v2 records require exact authority, system, objective, ownership, scope, test, revision, and claim-boundary metadata.';
comment on function public.cmmc_archive_evidence_v2(
  text,
  text[],
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  jsonb,
  text,
  jsonb,
  text,
  uuid
) is
  'Archives a final non-CUI CMMC evidence package only when the objective-level exact-revision v2 contract passes fail-closed validation.';
comment on function public.cmmc_list_evidence_v2(text, text, integer, integer) is
  'Returns the investigator/auditor CMMC evidence catalog without artifact payloads and records the access purpose in the append-only event chain.';
comment on function public.cmmc_verify_evidence_archive_chain() is
  'Recomputes every artifact digest and evidence chain link, returning a fail-closed machine-readable integrity result.';
comment on function public.cmmc_verify_evidence_event_chain() is
  'Recomputes the append-only archive access-event chain, returning a fail-closed machine-readable integrity result.';
