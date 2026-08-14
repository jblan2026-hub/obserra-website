begin;

-- Transactional outbox for automatic LMS-to-regulated-record archiving.
-- Jobs contain identifiers and safe operational metadata only; no student PII,
-- document images, biometric templates, CUI, payment data, or encryption keys.

create table public.fdacs_class_d_record_archive_jobs (
  job_id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('enrollment_record_snapshot','completion_evidence_package')),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  completion_record_id uuid references public.fdacs_class_d_completion_records(id) on delete restrict,
  idempotency_key text not null unique check (char_length(idempotency_key) between 12 and 200),
  status text not null default 'pending' check (status in ('pending','processing','retry_wait','completed','dead_letter')),
  attempts smallint not null default 0 check (attempts between 0 and 12),
  max_attempts smallint not null default 12 check (max_attempts = 12),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text check (locked_by is null or char_length(locked_by) between 3 and 255),
  completed_at timestamptz,
  protected_artifact_id uuid references public.fdacs_class_d_protected_artifacts(artifact_id) on delete restrict,
  artifact_record_sha256 text check (artifact_record_sha256 is null or artifact_record_sha256 ~ '^[0-9a-f]{64}$'),
  last_error_code text check (last_error_code is null or last_error_code ~ '^[A-Z0-9_]{3,100}$'),
  last_error_sha256 text check (last_error_sha256 is null or last_error_sha256 ~ '^[0-9a-f]{64}$'),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fdacs_class_d_archive_job_source_shape check (
    (job_type = 'enrollment_record_snapshot' and completion_record_id is null) or
    (job_type = 'completion_evidence_package' and completion_record_id is not null)
  ),
  constraint fdacs_class_d_archive_job_completion_shape check (
    (status = 'completed' and completed_at is not null and protected_artifact_id is not null and artifact_record_sha256 is not null) or
    (status <> 'completed' and completed_at is null)
  )
);

create index fdacs_class_d_record_archive_jobs_claim_idx
  on public.fdacs_class_d_record_archive_jobs(status, available_at, created_at)
  where status in ('pending','retry_wait','processing');
create index fdacs_class_d_record_archive_jobs_enrollment_idx
  on public.fdacs_class_d_record_archive_jobs(enrollment_id, created_at desc);

create or replace function public.fdacs_class_d_queue_record_archive_job()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job_type text;
  v_enrollment_id uuid;
  v_completion_record_id uuid;
  v_idempotency_key text;
  v_correlation_id uuid;
begin
  if tg_table_name = 'fdacs_class_d_enrollments' then
    v_job_type := 'enrollment_record_snapshot';
    v_enrollment_id := new.id;
    v_completion_record_id := null;
    v_idempotency_key := 'fdacs-enrollment:' || new.id::text || ':v1';
    v_correlation_id := coalesce(new.correlation_id, gen_random_uuid());
  elsif tg_table_name = 'fdacs_class_d_completion_records' then
    v_job_type := 'completion_evidence_package';
    v_enrollment_id := new.enrollment_id;
    v_completion_record_id := new.id;
    v_idempotency_key := 'fdacs-completion:' || new.id::text || ':v1';
    v_correlation_id := new.correlation_id;
  else
    raise exception 'unsupported automatic archive source table';
  end if;

  insert into public.fdacs_class_d_record_archive_jobs (
    job_type,enrollment_id,completion_record_id,idempotency_key,correlation_id
  ) values (
    v_job_type,v_enrollment_id,v_completion_record_id,v_idempotency_key,v_correlation_id
  ) on conflict (idempotency_key) do nothing;
  return new;
end;
$$;

-- The original enrollment schema has no correlation_id column; bind its
-- transactional outbox job to a new opaque correlation identifier.
create or replace function public.fdacs_class_d_queue_enrollment_archive_job()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.fdacs_class_d_record_archive_jobs (
    job_type,enrollment_id,completion_record_id,idempotency_key,correlation_id
  ) values (
    'enrollment_record_snapshot',new.id,null,
    'fdacs-enrollment:' || new.id::text || ':v1',gen_random_uuid()
  ) on conflict (idempotency_key) do nothing;
  return new;
end;
$$;

create trigger fdacs_class_d_enrollment_archive_job
after insert on public.fdacs_class_d_enrollments
for each row execute function public.fdacs_class_d_queue_enrollment_archive_job();

create or replace function public.fdacs_class_d_queue_enrolled_archive_job()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status and new.status = 'enrolled' then
    insert into public.fdacs_class_d_record_archive_jobs (
      job_type,enrollment_id,completion_record_id,idempotency_key,correlation_id
    ) values (
      'enrollment_record_snapshot',new.id,null,
      'fdacs-enrollment:' || new.id::text || ':enrolled:v1',gen_random_uuid()
    ) on conflict (idempotency_key) do nothing;
  end if;
  return new;
end;
$$;

create trigger fdacs_class_d_enrolled_archive_job
after update of status on public.fdacs_class_d_enrollments
for each row execute function public.fdacs_class_d_queue_enrolled_archive_job();

create trigger fdacs_class_d_completion_archive_job
after insert on public.fdacs_class_d_completion_records
for each row execute function public.fdacs_class_d_queue_record_archive_job();

create or replace function public.fdacs_class_d_claim_record_archive_jobs(
  p_worker_ref text,
  p_limit integer default 10,
  p_job_id uuid default null
)
returns table (
  job_id uuid,
  job_type text,
  enrollment_id uuid,
  completion_record_id uuid,
  idempotency_key text,
  correlation_id uuid,
  attempt smallint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(trim(coalesce(p_worker_ref,''))) not between 3 and 255 then raise exception 'archive worker reference is required'; end if;
  if p_limit not between 1 and 25 then raise exception 'archive worker claim limit must be between 1 and 25'; end if;

  update public.fdacs_class_d_record_archive_jobs
  set status = case when attempts >= max_attempts then 'dead_letter' else 'retry_wait' end,
      available_at = case when attempts >= max_attempts then available_at else clock_timestamp() end,
      locked_at = null,
      locked_by = null,
      last_error_code = 'STALE_WORKER_LOCK',
      last_error_sha256 = encode(extensions.digest(convert_to('STALE_WORKER_LOCK','UTF8'),'sha256'),'hex'),
      updated_at = clock_timestamp()
  where status = 'processing' and locked_at < clock_timestamp() - interval '15 minutes';

  return query
  with candidates as (
    select j.job_id
    from public.fdacs_class_d_record_archive_jobs j
    where j.status in ('pending','retry_wait')
      and j.available_at <= clock_timestamp()
      and j.attempts < j.max_attempts
      and (p_job_id is null or j.job_id = p_job_id)
    order by j.created_at,j.job_id
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.fdacs_class_d_record_archive_jobs j
    set status = 'processing',
        attempts = j.attempts + 1,
        locked_at = clock_timestamp(),
        locked_by = trim(p_worker_ref),
        updated_at = clock_timestamp()
    from candidates c
    where j.job_id = c.job_id
    returning j.*
  )
  select c.job_id,c.job_type,c.enrollment_id,c.completion_record_id,
         c.idempotency_key,c.correlation_id,c.attempts
  from claimed c;
end;
$$;

create or replace function public.fdacs_class_d_lookup_record_archive_job(
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_job public.fdacs_class_d_record_archive_jobs%rowtype;
begin
  if char_length(trim(coalesce(p_idempotency_key,''))) not between 12 and 200 then
    raise exception 'archive-job idempotency key is invalid';
  end if;
  select * into v_job
  from public.fdacs_class_d_record_archive_jobs
  where idempotency_key = trim(p_idempotency_key);
  if not found then return null; end if;
  return jsonb_build_object(
    'jobId',v_job.job_id,'jobType',v_job.job_type,'enrollmentId',v_job.enrollment_id,
    'completionRecordId',v_job.completion_record_id,'idempotencyKey',v_job.idempotency_key,
    'status',v_job.status,'correlationId',v_job.correlation_id,'attempts',v_job.attempts
  );
end;
$$;

-- A worker may lose the archive RPC response after the immutable artifact was
-- committed. This lookup makes the retry converge on that exact artifact
-- instead of rebuilding time-varying evidence under the same idempotency key.
create or replace function public.fdacs_class_d_lookup_record_archive_job_artifact(
  p_job_id uuid,
  p_worker_ref text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_job public.fdacs_class_d_record_archive_jobs%rowtype;
  v_artifact public.fdacs_class_d_protected_artifacts%rowtype;
  v_expected_type text;
begin
  select * into v_job
  from public.fdacs_class_d_record_archive_jobs
  where job_id = p_job_id;
  if not found or v_job.status <> 'processing' or v_job.locked_by <> trim(p_worker_ref) then
    raise exception 'archive job is not held by this worker';
  end if;
  v_expected_type := case v_job.job_type
    when 'enrollment_record_snapshot' then 'enrollment_record_snapshot'
    when 'completion_evidence_package' then 'completion_evidence_package'
  end;
  select * into v_artifact
  from public.fdacs_class_d_protected_artifacts
  where idempotency_key = v_job.idempotency_key;
  if not found then return null; end if;
  if v_artifact.artifact_type <> v_expected_type
     or v_artifact.enrollment_id <> v_job.enrollment_id then
    raise exception 'existing protected artifact does not match its automatic archive job';
  end if;
  return jsonb_build_object(
    'artifactId',v_artifact.artifact_id,
    'recordSha256',v_artifact.artifact_record_sha256,
    'plaintextSha256',v_artifact.plaintext_sha256,
    'ciphertextSha256',v_artifact.ciphertext_sha256
  );
end;
$$;

create or replace function public.fdacs_class_d_complete_record_archive_job(
  p_job_id uuid,
  p_worker_ref text,
  p_protected_artifact_id uuid,
  p_artifact_record_sha256 text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.fdacs_class_d_record_archive_jobs%rowtype;
  v_artifact public.fdacs_class_d_protected_artifacts%rowtype;
  v_expected_type text;
begin
  select * into v_job from public.fdacs_class_d_record_archive_jobs where job_id = p_job_id for update;
  if not found or v_job.status <> 'processing' or v_job.locked_by <> trim(p_worker_ref) then
    raise exception 'archive job is not held by this worker';
  end if;
  select * into v_artifact from public.fdacs_class_d_protected_artifacts where artifact_id = p_protected_artifact_id;
  if not found then raise exception 'protected artifact is unavailable'; end if;

  v_expected_type := case v_job.job_type
    when 'enrollment_record_snapshot' then 'enrollment_record_snapshot'
    when 'completion_evidence_package' then 'completion_evidence_package'
  end;
  if v_artifact.artifact_type <> v_expected_type
     or v_artifact.enrollment_id <> v_job.enrollment_id
     or v_artifact.idempotency_key <> v_job.idempotency_key
     or v_artifact.artifact_record_sha256 <> p_artifact_record_sha256 then
    raise exception 'protected artifact does not match its automatic archive job';
  end if;

  update public.fdacs_class_d_record_archive_jobs
  set status = 'completed',completed_at = clock_timestamp(),protected_artifact_id = p_protected_artifact_id,
      artifact_record_sha256 = p_artifact_record_sha256,locked_at = null,locked_by = null,
      last_error_code = null,last_error_sha256 = null,updated_at = clock_timestamp()
  where job_id = p_job_id;

  return jsonb_build_object(
    'jobId',p_job_id,'status','completed','protectedArtifactId',p_protected_artifact_id,
    'artifactRecordSha256',p_artifact_record_sha256
  );
end;
$$;

create or replace function public.fdacs_class_d_fail_record_archive_job(
  p_job_id uuid,
  p_worker_ref text,
  p_error_code text,
  p_error_sha256 text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.fdacs_class_d_record_archive_jobs%rowtype;
  v_next_status text;
  v_delay_seconds integer;
begin
  if p_error_code !~ '^[A-Z0-9_]{3,100}$' then raise exception 'safe archive error code is invalid'; end if;
  if p_error_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'archive error SHA-256 is invalid'; end if;
  select * into v_job from public.fdacs_class_d_record_archive_jobs where job_id = p_job_id for update;
  if not found or v_job.status <> 'processing' or v_job.locked_by <> trim(p_worker_ref) then
    raise exception 'archive job is not held by this worker';
  end if;

  v_next_status := case when v_job.attempts >= v_job.max_attempts then 'dead_letter' else 'retry_wait' end;
  v_delay_seconds := least(21600,60 * power(2,least(greatest(v_job.attempts - 1,0),8))::integer);
  update public.fdacs_class_d_record_archive_jobs
  set status = v_next_status,
      available_at = case when v_next_status = 'retry_wait' then clock_timestamp() + make_interval(secs => v_delay_seconds) else available_at end,
      locked_at = null,locked_by = null,last_error_code = p_error_code,last_error_sha256 = p_error_sha256,
      updated_at = clock_timestamp()
  where job_id = p_job_id;

  return jsonb_build_object('jobId',p_job_id,'status',v_next_status,'attempts',v_job.attempts,'retryDelaySeconds',v_delay_seconds);
end;
$$;

create or replace function public.fdacs_class_d_record_archive_health()
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'schema','obserra.fdacs.class-d.automatic-record-archive-health.v1',
    'generatedAt',clock_timestamp(),
    'counts',jsonb_build_object(
      'pending',count(*) filter (where status = 'pending'),
      'processing',count(*) filter (where status = 'processing'),
      'retryWait',count(*) filter (where status = 'retry_wait'),
      'completed',count(*) filter (where status = 'completed'),
      'deadLetter',count(*) filter (where status = 'dead_letter')
    ),
    'oldestActionableAt',min(created_at) filter (where status in ('pending','retry_wait')),
    'lastCompletedAt',max(completed_at),
    'healthy',count(*) filter (where status = 'dead_letter') = 0
  )
  from public.fdacs_class_d_record_archive_jobs;
$$;

alter table public.fdacs_class_d_record_archive_jobs enable row level security;
alter table public.fdacs_class_d_record_archive_jobs force row level security;
revoke all on table public.fdacs_class_d_record_archive_jobs from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_queue_record_archive_job() from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_queue_enrollment_archive_job() from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_queue_enrolled_archive_job() from public, anon, authenticated, service_role;
revoke all on function public.fdacs_class_d_claim_record_archive_jobs(text,integer,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_lookup_record_archive_job(text) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_lookup_record_archive_job_artifact(uuid,text) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_complete_record_archive_job(uuid,text,uuid,text) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_fail_record_archive_job(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_archive_health() from public, anon, authenticated;
grant execute on function public.fdacs_class_d_claim_record_archive_jobs(text,integer,uuid) to service_role;
grant execute on function public.fdacs_class_d_lookup_record_archive_job(text) to service_role;
grant execute on function public.fdacs_class_d_lookup_record_archive_job_artifact(uuid,text) to service_role;
grant execute on function public.fdacs_class_d_complete_record_archive_job(uuid,text,uuid,text) to service_role;
grant execute on function public.fdacs_class_d_fail_record_archive_job(uuid,text,text,text) to service_role;
grant execute on function public.fdacs_class_d_record_archive_health() to service_role;

comment on table public.fdacs_class_d_record_archive_jobs is
  'Transactional, idempotent LMS outbox for automatic encrypted enrollment and completion evidence archiving; job rows contain no student PII payload.';

commit;
