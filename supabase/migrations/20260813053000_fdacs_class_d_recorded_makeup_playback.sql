begin;

create table if not exists public.fdacs_class_d_recorded_playback_sessions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.fdacs_class_d_makeup_assignments(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  clerk_user_id text not null check (char_length(clerk_user_id) between 3 and 255),
  clerk_session_id text not null check (char_length(clerk_session_id) between 3 and 255),
  browser_instance_id text not null check (char_length(browser_instance_id) between 12 and 180),
  status text not null default 'active' check (status in ('active','paused','challenge_required','completed','abandoned','invalidated')),
  playback_position_seconds integer not null default 0 check (playback_position_seconds >= 0),
  verified_watch_seconds integer not null default 0 check (verified_watch_seconds >= 0),
  uncredited_seconds integer not null default 0 check (uncredited_seconds >= 0),
  started_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  last_challenge_at timestamptz,
  challenge_due_at timestamptz not null default (now() + interval '110 minutes'),
  completed_at timestamptz,
  invalidated_at timestamptz,
  invalidation_reason text check (invalidation_reason is null or char_length(invalidation_reason) <= 500),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists fdacs_class_d_recorded_one_active_device_idx
  on public.fdacs_class_d_recorded_playback_sessions(enrollment_id)
  where status in ('active','paused','challenge_required');
create index if not exists fdacs_class_d_recorded_assignment_idx
  on public.fdacs_class_d_recorded_playback_sessions(assignment_id, created_at desc);

create table if not exists public.fdacs_class_d_recorded_playback_challenges (
  id uuid primary key default gen_random_uuid(),
  playback_session_id uuid not null references public.fdacs_class_d_recorded_playback_sessions(id) on delete restrict,
  assignment_id uuid not null references public.fdacs_class_d_makeup_assignments(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  challenge_code_digest text not null check (char_length(challenge_code_digest) = 64),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  attempt_count integer not null default 0 check (attempt_count between 0 and 2),
  status text not null default 'pending' check (status in ('pending','passed','failed','expired')),
  passed_at timestamptz,
  failed_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

create unique index if not exists fdacs_class_d_recorded_one_pending_challenge_idx
  on public.fdacs_class_d_recorded_playback_challenges(playback_session_id)
  where status = 'pending';

alter table public.fdacs_class_d_recorded_playback_sessions enable row level security;
alter table public.fdacs_class_d_recorded_playback_sessions force row level security;
alter table public.fdacs_class_d_recorded_playback_challenges enable row level security;
alter table public.fdacs_class_d_recorded_playback_challenges force row level security;

revoke all on table public.fdacs_class_d_recorded_playback_sessions from public, anon, authenticated;
revoke all on table public.fdacs_class_d_recorded_playback_challenges from public, anon, authenticated;
grant select, insert, update on table public.fdacs_class_d_recorded_playback_sessions to service_role;
grant select, insert, update on table public.fdacs_class_d_recorded_playback_challenges to service_role;

create or replace function public.fdacs_class_d_record_recorded_playback_heartbeat(
  p_playback_session_id uuid,
  p_clerk_user_id text,
  p_browser_instance_id text,
  p_observed_position_seconds integer,
  p_page_visible boolean,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.fdacs_class_d_recorded_playback_sessions%rowtype;
  v_assignment public.fdacs_class_d_makeup_assignments%rowtype;
  v_wall_seconds integer := 0;
  v_position_delta integer := 0;
  v_credit integer := 0;
  v_required_seconds integer := 0;
begin
  select * into v_session
  from public.fdacs_class_d_recorded_playback_sessions
  where id = p_playback_session_id
  for update;

  if v_session.id is null then raise exception 'recorded playback session not found'; end if;
  if v_session.clerk_user_id <> p_clerk_user_id then raise exception 'recorded playback user mismatch'; end if;
  if v_session.browser_instance_id <> p_browser_instance_id then raise exception 'recorded playback device mismatch'; end if;
  if v_session.status not in ('active','paused') then raise exception 'recorded playback session is not creditable'; end if;
  if p_observed_position_seconds < 0 then raise exception 'invalid playback position'; end if;

  select * into v_assignment
  from public.fdacs_class_d_makeup_assignments
  where id = v_session.assignment_id;
  if v_assignment.id is null or v_assignment.delivery_method <> 'recorded_makeup' then raise exception 'recorded make-up assignment not found'; end if;
  if v_assignment.status in ('cancelled','failed','certified') then raise exception 'recorded make-up assignment is closed'; end if;

  if now() >= v_session.challenge_due_at then
    update public.fdacs_class_d_recorded_playback_sessions
    set status = 'challenge_required', updated_at = now()
    where id = v_session.id;
    return jsonb_build_object('status','challenge_required','verifiedWatchSeconds',v_session.verified_watch_seconds,'requiredWatchSeconds',v_assignment.assigned_minutes * 60);
  end if;

  v_wall_seconds := greatest(0, least(75, floor(extract(epoch from (now() - v_session.last_heartbeat_at)))::integer));
  v_position_delta := p_observed_position_seconds - v_session.playback_position_seconds;

  if v_position_delta < -2 or v_position_delta > v_wall_seconds + 5 then
    update public.fdacs_class_d_recorded_playback_sessions
    set status = 'paused',
        uncredited_seconds = uncredited_seconds + greatest(v_wall_seconds, 0),
        last_heartbeat_at = now(),
        updated_at = now()
    where id = v_session.id;
    return jsonb_build_object('status','paused','reason','position_anomaly','verifiedWatchSeconds',v_session.verified_watch_seconds,'requiredWatchSeconds',v_assignment.assigned_minutes * 60);
  end if;

  if p_page_visible then
    v_credit := greatest(0, least(v_wall_seconds, v_position_delta));
  else
    v_credit := 0;
  end if;

  v_required_seconds := v_assignment.assigned_minutes * 60;
  update public.fdacs_class_d_recorded_playback_sessions
  set status = case when p_page_visible then 'active' else 'paused' end,
      playback_position_seconds = greatest(playback_position_seconds, p_observed_position_seconds),
      verified_watch_seconds = least(v_required_seconds, verified_watch_seconds + v_credit),
      uncredited_seconds = uncredited_seconds + greatest(0, v_wall_seconds - v_credit),
      last_heartbeat_at = now(),
      updated_at = now()
  where id = v_session.id
  returning * into v_session;

  return jsonb_build_object(
    'status',v_session.status,
    'verifiedWatchSeconds',v_session.verified_watch_seconds,
    'requiredWatchSeconds',v_required_seconds,
    'playbackPositionSeconds',v_session.playback_position_seconds,
    'challengeDueAt',v_session.challenge_due_at
  );
end;
$$;

revoke all on function public.fdacs_class_d_record_recorded_playback_heartbeat(uuid,text,text,integer,boolean,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_record_recorded_playback_heartbeat(uuid,text,text,integer,boolean,uuid) to service_role;

commit;
