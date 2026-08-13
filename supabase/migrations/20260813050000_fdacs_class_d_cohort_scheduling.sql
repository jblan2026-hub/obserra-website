begin;

create table if not exists public.fdacs_class_d_cohort_training_days (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.fdacs_class_d_cohorts(id) on delete restrict,
  day smallint not null check (day between 1 and 5),
  training_date date not null,
  day_start_local time without time zone not null,
  time_zone text not null check (char_length(time_zone) between 3 and 80),
  schedule_revision integer not null default 1 check (schedule_revision >= 1),
  created_by_clerk_user_id text not null,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, day),
  unique (cohort_id, training_date)
);

alter table public.fdacs_class_d_live_sessions
  add column if not exists scheduled_start_at timestamptz;
alter table public.fdacs_class_d_live_sessions
  add column if not exists scheduled_end_at timestamptz;
alter table public.fdacs_class_d_live_sessions
  add column if not exists schedule_revision integer not null default 1 check (schedule_revision >= 1);

create index if not exists fdacs_class_d_training_days_cohort_idx
  on public.fdacs_class_d_cohort_training_days(cohort_id, day);
create index if not exists fdacs_class_d_live_sessions_schedule_idx
  on public.fdacs_class_d_live_sessions(cohort_id, scheduled_start_at, status);

alter table public.fdacs_class_d_audit_events
  drop constraint if exists fdacs_class_d_audit_events_entity_type_check;
alter table public.fdacs_class_d_audit_events
  add constraint fdacs_class_d_audit_events_entity_type_check
  check (entity_type in (
    'identity','enrollment','cohort','cohort_schedule','attendance','instruction_time','live_session','device_lease',
    'presence','presence_challenge','live_interaction','module_progress','learning_check','remediation',
    'record_hold','acknowledgment','enrollment_review','observer_access','exam','completion','lias'
  ));

create or replace function public.fdacs_class_d_publish_cohort_schedule(
  p_cohort_id uuid,
  p_training_dates date[],
  p_day_start_local time without time zone,
  p_time_zone text,
  p_instructor_clerk_user_id text,
  p_instructor_license_number text,
  p_school_license_number text,
  p_actor_role text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns table (
  live_session_id uuid,
  training_day integer,
  lesson_id text,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day integer;
  v_lesson integer;
  v_offset_minutes integer;
  v_start_at timestamptz;
  v_end_at timestamptz;
  v_revision integer;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then
    raise exception 'cohort scheduling requires school or compliance administration';
  end if;
  if array_length(p_training_dates, 1) is distinct from 5 then
    raise exception 'exactly five training dates are required';
  end if;
  if p_day_start_local is null then raise exception 'daily start time is required'; end if;
  if p_time_zone is null or not exists (select 1 from pg_timezone_names where name = p_time_zone) then
    raise exception 'valid IANA time zone is required';
  end if;
  if p_instructor_clerk_user_id is null or char_length(trim(p_instructor_clerk_user_id)) < 3 then
    raise exception 'instructor identity is required';
  end if;
  if p_instructor_license_number is null or char_length(trim(p_instructor_license_number)) < 3 then
    raise exception 'instructor license number is required';
  end if;
  if p_school_license_number is null or char_length(trim(p_school_license_number)) < 3 then
    raise exception 'school license number is required';
  end if;
  if not exists (
    select 1 from public.fdacs_class_d_cohorts
    where id = p_cohort_id and status in ('draft','scheduled')
  ) then raise exception 'cohort is not eligible for scheduling'; end if;
  if exists (
    select 1 from public.fdacs_class_d_live_sessions
    where cohort_id = p_cohort_id and status <> 'scheduled'
  ) then raise exception 'cohort schedule cannot change after regulated live activity begins'; end if;

  for v_day in 1..5 loop
    if p_training_dates[v_day] is null then raise exception 'training date cannot be null'; end if;
    if v_day > 1 and p_training_dates[v_day] <= p_training_dates[v_day - 1] then
      raise exception 'training dates must be strictly increasing';
    end if;
  end loop;

  select coalesce(max(schedule_revision), 0) + 1 into v_revision
  from public.fdacs_class_d_cohort_training_days
  where cohort_id = p_cohort_id;

  for v_day in 1..5 loop
    insert into public.fdacs_class_d_cohort_training_days (
      cohort_id, day, training_date, day_start_local, time_zone, schedule_revision,
      created_by_clerk_user_id, correlation_id
    ) values (
      p_cohort_id, v_day, p_training_dates[v_day], p_day_start_local, p_time_zone, v_revision,
      p_actor_clerk_user_id, p_correlation_id
    )
    on conflict (cohort_id, day) do update
      set training_date = excluded.training_date,
          day_start_local = excluded.day_start_local,
          time_zone = excluded.time_zone,
          schedule_revision = excluded.schedule_revision,
          created_by_clerk_user_id = excluded.created_by_clerk_user_id,
          correlation_id = excluded.correlation_id,
          updated_at = now();

    for v_lesson in 1..4 loop
      v_offset_minutes := (v_lesson - 1) * 135;
      v_start_at := ((p_training_dates[v_day] + p_day_start_local) + make_interval(mins => v_offset_minutes)) at time zone p_time_zone;
      v_end_at := v_start_at + interval '120 minutes';

      insert into public.fdacs_class_d_live_sessions (
        cohort_id, day, lesson_id, instructor_clerk_user_id, instructor_license_number,
        school_license_number, physical_location_state, status, current_segment_type,
        scheduled_start_at, scheduled_end_at, schedule_revision
      ) values (
        p_cohort_id, v_day, format('D%s-L%s', v_day, v_lesson), trim(p_instructor_clerk_user_id),
        trim(p_instructor_license_number), trim(p_school_license_number), 'FL', 'scheduled', 'instruction',
        v_start_at, v_end_at, v_revision
      )
      on conflict (cohort_id, day, lesson_id) do update
        set instructor_clerk_user_id = excluded.instructor_clerk_user_id,
            instructor_license_number = excluded.instructor_license_number,
            school_license_number = excluded.school_license_number,
            physical_location_state = 'FL',
            scheduled_start_at = excluded.scheduled_start_at,
            scheduled_end_at = excluded.scheduled_end_at,
            schedule_revision = excluded.schedule_revision,
            updated_at = now()
      where public.fdacs_class_d_live_sessions.status = 'scheduled';
    end loop;
  end loop;

  update public.fdacs_class_d_cohorts
    set start_date = p_training_dates[1],
        end_date = p_training_dates[5],
        status = 'scheduled',
        instructor_clerk_user_ids = case
          when trim(p_instructor_clerk_user_id) = any(instructor_clerk_user_ids) then instructor_clerk_user_ids
          else array_append(instructor_clerk_user_ids, trim(p_instructor_clerk_user_id))
        end,
        updated_at = now()
  where id = p_cohort_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'cohort_schedule', p_cohort_id,
    'five_day_twenty_lesson_schedule_published', p_correlation_id,
    jsonb_build_object(
      'trainingDates', to_jsonb(p_training_dates),
      'dayStartLocal', p_day_start_local::text,
      'timeZone', p_time_zone,
      'scheduleRevision', v_revision,
      'liveLessonCount', 20,
      'instructionalMinutesPerLesson', 120,
      'breakMinutesBetweenLessons', 15
    )
  );

  return query
  select s.id, s.day::integer, s.lesson_id, s.scheduled_start_at, s.scheduled_end_at
  from public.fdacs_class_d_live_sessions s
  where s.cohort_id = p_cohort_id and s.status = 'scheduled'
  order by s.day, s.lesson_id;
end;
$$;

alter table public.fdacs_class_d_cohort_training_days enable row level security;
alter table public.fdacs_class_d_cohort_training_days force row level security;

revoke all on table public.fdacs_class_d_cohort_training_days from public, anon, authenticated;
revoke all on function public.fdacs_class_d_publish_cohort_schedule(uuid,date[],time without time zone,text,text,text,text,text,text,uuid) from public, anon, authenticated;

grant select, insert, update on table public.fdacs_class_d_cohort_training_days to service_role;
grant execute on function public.fdacs_class_d_publish_cohort_schedule(uuid,date[],time without time zone,text,text,text,text,text,text,uuid) to service_role;

commit;
