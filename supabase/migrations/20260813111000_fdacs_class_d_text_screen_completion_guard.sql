begin;

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
    and s.status = 'open'
    and e.clerk_user_id = p_clerk_user_id
  for update of v;

  if v_view_id is null then raise exception 'open instructional text view not found'; end if;
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

create or replace function public.fdacs_class_d_missing_text_screen_acknowledgments(
  p_enrollment_id uuid
)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer
  from public.fdacs_class_d_live_text_screens s
  join public.fdacs_class_d_live_sessions ls on ls.id = s.live_session_id
  join public.fdacs_class_d_enrollments e on e.cohort_id = ls.cohort_id and e.id = p_enrollment_id
  left join public.fdacs_class_d_live_text_screen_views v
    on v.text_screen_id = s.id
   and v.enrollment_id = e.id
  where s.status = 'closed'
    and v.acknowledged_at is null;
$$;

revoke all on function public.fdacs_class_d_acknowledge_live_text_screen(uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_missing_text_screen_acknowledgments(uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_acknowledge_live_text_screen(uuid,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_missing_text_screen_acknowledgments(uuid) to service_role;

commit;
