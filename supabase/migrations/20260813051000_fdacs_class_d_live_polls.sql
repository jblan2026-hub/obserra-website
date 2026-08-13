begin;

create table if not exists public.fdacs_class_d_live_polls (
  id uuid primary key default gen_random_uuid(),
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  question text not null check (char_length(question) between 3 and 1000),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  correct_option_index smallint,
  status text not null default 'open' check (status in ('open','closed')),
  opened_by_clerk_user_id text not null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  check (correct_option_index is null or (correct_option_index >= 0 and correct_option_index < jsonb_array_length(options))),
  check ((status = 'open' and closed_at is null) or (status = 'closed' and closed_at is not null))
);

create table if not exists public.fdacs_class_d_live_poll_responses (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.fdacs_class_d_live_polls(id) on delete restrict,
  live_session_id uuid not null references public.fdacs_class_d_live_sessions(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  selected_option_index smallint not null check (selected_option_index >= 0),
  is_correct boolean,
  submitted_at timestamptz not null default now(),
  response_milliseconds integer check (response_milliseconds is null or response_milliseconds >= 0),
  correlation_id uuid not null,
  unique (poll_id, enrollment_id)
);

create index if not exists fdacs_class_d_live_polls_session_idx
  on public.fdacs_class_d_live_polls(live_session_id, status, opened_at desc);
create index if not exists fdacs_class_d_live_poll_responses_session_idx
  on public.fdacs_class_d_live_poll_responses(live_session_id, enrollment_id, submitted_at);

alter table public.fdacs_class_d_audit_events
  drop constraint if exists fdacs_class_d_audit_events_entity_type_check;
alter table public.fdacs_class_d_audit_events
  add constraint fdacs_class_d_audit_events_entity_type_check
  check (entity_type in (
    'identity','enrollment','cohort','cohort_schedule','attendance','instruction_time','live_session','device_lease',
    'presence','presence_challenge','live_interaction','live_poll','module_progress','learning_check','remediation',
    'record_hold','acknowledgment','enrollment_review','observer_access','exam','completion','lias'
  ));

create or replace function public.fdacs_class_d_open_live_poll(
  p_live_session_id uuid,
  p_question text,
  p_options jsonb,
  p_correct_option_index smallint,
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
  v_poll_id uuid;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'live poll creation requires authorized instructional staff';
  end if;
  if p_question is null or char_length(trim(p_question)) not between 3 and 1000 then
    raise exception 'poll question is invalid';
  end if;
  if p_options is null or jsonb_typeof(p_options) <> 'array' or jsonb_array_length(p_options) not between 2 and 6 then
    raise exception 'poll must contain between two and six options';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_options) as opt(value)
    where jsonb_typeof(opt.value) <> 'string'
       or char_length(trim(opt.value #>> '{}')) not between 1 and 500
  ) then
    raise exception 'poll options must be non-empty strings of no more than 500 characters';
  end if;
  if p_correct_option_index is not null and (p_correct_option_index < 0 or p_correct_option_index >= jsonb_array_length(p_options)) then
    raise exception 'correct poll option is out of range';
  end if;
  if not exists (
    select 1 from public.fdacs_class_d_live_sessions
    where id = p_live_session_id and status = 'live'
  ) then raise exception 'polls may open only during live instruction'; end if;
  if exists (
    select 1 from public.fdacs_class_d_live_polls
    where live_session_id = p_live_session_id and status = 'open'
  ) then raise exception 'only one live poll may be open at a time'; end if;

  insert into public.fdacs_class_d_live_polls (
    live_session_id, question, options, correct_option_index,
    opened_by_clerk_user_id, correlation_id
  ) values (
    p_live_session_id, trim(p_question), p_options, p_correct_option_index,
    p_actor_clerk_user_id, p_correlation_id
  ) returning id into v_poll_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id,
    metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'live_poll', v_poll_id,
    'live_poll_opened', p_correlation_id,
    jsonb_build_object('liveSessionId', p_live_session_id, 'optionCount', jsonb_array_length(p_options))
  );

  return v_poll_id;
end;
$$;

create or replace function public.fdacs_class_d_submit_live_poll_response(
  p_poll_id uuid,
  p_clerk_user_id text,
  p_selected_option_index smallint,
  p_response_milliseconds integer,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_poll public.fdacs_class_d_live_polls%rowtype;
  v_session public.fdacs_class_d_live_sessions%rowtype;
  v_enrollment_id uuid;
  v_response_id uuid;
  v_is_correct boolean;
begin
  select * into v_poll from public.fdacs_class_d_live_polls where id = p_poll_id for update;
  if v_poll.id is null or v_poll.status <> 'open' then raise exception 'poll is not open'; end if;
  if p_selected_option_index < 0 or p_selected_option_index >= jsonb_array_length(v_poll.options) then
    raise exception 'poll response option is out of range';
  end if;
  if p_response_milliseconds is not null and p_response_milliseconds < 0 then
    raise exception 'poll response timing is invalid';
  end if;

  select * into v_session from public.fdacs_class_d_live_sessions where id = v_poll.live_session_id;
  if v_session.id is null or v_session.status <> 'live' then raise exception 'poll response requires live instruction'; end if;

  select e.id into v_enrollment_id
  from public.fdacs_class_d_enrollments e
  where e.cohort_id = v_session.cohort_id
    and e.clerk_user_id = p_clerk_user_id
    and e.status in ('enrolled','active','in_progress')
  limit 1;
  if v_enrollment_id is null then raise exception 'student is not enrolled in this live cohort'; end if;

  v_is_correct := case
    when v_poll.correct_option_index is null then null
    else p_selected_option_index = v_poll.correct_option_index
  end;

  insert into public.fdacs_class_d_live_poll_responses (
    poll_id, live_session_id, enrollment_id, selected_option_index,
    is_correct, response_milliseconds, correlation_id
  ) values (
    v_poll.id, v_poll.live_session_id, v_enrollment_id, p_selected_option_index,
    v_is_correct, p_response_milliseconds, p_correlation_id
  )
  on conflict (poll_id, enrollment_id) do nothing
  returning id into v_response_id;

  if v_response_id is null then raise exception 'student has already submitted this poll'; end if;

  insert into public.fdacs_class_d_live_interactions (
    live_session_id, enrollment_id, actor_role, actor_clerk_user_id,
    interaction_type, content, correlation_id
  ) values (
    v_poll.live_session_id, v_enrollment_id, 'student', p_clerk_user_id,
    'poll_response', 'Structured live poll response submitted', p_correlation_id
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id,
    metadata
  ) values (
    'student', p_clerk_user_id, 'live_poll', v_response_id,
    'live_poll_response_submitted', p_correlation_id,
    jsonb_build_object('pollId', v_poll.id, 'liveSessionId', v_poll.live_session_id)
  );

  return v_response_id;
end;
$$;

create or replace function public.fdacs_class_d_close_live_poll(
  p_poll_id uuid,
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
  v_response_count integer;
begin
  if p_actor_role not in ('instructor','school_admin','compliance_admin') then
    raise exception 'live poll close requires authorized instructional staff';
  end if;

  update public.fdacs_class_d_live_polls
    set status = 'closed', closed_at = now()
  where id = p_poll_id and status = 'open'
  returning live_session_id into v_session_id;
  if v_session_id is null then raise exception 'open poll not found'; end if;

  select count(*) into v_response_count
  from public.fdacs_class_d_live_poll_responses
  where poll_id = p_poll_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, entity_type, entity_id, action, correlation_id,
    metadata
  ) values (
    p_actor_role, p_actor_clerk_user_id, 'live_poll', p_poll_id,
    'live_poll_closed', p_correlation_id,
    jsonb_build_object('liveSessionId', v_session_id, 'responseCount', v_response_count)
  );
end;
$$;

alter table public.fdacs_class_d_live_polls enable row level security;
alter table public.fdacs_class_d_live_polls force row level security;
alter table public.fdacs_class_d_live_poll_responses enable row level security;
alter table public.fdacs_class_d_live_poll_responses force row level security;

revoke all on table public.fdacs_class_d_live_polls from public, anon, authenticated;
revoke all on table public.fdacs_class_d_live_poll_responses from public, anon, authenticated;
revoke all on function public.fdacs_class_d_open_live_poll(uuid,text,jsonb,smallint,text,text,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_submit_live_poll_response(uuid,text,smallint,integer,uuid) from public, anon, authenticated;
revoke all on function public.fdacs_class_d_close_live_poll(uuid,text,text,uuid) from public, anon, authenticated;

grant select, insert, update on table public.fdacs_class_d_live_polls to service_role;
grant select, insert on table public.fdacs_class_d_live_poll_responses to service_role;
grant execute on function public.fdacs_class_d_open_live_poll(uuid,text,jsonb,smallint,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_submit_live_poll_response(uuid,text,smallint,integer,uuid) to service_role;
grant execute on function public.fdacs_class_d_close_live_poll(uuid,text,text,uuid) to service_role;

commit;
