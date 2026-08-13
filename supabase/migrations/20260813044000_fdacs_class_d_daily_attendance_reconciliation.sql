begin;

create or replace function public.fdacs_class_d_certify_live_day(
  p_enrollment_id uuid,
  p_day smallint,
  p_status text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_idempotency_key text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cohort_id uuid;
  v_session_count integer;
  v_ended_count integer;
  v_instructional_seconds bigint := 0;
  v_break_seconds bigint := 0;
  v_connected_seconds bigint := 0;
  v_uncredited_seconds bigint := 0;
  v_unresolved_absence_count integer := 0;
  v_instructional_minutes integer := 0;
  v_checked_in_at timestamptz;
  v_checked_out_at timestamptz;
  v_existing public.fdacs_class_d_attendance_entries%rowtype;
  v_entry_id uuid;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'daily attendance certification requires authorized Class D staff';
  end if;
  if p_day < 1 or p_day > 5 then
    raise exception 'invalid instructional day';
  end if;
  if p_status not in ('present','partial','absent','makeup_required') then
    raise exception 'unsupported daily attendance certification status';
  end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) < 12 or char_length(p_idempotency_key) > 180 then
    raise exception 'invalid attendance certification idempotency key';
  end if;

  select cohort_id into v_cohort_id
  from public.fdacs_class_d_enrollments
  where id = p_enrollment_id
  for update;
  if v_cohort_id is null then raise exception 'regulated enrollment not found'; end if;

  select count(*), count(*) filter (where status = 'ended')
    into v_session_count, v_ended_count
  from public.fdacs_class_d_live_sessions
  where cohort_id = v_cohort_id and day = p_day;

  if v_session_count <> 4 or v_ended_count <> 4 then
    raise exception 'all four live lessons must be completed before daily attendance certification';
  end if;

  select
    coalesce(sum(t.instructional_presence_seconds), 0),
    coalesce(sum(t.break_presence_seconds), 0),
    coalesce(sum(t.connected_seconds), 0),
    coalesce(sum(t.uncredited_connected_seconds), 0),
    count(*) filter (where t.presence_state = 'absent_challenge')
  into
    v_instructional_seconds,
    v_break_seconds,
    v_connected_seconds,
    v_uncredited_seconds,
    v_unresolved_absence_count
  from public.fdacs_class_d_live_time_totals t
  join public.fdacs_class_d_live_sessions s on s.id = t.live_session_id
  where t.enrollment_id = p_enrollment_id
    and s.cohort_id = v_cohort_id
    and s.day = p_day;

  v_instructional_minutes := least(480, floor(v_instructional_seconds / 60.0)::integer);

  if p_status = 'present' and (v_instructional_minutes < 480 or v_unresolved_absence_count > 0) then
    raise exception 'present status requires 480 verified instructional minutes and no unresolved security-challenge absence';
  end if;
  if p_status = 'absent' and v_instructional_minutes > 0 then
    raise exception 'use partial or makeup-required status when instructional minutes were earned';
  end if;
  if p_status = 'partial' and (v_instructional_minutes = 0 or v_instructional_minutes >= 480) then
    raise exception 'partial status requires between 1 and 479 verified instructional minutes';
  end if;
  if p_status = 'makeup_required' and v_instructional_minutes >= 480 and v_unresolved_absence_count = 0 then
    raise exception 'makeup-required status is not valid after full verified attendance';
  end if;

  select min(l.acquired_at), max(coalesce(l.released_at, l.last_heartbeat_at))
    into v_checked_in_at, v_checked_out_at
  from public.fdacs_class_d_device_leases l
  join public.fdacs_class_d_live_sessions s on s.id = l.live_session_id
  where l.enrollment_id = p_enrollment_id
    and s.cohort_id = v_cohort_id
    and s.day = p_day;

  select * into v_existing
  from public.fdacs_class_d_attendance_entries
  where idempotency_key = p_idempotency_key;
  if v_existing.id is not null then
    return jsonb_build_object(
      'entryId', v_existing.id,
      'status', v_existing.status,
      'instructionalMinutesCredited', v_existing.instructional_minutes_credited,
      'idempotentReplay', true
    );
  end if;

  insert into public.fdacs_class_d_attendance_entries (
    enrollment_id,
    day,
    status,
    checked_in_at,
    checked_out_at,
    instructional_minutes_credited,
    attested_by_clerk_user_id,
    idempotency_key,
    correlation_id
  ) values (
    p_enrollment_id,
    p_day,
    p_status,
    v_checked_in_at,
    v_checked_out_at,
    v_instructional_minutes,
    p_actor_clerk_user_id,
    p_idempotency_key,
    p_correlation_id
  ) returning id into v_entry_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role,
    actor_clerk_user_id,
    enrollment_id,
    entity_type,
    entity_id,
    action,
    correlation_id,
    metadata
  ) values (
    p_actor_role,
    p_actor_clerk_user_id,
    p_enrollment_id,
    'attendance',
    v_entry_id,
    'live_day_attendance_certified',
    p_correlation_id,
    jsonb_build_object(
      'day', p_day,
      'status', p_status,
      'instructionalMinutesCredited', v_instructional_minutes,
      'instructionalPresenceSeconds', v_instructional_seconds,
      'breakPresenceSeconds', v_break_seconds,
      'connectedSeconds', v_connected_seconds,
      'uncreditedConnectedSeconds', v_uncredited_seconds,
      'unresolvedChallengeAbsences', v_unresolved_absence_count
    )
  );

  return jsonb_build_object(
    'entryId', v_entry_id,
    'status', p_status,
    'instructionalMinutesCredited', v_instructional_minutes,
    'instructionalPresenceSeconds', v_instructional_seconds,
    'breakPresenceSeconds', v_break_seconds,
    'connectedSeconds', v_connected_seconds,
    'uncreditedConnectedSeconds', v_uncredited_seconds,
    'idempotentReplay', false
  );
end;
$$;

revoke all on function public.fdacs_class_d_certify_live_day(uuid,smallint,text,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_certify_live_day(uuid,smallint,text,text,text,text,uuid) to service_role;

commit;
