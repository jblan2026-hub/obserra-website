begin;

-- Gate 40: complete the real owner-UAT instruction path without weakening the
-- production Class DS boundary. Instructor evidence is encrypted before it
-- reaches PostgreSQL and is registered atomically with the verified-active
-- Class DI record. Only the assigned DI may start an owner-UAT lesson.

alter table public.fdacs_class_d_instructor_files
  add constraint fdacs_class_d_verified_active_instructor_expiry_check
  check (license_status <> 'verified_active' or license_expires_on is not null);

create or replace function public.fdacs_class_d_start_live_session(
  p_live_session_id uuid,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_instructor_license_number text,
  p_school_license_number text,
  p_inspection_access_reference text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.fdacs_class_d_live_sessions%rowtype;
  v_cohort public.fdacs_class_d_cohorts%rowtype;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'live instruction requires authorized Class D staff';
  end if;
  if char_length(trim(coalesce(p_actor_clerk_user_id,''))) not between 3 and 255
     or p_correlation_id is null then
    raise exception 'authenticated live-instruction actor and correlation ID are required';
  end if;
  if p_inspection_access_reference is not null
     and char_length(p_inspection_access_reference) > 500 then
    raise exception 'inspection access reference is too long';
  end if;

  select * into v_session
  from public.fdacs_class_d_live_sessions s
  where s.id = p_live_session_id
  for update;
  if not found or v_session.status <> 'scheduled' then
    raise exception 'live session is not eligible to start';
  end if;

  select * into v_cohort
  from public.fdacs_class_d_cohorts c
  where c.id = v_session.cohort_id;
  if not found then raise exception 'live-session cohort is unavailable'; end if;

  if v_session.execution_profile = 'owner_uat_noncredit' then
    if p_actor_role <> 'instructor'
       or trim(p_actor_clerk_user_id) <> v_session.instructor_clerk_user_id
       or not coalesce(trim(p_actor_clerk_user_id) = any(v_cohort.instructor_clerk_user_ids),false) then
      raise exception 'only the assigned Class DI instructor may start an owner UAT lesson';
    end if;
    if v_cohort.execution_profile <> 'owner_uat_noncredit'
       or v_cohort.status <> 'scheduled'
       or v_cohort.uat_expires_at <= clock_timestamp()
       or v_cohort.release_commit_sha !~ '^[0-9a-f]{40}$'
       or v_cohort.authorization_evidence_sha256 !~ '^[0-9a-f]{64}$'
       or v_session.school_license_number is not null
       or p_instructor_license_number is not null
       or p_school_license_number is not null
       or exists (
         select 1 from public.fdacs_class_d_activation_state a
         where a.boundary_id = 1 and a.production_runtime_authorized = true
       ) then
      raise exception 'owner UAT live instruction is outside its exact-release non-credit authorization';
    end if;
    if not exists (
      select 1
      from public.fdacs_class_d_instructor_files f
      where f.instructor_clerk_user_id = v_session.instructor_clerk_user_id
        and f.di_license_number = v_session.instructor_license_number
        and f.license_status = 'verified_active'
        and f.license_expires_on >= current_date
    ) then
      raise exception 'assigned verified-active Class DI evidence is unavailable';
    end if;

    update public.fdacs_class_d_live_sessions
    set status = 'live',
        current_segment_type = 'instruction',
        current_segment_started_at = clock_timestamp(),
        started_at = coalesce(started_at,clock_timestamp()),
        inspection_access_reference = p_inspection_access_reference,
        updated_at = clock_timestamp()
    where id = p_live_session_id;
  else
    if v_session.execution_profile <> 'production' or v_cohort.execution_profile <> 'production' then
      raise exception 'unsupported live-session execution profile';
    end if;
    if p_instructor_license_number is null or char_length(trim(p_instructor_license_number)) < 3 then
      raise exception 'instructor license number is required';
    end if;
    if p_school_license_number is null or char_length(trim(p_school_license_number)) < 3 then
      raise exception 'school license number is required';
    end if;

    update public.fdacs_class_d_live_sessions
    set status = 'live',
        current_segment_type = 'instruction',
        current_segment_started_at = clock_timestamp(),
        started_at = coalesce(started_at,clock_timestamp()),
        instructor_clerk_user_id = trim(p_actor_clerk_user_id),
        instructor_license_number = trim(p_instructor_license_number),
        school_license_number = trim(p_school_license_number),
        inspection_access_reference = p_inspection_access_reference,
        updated_at = clock_timestamp()
    where id = p_live_session_id;
  end if;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    p_actor_role,trim(p_actor_clerk_user_id),'live_session',p_live_session_id,
    'live_session_started',p_correlation_id,
    jsonb_build_object(
      'physicalLocationState','FL','executionProfile',v_session.execution_profile,
      'schoolLicenseClaimed',v_session.execution_profile = 'production',
      'assignedInstructorEnforced',v_session.execution_profile = 'owner_uat_noncredit'
    )
  );
end;
$$;

create or replace function public.fdacs_class_d_archive_and_register_instructor_file(
  p_instructor_clerk_user_id text,
  p_instructor_legal_name text,
  p_di_license_number text,
  p_license_verified_at timestamptz,
  p_license_expires_on date,
  p_key_reference text,
  p_qualification_idempotency_key text,
  p_qualification_initialization_vector bytea,
  p_qualification_encrypted_payload bytea,
  p_qualification_plaintext_sha256 text,
  p_qualification_plaintext_size_bytes bigint,
  p_qualification_content_type text,
  p_license_idempotency_key text,
  p_license_initialization_vector bytea,
  p_license_encrypted_payload bytea,
  p_license_plaintext_sha256 text,
  p_license_plaintext_size_bytes bigint,
  p_license_content_type text,
  p_supersedes_instructor_file_id uuid,
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
  v_qualification jsonb;
  v_license jsonb;
  v_instructor jsonb;
  v_existing public.fdacs_class_d_instructor_files%rowtype;
  v_retention_anchor date := current_date;
  v_operational_retain_until date := (current_date + interval '3 years')::date;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then
    raise exception 'instructor-file provisioning requires school or compliance administration';
  end if;
  if char_length(trim(coalesce(p_actor_clerk_user_id,''))) not between 3 and 255
     or p_correlation_id is null then
    raise exception 'authenticated provisioning actor and correlation ID are required';
  end if;
  if p_license_expires_on is null or p_license_expires_on < current_date then
    raise exception 'a verified-active Class DI license requires a current expiration date';
  end if;

  v_qualification := public.fdacs_class_d_archive_protected_artifact(
    null,p_qualification_idempotency_key,'instructor_qualification','regulated_personnel_pii',
    p_key_reference,p_qualification_initialization_vector,p_qualification_encrypted_payload,
    p_qualification_plaintext_sha256,p_qualification_plaintext_size_bytes,
    p_qualification_content_type,'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC FDACS instructor provisioning',
    v_retention_anchor,v_operational_retain_until,false,trim(p_actor_clerk_user_id),p_correlation_id
  );
  v_license := public.fdacs_class_d_archive_protected_artifact(
    null,p_license_idempotency_key,'instructor_license','regulated_personnel_pii',
    p_key_reference,p_license_initialization_vector,p_license_encrypted_payload,
    p_license_plaintext_sha256,p_license_plaintext_size_bytes,
    p_license_content_type,'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC FDACS instructor provisioning',
    v_retention_anchor,v_operational_retain_until,false,trim(p_actor_clerk_user_id),p_correlation_id
  );

  -- Serialize exact retries for one instructor. The protected-artifact RPC is
  -- already idempotent; this lock and lookup make the combined operation
  -- idempotent as well if the caller loses the first HTTP response.
  perform pg_advisory_xact_lock(hashtext(
    'public.fdacs_class_d_instructor_files:' || trim(p_instructor_clerk_user_id)
  ));
  select * into v_existing
  from public.fdacs_class_d_instructor_files f
  where f.instructor_clerk_user_id = trim(p_instructor_clerk_user_id)
    and f.instructor_legal_name = trim(p_instructor_legal_name)
    and f.di_license_number = trim(p_di_license_number)
    and f.license_status = 'verified_active'
    and f.license_verified_at = p_license_verified_at
    and f.license_expires_on is not distinct from p_license_expires_on
    and f.qualification_artifact_id = (v_qualification->>'artifactId')::uuid
    and f.license_artifact_id = (v_license->>'artifactId')::uuid
  order by f.created_at desc
  limit 1;
  if found then
    return jsonb_build_object(
      'instructorFileId',v_existing.instructor_file_id,
      'recordSha256',v_existing.record_sha256,
      'qualificationArtifactId',v_qualification->>'artifactId',
      'qualificationPlaintextSha256',v_qualification->>'plaintextSha256',
      'licenseArtifactId',v_license->>'artifactId',
      'licensePlaintextSha256',v_license->>'plaintextSha256',
      'licenseStatus','verified_active','secretValuesExposed',false,
      'idempotentReplay',true
    );
  end if;

  v_instructor := public.fdacs_class_d_register_instructor_file(
    p_instructor_clerk_user_id,p_instructor_legal_name,p_di_license_number,'verified_active',
    p_license_verified_at,p_license_expires_on,
    (v_qualification->>'artifactId')::uuid,(v_license->>'artifactId')::uuid,
    trim(p_actor_clerk_user_id),p_supersedes_instructor_file_id,p_correlation_id
  );

  return v_instructor || jsonb_build_object(
    'qualificationArtifactId',v_qualification->>'artifactId',
    'qualificationPlaintextSha256',v_qualification->>'plaintextSha256',
    'licenseArtifactId',v_license->>'artifactId',
    'licensePlaintextSha256',v_license->>'plaintextSha256',
    'licenseStatus','verified_active','secretValuesExposed',false,
    'idempotentReplay',false
  );
end;
$$;

create or replace function public.fdacs_class_d_owner_uat_instructor_readiness(
  p_required_through date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_required_through is null or p_required_through < current_date then
    raise exception 'instructor readiness requires a current or future coverage date';
  end if;
  select count(*) into v_count
  from public.fdacs_class_d_instructor_files f
  where f.license_status = 'verified_active'
    and f.license_expires_on >= p_required_through;
  return jsonb_build_object(
    'ready',v_count > 0,'verifiedActiveInstructorCount',v_count,
    'requiredThrough',p_required_through,'licenseValuesExposed',false
  );
end;
$$;

revoke all on function public.fdacs_class_d_start_live_session(uuid,text,text,text,text,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_archive_and_register_instructor_file(text,text,text,timestamptz,date,text,text,bytea,bytea,text,bigint,text,text,bytea,bytea,text,bigint,text,uuid,text,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_owner_uat_instructor_readiness(date)
  from public,anon,authenticated,service_role;

grant execute on function public.fdacs_class_d_start_live_session(uuid,text,text,text,text,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_archive_and_register_instructor_file(text,text,text,timestamptz,date,text,text,bytea,bytea,text,bigint,text,text,bytea,bytea,text,bigint,text,uuid,text,text,uuid)
  to service_role;
grant execute on function public.fdacs_class_d_owner_uat_instructor_readiness(date)
  to service_role;

comment on function public.fdacs_class_d_archive_and_register_instructor_file(text,text,text,timestamptz,date,text,text,bytea,bytea,text,bigint,text,text,bytea,bytea,text,bigint,text,uuid,text,text,uuid) is
  'Atomically archives encrypted Class DI qualification and license evidence and registers the verified-active instructor file; plaintext and secret values are never returned.';
comment on function public.fdacs_class_d_owner_uat_instructor_readiness(date) is
  'Returns only nonsecret readiness/count evidence for verified-active Class DI coverage.';

commit;
