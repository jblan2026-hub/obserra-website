begin;

-- A regulated lesson may not expose credited instruction before every eligible
-- learner has an initial presence challenge. This single RPC deliberately
-- enters an uncredited break state first, creates and verifies the complete
-- challenge set, and only then transitions to instruction. Any exception rolls
-- the entire PostgreSQL statement back, including the break-state update.

create or replace function public.fdacs_class_d_start_live_session_with_initial_presence(
  p_live_session_id uuid,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_instructor_license_number text,
  p_school_license_number text,
  p_inspection_access_reference text,
  p_challenge_prompt text,
  p_answer_digest text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.fdacs_class_d_live_sessions%rowtype;
  v_cohort public.fdacs_class_d_cohorts%rowtype;
  v_transition_at timestamptz := clock_timestamp();
  v_eligible_count integer := 0;
  v_issued_count integer := 0;
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
  if char_length(trim(coalesce(p_challenge_prompt,''))) not between 1 and 1000
     or p_answer_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'initial presence challenge is invalid';
  end if;
  if exists (
    select 1 from public.fdacs_class_d_presence_challenges c
    where c.correlation_id = p_correlation_id
  ) then
    raise exception 'initial presence correlation ID has already been used';
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
  where c.id = v_session.cohort_id
  for update;
  if not found then raise exception 'live-session cohort is unavailable'; end if;

  -- Freeze the cohort roster for the remainder of this transaction. The
  -- cohort-row lock blocks new foreign-key references while these row locks
  -- prevent an existing enrollment from changing eligibility mid-start.
  perform 1
  from public.fdacs_class_d_enrollments e
  where e.cohort_id = v_session.cohort_id
  for update;

  select count(*)::integer into v_eligible_count
  from public.fdacs_class_d_enrollments e
  where e.cohort_id = v_session.cohort_id
    and e.status in ('enrolled','in_progress','instruction_complete','exam_eligible');
  if v_eligible_count < 1 then
    raise exception 'at least one eligible learner is required before live instruction can start';
  end if;

  if v_session.execution_profile = 'owner_uat_noncredit' then
    if p_actor_role <> 'instructor'
       or trim(p_actor_clerk_user_id) <> v_session.instructor_clerk_user_id
       or not coalesce(trim(p_actor_clerk_user_id) = any(v_cohort.instructor_clerk_user_ids),false) then
      raise exception 'only the assigned Class DI instructor may start an owner UAT lesson';
    end if;
    if v_cohort.execution_profile <> 'owner_uat_noncredit'
       or v_cohort.status <> 'scheduled'
       or v_cohort.uat_expires_at <= v_transition_at
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
    set status = 'break',
        current_segment_type = 'break',
        current_segment_started_at = v_transition_at,
        started_at = coalesce(started_at,v_transition_at),
        inspection_access_reference = p_inspection_access_reference,
        updated_at = v_transition_at
    where id = p_live_session_id and status = 'scheduled';
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
    set status = 'break',
        current_segment_type = 'break',
        current_segment_started_at = v_transition_at,
        started_at = coalesce(started_at,v_transition_at),
        instructor_clerk_user_id = trim(p_actor_clerk_user_id),
        instructor_license_number = trim(p_instructor_license_number),
        school_license_number = trim(p_school_license_number),
        inspection_access_reference = p_inspection_access_reference,
        updated_at = v_transition_at
    where id = p_live_session_id and status = 'scheduled';
  end if;
  if not found then raise exception 'live session could not enter uncredited start state'; end if;

  -- Controlled database fault-injection seam for transaction verification.
  -- It is unreachable from the application API and requires a privileged
  -- session to opt in with SET LOCAL.
  if current_setting('obserra.fdacs_atomic_start_fault_after_break',true) = 'on' then
    raise exception 'injected atomic-start failure after uncredited transition';
  end if;

  insert into public.fdacs_class_d_presence_challenges (
    live_session_id,enrollment_id,challenge_type,prompt,answer_digest,
    issued_at,expires_at,correlation_id
  )
  select
    p_live_session_id,e.id,'presence_code',trim(p_challenge_prompt),lower(p_answer_digest),
    v_transition_at,v_transition_at + interval '5 minutes',p_correlation_id
  from public.fdacs_class_d_enrollments e
  where e.cohort_id = v_session.cohort_id
    and e.status in ('enrolled','in_progress','instruction_complete','exam_eligible');
  get diagnostics v_issued_count = row_count;

  if v_issued_count <> v_eligible_count or exists (
    select 1
    from public.fdacs_class_d_enrollments e
    left join public.fdacs_class_d_presence_challenges c
      on c.live_session_id = p_live_session_id
     and c.enrollment_id = e.id
     and c.challenge_type = 'presence_code'
     and c.correlation_id = p_correlation_id
     and c.status = 'pending'
    where e.cohort_id = v_session.cohort_id
      and e.status in ('enrolled','in_progress','instruction_complete','exam_eligible')
      and c.id is null
  ) then
    raise exception 'initial presence challenge issuance is incomplete';
  end if;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  )
  select
    p_actor_role,trim(p_actor_clerk_user_id),c.enrollment_id,'presence_challenge',c.id,
    'presence_challenge_issued',p_correlation_id,
    jsonb_build_object('initialLessonChallenge',true,'liveSessionId',p_live_session_id)
  from public.fdacs_class_d_presence_challenges c
  where c.live_session_id = p_live_session_id
    and c.correlation_id = p_correlation_id;

  update public.fdacs_class_d_live_sessions
  set status = 'live',
      current_segment_type = 'instruction',
      current_segment_started_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where id = p_live_session_id
    and status = 'break'
    and current_segment_type = 'break';
  if not found then raise exception 'live instruction activation failed after initial presence verification'; end if;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    p_actor_role,trim(p_actor_clerk_user_id),'live_session',p_live_session_id,
    'live_session_started',p_correlation_id,
    jsonb_build_object(
      'physicalLocationState','FL','executionProfile',v_session.execution_profile,
      'schoolLicenseClaimed',v_session.execution_profile = 'production',
      'assignedInstructorEnforced',v_session.execution_profile = 'owner_uat_noncredit',
      'initialPresenceChallengeCount',v_issued_count,
      'initialPresenceVerified',true,
      'atomicUncreditedStart',true
    )
  );

  return jsonb_build_object(
    'status','live',
    'segmentType','instruction',
    'challengeCount',v_issued_count,
    'initialPresenceVerified',true
  );
end;
$$;

revoke all on function public.fdacs_class_d_start_live_session(uuid,text,text,text,text,text,uuid)
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_start_live_session_with_initial_presence(uuid,text,text,text,text,text,text,text,uuid)
  from public,anon,authenticated;
grant execute on function public.fdacs_class_d_start_live_session_with_initial_presence(uuid,text,text,text,text,text,text,text,uuid)
  to service_role;

comment on function public.fdacs_class_d_start_live_session_with_initial_presence(uuid,text,text,text,text,text,text,text,uuid)
is 'Atomically starts an authorized Class D lesson through an uncredited break transition, complete initial presence-challenge issuance, verification, and final instruction activation. Any failure rolls back the complete transition.';

commit;
