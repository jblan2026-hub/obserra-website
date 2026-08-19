begin;

set local lock_timeout = '5s';
set local statement_timeout = '2min';

create schema if not exists connector_private;
revoke all on schema connector_private from public, anon, authenticated;
grant usage on schema connector_private to service_role;

create table public.integration_connectors (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  tenant_key text not null check (tenant_key ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  connector_key text not null check (connector_key ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  provider text not null check (length(provider) between 1 and 120),
  display_name text not null check (length(display_name) between 1 and 200),
  base_url text not null check (base_url ~ '^https://'),
  allowed_hostname text not null check (length(allowed_hostname) between 1 and 253),
  activated boolean not null default false,
  health_state text not null default 'inactive'
    check (health_state in ('inactive','healthy','degraded','unavailable','open_circuit','misconfigured')),
  failure_count integer not null default 0 check (failure_count >= 0),
  circuit_open_until timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error_code text check (last_error_code is null or length(last_error_code) <= 160),
  config_version integer not null default 1 check (config_version > 0),
  provenance jsonb not null default '{}'::jsonb check (jsonb_typeof(provenance) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, tenant_key, connector_key),
  unique (id, owner_user_id, tenant_key)
);

create index integration_connectors_tenant_health_idx
  on public.integration_connectors (owner_user_id, tenant_key, health_state, connector_key);
create index integration_connectors_open_circuit_idx
  on public.integration_connectors (circuit_open_until)
  where circuit_open_until is not null;

alter table public.integration_connectors enable row level security;
alter table public.integration_connectors force row level security;
revoke all on table public.integration_connectors from public, anon, authenticated;
grant select, insert, update on table public.integration_connectors to service_role;

create table connector_private.connector_secrets (
  connector_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  tenant_key text not null check (tenant_key ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  secret_name text not null check (secret_name ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  secret_envelope text not null check (length(secret_envelope) between 16 and 100000),
  encryption_key_id text not null check (encryption_key_id ~ '^[A-Za-z0-9_.:-]{1,64}$'),
  rotated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (connector_id, secret_name),
  foreign key (connector_id, owner_user_id, tenant_key)
    references public.integration_connectors(id, owner_user_id, tenant_key)
    on delete cascade
);

revoke all on table connector_private.connector_secrets from public, anon, authenticated;
grant select, insert, update, delete on table connector_private.connector_secrets to service_role;

create table public.integration_connector_health_events (
  id bigint generated always as identity primary key,
  connector_id uuid not null references public.integration_connectors(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  tenant_key text not null check (tenant_key ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  connector_key text not null check (connector_key ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  provider text not null check (length(provider) between 1 and 120),
  correlation_id uuid not null,
  health_state text not null
    check (health_state in ('inactive','healthy','degraded','unavailable','open_circuit','misconfigured')),
  failure_class text check (failure_class is null or length(failure_class) <= 80),
  error_code text check (error_code is null or length(error_code) <= 160),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  attempt_count integer not null check (attempt_count > 0),
  provider_status integer check (provider_status is null or provider_status between 100 and 599),
  occurred_at timestamptz not null default now()
);

create index integration_connector_health_tenant_time_idx
  on public.integration_connector_health_events (owner_user_id, tenant_key, occurred_at desc);
create index integration_connector_health_connector_time_idx
  on public.integration_connector_health_events (connector_id, occurred_at desc);
create index integration_connector_health_correlation_idx
  on public.integration_connector_health_events (correlation_id);

alter table public.integration_connector_health_events enable row level security;
alter table public.integration_connector_health_events force row level security;
revoke all on table public.integration_connector_health_events from public, anon, authenticated;
grant select, insert on table public.integration_connector_health_events to service_role;

comment on table public.integration_connector_health_events is
  'append-only connector health telemetry; update and delete are intentionally not granted.';

create table public.integration_connector_failures (
  id bigint generated always as identity primary key,
  connector_id uuid not null references public.integration_connectors(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  tenant_key text not null check (tenant_key ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  correlation_id uuid not null,
  operation_key text not null check (operation_key ~ '^[a-z0-9][a-z0-9_.:-]{1,127}$'),
  failure_class text not null check (length(failure_class) between 1 and 80),
  error_code text not null check (length(error_code) between 1 and 160),
  payload_digest text check (payload_digest is null or payload_digest ~ '^[0-9a-f]{64}$'),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null,
  claimed_at timestamptz,
  resolved_at timestamptz,
  dead_lettered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connector_id, correlation_id, operation_key)
);

create index integration_connector_failures_ready_idx
  on public.integration_connector_failures (next_attempt_at, id)
  where resolved_at is null and dead_lettered_at is null;
create index integration_connector_failures_tenant_idx
  on public.integration_connector_failures (owner_user_id, tenant_key, created_at desc);
create index integration_connector_failures_correlation_idx
  on public.integration_connector_failures (correlation_id);

alter table public.integration_connector_failures enable row level security;
alter table public.integration_connector_failures force row level security;
revoke all on table public.integration_connector_failures from public, anon, authenticated;
grant select, insert, update on table public.integration_connector_failures to service_role;

create or replace function public.obserra_connector_store_secret(
  p_connector_id uuid,
  p_owner_user_id uuid,
  p_tenant_key text,
  p_secret_name text,
  p_secret_envelope text,
  p_encryption_key_id text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.integration_connectors c
    where c.id = p_connector_id
      and c.owner_user_id = p_owner_user_id
      and c.tenant_key = p_tenant_key
  ) then
    raise exception 'connector identity mismatch' using errcode = '42501';
  end if;

  insert into connector_private.connector_secrets (
    connector_id,
    owner_user_id,
    tenant_key,
    secret_name,
    secret_envelope,
    encryption_key_id,
    updated_at
  ) values (
    p_connector_id,
    p_owner_user_id,
    p_tenant_key,
    p_secret_name,
    p_secret_envelope,
    p_encryption_key_id,
    now()
  )
  on conflict (connector_id, secret_name)
  do update set
    owner_user_id = excluded.owner_user_id,
    tenant_key = excluded.tenant_key,
    secret_envelope = excluded.secret_envelope,
    encryption_key_id = excluded.encryption_key_id,
    rotated_at = now(),
    updated_at = now();
end;
$$;

revoke all on function public.obserra_connector_store_secret(uuid, uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.obserra_connector_store_secret(uuid, uuid, text, text, text, text)
  to service_role;

create or replace function public.obserra_connector_load_secret(
  p_connector_id uuid,
  p_owner_user_id uuid,
  p_tenant_key text,
  p_secret_name text
)
returns table(secret_envelope text, encryption_key_id text)
language sql
stable
security invoker
set search_path = ''
as $$
  select s.secret_envelope, s.encryption_key_id
  from connector_private.connector_secrets s
  where s.connector_id = p_connector_id
    and s.owner_user_id = p_owner_user_id
    and s.tenant_key = p_tenant_key
    and s.secret_name = p_secret_name
  limit 1
$$;

revoke all on function public.obserra_connector_load_secret(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.obserra_connector_load_secret(uuid, uuid, text, text)
  to service_role;

do $$
begin
  if has_schema_privilege('anon', 'connector_private', 'USAGE')
    or has_schema_privilege('authenticated', 'connector_private', 'USAGE')
    or has_function_privilege('anon', 'public.obserra_connector_load_secret(uuid,uuid,text,text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.obserra_connector_load_secret(uuid,uuid,text,text)', 'EXECUTE')
  then
    raise exception 'connector private boundary is not fail closed';
  end if;
end
$$;

commit;
