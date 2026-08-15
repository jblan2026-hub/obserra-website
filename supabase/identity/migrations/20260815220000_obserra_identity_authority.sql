begin;

set local lock_timeout = '5s';
set local statement_timeout = '2min';

create schema if not exists identity_private;
revoke all on schema identity_private from public, anon, authenticated, service_role;

create table identity_private.subjects (
  principal_id text primary key
    check (principal_id ~ '^[A-Za-z0-9][A-Za-z0-9_.:-]{2,254}$'),
  status text not null default 'active'
    check (status in ('active', 'deprovisioned')),
  roles text[] not null default '{}'::text[]
    check (roles <@ array['owner', 'academy_admin', 'instructor', 'school_admin', 'compliance_admin']::text[]),
  role_version bigint not null default 1 check (role_version > 0),
  internal_identity boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table identity_private.provider_links (
  provider text not null default 'supabase' check (provider = 'supabase'),
  provider_subject uuid not null references auth.users(id) on delete restrict,
  principal_id text not null references identity_private.subjects(principal_id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'deprovisioned')),
  version bigint not null default 1 check (version > 0),
  linked_at timestamptz not null default now(),
  deprovisioned_at timestamptz,
  primary key (provider, provider_subject),
  unique (provider, principal_id),
  check (
    (status = 'active' and deprovisioned_at is null)
    or (status = 'deprovisioned' and deprovisioned_at is not null)
  )
);

create table identity_private.authorization_audit_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  provider text not null default 'supabase' check (provider = 'supabase'),
  provider_subject uuid,
  principal_id text,
  session_id uuid,
  decision text not null check (decision in ('authorized', 'denied', 'changed')),
  reason text not null check (char_length(reason) between 3 and 120),
  correlation_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object')
);

alter table identity_private.subjects enable row level security;
alter table identity_private.subjects force row level security;
alter table identity_private.provider_links enable row level security;
alter table identity_private.provider_links force row level security;
alter table identity_private.authorization_audit_events enable row level security;
alter table identity_private.authorization_audit_events force row level security;

revoke all on table identity_private.subjects from public, anon, authenticated, service_role;
revoke all on table identity_private.provider_links from public, anon, authenticated, service_role;
revoke all on table identity_private.authorization_audit_events from public, anon, authenticated, service_role;
revoke all on sequence identity_private.authorization_audit_events_id_seq from public, anon, authenticated, service_role;
grant usage on schema identity_private to service_role;
grant select on table identity_private.subjects to service_role;
grant select on table identity_private.provider_links to service_role;
grant select on table identity_private.authorization_audit_events to service_role;

create unique index identity_subjects_single_active_owner_idx
  on identity_private.subjects ((true))
  where status = 'active'
    and internal_identity
    and roles @> array['owner']::text[];

create index identity_provider_links_principal_idx
  on identity_private.provider_links (principal_id, status);

create index identity_audit_subject_occurred_idx
  on identity_private.authorization_audit_events (provider_subject, occurred_at desc);

create index identity_audit_correlation_idx
  on identity_private.authorization_audit_events (correlation_id);

create or replace function identity_private.identity_links_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'identity links are append-preserved';
  end if;
  if new.provider is distinct from old.provider
    or new.provider_subject is distinct from old.provider_subject
    or new.principal_id is distinct from old.principal_id then
    raise exception 'identity link ownership is immutable';
  end if;
  if old.status = 'deprovisioned' and new.status <> old.status then
    raise exception 'a deprovisioned identity link cannot be reactivated';
  end if;
  if new.status is distinct from old.status and new.version <> old.version + 1 then
    raise exception 'identity link status changes require the next version';
  end if;
  return new;
end;
$$;

create trigger identity_links_immutable
before update or delete on identity_private.provider_links
for each row execute function identity_private.identity_links_immutable();

create or replace function identity_private.authorization_audit_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'authorization audit history is append-only';
end;
$$;

create trigger authorization_audit_append_only
before update or delete on identity_private.authorization_audit_events
for each row execute function identity_private.authorization_audit_append_only();

create or replace function public.obserra_current_identity_authority(p_correlation_id uuid)
returns table (
  provider_subject uuid,
  principal_id text,
  session_id uuid,
  roles text[],
  role_version bigint,
  subject_active boolean,
  link_active boolean,
  session_active boolean,
  internal_identity boolean,
  role_fresh boolean,
  email_verified boolean,
  aal2 boolean,
  authorized boolean,
  reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_jwt jsonb := coalesce((select auth.jwt()), '{}'::jsonb);
  v_app_metadata jsonb;
  v_session_id uuid;
  v_principal_id text;
  v_roles text[] := '{}'::text[];
  v_claimed_roles text[] := '{}'::text[];
  v_role_version bigint;
  v_claimed_role_version bigint;
  v_subject_status text;
  v_link_status text;
  v_internal boolean := false;
  v_session_active boolean := false;
  v_role_fresh boolean := false;
  v_email_verified boolean := false;
  v_aal2 boolean := false;
  v_authorized boolean := false;
  v_reason text := 'identity_unbound';
begin
  if p_correlation_id is null then
    raise exception 'correlation id is required';
  end if;

  v_app_metadata := coalesce(v_jwt -> 'app_metadata', '{}'::jsonb);
  if coalesce(v_jwt ->> 'session_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    v_session_id := (v_jwt ->> 'session_id')::uuid;
  end if;
  if jsonb_typeof(v_app_metadata -> 'role_version') = 'number' then
    v_claimed_role_version := (v_app_metadata ->> 'role_version')::bigint;
  end if;
  if jsonb_typeof(v_app_metadata -> 'roles') = 'array' then
    select coalesce(array_agg(role_name order by role_name), '{}'::text[])
      into v_claimed_roles
      from (
        select distinct jsonb_array_elements_text(v_app_metadata -> 'roles') as role_name
      ) claimed;
  end if;
  v_aal2 := v_jwt ->> 'aal' = 'aal2';

  select s.principal_id, s.roles, s.role_version, s.status, s.internal_identity,
         l.status, u.email_confirmed_at is not null
    into v_principal_id, v_roles, v_role_version, v_subject_status, v_internal,
         v_link_status, v_email_verified
    from identity_private.provider_links l
    join identity_private.subjects s on s.principal_id = l.principal_id
    join auth.users u on u.id = l.provider_subject
   where l.provider = 'supabase' and l.provider_subject = v_uid;

  if v_session_id is not null and v_uid is not null then
    select exists (
      select 1 from auth.sessions ses
       where ses.id = v_session_id and ses.user_id = v_uid
    ) into v_session_active;
  end if;

  v_role_fresh := v_claimed_role_version = v_role_version
    and v_claimed_roles @> v_roles
    and v_roles @> v_claimed_roles;

  v_authorized := v_uid is not null
    and v_principal_id is not null
    and v_subject_status = 'active'
    and v_link_status = 'active'
    and v_session_active
    and v_internal
    and v_role_fresh
    and v_email_verified
    and v_aal2
    and v_roles @> array['owner']::text[];

  v_reason := case
    when v_uid is null then 'signed_out'
    when v_principal_id is null then 'identity_unbound'
    when v_subject_status <> 'active' then 'subject_deprovisioned'
    when v_link_status <> 'active' then 'identity_link_inactive'
    when not v_session_active then 'session_revoked'
    when not v_internal then 'internal_identity_unverified'
    when not v_role_fresh then 'role_stale'
    when not (v_roles @> array['owner']::text[]) then 'owner_role_required'
    when not v_email_verified then 'verified_email_required'
    when not v_aal2 then 'aal2_required'
    else 'internal_owner_authorized'
  end;

  insert into identity_private.authorization_audit_events (
    event_type, provider_subject, principal_id, session_id, decision, reason, correlation_id
  ) values (
    'authorization_decision', v_uid, v_principal_id, v_session_id,
    case when v_authorized then 'authorized' else 'denied' end,
    v_reason, p_correlation_id
  );

  return query select
    v_uid, v_principal_id, v_session_id, v_roles, v_role_version,
    v_subject_status = 'active', v_link_status = 'active', v_session_active,
    v_internal, v_role_fresh, v_email_verified, v_aal2, v_authorized, v_reason;
end;
$$;

create or replace function public.obserra_bind_identity(
  p_provider_subject uuid,
  p_principal_id text,
  p_roles text[],
  p_internal_identity boolean,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_roles text[];
  v_role_version bigint;
begin
  if p_correlation_id is null or p_provider_subject is null
    or p_principal_id !~ '^[A-Za-z0-9][A-Za-z0-9_.:-]{2,254}$' then
    raise exception 'valid subject, principal, and correlation id are required';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_provider_subject) then
    raise exception 'provider subject does not exist';
  end if;
  select coalesce(array_agg(role_name order by role_name), '{}'::text[])
    into v_roles from (select distinct unnest(p_roles) as role_name) normalized;
  if cardinality(v_roles) = 0 or not v_roles <@ array['owner', 'academy_admin', 'instructor', 'school_admin', 'compliance_admin']::text[] then
    raise exception 'roles are invalid';
  end if;

  insert into identity_private.subjects (principal_id, roles, internal_identity)
  values (p_principal_id, v_roles, p_internal_identity)
  on conflict (principal_id) do nothing;
  if not exists (
    select 1 from identity_private.subjects s
    where s.principal_id = p_principal_id and s.status = 'active'
      and s.roles = v_roles and s.internal_identity = p_internal_identity
  ) then
    raise exception 'subject binding conflicts with immutable authority';
  end if;

  insert into identity_private.provider_links (provider_subject, principal_id)
  values (p_provider_subject, p_principal_id)
  on conflict (provider, provider_subject) do nothing;
  if not exists (
    select 1 from identity_private.provider_links l
    where l.provider = 'supabase' and l.provider_subject = p_provider_subject
      and l.principal_id = p_principal_id and l.status = 'active'
  ) then
    raise exception 'provider identity is already bound';
  end if;

  select s.role_version into v_role_version
    from identity_private.subjects s
   where s.principal_id = p_principal_id and s.status = 'active';

  update auth.users u
     set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
       || jsonb_build_object(
         'obserra_subject_id', p_principal_id,
         'roles', to_jsonb(v_roles),
         'role_version', v_role_version,
         'identity_status', 'active'
       ),
       updated_at = now()
   where u.id = p_provider_subject;
  if not found then raise exception 'provider claims were not updated'; end if;

  delete from auth.sessions ses where ses.user_id = p_provider_subject;

  insert into identity_private.authorization_audit_events (
    event_type, provider_subject, principal_id, decision, reason, correlation_id,
    metadata
  ) values (
    'identity_link_bound', p_provider_subject, p_principal_id, 'changed',
    'identity_link_bound', p_correlation_id,
    jsonb_build_object('role_version', v_role_version, 'internal_identity', p_internal_identity)
  );
end;
$$;

create or replace function public.obserra_request_owner_activation(p_correlation_id uuid)
returns table (
  accepted boolean,
  reason text,
  provider_subject uuid,
  principal_id text,
  session_id uuid,
  correlation_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_authority record;
begin
  if p_correlation_id is null then
    raise exception 'correlation id is required';
  end if;

  select * into v_authority
    from public.obserra_current_identity_authority(p_correlation_id);

  insert into identity_private.authorization_audit_events (
    event_type, provider_subject, principal_id, session_id, decision, reason,
    correlation_id, metadata
  ) values (
    'owner_activation_requested',
    v_authority.provider_subject,
    v_authority.principal_id,
    v_authority.session_id,
    case when v_authority.authorized then 'authorized' else 'denied' end,
    case when v_authority.authorized then 'activation_request_recorded' else v_authority.reason end,
    p_correlation_id,
    jsonb_build_object(
      'authority_reason', v_authority.reason,
      'role_version', v_authority.role_version,
      'aal2', v_authority.aal2
    )
  );

  return query select
    v_authority.authorized,
    case when v_authority.authorized then 'activation_request_recorded' else v_authority.reason end,
    v_authority.provider_subject,
    v_authority.principal_id,
    v_authority.session_id,
    p_correlation_id;
end;
$$;

create or replace function public.obserra_set_subject_roles(
  p_principal_id text,
  p_roles text[],
  p_correlation_id uuid
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_roles text[];
  v_version bigint;
begin
  if p_correlation_id is null then raise exception 'correlation id is required'; end if;
  select coalesce(array_agg(role_name order by role_name), '{}'::text[])
    into v_roles from (select distinct unnest(p_roles) as role_name) normalized;
  if cardinality(v_roles) = 0 or not v_roles <@ array['owner', 'academy_admin', 'instructor', 'school_admin', 'compliance_admin']::text[] then
    raise exception 'roles are invalid';
  end if;

  update identity_private.subjects s
     set roles = v_roles, role_version = s.role_version + 1, updated_at = now()
   where s.principal_id = p_principal_id and s.status = 'active'
     and s.roles is distinct from v_roles
  returning s.role_version into v_version;
  if v_version is null then raise exception 'active subject role change was not applied'; end if;

  update auth.users u
     set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
       || jsonb_build_object(
         'obserra_subject_id', p_principal_id,
         'roles', to_jsonb(v_roles),
         'role_version', v_version,
         'identity_status', 'active'
       ),
       updated_at = now()
    from identity_private.provider_links l
   where l.provider = 'supabase'
     and l.principal_id = p_principal_id
     and l.status = 'active'
     and u.id = l.provider_subject;
  if not found then raise exception 'provider claims were not updated'; end if;

  delete from auth.sessions ses using identity_private.provider_links l
   where l.principal_id = p_principal_id and l.provider_subject = ses.user_id;
  insert into identity_private.authorization_audit_events (
    event_type, principal_id, decision, reason, correlation_id, metadata
  ) values (
    'subject_roles_changed', p_principal_id, 'changed', 'role_version_changed',
    p_correlation_id, jsonb_build_object('role_version', v_version)
  );
  return v_version;
end;
$$;

create or replace function public.obserra_deprovision_subject(
  p_principal_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version bigint;
begin
  if p_correlation_id is null then raise exception 'correlation id is required'; end if;
  update identity_private.subjects s
     set status = 'deprovisioned', role_version = s.role_version + 1, updated_at = now()
   where s.principal_id = p_principal_id and s.status = 'active'
  returning s.role_version into v_version;
  if not found then raise exception 'active subject was not found'; end if;

  update identity_private.provider_links l
     set status = 'deprovisioned', version = l.version + 1, deprovisioned_at = now()
   where l.principal_id = p_principal_id and l.status = 'active';

  update auth.users u
     set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
       || jsonb_build_object(
         'obserra_subject_id', p_principal_id,
         'roles', '[]'::jsonb,
         'role_version', v_version,
         'identity_status', 'deprovisioned'
       ),
       updated_at = now()
    from identity_private.provider_links l
   where l.provider = 'supabase'
     and l.principal_id = p_principal_id
     and u.id = l.provider_subject;
  if not found then raise exception 'provider claims were not deprovisioned'; end if;

  delete from auth.sessions ses using identity_private.provider_links l
   where l.principal_id = p_principal_id and l.provider_subject = ses.user_id;
  insert into identity_private.authorization_audit_events (
    event_type, principal_id, decision, reason, correlation_id
  ) values (
    'subject_deprovisioned', p_principal_id, 'changed', 'subject_deprovisioned', p_correlation_id
  );
end;
$$;

revoke all on function public.obserra_current_identity_authority(uuid) from public, anon, authenticated, service_role;
grant execute on function public.obserra_current_identity_authority(uuid) to authenticated;
revoke all on function public.obserra_request_owner_activation(uuid) from public, anon, authenticated, service_role;
grant execute on function public.obserra_request_owner_activation(uuid) to authenticated;

revoke all on function public.obserra_bind_identity(uuid, text, text[], boolean, uuid) from public, anon, authenticated, service_role;
revoke all on function public.obserra_set_subject_roles(text, text[], uuid) from public, anon, authenticated, service_role;
revoke all on function public.obserra_deprovision_subject(text, uuid) from public, anon, authenticated, service_role;
grant execute on function public.obserra_bind_identity(uuid, text, text[], boolean, uuid) to service_role;
grant execute on function public.obserra_set_subject_roles(text, text[], uuid) to service_role;
grant execute on function public.obserra_deprovision_subject(text, uuid) to service_role;

revoke all on function identity_private.identity_links_immutable() from public, anon, authenticated, service_role;
revoke all on function identity_private.authorization_audit_append_only() from public, anon, authenticated, service_role;

do $authority_privilege_assertions$
begin
  if not has_schema_privilege('service_role', 'identity_private', 'USAGE')
    or has_schema_privilege('anon', 'identity_private', 'USAGE')
    or has_schema_privilege('authenticated', 'identity_private', 'USAGE')
    or not has_table_privilege('service_role', 'identity_private.subjects', 'SELECT')
    or not has_table_privilege('service_role', 'identity_private.provider_links', 'SELECT')
    or not has_table_privilege('service_role', 'identity_private.authorization_audit_events', 'SELECT')
    or has_table_privilege('service_role', 'identity_private.subjects', 'INSERT,UPDATE,DELETE')
    or has_table_privilege('service_role', 'identity_private.provider_links', 'INSERT,UPDATE,DELETE')
    or has_table_privilege('service_role', 'identity_private.authorization_audit_events', 'INSERT,UPDATE,DELETE')
    or has_sequence_privilege('service_role', 'identity_private.authorization_audit_events_id_seq', 'USAGE')
    or not has_function_privilege('authenticated', 'public.obserra_current_identity_authority(uuid)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.obserra_request_owner_activation(uuid)', 'EXECUTE')
    or has_function_privilege('anon', 'public.obserra_current_identity_authority(uuid)', 'EXECUTE')
    or has_function_privilege('anon', 'public.obserra_request_owner_activation(uuid)', 'EXECUTE')
    or has_function_privilege('service_role', 'public.obserra_current_identity_authority(uuid)', 'EXECUTE')
    or has_function_privilege('service_role', 'public.obserra_request_owner_activation(uuid)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.obserra_bind_identity(uuid,text,text[],boolean,uuid)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.obserra_set_subject_roles(text,text[],uuid)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.obserra_deprovision_subject(text,uuid)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.obserra_bind_identity(uuid,text,text[],boolean,uuid)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.obserra_set_subject_roles(text,text[],uuid)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.obserra_deprovision_subject(text,uuid)', 'EXECUTE')
    or has_function_privilege('service_role', 'identity_private.identity_links_immutable()', 'EXECUTE')
    or has_function_privilege('service_role', 'identity_private.authorization_audit_append_only()', 'EXECUTE') then
    raise exception 'identity authority privilege assertion failed';
  end if;
end;
$authority_privilege_assertions$;

commit;
