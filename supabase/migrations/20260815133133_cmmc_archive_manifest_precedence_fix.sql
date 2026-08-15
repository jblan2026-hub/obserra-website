-- Correct PostgreSQL operator precedence in the paired digest-manifest assignment.
--
-- This forward-only migration preserves the complete fail-closed v2 evidence
-- contract, indefinite retention, non-CUI boundary, immutable chains, and
-- service-role-only execution. It changes only the parenthesization of two
-- jsonb text extractions before concatenation.

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
  'Archives a final non-CUI CMMC evidence package only when the objective-level exact-revision v2 contract passes fail-closed validation; manifest hash concatenation uses explicit JSON extraction precedence.';

