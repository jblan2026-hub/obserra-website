begin;

create table if not exists public.fdacs_class_d_quality_cases (
  id uuid primary key default gen_random_uuid(),
  case_type text not null check (case_type in ('incident','complaint','attendance_exception','exam_exception','lias_exception','security_event','quality_finding')),
  status text not null default 'open' check (status in ('open','investigating','action_required','verification','closed','voided')),
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  enrollment_id uuid references public.fdacs_class_d_enrollments(id),
  cohort_id uuid references public.fdacs_class_d_cohorts(id),
  title text not null check (char_length(title) between 3 and 250),
  description text not null check (char_length(description) between 3 and 8000),
  root_cause text,
  corrective_action text,
  preventive_action text,
  assigned_to_clerk_user_id text,
  due_at timestamptz,
  opened_by_clerk_user_id text not null,
  opened_at timestamptz not null default now(),
  verified_by_clerk_user_id text,
  verified_at timestamptz,
  closed_by_clerk_user_id text,
  closed_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_quality_cases_status_idx
  on public.fdacs_class_d_quality_cases(status, severity, opened_at);
create index if not exists fdacs_class_d_quality_cases_enrollment_idx
  on public.fdacs_class_d_quality_cases(enrollment_id, opened_at);

create table if not exists public.fdacs_class_d_quality_case_events (
  id uuid primary key default gen_random_uuid(),
  quality_case_id uuid not null references public.fdacs_class_d_quality_cases(id) on delete restrict,
  enrollment_id uuid references public.fdacs_class_d_enrollments(id),
  event_type text not null check (event_type in ('opened','investigation_started','action_defined','verification_started','closed','reopened','voided','note')),
  actor_clerk_user_id text not null,
  event_note text,
  correlation_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists fdacs_class_d_quality_case_events_case_idx
  on public.fdacs_class_d_quality_case_events(quality_case_id, occurred_at, id);

create table if not exists public.fdacs_class_d_retention_reviews (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  completion_record_id uuid references public.fdacs_class_d_completion_records(id) on delete restrict,
  minimum_retain_until date not null,
  operational_retain_until date not null,
  next_review_on date not null,
  legal_hold_active boolean not null default false,
  status text not null default 'retained' check (status in ('retained','review_due','eligible_for_disposition','disposition_blocked','disposed')),
  review_note text,
  reviewed_by_clerk_user_id text,
  reviewed_at timestamptz,
  disposition_authorized_by_clerk_user_id text,
  disposition_authorized_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id)
);

create index if not exists fdacs_class_d_retention_reviews_due_idx
  on public.fdacs_class_d_retention_reviews(status, next_review_on);

alter table public.fdacs_class_d_quality_cases enable row level security;
alter table public.fdacs_class_d_quality_cases force row level security;
alter table public.fdacs_class_d_quality_case_events enable row level security;
alter table public.fdacs_class_d_quality_case_events force row level security;
alter table public.fdacs_class_d_retention_reviews enable row level security;
alter table public.fdacs_class_d_retention_reviews force row level security;

revoke all on table public.fdacs_class_d_quality_cases from public, anon, authenticated;
revoke all on table public.fdacs_class_d_quality_case_events from public, anon, authenticated;
revoke all on table public.fdacs_class_d_retention_reviews from public, anon, authenticated;
grant select, insert, update on table public.fdacs_class_d_quality_cases to service_role;
grant select, insert on table public.fdacs_class_d_quality_case_events to service_role;
grant select, insert, update on table public.fdacs_class_d_retention_reviews to service_role;

create or replace function public.fdacs_class_d_reject_quality_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Florida Class D quality-case event history is append-only';
end;
$$;

drop trigger if exists fdacs_class_d_quality_event_immutable on public.fdacs_class_d_quality_case_events;
create trigger fdacs_class_d_quality_event_immutable
before update or delete on public.fdacs_class_d_quality_case_events
for each row execute function public.fdacs_class_d_reject_quality_event_mutation();

create or replace function public.fdacs_class_d_open_quality_case(
  p_case_type text,
  p_severity text,
  p_enrollment_id uuid,
  p_cohort_id uuid,
  p_title text,
  p_description text,
  p_actor_clerk_user_id text,
  p_assigned_to_clerk_user_id text,
  p_due_at timestamptz,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case_id uuid;
begin
  if trim(coalesce(p_actor_clerk_user_id,'')) = '' then raise exception 'actor is required'; end if;
  if char_length(trim(coalesce(p_title,''))) < 3 then raise exception 'case title is required'; end if;
  if char_length(trim(coalesce(p_description,''))) < 3 then raise exception 'case description is required'; end if;

  insert into public.fdacs_class_d_quality_cases (
    case_type,severity,enrollment_id,cohort_id,title,description,opened_by_clerk_user_id,
    assigned_to_clerk_user_id,due_at,correlation_id
  ) values (
    p_case_type,p_severity,p_enrollment_id,p_cohort_id,trim(p_title),trim(p_description),p_actor_clerk_user_id,
    nullif(trim(coalesce(p_assigned_to_clerk_user_id,'')),''),p_due_at,p_correlation_id
  ) returning id into v_case_id;

  insert into public.fdacs_class_d_quality_case_events (
    quality_case_id,enrollment_id,event_type,actor_clerk_user_id,event_note,correlation_id,metadata
  ) values (
    v_case_id,p_enrollment_id,'opened',p_actor_clerk_user_id,trim(p_description),p_correlation_id,
    jsonb_build_object('caseType',p_case_type,'severity',p_severity,'dueAt',p_due_at)
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'system',p_actor_clerk_user_id,p_enrollment_id,'quality_case',v_case_id,'quality_case_opened',p_correlation_id,
    jsonb_build_object('caseType',p_case_type,'severity',p_severity,'title',trim(p_title))
  );

  return v_case_id;
end;
$$;

create or replace function public.fdacs_class_d_progress_quality_case(
  p_case_id uuid,
  p_status text,
  p_root_cause text,
  p_corrective_action text,
  p_preventive_action text,
  p_event_note text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.fdacs_class_d_quality_cases%rowtype;
  v_event_type text;
begin
  select * into v_case from public.fdacs_class_d_quality_cases where id = p_case_id for update;
  if not found then raise exception 'quality case not found'; end if;
  if v_case.status = 'voided' then raise exception 'voided quality case cannot be progressed'; end if;

  if p_status = 'closed' and char_length(trim(coalesce(p_corrective_action,v_case.corrective_action,''))) < 3 then
    raise exception 'corrective action is required before closure';
  end if;

  v_event_type := case p_status
    when 'investigating' then 'investigation_started'
    when 'action_required' then 'action_defined'
    when 'verification' then 'verification_started'
    when 'closed' then 'closed'
    when 'voided' then 'voided'
    else 'note'
  end;

  update public.fdacs_class_d_quality_cases
  set status = p_status,
      root_cause = coalesce(nullif(trim(coalesce(p_root_cause,'')),''),root_cause),
      corrective_action = coalesce(nullif(trim(coalesce(p_corrective_action,'')),''),corrective_action),
      preventive_action = coalesce(nullif(trim(coalesce(p_preventive_action,'')),''),preventive_action),
      verified_by_clerk_user_id = case when p_status = 'closed' then p_actor_clerk_user_id else verified_by_clerk_user_id end,
      verified_at = case when p_status = 'closed' then now() else verified_at end,
      closed_by_clerk_user_id = case when p_status = 'closed' then p_actor_clerk_user_id else closed_by_clerk_user_id end,
      closed_at = case when p_status = 'closed' then now() else closed_at end,
      correlation_id = p_correlation_id,
      updated_at = now()
  where id = p_case_id;

  insert into public.fdacs_class_d_quality_case_events (
    quality_case_id,enrollment_id,event_type,actor_clerk_user_id,event_note,correlation_id,metadata
  ) values (
    p_case_id,v_case.enrollment_id,v_event_type,p_actor_clerk_user_id,nullif(trim(coalesce(p_event_note,'')),''),p_correlation_id,
    jsonb_build_object('fromStatus',v_case.status,'toStatus',p_status)
  );

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'system',p_actor_clerk_user_id,v_case.enrollment_id,'quality_case',p_case_id,'quality_case_progressed',p_correlation_id,
    jsonb_build_object('fromStatus',v_case.status,'toStatus',p_status)
  );
end;
$$;

create or replace function public.fdacs_class_d_upsert_retention_review(
  p_enrollment_id uuid,
  p_completion_record_id uuid,
  p_completion_date date,
  p_legal_hold_active boolean,
  p_review_note text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review_id uuid;
  v_minimum date := p_completion_date + interval '2 years';
  v_operational date := p_completion_date + interval '3 years';
  v_status text;
begin
  if p_completion_date is null then raise exception 'completion date is required'; end if;
  v_status := case
    when p_legal_hold_active then 'disposition_blocked'
    when current_date >= v_operational then 'eligible_for_disposition'
    when current_date >= v_minimum then 'retained'
    else 'retained'
  end;

  insert into public.fdacs_class_d_retention_reviews (
    enrollment_id,completion_record_id,minimum_retain_until,operational_retain_until,next_review_on,
    legal_hold_active,status,review_note,reviewed_by_clerk_user_id,reviewed_at,correlation_id
  ) values (
    p_enrollment_id,p_completion_record_id,v_minimum,v_operational,least(v_operational,current_date + interval '1 year'),
    p_legal_hold_active,v_status,nullif(trim(coalesce(p_review_note,'')),''),p_actor_clerk_user_id,now(),p_correlation_id
  )
  on conflict (enrollment_id) do update set
    completion_record_id = excluded.completion_record_id,
    minimum_retain_until = excluded.minimum_retain_until,
    operational_retain_until = excluded.operational_retain_until,
    next_review_on = excluded.next_review_on,
    legal_hold_active = excluded.legal_hold_active,
    status = excluded.status,
    review_note = excluded.review_note,
    reviewed_by_clerk_user_id = excluded.reviewed_by_clerk_user_id,
    reviewed_at = excluded.reviewed_at,
    correlation_id = excluded.correlation_id,
    updated_at = now()
  returning id into v_review_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role,actor_clerk_user_id,enrollment_id,entity_type,entity_id,action,correlation_id,metadata
  ) values (
    'system',p_actor_clerk_user_id,p_enrollment_id,'retention_review',v_review_id,'retention_review_recorded',p_correlation_id,
    jsonb_build_object('minimumRetainUntil',v_minimum,'operationalRetainUntil',v_operational,'legalHoldActive',p_legal_hold_active,'status',v_status)
  );

  return v_review_id;
end;
$$;

revoke execute on function public.fdacs_class_d_open_quality_case(text,text,uuid,uuid,text,text,text,text,timestamptz,uuid) from public, anon, authenticated;
revoke execute on function public.fdacs_class_d_progress_quality_case(uuid,text,text,text,text,text,text,uuid) from public, anon, authenticated;
revoke execute on function public.fdacs_class_d_upsert_retention_review(uuid,uuid,date,boolean,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_open_quality_case(text,text,uuid,uuid,text,text,text,text,timestamptz,uuid) to service_role;
grant execute on function public.fdacs_class_d_progress_quality_case(uuid,text,text,text,text,text,text,uuid) to service_role;
grant execute on function public.fdacs_class_d_upsert_retention_review(uuid,uuid,date,boolean,text,text,uuid) to service_role;

commit;
