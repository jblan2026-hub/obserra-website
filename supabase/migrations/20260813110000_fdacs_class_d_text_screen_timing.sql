begin;

create table if not exists public.fdacs_class_d_live_text_screens (
  id uuid primary key default gen_random_uuid(),
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 240),
  body text not null check (char_length(body) between 10 and 12000),
  word_count integer not null check (word_count > 0),
  minimum_seconds integer not null check (minimum_seconds > 0),
  status text not null default 'open' check (status in ('open','closed')),
  opened_by_clerk_user_id text not null,
  opened_at timestamptz not null default now(),
  discussion_confirmed_by_clerk_user_id text,
  discussion_confirmed_at timestamptz,
  discussion_note text check (discussion_note is null or char_length(discussion_note) between 3 and 1000),
  closed_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  check (
    (status = 'open' and closed_at is null)
    or
    (status = 'closed' and closed_at is not null and discussion_confirmed_at is not null)
  )
);

create unique index if not exists fdacs_class_d_one_open_text_screen_idx
  on public.fdacs_class_d_live_text_screens(live_session_id)
  where status = 'open';

create index if not exists fdacs_class_d_live_text_screens_session_idx
  on public.fdacs_class_d_live_text_screens(live_session_id, opened_at desc);

create table if not exists public.fdacs_class_d_live_text_screen_views (
  id uuid primary key default gen_random_uuid(),
  text_screen_id uuid not null references public.fdacs_class_d_live_text_screens(id) on delete restrict,
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  device_lease_id uuid not null references public.fdacs_class_d_device_leases(id) on delete restrict,
  first_seen_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  observed_seconds integer not null default 0 check (observed_seconds >= 0),
  requirement_met_at timestamptz,
  acknowledged_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  unique (text_screen_id, enrollment_id),
  check (acknowledged_at is null or requirement_met_at is not null)
);

create index if not exists fdacs_class_d_live_text_screen_views_session_idx
  on public.fdacs_class_d_live_text_screen_views(live_session_id, enrollment_id, first_seen_at);

create or replace function public.fdacs_class_d_open_live_text_screen(
  p_live_session_id uuid,
  p_title text,
  p_body text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_screen_id uuid;
  v_word_count integer;
  v_minimum_seconds integer;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'text screen creation requires authorized instructional staff';
  end if;
  if p_title is null or char_length(trim(p_title)) not between 3 and 240 then
    raise exception 'text screen title is invalid';
  end if;
  if p_body is null or char_length(trim(p_body)) not between 10 and 12000 then
    raise exception 'text screen body is invalid';
  end if;
  if not exists (
    select 1 from public.fdacs_class_d_live_sessions
    where id = p_live_session_id
      and status = 'live'
      and current_segment_type = 'instruction'
  ) then
    raise exception 'text screens may open only during live instruction';
  end if;
  if exists (
    select 1 from public.fdacs_class_d_live_text_screens
    where live_session_id = p_live_session_id and status = 'open'
  ) then
    raise exception 'only one instructional text screen may be open at a time';
  end if;

  v_word_count := array_length(regexp_split_to_array(trim(p_body), E'\\s+'), 1);
  if v_word_count is null or v_word_count < 1 then raise exception 'text screen word count is invalid'; end if;
  v_minimum_seconds := greatest(1, ((v_word_count * 60) + 49) / 50);

  insert into public.fdacs_class_d_live_text_screens (
    live_session_id, title, body, word_count, minimum_seconds,
    opened_by_clerk_user_id, correlation_id
  ) values (
    p_live_session_id, trim(p_title), trim(p_body), v_word_count, v_minimum_seconds,
    p_actor_clerk_user_id, p_correlation_id
  ) returning id into v_screen_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'live_interaction', v_screen_id,
    'instructional_text_screen_opened', p_correlation_id,
    jsonb_build_object(
      'liveSessionId', p_live_session_id,
      'wordCount', v_word_count,
      'minimumSeconds', v_minimum_seconds
    )
  );

  return v_screen_id;
end;
$$;

create or replace function public.fdacs_class_d_begin_live_text_screen_view(
  p_text_screen_id uuid,
  p_device_lease_id uuid,
  p_clerk_user_id text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_screen public.fdacs_class_d_live_text_screens%rowtype;
  v_enrollment_id uuid;
  v_view public.fdacs_class_d_live_text_screen_views%rowtype;
begin
  select * into v_screen
  from public.fdacs_class_d_live_text_screens
  where id = p_text_screen_id and status = 'open';
  if v_screen.id is null then raise exception 'instructional text screen is not open'; end if;

  select dl.enrollment_id into v_enrollment_id
  from public.fdacs_class_d_device_leases dl
  join public.fdacs_class_d_enrollments e on e.id = dl.enrollment_id
  where dl.id = p_device_lease_id
    and dl.live_session_id = v_screen.live_session_id
    and dl.released_at is null
    and dl.last_heartbeat_at >= now() - interval '150 seconds'
    and e.clerk_user_id = p_clerk_user_id
  limit 1;
  if v_enrollment_id is null then raise exception 'active authenticated device lease is required for instructional text timing'; end if;

  insert into public.fdacs_class_d_live_text_screen_views (
    text_screen_id, live_session_id, enrollment_id, device_lease_id, correlation_id
  ) values (
    v_screen.id, v_screen.live_session_id, v_enrollment_id, p_device_lease_id, p_correlation_id
  )
  on conflict (text_screen_id, enrollment_id) do update
    set device_lease_id = excluded.device_lease_id,
        last_heartbeat_at = now()
  returning * into v_view;

  return jsonb_build_object(
    'viewId', v_view.id,
    'observedSeconds', v_view.observed_seconds,
    'minimumSeconds', v_screen.minimum_seconds,
    'requirementMet', v_view.requirement_met_at is not null,
    'acknowledged', v_view.acknowledged_at is not null
  );
end;
$$;

create or replace function public.fdacs_class_d_heartbeat_live_text_screen_view(
  p_text_screen_id uuid,
  p_device_lease_id uuid,
  p_clerk_user_id text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_screen public.fdacs_class_d_live_text_screens%rowtype;
  v_view public.fdacs_class_d_live_text_screen_views%rowtype;
  v_elapsed integer;
  v_credit integer;
  v_observed integer;
begin
  select * into v_screen
  from public.fdacs_class_d_live_text_screens
  where id = p_text_screen_id and status = 'open';
  if v_screen.id is null then raise exception 'instructional text screen is not open'; end if;

  select v.* into v_view
  from public.fdacs_class_d_live_text_screen_views v
  join public.fdacs_class_d_device_leases dl on dl.id = v.device_lease_id
  join public.fdacs_class_d_enrollments e on e.id = v.enrollment_id
  where v.text_screen_id = p_text_screen_id
    and v.device_lease_id = p_device_lease_id
    and e.clerk_user_id = p_clerk_user_id
    and dl.released_at is null
    and dl.last_heartbeat_at >= now() - interval '150 seconds'
  for update of v;
  if v_view.id is null then raise exception 'instructional text view has not been started'; end if;

  v_elapsed := greatest(0, floor(extract(epoch from (now() - v_view.last_heartbeat_at)))::integer);
  v_credit := least(v_elapsed, 20);
  v_observed := v_view.observed_seconds + v_credit;

  update public.fdacs_class_d_live_text_screen_views
    set observed_seconds = v_observed,
        last_heartbeat_at = now(),
        requirement_met_at = case
          when requirement_met_at is not null then requirement_met_at
          when v_observed >= v_screen.minimum_seconds then now()
          else null
        end
  where id = v_view.id;

  return jsonb_build_object(
    'viewId', v_view.id,
    'observedSeconds', v_observed,
    'minimumSeconds', v_screen.minimum_seconds,
    'requirementMet', v_observed >= v_screen.minimum_seconds,
    'acknowledged', v_view.acknowledged_at is not null
  );
end;
$$;

create or replace function public.fdacs_class_d_acknowledge_live_text_screen(
  p_text_screen_id uuid,
  p_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_view_id uuid;
  v_enrollment_id uuid;
  v_minimum integer;
  v_observed integer;
begin
  select v.id, v.enrollment_id, s.minimum_seconds, v.observed_seconds
    into v_view_id, v_enrollment_id, v_minimum, v_observed
  from public.fdacs_class_d_live_text_screen_views v
  join public.fdacs_class_d_live_text_screens s on s.id = v.text_screen_id
  join public.fdacs_class_d_enrollments e on e.id = v.enrollment_id
  where v.text_screen_id = p_text_screen_id
    and e.clerk_user_id = p_clerk_user_id
  for update of v;

  if v_view_id is null then raise exception 'instructional text view not found'; end if;
  if v_observed < v_minimum then raise exception 'minimum instructional text screen time has not been met'; end if;

  update public.fdacs_class_d_live_text_screen_views
    set requirement_met_at = coalesce(requirement_met_at, now()),
        acknowledged_at = coalesce(acknowledged_at, now())
  where id = v_view_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'student', p_clerk_user_id, 'live_interaction', v_view_id,
    'instructional_text_screen_acknowledged', p_correlation_id,
    jsonb_build_object('textScreenId', p_text_screen_id, 'enrollmentId', v_enrollment_id, 'observedSeconds', v_observed)
  );
end;
$$;

create or replace function public.fdacs_class_d_close_live_text_screen(
  p_text_screen_id uuid,
  p_discussion_note text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_ack_count integer;
  v_view_count integer;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'text screen closure requires authorized instructional staff';
  end if;
  if p_discussion_note is null or char_length(trim(p_discussion_note)) not between 3 and 1000 then
    raise exception 'instructor discussion confirmation is required before closing the text screen';
  end if;

  update public.fdacs_class_d_live_text_screens
    set status = 'closed',
        discussion_confirmed_by_clerk_user_id = p_actor_clerk_user_id,
        discussion_confirmed_at = now(),
        discussion_note = trim(p_discussion_note),
        closed_at = now()
  where id = p_text_screen_id and status = 'open'
  returning live_session_id into v_session_id;
  if v_session_id is null then raise exception 'open instructional text screen not found'; end if;

  select count(*), count(*) filter (where acknowledged_at is not null)
    into v_view_count, v_ack_count
  from public.fdacs_class_d_live_text_screen_views
  where text_screen_id = p_text_screen_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'live_interaction', p_text_screen_id,
    'instructional_text_screen_closed_after_discussion', p_correlation_id,
    jsonb_build_object('liveSessionId', v_session_id, 'viewCount', v_view_count, 'acknowledgedCount', v_ack_count)
  );
end;
$$;

alter table public.fdacs_class_d_live_text_screens enable row level security;
alter table public.fdacs_class_d_live_text_screens force row level security;
alter table public.fdacs_class_d_live_text_screen_views enable row level security;
alter table public.fdacs_class_d_live_text_screen_views force row level security;

revoke all on table public.fdacs_class_d_live_text_screens from public, anon, authenticated;
revoke all on table public.fdacs_class_d_live_text_screen_views from public, anon, authenticated;
revoke all on function public.fdacs_class_d_open_live_text_screen(uuid,text,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_begin_live_text_screen_view(uuid,uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_heartbeat_live_text_screen_view(uuid,uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_acknowledge_live_text_screen(uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_close_live_text_screen(uuid,text,text,text,uuid) from public, anon, authenticated;

grant select, insert, update on table public.fdacs_class_d_live_text_screens to service_role;
grant select, insert, update on table public.fdacs_class_d_live_text_screen_views to service_role;
grant execute on function public.fdacs_class_d_open_live_text_screen(uuid,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_begin_live_text_screen_view(uuid,uuid,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_heartbeat_live_text_screen_view(uuid,uuid,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_acknowledge_live_text_screen(uuid,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_close_live_text_screen(uuid,text,text,text,uuid) to service_role;

commit;
