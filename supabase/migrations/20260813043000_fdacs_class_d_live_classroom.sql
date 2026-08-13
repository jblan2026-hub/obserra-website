begin;

create table if not exists public.fdacs_class_d_live_sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.fdacs_class_d_cohorts(id) on delete restrict,
  day integer not null check (day between 1 and 5),
  lesson_id text not null check (lesson_id ~ '^D[1-5]-L[1-4]$'),
  instructor_clerk_user_id text not null,
  instructor_license_number text not null check (char_length(instructor_license_number) between 3 and 80),
  school_license_number text not null check (char_length(school_license_number) between 3 and 80),
  physical_location_state text not null default 'FL' check (physical_location_state = 'FL'),
  status text not null default 'scheduled' check (status in ('scheduled','live','break','ended','cancelled')),
  current_segment_type text not null default 'instruction' check (current_segment_type in ('instruction','break')),
  current_segment_started_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  inspection_access_reference text check (inspection_access_reference is null or char_length(inspection_access_reference) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, day, lesson_id)
);

create table if not exists public.fdacs_class_d_device_leases (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  clerk_session_id text not null check (char_length(clerk_session_id) between 3 and 255),
  browser_instance_id text not null check (char_length(browser_instance_id) between 12 and 180),
  acquired_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  released_at timestamptz,
  release_reason text check (release_reason is null or char_length(release_reason) <= 200)
);

create unique index if not exists fdacs_class_d_one_active_device_idx
  on public.fdacs_class_d_device_leases(enrollment_id)
  where released_at is null;
create index if not exists fdacs_class_d_device_session_idx
  on public.fdacs_class_d_device_leases(live_session_id, enrollment_id, last_heartbeat_at desc);

create table if not exists public.fdacs_class_d_live_time_totals (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  day integer not null check (day between 1 and 5),
  connected_seconds integer not null default 0 check (connected_seconds >= 0),
  instructional_presence_seconds integer not null default 0 check (instructional_presence_seconds >= 0),
  break_presence_seconds integer not null default 0 check (break_presence_seconds >= 0),
  uncredited_connected_seconds integer not null default 0 check (uncredited_connected_seconds >= 0),
  presence_state text not null default 'present' check (presence_state in ('present','absent_challenge','restored_after_review')),
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, live_session_id)
);

create index if not exists fdacs_class_d_live_time_enrollment_day_idx
  on public.fdacs_class_d_live_time_totals(enrollment_id, day);

create table if not exists public.fdacs_class_d_presence_challenges (
  id uuid primary key default gen_random_uuid(),
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  challenge_type text not null check (challenge_type in ('presence_code','lesson_check','instructor_prompt')),
  prompt text not null check (char_length(prompt) between 1 and 1000),
  answer_digest text not null check (char_length(answer_digest) = 64),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  retry_expires_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count between 0 and 2),
  status text not null default 'pending' check (status in ('pending','passed','retry_required','failed')),
  passed_at timestamptz,
  failed_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_challenge_pending_idx
  on public.fdacs_class_d_presence_challenges(enrollment_id, status, expires_at);

create table if not exists public.fdacs_class_d_live_interactions (
  id uuid primary key default gen_random_uuid(),
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  enrollment_id uuid references public.fdacs_class_d_enrollments(id) on delete restrict,
  actor_role text not null check (actor_role in ('student','instructor')),
  actor_clerk_user_id text not null,
  interaction_type text not null check (interaction_type in ('student_question','instructor_answer','instructor_prompt','student_response','hand_raise','poll_response')),
  content text check (content is null or char_length(content) <= 4000),
  parent_interaction_id uuid references public.fdacs_class_d_live_interactions(id) on delete restrict,
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_live_interactions_session_idx
  on public.fdacs_class_d_live_interactions(live_session_id, created_at, id);
create index if not exists fdacs_class_d_live_interactions_enrollment_idx
  on public.fdacs_class_d_live_interactions(enrollment_id, created_at);

alter table public.fdacs_class_d_audit_events
  drop constraint if exists fdacs_class_d_audit_events_entity_type_check;
alter table public.fdacs_class_d_audit_events
  add constraint fdacs_class_d_audit_events_entity_type_check
  check (entity_type in (
    'identity','enrollment','cohort','attendance','instruction_time','live_session','device_lease',
    'presence','presence_challenge','live_interaction','module_progress','learning_check','remediation',
    'record_hold','acknowledgment','enrollment_review','exam','completion','lias'
  ));

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
set search_path = public
as $$
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'live instruction requires authorized Class D staff';
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
        current_segment_started_at = now(),
        started_at = coalesce(started_at, now()),
        instructor_clerk_user_id = p_actor_clerk_user_id,
        instructor_license_number = trim(p_instructor_license_number),
        school_license_number = trim(p_school_license_number),
        inspection_access_reference = p_inspection_access_reference,
        updated_at = now()
  where id = p_live_session_id and status = 'scheduled';

  if not found then
    raise exception 'live session is not eligible to start';
  end if;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'live_session', p_live_session_id,
    'live_session_started', p_correlation_id,
    jsonb_build_object('physicalLocationState','FL')
  );
end;
$$;

create or replace function public.fdacs_class_d_set_live_segment(
  p_live_session_id uuid,
  p_segment_type text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'live segment control requires authorized Class D staff';
  end if;
  if p_segment_type not in ('instruction','break') then
    raise exception 'unsupported live segment type';
  end if;

  update public.fdacs_class_d_live_sessions
    set status = case when p_segment_type = 'break' then 'break' else 'live' end,
        current_segment_type = p_segment_type,
        current_segment_started_at = now(),
        updated_at = now()
  where id = p_live_session_id and status in ('live','break');

  if not found then
    raise exception 'live session is not active';
  end if;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'live_session', p_live_session_id,
    'live_segment_changed', p_correlation_id,
    jsonb_build_object('segmentType', p_segment_type)
  );
end;
$$;

create or replace function public.fdacs_class_d_end_live_session(
  p_live_session_id uuid,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'ending live instruction requires authorized Class D staff';
  end if;

  update public.fdacs_class_d_live_sessions
    set status = 'ended', ended_at = now(), updated_at = now()
  where id = p_live_session_id and status in ('live','break');
  if not found then raise exception 'live session is not active'; end if;

  update public.fdacs_class_d_device_leases
    set released_at = coalesce(released_at, now()), release_reason = coalesce(release_reason, 'live_session_ended')
  where live_session_id = p_live_session_id and released_at is null;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'live_session', p_live_session_id,
    'live_session_ended', p_correlation_id
  );
end;
$$;

create or replace function public.fdacs_class_d_acquire_device_lease(
  p_live_session_id uuid,
  p_clerk_user_id text,
  p_clerk_session_id text,
  p_browser_instance_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment_id uuid;
  v_lease_id uuid;
  v_existing public.fdacs_class_d_device_leases%rowtype;
begin
  select e.id into v_enrollment_id
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_live_sessions s on s.cohort_id = e.cohort_id
  where s.id = p_live_session_id
    and e.clerk_user_id = p_clerk_user_id
    and e.status in ('enrolled','in_progress','instruction_complete','exam_eligible')
    and s.status in ('live','break');
  if v_enrollment_id is null then raise exception 'student is not eligible for this live session'; end if;

  select * into v_existing
  from public.fdacs_class_d_device_leases
  where enrollment_id = v_enrollment_id and released_at is null
  for update;

  if v_existing.id is not null then
    if v_existing.last_heartbeat_at >= now() - interval '150 seconds' then
      if v_existing.clerk_session_id = p_clerk_session_id and v_existing.browser_instance_id = p_browser_instance_id then
        update public.fdacs_class_d_device_leases set last_heartbeat_at = now() where id = v_existing.id;
        return v_existing.id;
      end if;
      raise exception 'student already has an active Class D training device';
    end if;
    update public.fdacs_class_d_device_leases
      set released_at = now(), release_reason = 'stale_device_lease'
    where id = v_existing.id;
  end if;

  insert into public.fdacs_class_d_device_leases (
    enrollment_id, live_session_id, clerk_session_id, browser_instance_id
  ) values (
    v_enrollment_id, p_live_session_id, p_clerk_session_id, p_browser_instance_id
  ) returning id into v_lease_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id
  ) values (
    'student', p_clerk_user_id, v_enrollment_id, 'device_lease', v_lease_id,
    'single_device_lease_acquired', p_correlation_id
  );
  return v_lease_id;
end;
$$;

create or replace function public.fdacs_class_d_record_live_heartbeat(
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
  v_lease public.fdacs_class_d_device_leases%rowtype;
  v_session public.fdacs_class_d_live_sessions%rowtype;
  v_elapsed integer;
  v_total public.fdacs_class_d_live_time_totals%rowtype;
begin
  select * into v_lease
  from public.fdacs_class_d_device_leases
  where id = p_device_lease_id and released_at is null
  for update;
  if v_lease.id is null then raise exception 'active device lease not found'; end if;

  if not exists (
    select 1 from public.fdacs_class_d_enrollments
    where id = v_lease.enrollment_id and clerk_user_id = p_clerk_user_id
  ) then raise exception 'device lease does not belong to authenticated student'; end if;

  select * into v_session from public.fdacs_class_d_live_sessions where id = v_lease.live_session_id;
  if v_session.status not in ('live','break') then raise exception 'live session is not active'; end if;

  v_elapsed := greatest(0, least(90, extract(epoch from (now() - v_lease.last_heartbeat_at))::integer));
  update public.fdacs_class_d_device_leases set last_heartbeat_at = now() where id = v_lease.id;

  insert into public.fdacs_class_d_live_time_totals (
    enrollment_id, live_session_id, day, connected_seconds,
    instructional_presence_seconds, break_presence_seconds,
    uncredited_connected_seconds, last_heartbeat_at
  ) values (
    v_lease.enrollment_id, v_lease.live_session_id, v_session.day, v_elapsed,
    case when v_session.current_segment_type = 'instruction' then v_elapsed else 0 end,
    case when v_session.current_segment_type = 'break' then v_elapsed else 0 end,
    0, now()
  )
  on conflict (enrollment_id, live_session_id) do update
    set connected_seconds = public.fdacs_class_d_live_time_totals.connected_seconds + v_elapsed,
        instructional_presence_seconds = public.fdacs_class_d_live_time_totals.instructional_presence_seconds +
          case when public.fdacs_class_d_live_time_totals.presence_state <> 'absent_challenge' and v_session.current_segment_type = 'instruction' then v_elapsed else 0 end,
        break_presence_seconds = public.fdacs_class_d_live_time_totals.break_presence_seconds +
          case when v_session.current_segment_type = 'break' then v_elapsed else 0 end,
        uncredited_connected_seconds = public.fdacs_class_d_live_time_totals.uncredited_connected_seconds +
          case when public.fdacs_class_d_live_time_totals.presence_state = 'absent_challenge' and v_session.current_segment_type = 'instruction' then v_elapsed else 0 end,
        last_heartbeat_at = now(),
        updated_at = now()
  returning * into v_total;

  return jsonb_build_object(
    'liveSessionId', v_session.id,
    'segmentType', v_session.current_segment_type,
    'presenceState', v_total.presence_state,
    'connectedSeconds', v_total.connected_seconds,
    'instructionalPresenceSeconds', v_total.instructional_presence_seconds,
    'breakPresenceSeconds', v_total.break_presence_seconds,
    'uncreditedConnectedSeconds', v_total.uncredited_connected_seconds
  );
end;
$$;

create or replace function public.fdacs_class_d_issue_presence_challenge(
  p_live_session_id uuid,
  p_enrollment_id uuid,
  p_challenge_type text,
  p_prompt text,
  p_answer_digest text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_challenge_id uuid;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'presence challenges require authorized Class D staff';
  end if;
  if p_challenge_type not in ('presence_code','lesson_check','instructor_prompt') then
    raise exception 'unsupported presence challenge type';
  end if;
  if p_answer_digest !~ '^[0-9a-f]{64}$' then raise exception 'invalid answer digest'; end if;
  if not exists (
    select 1 from public.fdacs_class_d_enrollments e
    join public.fdacs_class_d_live_sessions s on s.cohort_id = e.cohort_id
    where e.id = p_enrollment_id and s.id = p_live_session_id and s.status in ('live','break')
  ) then raise exception 'student is not active in this live cohort'; end if;

  insert into public.fdacs_class_d_presence_challenges (
    live_session_id, enrollment_id, challenge_type, prompt, answer_digest,
    expires_at, correlation_id
  ) values (
    p_live_session_id, p_enrollment_id, p_challenge_type, p_prompt, lower(p_answer_digest),
    now() + interval '5 minutes', p_correlation_id
  ) returning id into v_challenge_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id
  ) values (
    p_actor_role, p_actor_clerk_user_id, p_enrollment_id, 'presence_challenge', v_challenge_id,
    'presence_challenge_issued', p_correlation_id
  );
  return v_challenge_id;
end;
$$;

create or replace function public.fdacs_class_d_respond_presence_challenge(
  p_challenge_id uuid,
  p_clerk_user_id text,
  p_answer_digest text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.fdacs_class_d_presence_challenges%rowtype;
  v_correct boolean;
begin
  select c.* into v_challenge
  from public.fdacs_class_d_presence_challenges c
  join public.fdacs_class_d_enrollments e on e.id = c.enrollment_id
  where c.id = p_challenge_id and e.clerk_user_id = p_clerk_user_id
  for update of c;
  if v_challenge.id is null then raise exception 'presence challenge not found'; end if;
  if v_challenge.status in ('passed','failed') then
    return jsonb_build_object('status', v_challenge.status, 'attemptCount', v_challenge.attempt_count);
  end if;

  v_correct := lower(p_answer_digest) = v_challenge.answer_digest;
  if v_correct then
    update public.fdacs_class_d_presence_challenges
      set status = 'passed', attempt_count = attempt_count + 1, passed_at = now()
    where id = v_challenge.id;
    update public.fdacs_class_d_live_time_totals
      set presence_state = case when presence_state = 'absent_challenge' then 'restored_after_review' else presence_state end,
          updated_at = now()
    where enrollment_id = v_challenge.enrollment_id and live_session_id = v_challenge.live_session_id;
    insert into public.fdacs_class_d_audit_events (
      actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id
    ) values (
      'student', p_clerk_user_id, v_challenge.enrollment_id, 'presence_challenge', v_challenge.id,
      'presence_challenge_passed', p_correlation_id
    );
    return jsonb_build_object('status','passed','attemptCount',v_challenge.attempt_count + 1);
  end if;

  if v_challenge.attempt_count = 0 and now() <= v_challenge.expires_at then
    update public.fdacs_class_d_presence_challenges
      set status = 'retry_required', attempt_count = 1, retry_expires_at = now() + interval '5 minutes'
    where id = v_challenge.id;
    return jsonb_build_object('status','retry_required','attemptCount',1,'retryMinutes',5);
  end if;

  update public.fdacs_class_d_presence_challenges
    set status = 'failed', attempt_count = least(2, attempt_count + 1), failed_at = now()
  where id = v_challenge.id;
  insert into public.fdacs_class_d_live_time_totals (
    enrollment_id, live_session_id, day, presence_state, last_heartbeat_at
  )
  select v_challenge.enrollment_id, v_challenge.live_session_id, s.day, 'absent_challenge', now()
  from public.fdacs_class_d_live_sessions s where s.id = v_challenge.live_session_id
  on conflict (enrollment_id, live_session_id) do update
    set presence_state = 'absent_challenge', updated_at = now();

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id,
    metadata
  ) values (
    'system', p_clerk_user_id, v_challenge.enrollment_id, 'presence_challenge', v_challenge.id,
    'presence_challenge_failed_student_marked_absent', p_correlation_id,
    jsonb_build_object('makeupReviewRequired', true)
  );
  return jsonb_build_object('status','failed','attemptCount',least(2, v_challenge.attempt_count + 1),'markedAbsent',true);
end;
$$;

create or replace function public.fdacs_class_d_restore_presence_after_review(
  p_enrollment_id uuid,
  p_live_session_id uuid,
  p_review_note text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'presence restoration requires authorized Class D staff';
  end if;
  if p_review_note is null or char_length(trim(p_review_note)) < 3 or char_length(p_review_note) > 2000 then
    raise exception 'presence restoration requires a review note';
  end if;
  update public.fdacs_class_d_live_time_totals
    set presence_state = 'restored_after_review', updated_at = now()
  where enrollment_id = p_enrollment_id and live_session_id = p_live_session_id and presence_state = 'absent_challenge';
  if not found then raise exception 'student is not currently marked absent for this live session'; end if;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, p_enrollment_id, 'presence', p_live_session_id,
    'presence_restored_after_instructor_review', p_correlation_id,
    jsonb_build_object('reviewNote', left(trim(p_review_note), 2000))
  );
end;
$$;

create or replace function public.fdacs_class_d_live_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'regulated live record is append-only';
end;
$$;

drop trigger if exists fdacs_class_d_presence_challenges_append_only on public.fdacs_class_d_presence_challenges;
-- Challenges are intentionally stateful because attempts and outcomes must be recorded.
drop trigger if exists fdacs_class_d_live_interactions_append_only on public.fdacs_class_d_live_interactions;
create trigger fdacs_class_d_live_interactions_append_only
  before update or delete on public.fdacs_class_d_live_interactions
  for each row execute function public.fdacs_class_d_live_append_only();

alter table public.fdacs_class_d_live_sessions enable row level security;
alter table public.fdacs_class_d_live_sessions force row level security;
alter table public.fdacs_class_d_device_leases enable row level security;
alter table public.fdacs_class_d_device_leases force row level security;
alter table public.fdacs_class_d_live_time_totals enable row level security;
alter table public.fdacs_class_d_live_time_totals force row level security;
alter table public.fdacs_class_d_presence_challenges enable row level security;
alter table public.fdacs_class_d_presence_challenges force row level security;
alter table public.fdacs_class_d_live_interactions enable row level security;
alter table public.fdacs_class_d_live_interactions force row level security;

revoke all on table public.fdacs_class_d_live_sessions from public, anon, authenticated;
revoke all on table public.fdacs_class_d_device_leases from public, anon, authenticated;
revoke all on table public.fdacs_class_d_live_time_totals from public, anon, authenticated;
revoke all on table public.fdacs_class_d_presence_challenges from public, anon, authenticated;
revoke all on table public.fdacs_class_d_live_interactions from public, anon, authenticated;

revoke all on function public.fdacs_class_d_start_live_session(uuid,text,text,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_set_live_segment(uuid,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_end_live_session(uuid,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_acquire_device_lease(uuid,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_record_live_heartbeat(uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_issue_presence_challenge(uuid,uuid,text,text,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_respond_presence_challenge(uuid,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_restore_presence_after_review(uuid,uuid,text,text,text,uuid) from public, anon, authenticated;

grant execute on function public.fdacs_class_d_start_live_session(uuid,text,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_set_live_segment(uuid,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_end_live_session(uuid,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_acquire_device_lease(uuid,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_record_live_heartbeat(uuid,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_issue_presence_challenge(uuid,uuid,text,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_respond_presence_challenge(uuid,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_restore_presence_after_review(uuid,uuid,text,text,text,uuid) to service_role;

commit;
