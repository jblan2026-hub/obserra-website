begin;

-- Gate 39: make the exact-release owner UAT instruction path executable
-- without fabricating a Class DS school license or weakening the production
-- scheduling boundary. A real, active Class DI instructor record remains
-- mandatory and must be assigned to the UAT cohort.

alter table public.fdacs_class_d_live_sessions
  add column execution_profile text not null default 'production';

alter table public.fdacs_class_d_live_sessions
  alter column school_license_number drop not null,
  add constraint fdacs_class_d_live_session_execution_profile_check
    check (execution_profile in ('production','owner_uat_noncredit')),
  add constraint fdacs_class_d_live_session_license_shape_check
    check (
      (execution_profile = 'production' and school_license_number is not null) or
      (execution_profile = 'owner_uat_noncredit' and school_license_number is null)
    );

create or replace function public.fdacs_class_d_validate_live_session_execution_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_cohort public.fdacs_class_d_cohorts%rowtype;
begin
  select * into v_cohort
  from public.fdacs_class_d_cohorts c
  where c.id = new.cohort_id;
  if not found then raise exception 'live-session cohort is unavailable'; end if;
  if new.execution_profile <> v_cohort.execution_profile then
    raise exception 'live-session execution profile must match its cohort';
  end if;
  if new.execution_profile = 'owner_uat_noncredit' then
    if v_cohort.uat_expires_at <= clock_timestamp()
       or v_cohort.release_commit_sha !~ '^[0-9a-f]{40}$'
       or v_cohort.authorization_evidence_sha256 !~ '^[0-9a-f]{64}$'
       or new.school_license_number is not null
       or exists (
         select 1 from public.fdacs_class_d_activation_state a
         where a.boundary_id = 1 and a.production_runtime_authorized = true
       ) then
      raise exception 'owner UAT live session is not authorized by the exact-release non-credit cohort';
    end if;
  elsif new.school_license_number is null then
    raise exception 'production live session requires a school license number';
  end if;
  return new;
end;
$$;

create trigger fdacs_class_d_validate_live_session_execution_profile
before insert or update of cohort_id,execution_profile,school_license_number
on public.fdacs_class_d_live_sessions
for each row execute function public.fdacs_class_d_validate_live_session_execution_profile();

create or replace function public.fdacs_class_d_reject_student_self_attestation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_student_clerk_user_id text;
  v_instructor_clerk_user_ids text[];
begin
  select e.clerk_user_id,c.instructor_clerk_user_ids
    into v_student_clerk_user_id,v_instructor_clerk_user_ids
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_cohorts c on c.id = e.cohort_id
  where e.id = new.enrollment_id;
  if not found then raise exception 'attestation enrollment is unavailable'; end if;
  if v_student_clerk_user_id = new.instructor_clerk_user_id then
    raise exception 'a student cannot act as their own Class DI identity or attendance verifier';
  end if;
  if not coalesce(new.instructor_clerk_user_id = any(v_instructor_clerk_user_ids),false) then
    raise exception 'identity and attendance evidence requires the Class DI instructor assigned to the enrollment cohort';
  end if;
  return new;
end;
$$;

create or replace function public.fdacs_class_d_publish_owner_uat_schedule(
  p_cohort_id uuid,
  p_training_dates date[],
  p_day_start_local time without time zone,
  p_time_zone text,
  p_instructor_clerk_user_id text,
  p_release_commit_sha text,
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
set search_path = ''
as $$
declare
  v_cohort public.fdacs_class_d_cohorts%rowtype;
  v_instructor_file_id uuid;
  v_instructor_license_number text;
  v_day integer;
  v_lesson integer;
  v_offset_minutes integer;
  v_start_at timestamptz;
  v_end_at timestamptz;
  v_final_end_at timestamptz;
  v_revision integer;
begin
  if p_actor_role not in ('school_admin','compliance_admin') then
    raise exception 'owner UAT scheduling requires school or compliance administration';
  end if;
  if array_length(p_training_dates,1) is distinct from 5 then
    raise exception 'exactly five owner UAT dates are required';
  end if;
  if p_day_start_local is null then raise exception 'daily start time is required'; end if;
  if p_time_zone is null or not exists (
    select 1 from pg_catalog.pg_timezone_names where name = p_time_zone
  ) then raise exception 'valid IANA time zone is required'; end if;
  if char_length(trim(coalesce(p_instructor_clerk_user_id,''))) not between 3 and 255 then
    raise exception 'assigned Class DI instructor identity is required';
  end if;
  if lower(trim(coalesce(p_release_commit_sha,''))) !~ '^[0-9a-f]{40}$' then
    raise exception 'owner UAT schedule requires an exact release SHA';
  end if;
  if char_length(trim(coalesce(p_actor_clerk_user_id,''))) not between 3 and 255
     or p_correlation_id is null then
    raise exception 'authorized scheduling actor and correlation ID are required';
  end if;

  select * into v_cohort
  from public.fdacs_class_d_cohorts c
  where c.id = p_cohort_id
  for update;
  if not found or v_cohort.status <> 'scheduled'
     or v_cohort.execution_profile <> 'owner_uat_noncredit'
     or v_cohort.uat_expires_at <= clock_timestamp()
     or v_cohort.release_commit_sha <> lower(trim(p_release_commit_sha))
     or v_cohort.authorization_evidence_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'exact-release owner UAT cohort is unavailable or expired';
  end if;
  if exists (
    select 1 from public.fdacs_class_d_activation_state a
    where a.boundary_id = 1 and a.production_runtime_authorized = true
  ) then raise exception 'owner UAT scheduling is prohibited while production runtime authorization is active'; end if;
  if exists (
    select 1 from public.fdacs_class_d_live_sessions s
    where s.cohort_id = p_cohort_id and s.status <> 'scheduled'
  ) then raise exception 'owner UAT schedule cannot change after live activity begins'; end if;

  for v_day in 1..5 loop
    if p_training_dates[v_day] is null or p_training_dates[v_day] < current_date then
      raise exception 'owner UAT dates must be current or future calendar dates';
    end if;
    if v_day > 1 and p_training_dates[v_day] <= p_training_dates[v_day - 1] then
      raise exception 'owner UAT dates must be strictly increasing';
    end if;
  end loop;
  v_final_end_at := (
    (p_training_dates[5] + p_day_start_local)
    + make_interval(mins => 3 * 135)
    + interval '120 minutes'
  ) at time zone p_time_zone;
  if v_final_end_at > v_cohort.uat_expires_at then
    raise exception 'all owner UAT live lessons must end before the UAT authorization expires';
  end if;

  select f.instructor_file_id,f.di_license_number
    into v_instructor_file_id,v_instructor_license_number
  from public.fdacs_class_d_instructor_files f
  where f.instructor_clerk_user_id = trim(p_instructor_clerk_user_id)
    and f.license_status = 'verified_active'
    and (f.license_expires_on is null or f.license_expires_on >= p_training_dates[5])
  order by f.license_verified_at desc,f.created_at desc
  limit 1;
  if v_instructor_file_id is null then
    raise exception 'a verified active Class DI instructor record covering all UAT dates is required';
  end if;

  select coalesce(max(d.schedule_revision),0) + 1 into v_revision
  from public.fdacs_class_d_cohort_training_days d
  where d.cohort_id = p_cohort_id;

  update public.fdacs_class_d_cohorts
  set start_date = p_training_dates[1],
      end_date = p_training_dates[5],
      instructor_clerk_user_ids = case
        when trim(p_instructor_clerk_user_id) = any(instructor_clerk_user_ids) then instructor_clerk_user_ids
        else array_append(instructor_clerk_user_ids,trim(p_instructor_clerk_user_id))
      end,
      updated_at = clock_timestamp()
  where id = p_cohort_id;

  for v_day in 1..5 loop
    insert into public.fdacs_class_d_cohort_training_days (
      cohort_id,day,training_date,day_start_local,time_zone,schedule_revision,
      created_by_clerk_user_id,correlation_id
    ) values (
      p_cohort_id,v_day,p_training_dates[v_day],p_day_start_local,p_time_zone,v_revision,
      trim(p_actor_clerk_user_id),p_correlation_id
    )
    on conflict (cohort_id,day) do update
      set training_date = excluded.training_date,
          day_start_local = excluded.day_start_local,
          time_zone = excluded.time_zone,
          schedule_revision = excluded.schedule_revision,
          created_by_clerk_user_id = excluded.created_by_clerk_user_id,
          correlation_id = excluded.correlation_id,
          updated_at = clock_timestamp();

    for v_lesson in 1..4 loop
      v_offset_minutes := (v_lesson - 1) * 135;
      v_start_at := (
        (p_training_dates[v_day] + p_day_start_local)
        + make_interval(mins => v_offset_minutes)
      ) at time zone p_time_zone;
      v_end_at := v_start_at + interval '120 minutes';

      insert into public.fdacs_class_d_live_sessions (
        cohort_id,day,lesson_id,instructor_clerk_user_id,instructor_license_number,
        school_license_number,physical_location_state,status,current_segment_type,
        scheduled_start_at,scheduled_end_at,schedule_revision,execution_profile
      ) values (
        p_cohort_id,v_day,format('D%s-L%s',v_day,v_lesson),trim(p_instructor_clerk_user_id),
        v_instructor_license_number,null,'FL','scheduled','instruction',
        v_start_at,v_end_at,v_revision,'owner_uat_noncredit'
      )
      on conflict (cohort_id,day,lesson_id) do update
        set instructor_clerk_user_id = excluded.instructor_clerk_user_id,
            instructor_license_number = excluded.instructor_license_number,
            school_license_number = null,
            physical_location_state = 'FL',
            scheduled_start_at = excluded.scheduled_start_at,
            scheduled_end_at = excluded.scheduled_end_at,
            schedule_revision = excluded.schedule_revision,
            execution_profile = 'owner_uat_noncredit',
            updated_at = clock_timestamp()
      where public.fdacs_class_d_live_sessions.status = 'scheduled';
    end loop;
  end loop;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    p_actor_role,trim(p_actor_clerk_user_id),'cohort_schedule',p_cohort_id,
    'owner_uat_noncredit_schedule_published',p_correlation_id,
    jsonb_build_object(
      'executionProfile','owner_uat_noncredit','trainingDates',to_jsonb(p_training_dates),
      'dayStartLocal',p_day_start_local::text,'timeZone',p_time_zone,
      'scheduleRevision',v_revision,'liveLessonCount',20,'instructorFileId',v_instructor_file_id,
      'releaseCommitSha',v_cohort.release_commit_sha,'trainingCreditEligible',false,
      'schoolLicenseClaimed',false,'instructionalMinutesPerLesson',120,'breakMinutesBetweenLessons',15
    )
  );

  return query
  select s.id,s.day::integer,s.lesson_id,s.scheduled_start_at,s.scheduled_end_at
  from public.fdacs_class_d_live_sessions s
  where s.cohort_id = p_cohort_id and s.status = 'scheduled'
    and s.execution_profile = 'owner_uat_noncredit'
  order by s.day,s.lesson_id;
end;
$$;

revoke all on function public.fdacs_class_d_validate_live_session_execution_profile()
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_reject_student_self_attestation()
  from public,anon,authenticated,service_role;
revoke all on function public.fdacs_class_d_publish_owner_uat_schedule(uuid,date[],time without time zone,text,text,text,text,text,uuid)
  from public,anon,authenticated,service_role;
grant execute on function public.fdacs_class_d_publish_owner_uat_schedule(uuid,date[],time without time zone,text,text,text,text,text,uuid)
  to service_role;

comment on column public.fdacs_class_d_live_sessions.execution_profile is
  'Production or exact-release non-credit owner UAT. Owner UAT sessions never carry a Class DS school-license claim.';
comment on function public.fdacs_class_d_publish_owner_uat_schedule(uuid,date[],time without time zone,text,text,text,text,text,uuid) is
  'Publishes the capacity-one owner UAT schedule only for an exact release and a verified active assigned Class DI instructor, without fabricating a Class DS school license.';

commit;
