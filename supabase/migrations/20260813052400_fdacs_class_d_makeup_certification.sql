begin;

create or replace function public.fdacs_class_d_certify_makeup_atomic(
  p_assignment_id uuid,
  p_certified_minutes integer,
  p_evidence_reference text,
  p_evidence_started_at timestamptz,
  p_evidence_ended_at timestamptz,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_idempotency_key text,
  p_correlation_id uuid
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_assignment public.fdacs_class_d_makeup_assignments%rowtype;
  v_live_day_minutes integer := 0;
  v_live_course_minutes integer := 0;
  v_day_makeup_minutes integer := 0;
  v_course_makeup_minutes integer := 0;
  v_recorded_makeup_minutes integer := 0;
  v_elapsed_minutes integer := 0;
  v_instruction_id uuid;
  v_attendance_id uuid;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then raise exception 'authorized Class D staff is required'; end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) not between 12 and 180 then raise exception 'invalid idempotency key'; end if;

  select * into v_assignment from public.fdacs_class_d_makeup_assignments where id = p_assignment_id for update;
  if v_assignment.id is null then raise exception 'make-up assignment not found'; end if;
  if v_assignment.status = 'certified' then
    return jsonb_build_object('assignmentId',v_assignment.id,'certifiedMinutes',v_assignment.certified_minutes,'idempotentReplay',true);
  end if;
  if v_assignment.status in ('cancelled','failed') then raise exception 'make-up assignment is not certifiable'; end if;
  if p_certified_minutes < 1 or p_certified_minutes > v_assignment.assigned_minutes then raise exception 'certified minutes exceed the assignment'; end if;
  if p_evidence_reference is null or char_length(trim(p_evidence_reference)) not between 3 and 500 then raise exception 'evidence reference is required'; end if;
  if p_evidence_started_at is null or p_evidence_ended_at is null or p_evidence_ended_at < p_evidence_started_at then raise exception 'valid evidence timestamps are required'; end if;

  v_elapsed_minutes := floor(extract(epoch from (p_evidence_ended_at - p_evidence_started_at)) / 60.0)::integer;
  if v_elapsed_minutes < p_certified_minutes then raise exception 'evidence duration is shorter than requested credit'; end if;
  if v_assignment.delivery_method = 'recorded_makeup' and v_assignment.recording_asset_reference is null then raise exception 'recorded make-up requires a controlled asset reference'; end if;

  select least(480, floor(coalesce(sum(t.instructional_presence_seconds),0) / 60.0)::integer)
  into v_live_day_minutes
  from public.fdacs_class_d_live_time_totals t
  where t.enrollment_id = v_assignment.enrollment_id and t.day = v_assignment.training_day;

  select least(2400, floor(coalesce(sum(t.instructional_presence_seconds),0) / 60.0)::integer)
  into v_live_course_minutes
  from public.fdacs_class_d_live_time_totals t
  where t.enrollment_id = v_assignment.enrollment_id;

  select coalesce(sum(certified_minutes),0)::integer into v_day_makeup_minutes
  from public.fdacs_class_d_makeup_assignments
  where enrollment_id = v_assignment.enrollment_id and training_day = v_assignment.training_day and status = 'certified' and id <> v_assignment.id;

  select coalesce(sum(certified_minutes),0)::integer into v_course_makeup_minutes
  from public.fdacs_class_d_makeup_assignments
  where enrollment_id = v_assignment.enrollment_id and status = 'certified' and id <> v_assignment.id;

  select coalesce(sum(certified_minutes),0)::integer into v_recorded_makeup_minutes
  from public.fdacs_class_d_makeup_assignments
  where enrollment_id = v_assignment.enrollment_id and delivery_method = 'recorded_makeup' and status = 'certified' and id <> v_assignment.id;

  if v_live_day_minutes + v_day_makeup_minutes + p_certified_minutes > 480 then raise exception 'make-up credit exceeds remaining daily deficit'; end if;
  if v_live_course_minutes + v_course_makeup_minutes + p_certified_minutes > 2400 then raise exception 'make-up credit exceeds remaining course deficit'; end if;
  if v_assignment.delivery_method = 'recorded_makeup' and v_recorded_makeup_minutes + p_certified_minutes > 600 then raise exception 'recorded make-up credit exceeds 600 minutes'; end if;

  insert into public.fdacs_class_d_instruction_time_entries (
    enrollment_id,module_id,started_at,ended_at,credited_minutes,source,recorded_by_clerk_user_id,idempotency_key,correlation_id
  ) values (
    v_assignment.enrollment_id,v_assignment.module_id,p_evidence_started_at,p_evidence_ended_at,p_certified_minutes,'instructor_attested_makeup',p_actor_clerk_user_id,p_idempotency_key,p_correlation_id
  ) returning id into v_instruction_id;

  insert into public.fdacs_class_d_attendance_entries (
    enrollment_id,day,status,checked_in_at,checked_out_at,instructional_minutes_credited,attested_by_clerk_user_id,idempotency_key,correlation_id
  ) values (
    v_assignment.enrollment_id,v_assignment.training_day,'made_up',p_evidence_started_at,p_evidence_ended_at,p_certified_minutes,p_actor_clerk_user_id,'makeup-attendance-' || v_assignment.id::text,p_correlation_id
  ) returning id into v_attendance_id;

  update public.fdacs_class_d_makeup_assignments
  set status='certified',certified_minutes=p_certified_minutes,evidence_reference=trim(p_evidence_reference),evidence_started_at=p_evidence_started_at,evidence_ended_at=p_evidence_ended_at,certified_by_clerk_user_id=p_actor_clerk_user_id,certified_at=now(),updated_at=now()
  where id=v_assignment.id;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    p_actor_role,p_actor_clerk_user_id,v_assignment.enrollment_id,'remediation',v_assignment.id,'makeup_certified',p_correlation_id,
    jsonb_build_object('recordType','makeup_training','trainingDay',v_assignment.training_day,'moduleId',v_assignment.module_id,'deliveryMethod',v_assignment.delivery_method,'certifiedMinutes',p_certified_minutes,'instructionTimeEntryId',v_instruction_id,'attendanceEntryId',v_attendance_id)
  );

  return jsonb_build_object(
    'assignmentId',v_assignment.id,
    'certifiedMinutes',p_certified_minutes,
    'dayInstructionalMinutesAfterReconciliation',v_live_day_minutes + v_day_makeup_minutes + p_certified_minutes,
    'courseInstructionalMinutesAfterReconciliation',v_live_course_minutes + v_course_makeup_minutes + p_certified_minutes,
    'instructionTimeEntryId',v_instruction_id,
    'attendanceEntryId',v_attendance_id,
    'idempotentReplay',false
  );
end;
$$;

commit;
