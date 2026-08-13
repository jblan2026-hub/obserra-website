begin;

alter table public.fdacs_class_d_exam_attempts
  add column if not exists monitoring_status text not null default 'active'
    check (monitoring_status in ('active','interrupted','resume_authorized','invalidated')),
  add column if not exists last_heartbeat_at timestamptz,
  add column if not exists last_visible_at timestamptz,
  add column if not exists interrupted_at timestamptz,
  add column if not exists interruption_reason text,
  add column if not exists resume_authorized_at timestamptz,
  add column if not exists resume_authorized_by_clerk_user_id text,
  add column if not exists invalidated_at timestamptz,
  add column if not exists invalidated_by_clerk_user_id text,
  add column if not exists invalidation_reason text;

create table if not exists public.fdacs_class_d_exam_monitor_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.fdacs_class_d_exam_attempts(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  clerk_user_id text not null,
  event_type text not null check (event_type in (
    'heartbeat','visibility_lost','visibility_restored','session_mismatch','device_mismatch',
    'interrupted','resume_authorized','resumed','invalidated'
  )),
  page_visible boolean,
  browser_instance_id text,
  clerk_session_id text,
  detail text,
  correlation_id uuid not null,
  occurred_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_exam_monitor_attempt_idx
  on public.fdacs_class_d_exam_monitor_events(attempt_id, occurred_at desc);
create index if not exists fdacs_class_d_exam_monitor_enrollment_idx
  on public.fdacs_class_d_exam_monitor_events(enrollment_id, occurred_at desc);

alter table public.fdacs_class_d_exam_monitor_events enable row level security;
alter table public.fdacs_class_d_exam_monitor_events force row level security;
revoke all on table public.fdacs_class_d_exam_monitor_events from public, anon, authenticated;
grant all on table public.fdacs_class_d_exam_monitor_events to service_role;

create or replace function public.fdacs_class_d_record_exam_heartbeat(
  p_attempt_id uuid,
  p_clerk_user_id text,
  p_clerk_session_id text,
  p_browser_instance_id text,
  p_page_visible boolean,
  p_correlation_id uuid
)
returns table(monitoring_status text, last_heartbeat_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.fdacs_class_d_exam_attempts%rowtype;
  v_now timestamptz := now();
  v_event text := 'heartbeat';
begin
  select * into v_attempt
  from public.fdacs_class_d_exam_attempts
  where id = p_attempt_id
  for update;

  if v_attempt.id is null or v_attempt.clerk_user_id <> p_clerk_user_id then
    raise exception 'exam attempt not found';
  end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'exam attempt is not active';
  end if;
  if v_attempt.monitoring_status = 'invalidated' then
    raise exception 'exam attempt has been invalidated';
  end if;

  if v_attempt.clerk_session_id <> p_clerk_session_id then
    insert into public.fdacs_class_d_exam_monitor_events (
      attempt_id,enrollment_id,clerk_user_id,event_type,page_visible,browser_instance_id,clerk_session_id,detail,correlation_id
    ) values (
      v_attempt.id,v_attempt.enrollment_id,p_clerk_user_id,'session_mismatch',p_page_visible,p_browser_instance_id,p_clerk_session_id,
      'heartbeat rejected because authenticated session did not match the attempt session',p_correlation_id
    );
    raise exception 'exam session mismatch';
  end if;

  if v_attempt.browser_instance_id <> p_browser_instance_id then
    insert into public.fdacs_class_d_exam_monitor_events (
      attempt_id,enrollment_id,clerk_user_id,event_type,page_visible,browser_instance_id,clerk_session_id,detail,correlation_id
    ) values (
      v_attempt.id,v_attempt.enrollment_id,p_clerk_user_id,'device_mismatch',p_page_visible,p_browser_instance_id,p_clerk_session_id,
      'heartbeat rejected because browser instance did not match the attempt device',p_correlation_id
    );
    raise exception 'exam device mismatch';
  end if;

  if v_attempt.monitoring_status = 'interrupted' then
    raise exception 'exam attempt requires staff-authorized resume';
  end if;

  if v_attempt.monitoring_status = 'resume_authorized' then
    update public.fdacs_class_d_exam_attempts
    set monitoring_status = 'active',
        interrupted_at = null,
        interruption_reason = null,
        updated_at = v_now
    where id = v_attempt.id;
    v_event := 'resumed';
  elsif p_page_visible is false then
    update public.fdacs_class_d_exam_attempts
    set monitoring_status = 'interrupted',
        interrupted_at = v_now,
        interruption_reason = 'exam page not visible',
        last_heartbeat_at = v_now,
        updated_at = v_now
    where id = v_attempt.id;
    v_event := 'visibility_lost';
  else
    update public.fdacs_class_d_exam_attempts
    set last_heartbeat_at = v_now,
        last_visible_at = v_now,
        updated_at = v_now
    where id = v_attempt.id;
  end if;

  insert into public.fdacs_class_d_exam_monitor_events (
    attempt_id,enrollment_id,clerk_user_id,event_type,page_visible,browser_instance_id,clerk_session_id,correlation_id
  ) values (
    v_attempt.id,v_attempt.enrollment_id,p_clerk_user_id,v_event,p_page_visible,p_browser_instance_id,p_clerk_session_id,p_correlation_id
  );

  return query
    select a.monitoring_status, a.last_heartbeat_at
    from public.fdacs_class_d_exam_attempts a
    where a.id = v_attempt.id;
end;
$$;

revoke execute on function public.fdacs_class_d_record_exam_heartbeat(uuid,text,text,text,boolean,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_record_exam_heartbeat(uuid,text,text,text,boolean,uuid) to service_role;

create or replace function public.fdacs_class_d_authorize_exam_resume(
  p_attempt_id uuid,
  p_staff_clerk_user_id text,
  p_reason text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.fdacs_class_d_exam_attempts%rowtype;
begin
  if p_reason is null or char_length(trim(p_reason)) < 3 or char_length(trim(p_reason)) > 2000 then
    raise exception 'resume reason is required';
  end if;
  select * into v_attempt from public.fdacs_class_d_exam_attempts where id = p_attempt_id for update;
  if v_attempt.id is null or v_attempt.status <> 'in_progress' then
    raise exception 'active exam attempt not found';
  end if;
  if v_attempt.monitoring_status <> 'interrupted' then
    raise exception 'exam attempt is not awaiting resume authorization';
  end if;

  update public.fdacs_class_d_exam_attempts
  set monitoring_status = 'resume_authorized',
      resume_authorized_at = now(),
      resume_authorized_by_clerk_user_id = p_staff_clerk_user_id,
      updated_at = now()
  where id = p_attempt_id;

  insert into public.fdacs_class_d_exam_monitor_events (
    attempt_id,enrollment_id,clerk_user_id,event_type,detail,correlation_id
  ) values (
    p_attempt_id,v_attempt.enrollment_id,v_attempt.clerk_user_id,'resume_authorized',trim(p_reason),p_correlation_id
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'school_admin',p_staff_clerk_user_id,v_attempt.enrollment_id,'exam',p_attempt_id,'exam_resume_authorized',p_correlation_id,
    jsonb_build_object('reason',trim(p_reason))
  );
end;
$$;

revoke execute on function public.fdacs_class_d_authorize_exam_resume(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_authorize_exam_resume(uuid,text,text,uuid) to service_role;

create or replace function public.fdacs_class_d_invalidate_exam_attempt(
  p_attempt_id uuid,
  p_staff_clerk_user_id text,
  p_reason text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.fdacs_class_d_exam_attempts%rowtype;
begin
  if p_reason is null or char_length(trim(p_reason)) < 3 or char_length(trim(p_reason)) > 2000 then
    raise exception 'invalidation reason is required';
  end if;
  select * into v_attempt from public.fdacs_class_d_exam_attempts where id = p_attempt_id for update;
  if v_attempt.id is null or v_attempt.status <> 'in_progress' then
    raise exception 'active exam attempt not found';
  end if;

  update public.fdacs_class_d_exam_attempts
  set status = 'invalidated',
      monitoring_status = 'invalidated',
      invalidated_at = now(),
      invalidated_by_clerk_user_id = p_staff_clerk_user_id,
      invalidation_reason = trim(p_reason),
      updated_at = now()
  where id = p_attempt_id;

  insert into public.fdacs_class_d_exam_monitor_events (
    attempt_id,enrollment_id,clerk_user_id,event_type,detail,correlation_id
  ) values (
    p_attempt_id,v_attempt.enrollment_id,v_attempt.clerk_user_id,'invalidated',trim(p_reason),p_correlation_id
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'school_admin',p_staff_clerk_user_id,v_attempt.enrollment_id,'exam',p_attempt_id,'exam_attempt_invalidated',p_correlation_id,
    jsonb_build_object('reason',trim(p_reason))
  );
end;
$$;

revoke execute on function public.fdacs_class_d_invalidate_exam_attempt(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_invalidate_exam_attempt(uuid,text,text,uuid) to service_role;

commit;
