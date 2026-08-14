-- Gate 35: durable, service-only Academy learner state and payment audit trail.
-- This migration contains no learner records and does not enable Florida Class D production.

create table if not exists public.academy_learner_state (
  clerk_user_id text not null,
  course_slug text not null,
  access_status text not null default 'active',
  enrolled_at timestamptz not null,
  payment_reference text not null,
  completed_lessons integer[] not null default '{}'::integer[],
  assessment_score numeric(5, 2),
  completed_at timestamptz,
  certificate_id text,
  signed_certificate jsonb,
  course_version text not null,
  record_version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_learner_state_pkey primary key (clerk_user_id, course_slug),
  constraint academy_learner_state_course_slug check (course_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint academy_learner_state_user_id check (char_length(clerk_user_id) between 3 and 255),
  constraint academy_learner_state_access_status check (access_status in ('active', 'refunded', 'revoked')),
  constraint academy_learner_state_payment_reference check (char_length(payment_reference) between 3 and 255),
  constraint academy_learner_state_lesson_count check (cardinality(completed_lessons) <= 100),
  constraint academy_learner_state_lesson_nulls check (array_position(completed_lessons, null) is null),
  constraint academy_learner_state_score check (assessment_score is null or assessment_score between 0 and 100),
  constraint academy_learner_state_course_version check (course_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint academy_learner_state_record_version check (record_version > 0),
  constraint academy_learner_state_certificate_consistency check (
    (
      certificate_id is null and
      signed_certificate is null and
      completed_at is null
    ) or (
      certificate_id is not null and
      signed_certificate is not null and
      jsonb_typeof(signed_certificate) = 'object' and
      completed_at is not null and
      assessment_score >= 80
    )
  ),
  constraint academy_learner_state_certificate_id_key unique (certificate_id)
);

create table if not exists public.academy_payment_events (
  event_id text primary key,
  event_type text not null,
  checkout_session_id text not null,
  payment_intent_id text,
  course_slug text not null,
  course_version text not null,
  identity_mode text not null,
  clerk_user_id text,
  purchaser_email_hash text,
  processing_state text not null default 'received',
  delivery_count integer not null default 1,
  failure_code text,
  first_received_at timestamptz not null default now(),
  last_received_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint academy_payment_events_event_id check (event_id ~ '^evt_[A-Za-z0-9_]+$'),
  constraint academy_payment_events_type check (
    event_type in ('checkout.session.completed', 'checkout.session.async_payment_succeeded')
  ),
  constraint academy_payment_events_checkout check (checkout_session_id ~ '^cs_[A-Za-z0-9_]+$'),
  constraint academy_payment_events_payment_intent check (
    payment_intent_id is null or payment_intent_id ~ '^pi_[A-Za-z0-9_]+$'
  ),
  constraint academy_payment_events_course_slug check (course_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint academy_payment_events_course_version check (course_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint academy_payment_events_identity_mode check (identity_mode in ('authenticated', 'guest-email')),
  constraint academy_payment_events_email_hash check (
    purchaser_email_hash is null or purchaser_email_hash ~ '^[0-9a-f]{64}$'
  ),
  constraint academy_payment_events_identity check (
    clerk_user_id is not null or purchaser_email_hash is not null
  ),
  constraint academy_payment_events_state check (
    processing_state in ('received', 'fulfilled', 'paid_pending_claim', 'rejected')
  ),
  constraint academy_payment_events_delivery_count check (delivery_count > 0)
);

create table if not exists public.academy_assessment_records (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  course_slug text not null,
  attempt_number integer not null,
  score numeric(5, 2) not null,
  passed boolean not null,
  question_count integer not null,
  correct_count integer not null,
  assessment_version text not null,
  answers_retained boolean not null default false,
  submitted_at timestamptz not null default now(),
  constraint academy_assessment_records_attempt unique (clerk_user_id, course_slug, attempt_number),
  constraint academy_assessment_records_state_fkey foreign key (clerk_user_id, course_slug)
    references public.academy_learner_state (clerk_user_id, course_slug) on delete restrict,
  constraint academy_assessment_records_course_slug check (course_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint academy_assessment_records_attempt_number check (attempt_number > 0),
  constraint academy_assessment_records_score check (score between 0 and 100),
  constraint academy_assessment_records_counts check (
    question_count > 0 and correct_count between 0 and question_count
  ),
  constraint academy_assessment_records_version check (assessment_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint academy_assessment_records_no_answers check (answers_retained = false)
);

create table if not exists public.academy_learner_events (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  course_slug text not null,
  event_type text not null,
  event_reference text not null,
  event_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint academy_learner_events_course_slug check (course_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint academy_learner_events_type check (
    event_type in (
      'enrollment.fulfilled',
      'enrollment.pending_claim',
      'enrollment.claimed',
      'enrollment.legacy_imported',
      'lesson.completed',
      'assessment.recorded',
      'certificate.issued'
    )
  ),
  constraint academy_learner_events_reference check (char_length(event_reference) between 3 and 500),
  constraint academy_learner_events_payload check (jsonb_typeof(event_payload) = 'object'),
  constraint academy_learner_events_reference_key unique (event_reference)
);

create index if not exists academy_payment_events_session_idx
  on public.academy_payment_events (checkout_session_id, course_slug, last_received_at desc);
create index if not exists academy_payment_events_user_idx
  on public.academy_payment_events (clerk_user_id, last_received_at desc)
  where clerk_user_id is not null;
create index if not exists academy_assessment_records_user_course_idx
  on public.academy_assessment_records (clerk_user_id, course_slug, submitted_at desc);
create index if not exists academy_learner_events_user_course_idx
  on public.academy_learner_events (clerk_user_id, course_slug, occurred_at desc)
  where clerk_user_id is not null;

alter table public.academy_learner_state enable row level security;
alter table public.academy_learner_state force row level security;
alter table public.academy_payment_events enable row level security;
alter table public.academy_payment_events force row level security;
alter table public.academy_assessment_records enable row level security;
alter table public.academy_assessment_records force row level security;
alter table public.academy_learner_events enable row level security;
alter table public.academy_learner_events force row level security;

revoke all on public.academy_learner_state from public, anon, authenticated;
revoke all on public.academy_payment_events from public, anon, authenticated;
revoke all on public.academy_assessment_records from public, anon, authenticated;
revoke all on public.academy_learner_events from public, anon, authenticated;
grant select, insert, update on public.academy_learner_state to service_role;
grant select, insert, update on public.academy_payment_events to service_role;
grant select, insert on public.academy_assessment_records to service_role;
grant select, insert on public.academy_learner_events to service_role;

create or replace function public.academy_reject_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Academy audit records are append-only';
end;
$$;

drop trigger if exists academy_assessment_records_append_only on public.academy_assessment_records;
create trigger academy_assessment_records_append_only
before update or delete on public.academy_assessment_records
for each row execute function public.academy_reject_audit_mutation();

drop trigger if exists academy_learner_events_append_only on public.academy_learner_events;
create trigger academy_learner_events_append_only
before update or delete on public.academy_learner_events
for each row execute function public.academy_reject_audit_mutation();

revoke all on function public.academy_reject_audit_mutation() from public, anon, authenticated;

create or replace function public.academy_record_paid_checkout(
  p_event_id text,
  p_event_type text,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_course_slug text,
  p_course_version text,
  p_identity_mode text,
  p_clerk_user_id text,
  p_purchaser_email_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.academy_payment_events%rowtype;
  v_terminal boolean;
begin
  insert into public.academy_payment_events (
    event_id, event_type, checkout_session_id, payment_intent_id, course_slug,
    course_version, identity_mode, clerk_user_id, purchaser_email_hash
  ) values (
    p_event_id, p_event_type, p_checkout_session_id, nullif(p_payment_intent_id, ''),
    p_course_slug, p_course_version, p_identity_mode, nullif(p_clerk_user_id, ''),
    nullif(p_purchaser_email_hash, '')
  )
  on conflict (event_id) do update
    set delivery_count = public.academy_payment_events.delivery_count + 1,
        last_received_at = now()
  returning * into v_event;

  if v_event.event_type <> p_event_type or
     v_event.checkout_session_id <> p_checkout_session_id or
     v_event.course_slug <> p_course_slug then
    raise exception 'Stripe event identity mismatch';
  end if;

  v_terminal := v_event.processing_state in ('fulfilled', 'paid_pending_claim');
  if v_terminal then
    return jsonb_build_object(
      'state', v_event.processing_state,
      'courseId', v_event.course_slug,
      'idempotentReplay', true
    );
  end if;

  if nullif(p_clerk_user_id, '') is null then
    update public.academy_payment_events
      set processing_state = 'paid_pending_claim', processed_at = now(), failure_code = null
      where event_id = p_event_id;
    insert into public.academy_learner_events (
      clerk_user_id, course_slug, event_type, event_reference, event_payload
    ) values (
      null, p_course_slug, 'enrollment.pending_claim', p_event_id || ':pending-claim',
      jsonb_build_object('checkoutSessionId', p_checkout_session_id, 'identityMode', p_identity_mode)
    ) on conflict (event_reference) do nothing;
    return jsonb_build_object('state', 'paid_pending_claim', 'courseId', p_course_slug, 'idempotentReplay', false);
  end if;

  insert into public.academy_learner_state (
    clerk_user_id, course_slug, access_status, enrolled_at, payment_reference, course_version
  ) values (
    p_clerk_user_id, p_course_slug, 'active', now(), p_checkout_session_id, p_course_version
  ) on conflict (clerk_user_id, course_slug) do nothing;

  update public.academy_payment_events
    set processing_state = 'fulfilled', processed_at = now(), failure_code = null
    where event_id = p_event_id;
  insert into public.academy_learner_events (
    clerk_user_id, course_slug, event_type, event_reference, event_payload
  ) values (
    p_clerk_user_id, p_course_slug, 'enrollment.fulfilled', p_event_id || ':fulfilled',
    jsonb_build_object('checkoutSessionId', p_checkout_session_id, 'identityMode', p_identity_mode)
  ) on conflict (event_reference) do nothing;

  return jsonb_build_object('state', 'fulfilled', 'courseId', p_course_slug, 'idempotentReplay', false);
end;
$$;

create or replace function public.academy_claim_paid_checkout(
  p_checkout_session_id text,
  p_course_slug text,
  p_course_version text,
  p_clerk_user_id text,
  p_purchaser_email_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.academy_payment_events%rowtype;
  v_state public.academy_learner_state%rowtype;
begin
  select * into v_event
  from public.academy_payment_events
  where checkout_session_id = p_checkout_session_id and course_slug = p_course_slug
  order by last_received_at desc
  limit 1
  for update;

  if not found or v_event.processing_state not in ('fulfilled', 'paid_pending_claim') then
    raise exception 'Paid checkout event is unavailable';
  end if;
  if v_event.clerk_user_id is not null and v_event.clerk_user_id <> p_clerk_user_id then
    raise exception 'Paid checkout belongs to a different identity';
  end if;
  if v_event.clerk_user_id is null and
     v_event.purchaser_email_hash is distinct from nullif(p_purchaser_email_hash, '') then
    raise exception 'Purchaser email verification failed';
  end if;

  insert into public.academy_learner_state (
    clerk_user_id, course_slug, access_status, enrolled_at, payment_reference, course_version
  ) values (
    p_clerk_user_id, p_course_slug, 'active', now(), p_checkout_session_id, p_course_version
  ) on conflict (clerk_user_id, course_slug) do nothing;

  update public.academy_payment_events
    set clerk_user_id = p_clerk_user_id,
        processing_state = 'fulfilled',
        processed_at = now(),
        failure_code = null
    where event_id = v_event.event_id;

  insert into public.academy_learner_events (
    clerk_user_id, course_slug, event_type, event_reference, event_payload
  ) values (
    p_clerk_user_id, p_course_slug, 'enrollment.claimed',
    'claim:' || p_checkout_session_id || ':' || p_clerk_user_id,
    jsonb_build_object('checkoutSessionId', p_checkout_session_id)
  ) on conflict (event_reference) do nothing;

  select * into strict v_state from public.academy_learner_state
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug;
  return to_jsonb(v_state);
end;
$$;

create or replace function public.academy_import_legacy_state(
  p_clerk_user_id text,
  p_course_slug text,
  p_enrolled_at timestamptz,
  p_payment_reference text,
  p_completed_lessons integer[],
  p_assessment_score numeric,
  p_completed_at timestamptz,
  p_certificate_id text,
  p_signed_certificate jsonb,
  p_course_version text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_state public.academy_learner_state%rowtype;
begin
  insert into public.academy_learner_state (
    clerk_user_id, course_slug, access_status, enrolled_at, payment_reference,
    completed_lessons, assessment_score, completed_at, certificate_id,
    signed_certificate, course_version
  ) values (
    p_clerk_user_id, p_course_slug, 'active', p_enrolled_at, p_payment_reference,
    coalesce(p_completed_lessons, '{}'::integer[]), p_assessment_score, p_completed_at,
    nullif(p_certificate_id, ''), p_signed_certificate, p_course_version
  ) on conflict (clerk_user_id, course_slug) do nothing;

  insert into public.academy_learner_events (
    clerk_user_id, course_slug, event_type, event_reference, event_payload
  ) values (
    p_clerk_user_id, p_course_slug, 'enrollment.legacy_imported',
    'legacy:' || p_clerk_user_id || ':' || p_course_slug,
    jsonb_build_object('source', 'clerk-private-metadata', 'certificatePresent', p_certificate_id is not null)
  ) on conflict (event_reference) do nothing;

  select * into strict v_state from public.academy_learner_state
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug;
  return to_jsonb(v_state);
end;
$$;

create or replace function public.academy_get_learner_state(
  p_clerk_user_id text,
  p_course_slug text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(to_jsonb(s), 'null'::jsonb)
  from public.academy_learner_state s
  where s.clerk_user_id = p_clerk_user_id and s.course_slug = p_course_slug;
$$;

create or replace function public.academy_complete_lesson(
  p_clerk_user_id text,
  p_course_slug text,
  p_lesson_index integer,
  p_lesson_count integer,
  p_course_version text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_state public.academy_learner_state%rowtype;
  v_lessons integer[];
  v_added boolean;
begin
  if p_lesson_count < 1 or p_lesson_count > 100 or p_lesson_index < 0 or p_lesson_index >= p_lesson_count then
    raise exception 'Invalid course lesson';
  end if;

  select * into v_state from public.academy_learner_state
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug and access_status = 'active'
    for update;
  if not found then raise exception 'Enrollment required'; end if;

  v_added := not (p_lesson_index = any(v_state.completed_lessons));
  select coalesce(array_agg(distinct lesson order by lesson), '{}'::integer[])
    into v_lessons
    from unnest(v_state.completed_lessons || p_lesson_index) as lesson;

  update public.academy_learner_state
    set completed_lessons = v_lessons,
        course_version = p_course_version,
        record_version = record_version + case when v_added then 1 else 0 end,
        updated_at = case when v_added then now() else updated_at end
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug
    returning * into v_state;

  if v_added then
    insert into public.academy_learner_events (
      clerk_user_id, course_slug, event_type, event_reference, event_payload
    ) values (
      p_clerk_user_id, p_course_slug, 'lesson.completed',
      'lesson:' || p_clerk_user_id || ':' || p_course_slug || ':' || p_lesson_index::text,
      jsonb_build_object('lessonIndex', p_lesson_index, 'courseVersion', p_course_version)
    ) on conflict (event_reference) do nothing;
  end if;
  return to_jsonb(v_state);
end;
$$;

create or replace function public.academy_record_assessment(
  p_clerk_user_id text,
  p_course_slug text,
  p_score numeric,
  p_correct_count integer,
  p_question_count integer,
  p_lesson_count integer,
  p_assessment_version text,
  p_completed_at timestamptz,
  p_certificate_id text,
  p_signed_certificate jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_state public.academy_learner_state%rowtype;
  v_attempt integer;
  v_attempt_id uuid;
  v_passed boolean;
  v_issued boolean := false;
begin
  if p_question_count < 1 or p_correct_count < 0 or p_correct_count > p_question_count or
     p_score < 0 or p_score > 100 or
     p_score <> round((p_correct_count::numeric / p_question_count::numeric) * 100) then
    raise exception 'Invalid assessment result';
  end if;

  select * into v_state from public.academy_learner_state
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug and access_status = 'active'
    for update;
  if not found then raise exception 'Enrollment required'; end if;
  if p_lesson_count < 1 or exists (
    select 1 from generate_series(0, p_lesson_count - 1) as expected(index)
    where not (expected.index = any(v_state.completed_lessons))
  ) then
    raise exception 'Complete every lesson before the assessment';
  end if;

  select coalesce(max(attempt_number), 0) + 1 into v_attempt
    from public.academy_assessment_records
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug;
  v_passed := p_score >= 80;

  insert into public.academy_assessment_records (
    clerk_user_id, course_slug, attempt_number, score, passed,
    question_count, correct_count, assessment_version, answers_retained
  ) values (
    p_clerk_user_id, p_course_slug, v_attempt, p_score, v_passed,
    p_question_count, p_correct_count, p_assessment_version, false
  ) returning id into v_attempt_id;

  if v_passed and v_state.certificate_id is null then
    if nullif(p_certificate_id, '') is null or p_completed_at is null or
       p_signed_certificate is null or jsonb_typeof(p_signed_certificate) <> 'object' then
      raise exception 'Signed certificate evidence is required for a passing assessment';
    end if;
    v_issued := true;
  end if;

  update public.academy_learner_state
    set assessment_score = greatest(coalesce(assessment_score, 0), p_score),
        completed_at = case when v_issued then p_completed_at else completed_at end,
        certificate_id = case when v_issued then p_certificate_id else certificate_id end,
        signed_certificate = case when v_issued then p_signed_certificate else signed_certificate end,
        course_version = p_assessment_version,
        record_version = record_version + 1,
        updated_at = now()
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug
    returning * into v_state;

  insert into public.academy_learner_events (
    clerk_user_id, course_slug, event_type, event_reference, event_payload
  ) values (
    p_clerk_user_id, p_course_slug, 'assessment.recorded', 'assessment:' || v_attempt_id::text,
    jsonb_build_object('attemptNumber', v_attempt, 'score', p_score, 'passed', v_passed, 'answersRetained', false)
  );

  if v_issued then
    insert into public.academy_learner_events (
      clerk_user_id, course_slug, event_type, event_reference, event_payload
    ) values (
      p_clerk_user_id, p_course_slug, 'certificate.issued', 'certificate:' || p_certificate_id,
      jsonb_build_object('certificateId', p_certificate_id, 'assessmentAttempt', v_attempt)
    ) on conflict (event_reference) do nothing;
  end if;

  return to_jsonb(v_state);
end;
$$;

create or replace function public.academy_find_certificate(p_certificate_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(to_jsonb(s), 'null'::jsonb)
  from public.academy_learner_state s
  where s.certificate_id = p_certificate_id and s.access_status = 'active';
$$;

create or replace function public.academy_storage_health()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'schemaVersion', 'academy-durable-state-v1',
    'operational', true,
    'learnerStateRows', (select count(*) from public.academy_learner_state),
    'paymentEventRows', (select count(*) from public.academy_payment_events),
    'assessmentRecordRows', (select count(*) from public.academy_assessment_records),
    'auditEventRows', (select count(*) from public.academy_learner_events)
  );
$$;

create or replace function public.academy_aggregate_metrics()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'learnerAccounts', (select count(distinct clerk_user_id) from public.academy_learner_state),
    'enrollments', (select count(*) from public.academy_learner_state where access_status = 'active'),
    'certificates', (select count(*) from public.academy_learner_state where certificate_id is not null and access_status = 'active'),
    'coursesByEnrollment', coalesce((
      select jsonb_object_agg(course_slug, row_count)
      from (
        select course_slug, count(*) as row_count
        from public.academy_learner_state
        where access_status = 'active'
        group by course_slug
      ) grouped
    ), '{}'::jsonb),
    'coursesByCertificate', coalesce((
      select jsonb_object_agg(course_slug, row_count)
      from (
        select course_slug, count(*) as row_count
        from public.academy_learner_state
        where certificate_id is not null and access_status = 'active'
        group by course_slug
      ) grouped
    ), '{}'::jsonb)
  );
$$;

revoke all on function public.academy_record_paid_checkout(text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.academy_claim_paid_checkout(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.academy_import_legacy_state(text, text, timestamptz, text, integer[], numeric, timestamptz, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.academy_get_learner_state(text, text) from public, anon, authenticated;
revoke all on function public.academy_complete_lesson(text, text, integer, integer, text) from public, anon, authenticated;
revoke all on function public.academy_record_assessment(text, text, numeric, integer, integer, integer, text, timestamptz, text, jsonb) from public, anon, authenticated;
revoke all on function public.academy_find_certificate(text) from public, anon, authenticated;
revoke all on function public.academy_storage_health() from public, anon, authenticated;
revoke all on function public.academy_aggregate_metrics() from public, anon, authenticated;

grant execute on function public.academy_record_paid_checkout(text, text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.academy_claim_paid_checkout(text, text, text, text, text) to service_role;
grant execute on function public.academy_import_legacy_state(text, text, timestamptz, text, integer[], numeric, timestamptz, text, jsonb, text) to service_role;
grant execute on function public.academy_get_learner_state(text, text) to service_role;
grant execute on function public.academy_complete_lesson(text, text, integer, integer, text) to service_role;
grant execute on function public.academy_record_assessment(text, text, numeric, integer, integer, integer, text, timestamptz, text, jsonb) to service_role;
grant execute on function public.academy_find_certificate(text) to service_role;
grant execute on function public.academy_storage_health() to service_role;
grant execute on function public.academy_aggregate_metrics() to service_role;
