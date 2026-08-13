begin;

create table if not exists public.fdacs_class_d_acceptance_runs (
  id uuid primary key default gen_random_uuid(),
  environment_type text not null check (environment_type in ('development','sandbox','staging','uat')),
  release_commit_sha text not null check (release_commit_sha ~ '^[0-9a-f]{40}$'),
  test_identity_reference text not null check (char_length(test_identity_reference) between 3 and 200),
  synthetic_identity_confirmed boolean not null default false,
  status text not null default 'in_progress' check (status in ('in_progress','passed','failed','aborted')),
  started_by_clerk_user_id text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  summary text,
  correlation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.fdacs_class_d_acceptance_checks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.fdacs_class_d_acceptance_runs(id) on delete restrict,
  domain text not null check (domain in (
    'identity_enrollment','live_media','attendance_time','presence_challenges','observer_access',
    'makeup','recorded_makeup','exam','retest','completion','completion_documents','lias_workflow',
    'inspection_packet','quality_capa','retention','security_headers','mobile_desktop','accessibility'
  )),
  status text not null check (status in ('not_run','passed','failed','blocked')),
  evidence_reference text,
  operator_note text,
  verified_by_clerk_user_id text not null,
  verified_at timestamptz not null default now(),
  correlation_id uuid not null default gen_random_uuid()
);

create unique index if not exists fdacs_class_d_acceptance_one_check_per_domain_idx
  on public.fdacs_class_d_acceptance_checks(run_id, domain);

create table if not exists public.fdacs_class_d_acceptance_events (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.fdacs_class_d_acceptance_runs(id) on delete restrict,
  action text not null,
  actor_clerk_user_id text not null,
  detail jsonb not null default '{}'::jsonb,
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.fdacs_class_d_acceptance_runs enable row level security;
alter table public.fdacs_class_d_acceptance_runs force row level security;
alter table public.fdacs_class_d_acceptance_checks enable row level security;
alter table public.fdacs_class_d_acceptance_checks force row level security;
alter table public.fdacs_class_d_acceptance_events enable row level security;
alter table public.fdacs_class_d_acceptance_events force row level security;

revoke all on table public.fdacs_class_d_acceptance_runs from public, anon, authenticated;
revoke all on table public.fdacs_class_d_acceptance_checks from public, anon, authenticated;
revoke all on table public.fdacs_class_d_acceptance_events from public, anon, authenticated;

grant all on table public.fdacs_class_d_acceptance_runs to service_role;
grant all on table public.fdacs_class_d_acceptance_checks to service_role;
grant all on table public.fdacs_class_d_acceptance_events to service_role;

create or replace function public.fdacs_class_d_finalize_acceptance_run(
  p_run_id uuid,
  p_actor_clerk_user_id text,
  p_summary text,
  p_correlation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run public.fdacs_class_d_acceptance_runs%rowtype;
  v_expected integer := 18;
  v_total integer;
  v_passed integer;
  v_failed integer;
  v_blocked integer;
begin
  select * into v_run from public.fdacs_class_d_acceptance_runs where id = p_run_id for update;
  if not found then raise exception 'Acceptance run not found'; end if;
  if v_run.status <> 'in_progress' then raise exception 'Acceptance run is not open'; end if;
  if not v_run.synthetic_identity_confirmed then raise exception 'Synthetic identity confirmation is required'; end if;

  select count(*),
         count(*) filter (where status = 'passed'),
         count(*) filter (where status = 'failed'),
         count(*) filter (where status = 'blocked')
    into v_total, v_passed, v_failed, v_blocked
  from public.fdacs_class_d_acceptance_checks where run_id = p_run_id;

  if v_total <> v_expected then raise exception 'All acceptance domains must be recorded'; end if;
  if v_failed > 0 or v_blocked > 0 or v_passed <> v_expected then raise exception 'All acceptance domains must pass before finalization'; end if;

  update public.fdacs_class_d_acceptance_runs
     set status = 'passed', completed_at = now(), summary = nullif(trim(p_summary), '')
   where id = p_run_id;

  insert into public.fdacs_class_d_acceptance_events(run_id, action, actor_clerk_user_id, detail, correlation_id)
  values (p_run_id, 'acceptance_run_passed', p_actor_clerk_user_id,
          jsonb_build_object('passed_domains', v_passed, 'expected_domains', v_expected), p_correlation_id);

  return jsonb_build_object('run_id', p_run_id, 'status', 'passed', 'passed_domains', v_passed);
end;
$$;

revoke all on function public.fdacs_class_d_finalize_acceptance_run(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_finalize_acceptance_run(uuid,text,text,uuid) to service_role;

commit;
