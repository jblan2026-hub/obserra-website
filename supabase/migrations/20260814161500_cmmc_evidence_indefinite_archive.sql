-- Gate 37: append-only CMMC evidence archive with indefinite retention.
--
-- This archive accepts PUBLIC and INTERNAL_NON_CUI evidence only. It rejects CUI,
-- learner PII, payment data, credentials, and other secret-class material until a
-- separately assessed and authorized CUI storage boundary is available.

create table if not exists public.cmmc_evidence_archive (
  archive_id uuid primary key default gen_random_uuid(),
  sequence_id bigint generated always as identity unique,
  evidence_ref text not null unique,
  control_ids text[] not null,
  title text not null,
  artifact_name text not null,
  content_type text not null,
  artifact_payload bytea not null,
  artifact_size_bytes bigint generated always as (octet_length(artifact_payload)) stored,
  artifact_sha256 text not null,
  classification text not null default 'internal_non_cui',
  contains_cui boolean not null default false,
  contains_personal_data boolean not null default false,
  contains_payment_data boolean not null default false,
  contains_secret_material boolean not null default false,
  source_system text not null,
  source_created_at timestamptz not null,
  actor_ref text not null,
  release_sha text,
  correlation_id uuid not null default gen_random_uuid(),
  evidence_metadata jsonb not null default '{}'::jsonb,
  retention_mode text not null default 'indefinite',
  retain_until timestamptz,
  legal_hold_active boolean not null default true,
  automatic_deletion_enabled boolean not null default false,
  destruction_authority text not null default 'none',
  archived_at timestamptz not null default now(),
  previous_chain_sha256 text,
  chain_sha256 text not null unique,
  constraint cmmc_evidence_archive_reference check (
    evidence_ref ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,199}$'
  ),
  constraint cmmc_evidence_archive_controls check (
    cardinality(control_ids) between 1 and 110 and array_position(control_ids, null) is null
  ),
  constraint cmmc_evidence_archive_title check (char_length(title) between 3 and 300),
  constraint cmmc_evidence_archive_artifact_name check (char_length(artifact_name) between 1 and 255),
  constraint cmmc_evidence_archive_content_type check (
    content_type ~ '^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$'
  ),
  constraint cmmc_evidence_archive_payload_size check (artifact_size_bytes between 1 and 10485760),
  constraint cmmc_evidence_archive_payload_sha check (artifact_sha256 ~ '^[0-9a-f]{64}$'),
  constraint cmmc_evidence_archive_classification check (
    classification in ('public', 'internal_non_cui')
  ),
  constraint cmmc_evidence_archive_non_cui_boundary check (
    contains_cui = false and
    contains_personal_data = false and
    contains_payment_data = false and
    contains_secret_material = false
  ),
  constraint cmmc_evidence_archive_source check (char_length(source_system) between 2 and 200),
  constraint cmmc_evidence_archive_actor check (char_length(actor_ref) between 3 and 255),
  constraint cmmc_evidence_archive_release_sha check (
    release_sha is null or release_sha ~ '^[0-9a-f]{40}$'
  ),
  constraint cmmc_evidence_archive_metadata check (
    jsonb_typeof(evidence_metadata) = 'object' and octet_length(evidence_metadata::text) <= 65536
  ),
  constraint cmmc_evidence_archive_indefinite_retention check (
    retention_mode = 'indefinite' and
    retain_until is null and
    legal_hold_active = true and
    automatic_deletion_enabled = false and
    destruction_authority = 'none'
  ),
  constraint cmmc_evidence_archive_previous_chain check (
    previous_chain_sha256 is null or previous_chain_sha256 ~ '^[0-9a-f]{64}$'
  ),
  constraint cmmc_evidence_archive_chain_sha check (chain_sha256 ~ '^[0-9a-f]{64}$')
);

create table if not exists public.cmmc_evidence_archive_events (
  event_sequence bigint generated always as identity primary key,
  archive_id uuid references public.cmmc_evidence_archive (archive_id) on delete restrict,
  event_type text not null,
  actor_ref text not null,
  purpose text not null,
  event_metadata jsonb not null default '{}'::jsonb,
  event_at timestamptz not null default now(),
  previous_event_sha256 text,
  event_sha256 text not null unique,
  constraint cmmc_evidence_archive_events_type check (
    event_type in ('archived', 'accessed', 'catalog_read')
  ),
  constraint cmmc_evidence_archive_events_actor check (char_length(actor_ref) between 3 and 255),
  constraint cmmc_evidence_archive_events_purpose check (char_length(purpose) between 3 and 500),
  constraint cmmc_evidence_archive_events_metadata check (
    jsonb_typeof(event_metadata) = 'object' and octet_length(event_metadata::text) <= 16384
  ),
  constraint cmmc_evidence_archive_events_previous_hash check (
    previous_event_sha256 is null or previous_event_sha256 ~ '^[0-9a-f]{64}$'
  ),
  constraint cmmc_evidence_archive_events_hash check (event_sha256 ~ '^[0-9a-f]{64}$')
);

create index if not exists cmmc_evidence_archive_created_idx
  on public.cmmc_evidence_archive (archived_at desc, sequence_id desc);
create index if not exists cmmc_evidence_archive_control_ids_idx
  on public.cmmc_evidence_archive using gin (control_ids);
create index if not exists cmmc_evidence_archive_events_archive_idx
  on public.cmmc_evidence_archive_events (archive_id, event_at desc)
  where archive_id is not null;

alter table public.cmmc_evidence_archive enable row level security;
alter table public.cmmc_evidence_archive force row level security;
alter table public.cmmc_evidence_archive_events enable row level security;
alter table public.cmmc_evidence_archive_events force row level security;

revoke all on table public.cmmc_evidence_archive from public, anon, authenticated, service_role;
revoke all on table public.cmmc_evidence_archive_events from public, anon, authenticated, service_role;
revoke all on sequence public.cmmc_evidence_archive_sequence_id_seq from public, anon, authenticated, service_role;
revoke all on sequence public.cmmc_evidence_archive_events_event_sequence_seq from public, anon, authenticated, service_role;

create or replace function public.cmmc_reject_evidence_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'CMMC evidence archives and access events are append-only with indefinite retention';
end;
$$;

drop trigger if exists cmmc_evidence_archive_immutable on public.cmmc_evidence_archive;
create trigger cmmc_evidence_archive_immutable
before update or delete on public.cmmc_evidence_archive
for each row execute function public.cmmc_reject_evidence_mutation();

drop trigger if exists cmmc_evidence_archive_events_immutable on public.cmmc_evidence_archive_events;
create trigger cmmc_evidence_archive_events_immutable
before update or delete on public.cmmc_evidence_archive_events
for each row execute function public.cmmc_reject_evidence_mutation();

revoke all on function public.cmmc_reject_evidence_mutation() from public, anon, authenticated, service_role;

create or replace function public.cmmc_append_evidence_event(
  p_archive_id uuid,
  p_event_type text,
  p_actor_ref text,
  p_purpose text,
  p_event_metadata jsonb default '{}'::jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_at timestamptz := clock_timestamp();
  v_previous_event_sha256 text;
  v_event_sha256 text;
  v_canonical jsonb;
begin
  if p_event_type not in ('archived', 'accessed', 'catalog_read') then
    raise exception 'Unsupported CMMC evidence event type';
  end if;
  if char_length(trim(coalesce(p_actor_ref, ''))) not between 3 and 255 then
    raise exception 'CMMC evidence actor reference is invalid';
  end if;
  if char_length(trim(coalesce(p_purpose, ''))) not between 3 and 500 then
    raise exception 'CMMC evidence access purpose is invalid';
  end if;
  if p_event_metadata is null or jsonb_typeof(p_event_metadata) <> 'object' or
     octet_length(p_event_metadata::text) > 16384 then
    raise exception 'CMMC evidence event metadata is invalid';
  end if;

  perform pg_advisory_xact_lock(hashtext('public.cmmc_evidence_archive_events'));
  select event_sha256 into v_previous_event_sha256
  from public.cmmc_evidence_archive_events
  order by event_sequence desc
  limit 1;

  v_canonical := jsonb_build_object(
    'archiveId', coalesce(p_archive_id::text, 'catalog'),
    'eventType', p_event_type,
    'actorRef', trim(p_actor_ref),
    'purpose', trim(p_purpose),
    'eventAt', v_event_at,
    'metadata', p_event_metadata,
    'previousEventSha256', coalesce(v_previous_event_sha256, 'GENESIS')
  );
  v_event_sha256 := encode(
    extensions.digest(convert_to(v_canonical::text, 'UTF8'), 'sha256'),
    'hex'
  );

  insert into public.cmmc_evidence_archive_events (
    archive_id,
    event_type,
    actor_ref,
    purpose,
    event_metadata,
    event_at,
    previous_event_sha256,
    event_sha256
  ) values (
    p_archive_id,
    p_event_type,
    trim(p_actor_ref),
    trim(p_purpose),
    p_event_metadata,
    v_event_at,
    v_previous_event_sha256,
    v_event_sha256
  );

  return v_event_sha256;
end;
$$;

revoke all on function public.cmmc_append_evidence_event(uuid, text, text, text, jsonb)
  from public, anon, authenticated, service_role;

create or replace function public.cmmc_archive_evidence(
  p_evidence_ref text,
  p_control_ids text[],
  p_title text,
  p_artifact_name text,
  p_content_type text,
  p_artifact_payload bytea,
  p_source_system text,
  p_source_created_at timestamptz,
  p_actor_ref text,
  p_release_sha text default null,
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
  v_artifact_sha256 text;
  v_previous_chain_sha256 text;
  v_chain_sha256 text;
  v_existing public.cmmc_evidence_archive%rowtype;
  v_canonical jsonb;
begin
  if p_evidence_ref is null or p_evidence_ref !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,199}$' then
    raise exception 'CMMC evidence reference is invalid';
  end if;
  if p_control_ids is null or cardinality(p_control_ids) not between 1 and 110 or
     array_position(p_control_ids, null) is not null or
     exists (
       select 1 from unnest(p_control_ids) as control_id
       where control_id !~ '^3\.([1-9]|1[0-4])\.[0-9]+$'
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
  if p_artifact_payload is null or octet_length(p_artifact_payload) not between 1 and 10485760 then
    raise exception 'CMMC evidence artifact must contain between 1 byte and 10 MiB';
  end if;
  if char_length(trim(coalesce(p_source_system, ''))) not between 2 and 200 then
    raise exception 'CMMC evidence source system is invalid';
  end if;
  if p_source_created_at is null or p_source_created_at > clock_timestamp() + interval '5 minutes' then
    raise exception 'CMMC evidence source timestamp is invalid';
  end if;
  if char_length(trim(coalesce(p_actor_ref, ''))) not between 3 and 255 then
    raise exception 'CMMC evidence actor reference is invalid';
  end if;
  if p_release_sha is not null and p_release_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'CMMC evidence release SHA is invalid';
  end if;
  if p_evidence_metadata is null or jsonb_typeof(p_evidence_metadata) <> 'object' or
     octet_length(p_evidence_metadata::text) > 65536 then
    raise exception 'CMMC evidence metadata is invalid';
  end if;
  if p_classification not in ('public', 'internal_non_cui') then
    raise exception 'CUI and secret-class evidence are not authorized for this archive';
  end if;

  v_artifact_sha256 := encode(extensions.digest(p_artifact_payload, 'sha256'), 'hex');

  perform pg_advisory_xact_lock(hashtext('public.cmmc_evidence_archive'));
  select * into v_existing
  from public.cmmc_evidence_archive
  where evidence_ref = p_evidence_ref;

  if found then
    if v_existing.artifact_sha256 <> v_artifact_sha256 then
      raise exception 'CMMC evidence reference already exists with a different artifact digest';
    end if;
    return jsonb_build_object(
      'archiveId', v_existing.archive_id,
      'evidenceRef', v_existing.evidence_ref,
      'artifactSha256', v_existing.artifact_sha256,
      'chainSha256', v_existing.chain_sha256,
      'retentionMode', v_existing.retention_mode,
      'legalHoldActive', v_existing.legal_hold_active,
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
    archived_at,
    previous_chain_sha256,
    chain_sha256
  ) values (
    v_archive_id,
    p_evidence_ref,
    p_control_ids,
    trim(p_title),
    trim(p_artifact_name),
    lower(p_content_type),
    p_artifact_payload,
    v_artifact_sha256,
    p_classification,
    trim(p_source_system),
    p_source_created_at,
    trim(p_actor_ref),
    p_release_sha,
    p_correlation_id,
    p_evidence_metadata,
    v_archived_at,
    v_previous_chain_sha256,
    v_chain_sha256
  );

  perform public.cmmc_append_evidence_event(
    v_archive_id,
    'archived',
    p_actor_ref,
    'Preserve controlled CMMC evidence under indefinite retention',
    jsonb_build_object(
      'evidenceRef', p_evidence_ref,
      'artifactSha256', v_artifact_sha256,
      'chainSha256', v_chain_sha256
    )
  );

  return jsonb_build_object(
    'archiveId', v_archive_id,
    'evidenceRef', p_evidence_ref,
    'artifactSha256', v_artifact_sha256,
    'chainSha256', v_chain_sha256,
    'retentionMode', 'indefinite',
    'legalHoldActive', true,
    'archivedAt', v_archived_at,
    'idempotentReplay', false
  );
end;
$$;

create or replace function public.cmmc_get_evidence(
  p_archive_id uuid,
  p_actor_ref text,
  p_access_purpose text
)
returns setof public.cmmc_evidence_archive
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.cmmc_evidence_archive where archive_id = p_archive_id) then
    raise exception 'CMMC evidence archive record is unavailable';
  end if;

  perform public.cmmc_append_evidence_event(
    p_archive_id,
    'accessed',
    p_actor_ref,
    p_access_purpose,
    '{}'::jsonb
  );

  return query
    select archive.*
    from public.cmmc_evidence_archive as archive
    where archive.archive_id = p_archive_id;
end;
$$;

create or replace function public.cmmc_list_evidence(
  p_actor_ref text,
  p_access_purpose text,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  archive_id uuid,
  sequence_id bigint,
  evidence_ref text,
  control_ids text[],
  title text,
  artifact_name text,
  content_type text,
  artifact_size_bytes bigint,
  artifact_sha256 text,
  classification text,
  source_system text,
  source_created_at timestamptz,
  release_sha text,
  correlation_id uuid,
  retention_mode text,
  legal_hold_active boolean,
  archived_at timestamptz,
  previous_chain_sha256 text,
  chain_sha256 text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 500 or p_offset < 0 then
    raise exception 'CMMC evidence catalog pagination is invalid';
  end if;

  perform public.cmmc_append_evidence_event(
    null,
    'catalog_read',
    p_actor_ref,
    p_access_purpose,
    jsonb_build_object('limit', p_limit, 'offset', p_offset)
  );

  return query
    select
      archive.archive_id,
      archive.sequence_id,
      archive.evidence_ref,
      archive.control_ids,
      archive.title,
      archive.artifact_name,
      archive.content_type,
      archive.artifact_size_bytes,
      archive.artifact_sha256,
      archive.classification,
      archive.source_system,
      archive.source_created_at,
      archive.release_sha,
      archive.correlation_id,
      archive.retention_mode,
      archive.legal_hold_active,
      archive.archived_at,
      archive.previous_chain_sha256,
      archive.chain_sha256
    from public.cmmc_evidence_archive as archive
    order by archive.sequence_id desc
    limit p_limit offset p_offset;
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
    'schemaVersion', 'cmmc-evidence-archive-v1',
    'operational', true,
    'retentionMode', 'indefinite',
    'legalHoldEnforced', true,
    'automaticDeletionEnabled', false,
    'cuiAccepted', false,
    'recordCount', count(*),
    'artifactBytes', coalesce(sum(artifact_size_bytes), 0),
    'latestArchivedAt', max(archived_at),
    'chainHeadSha256', (array_agg(chain_sha256 order by sequence_id desc))[1]
  )
  from public.cmmc_evidence_archive;
$$;

revoke all on function public.cmmc_archive_evidence(
  text, text[], text, text, text, bytea, text, timestamptz, text, text, jsonb, text, uuid
) from public, anon, authenticated;
revoke all on function public.cmmc_get_evidence(uuid, text, text) from public, anon, authenticated;
revoke all on function public.cmmc_list_evidence(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.cmmc_evidence_archive_health() from public, anon, authenticated;

grant execute on function public.cmmc_archive_evidence(
  text, text[], text, text, text, bytea, text, timestamptz, text, text, jsonb, text, uuid
) to service_role;
grant execute on function public.cmmc_get_evidence(uuid, text, text) to service_role;
grant execute on function public.cmmc_list_evidence(text, text, integer, integer) to service_role;
grant execute on function public.cmmc_evidence_archive_health() to service_role;

comment on table public.cmmc_evidence_archive is
  'Append-only PUBLIC/INTERNAL_NON_CUI CMMC evidence artifacts with enforced indefinite retention and SHA-256 hash chaining.';
comment on table public.cmmc_evidence_archive_events is
  'Append-only hash-chained CMMC evidence archive and access events.';
comment on function public.cmmc_archive_evidence(
  text, text[], text, text, text, bytea, text, timestamptz, text, text, jsonb, text, uuid
) is
  'Archives one real non-CUI evidence artifact, validates its SHA-256 digest, and preserves it under indefinite retention.';
