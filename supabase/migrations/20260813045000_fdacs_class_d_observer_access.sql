begin;

create table if not exists public.fdacs_class_d_observer_grants (
  id uuid primary key default gen_random_uuid(),
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  token_digest text not null unique check (token_digest ~ '^[0-9a-f]{64}$'),
  observer_label text not null check (char_length(observer_label) between 3 and 160),
  purpose text not null check (char_length(purpose) between 3 and 500),
  access_scope text not null default 'live_observer' check (access_scope = 'live_observer'),
  created_by_clerk_user_id text not null,
  created_by_role text not null check (created_by_role in ('school_admin','compliance_admin')),
  expires_at timestamptz not null,
  last_accessed_at timestamptz,
  access_count integer not null default 0 check (access_count >= 0),
  revoked_at timestamptz,
  revoked_by_clerk_user_id text,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  check (expires_at > created_at),
  check ((revoked_at is null and revoked_by_clerk_user_id is null) or (revoked_at is not null and revoked_by_clerk_user_id is not null))
);

create index if not exists fdacs_class_d_observer_grants_session_idx
  on public.fdacs_class_d_observer_grants(live_session_id, expires_at desc);
create index if not exists fdacs_class_d_observer_grants_active_idx
  on public.fdacs_class_d_observer_grants(token_digest, expires_at)
  where revoked_at is null;

alter table public.fdacs_class_d_audit_events
  drop constraint if exists fdacs_class_d_audit_events_entity_type_check;
alter table public.fdacs_class_d_audit_events
  add constraint fdacs_class_d_audit_events_entity_type_check
  check (entity_type in (
    'identity','enrollment','cohort','attendance','instruction_time','live_session','device_lease',
    'presence','presence_challenge','live_interaction','module_progress','learning_check','remediation',
    'record_hold','acknowledgment','enrollment_review','observer_access','exam','completion','lias'
  ));

create or replace function public.fdacs_class_d_record_observer_access(
  p_grant_id uuid,
  p_token_digest text,
  p_correlation_id uuid
)
returns table (
  grant_id uuid,
  live_session_id uuid,
  observer_label text,
  purpose text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant public.fdacs_class_d_observer_grants%rowtype;
begin
  if p_token_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid observer access token';
  end if;

  select * into v_grant
  from public.fdacs_class_d_observer_grants
  where id = p_grant_id
    and token_digest = lower(p_token_digest)
  for update;

  if v_grant.id is null then raise exception 'observer access grant not found'; end if;
  if v_grant.revoked_at is not null then raise exception 'observer access grant has been revoked'; end if;
  if v_grant.expires_at <= now() then raise exception 'observer access grant has expired'; end if;
  if not exists (
    select 1 from public.fdacs_class_d_live_sessions s
    where s.id = v_grant.live_session_id and s.status in ('live','break')
  ) then raise exception 'live session is not currently available for observer access'; end if;

  update public.fdacs_class_d_observer_grants
    set last_accessed_at = now(), access_count = access_count + 1
  where id = v_grant.id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'system', 'external_observer', 'observer_access', v_grant.id,
    'external_observer_accessed_live_session', p_correlation_id,
    jsonb_build_object(
      'liveSessionId', v_grant.live_session_id,
      'observerLabel', left(v_grant.observer_label, 160),
      'purpose', left(v_grant.purpose, 500),
      'grantExpiresAt', v_grant.expires_at
    )
  );

  return query select v_grant.id, v_grant.live_session_id, v_grant.observer_label, v_grant.purpose, v_grant.expires_at;
end;
$$;

alter table public.fdacs_class_d_observer_grants enable row level security;
alter table public.fdacs_class_d_observer_grants force row level security;

revoke all on table public.fdacs_class_d_observer_grants from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_observer_access(uuid,text,uuid) from public, anon, authenticated;

grant select, insert, update on table public.fdacs_class_d_observer_grants to service_role;
grant execute on function public.fdacs_class_d_record_observer_access(uuid,text,uuid) to service_role;

commit;
