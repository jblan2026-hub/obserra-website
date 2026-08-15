-- Serialize Academy Checkout creation per purchaser, course, and entitlement revision.
-- Source only until the controlled Academy migration window is authorized.
-- No Stripe object, payment, learner, refund, dispute, or FDACS record is created here.

create table if not exists public.academy_checkout_attempts (
  attempt_id uuid primary key,
  purchaser_reference text not null,
  course_slug text not null,
  entitlement_revision bigint not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  request_fingerprint text,
  stripe_session_id text,
  state text not null default 'reserved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_checkout_attempt_purchaser check (char_length(purchaser_reference) between 3 and 255),
  constraint academy_checkout_attempt_course check (course_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint academy_checkout_attempt_revision check (entitlement_revision >= 0),
  constraint academy_checkout_attempt_window check (expires_at > issued_at),
  constraint academy_checkout_attempt_fingerprint check (
    request_fingerprint is null or request_fingerprint ~ '^[0-9a-f]{64}$'
  ),
  constraint academy_checkout_attempt_session check (
    stripe_session_id is null or stripe_session_id ~ '^cs_(live|test)_[A-Za-z0-9_]+$'
  ),
  constraint academy_checkout_attempt_state check (state in ('reserved', 'session-created')),
  constraint academy_checkout_attempt_session_state check (
    (state = 'reserved' and stripe_session_id is null) or
    (state = 'session-created' and stripe_session_id is not null)
  )
);

create index if not exists academy_checkout_attempt_open_idx
  on public.academy_checkout_attempts (
    purchaser_reference, course_slug, entitlement_revision, expires_at desc
  );

alter table public.academy_checkout_attempts enable row level security;
alter table public.academy_checkout_attempts force row level security;
revoke all on public.academy_checkout_attempts from public, anon, authenticated, service_role;
grant select, insert, update on public.academy_checkout_attempts to service_role;

create or replace function public.academy_reserve_checkout_attempt(
  p_attempt_id text,
  p_purchaser_reference text,
  p_course_slug text,
  p_entitlement_revision bigint,
  p_issued_at bigint,
  p_expires_at bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.academy_checkout_attempts%rowtype;
  v_created boolean := false;
begin
  if coalesce(p_attempt_id, '') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' or
     char_length(coalesce(p_purchaser_reference, '')) not between 3 and 255 or
     coalesce(p_course_slug, '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or
     p_entitlement_revision is null or p_entitlement_revision < 0 or
     p_issued_at is null or p_expires_at is null or
     p_issued_at > extract(epoch from now())::bigint + 90 or
     p_issued_at < extract(epoch from now())::bigint - (22 * 60 * 60) or
     p_expires_at <> p_issued_at + (23 * 60 * 60) or
     p_expires_at <= extract(epoch from now())::bigint then
    raise exception 'Invalid Academy checkout attempt';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    p_purchaser_reference || E'\n' || p_course_slug || E'\n' || p_entitlement_revision::text,
    0
  ));

  select * into v_attempt
  from public.academy_checkout_attempts
  where purchaser_reference = p_purchaser_reference
    and course_slug = p_course_slug
    and entitlement_revision = p_entitlement_revision
    and expires_at > now()
    and (state = 'session-created' or expires_at > now() + interval '30 minutes')
  order by created_at asc, attempt_id asc
  limit 1
  for update;

  if not found then
    insert into public.academy_checkout_attempts (
      attempt_id, purchaser_reference, course_slug, entitlement_revision, issued_at, expires_at
    ) values (
      p_attempt_id::uuid, p_purchaser_reference, p_course_slug, p_entitlement_revision,
      to_timestamp(p_issued_at), to_timestamp(p_expires_at)
    )
    returning * into v_attempt;
    v_created := true;
  end if;

  return jsonb_build_object(
    'attemptId', v_attempt.attempt_id::text,
    'issuedAt', extract(epoch from v_attempt.issued_at)::bigint,
    'expiresAt', extract(epoch from v_attempt.expires_at)::bigint,
    'requestFingerprint', v_attempt.request_fingerprint,
    'stripeSessionId', v_attempt.stripe_session_id,
    'idempotentReplay', not v_created and v_attempt.attempt_id::text = p_attempt_id,
    'coalescedConcurrentAttempt', not v_created and v_attempt.attempt_id::text <> p_attempt_id
  );
end;
$$;

create or replace function public.academy_bind_checkout_attempt(
  p_attempt_id text,
  p_request_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.academy_checkout_attempts%rowtype;
begin
  if coalesce(p_attempt_id, '') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' or
     coalesce(p_request_fingerprint, '') !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid Academy checkout request fingerprint';
  end if;
  select * into v_attempt from public.academy_checkout_attempts
    where attempt_id = p_attempt_id::uuid and expires_at > now()
    for update;
  if not found then raise exception 'Academy checkout attempt is unavailable'; end if;
  if v_attempt.request_fingerprint is not null and
     v_attempt.request_fingerprint <> p_request_fingerprint then
    raise exception 'Academy checkout attempt material mismatch';
  end if;
  update public.academy_checkout_attempts
    set request_fingerprint = p_request_fingerprint, updated_at = now()
    where attempt_id = v_attempt.attempt_id
    returning * into v_attempt;
  return jsonb_build_object(
    'attemptId', v_attempt.attempt_id::text,
    'requestFingerprint', v_attempt.request_fingerprint,
    'stripeSessionId', v_attempt.stripe_session_id
  );
end;
$$;

create or replace function public.academy_record_checkout_session(
  p_attempt_id text,
  p_stripe_session_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.academy_checkout_attempts%rowtype;
  v_replay boolean;
begin
  if coalesce(p_attempt_id, '') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' or
     coalesce(p_stripe_session_id, '') !~ '^cs_(live|test)_[A-Za-z0-9_]+$' then
    raise exception 'Invalid Academy Checkout Session';
  end if;
  select * into v_attempt from public.academy_checkout_attempts
    where attempt_id = p_attempt_id::uuid
    for update;
  if not found or v_attempt.request_fingerprint is null then
    raise exception 'Academy checkout attempt is unavailable';
  end if;
  if v_attempt.stripe_session_id is not null and
     v_attempt.stripe_session_id <> p_stripe_session_id then
    raise exception 'Academy checkout attempt session mismatch';
  end if;
  v_replay := coalesce(v_attempt.stripe_session_id = p_stripe_session_id, false);
  update public.academy_checkout_attempts
    set stripe_session_id = p_stripe_session_id, state = 'session-created', updated_at = now()
    where attempt_id = v_attempt.attempt_id
    returning * into v_attempt;
  return jsonb_build_object(
    'attemptId', v_attempt.attempt_id::text,
    'stripeSessionId', v_attempt.stripe_session_id,
    'idempotentReplay', v_replay
  );
end;
$$;

revoke all on function public.academy_reserve_checkout_attempt(text, text, text, bigint, bigint, bigint)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_bind_checkout_attempt(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_record_checkout_session(text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.academy_reserve_checkout_attempt(text, text, text, bigint, bigint, bigint)
  to service_role;
grant execute on function public.academy_bind_checkout_attempt(text, text) to service_role;
grant execute on function public.academy_record_checkout_session(text, text) to service_role;

create or replace function public.academy_storage_health()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'schemaVersion', 'academy-durable-state-v2',
    'operational',
      to_regclass('public.academy_payment_reversal_events') is not null and
      to_regclass('public.academy_checkout_attempts') is not null and
      to_regprocedure('public.academy_record_payment_reversal(text,text,text,text,text,text,text,text,text,bigint,bigint,text,boolean,text,text)') is not null and
      to_regprocedure('public.academy_reserve_checkout_attempt(text,text,text,bigint,bigint,bigint)') is not null and
      exists (
        select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'academy_record_paid_checkout'
          and p.prosrc like '%Verified payment did not activate exact Academy access%'
          and p.prosrc like '%Reversed payment cannot activate Academy access%'
      ) and
      exists (
        select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'academy_claim_paid_checkout'
          and p.prosrc like '%Verified payment did not activate exact Academy access%'
          and p.prosrc like '%Reversed payment cannot activate Academy access%'
      ) and
      exists (
        select 1 from pg_trigger t
        join pg_class c on c.oid = t.tgrelid
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = 'academy_learner_state'
          and t.tgname = 'academy_learner_state_reversal_guard'
          and not t.tgisinternal
          and t.tgenabled = 'O'
      ),
    'learnerStateRows', (select count(*) from public.academy_learner_state),
    'paymentEventRows', (select count(*) from public.academy_payment_events),
    'assessmentRecordRows', (select count(*) from public.academy_assessment_records),
    'auditEventRows', (select count(*) from public.academy_learner_events),
    'paymentReversalRows', (select count(*) from public.academy_payment_reversal_events),
    'checkoutAttemptRows', (select count(*) from public.academy_checkout_attempts),
    'reversalGuard', 'enabled',
    'checkoutSerialization', 'purchaser-course-entitlement-revision-v1'
  );
$$;

revoke all on function public.academy_storage_health() from public, anon, authenticated, service_role;
grant execute on function public.academy_storage_health() to service_role;

-- Normalize every Academy commerce ACL in one forward-only migration. CREATE OR
-- REPLACE preserves pre-existing ACLs, and Supabase-managed roles can otherwise
-- retain broader default privileges than these server-only functions require.
revoke all on public.academy_learner_state,
  public.academy_payment_events,
  public.academy_assessment_records,
  public.academy_learner_events,
  public.academy_payment_reversal_events,
  public.academy_checkout_attempts
from public, anon, authenticated, service_role;

grant select, insert, update on public.academy_learner_state to service_role;
grant select, insert, update on public.academy_payment_events to service_role;
grant select, insert on public.academy_assessment_records to service_role;
grant select, insert on public.academy_learner_events to service_role;
grant select, insert, update on public.academy_payment_reversal_events to service_role;
grant select, insert, update on public.academy_checkout_attempts to service_role;

revoke all on function public.academy_record_paid_checkout(text, text, text, text, text, text, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_claim_paid_checkout(text, text, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_import_legacy_state(text, text, timestamptz, text, integer[], numeric, timestamptz, text, jsonb, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_get_learner_state(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_complete_lesson(text, text, integer, integer, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_record_assessment(text, text, numeric, integer, integer, integer, text, timestamptz, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_find_certificate(text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_storage_health()
  from public, anon, authenticated, service_role;
revoke all on function public.academy_aggregate_metrics()
  from public, anon, authenticated, service_role;
revoke all on function public.academy_record_payment_reversal(text, text, text, text, text, text, text, text, text, bigint, bigint, text, boolean, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_reserve_checkout_attempt(text, text, text, bigint, bigint, bigint)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_bind_checkout_attempt(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.academy_record_checkout_session(text, text)
  from public, anon, authenticated, service_role;

grant execute on function public.academy_record_paid_checkout(text, text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.academy_claim_paid_checkout(text, text, text, text, text) to service_role;
grant execute on function public.academy_import_legacy_state(text, text, timestamptz, text, integer[], numeric, timestamptz, text, jsonb, text) to service_role;
grant execute on function public.academy_get_learner_state(text, text) to service_role;
grant execute on function public.academy_complete_lesson(text, text, integer, integer, text) to service_role;
grant execute on function public.academy_record_assessment(text, text, numeric, integer, integer, integer, text, timestamptz, text, jsonb) to service_role;
grant execute on function public.academy_find_certificate(text) to service_role;
grant execute on function public.academy_storage_health() to service_role;
grant execute on function public.academy_aggregate_metrics() to service_role;
grant execute on function public.academy_record_payment_reversal(text, text, text, text, text, text, text, text, text, bigint, bigint, text, boolean, text, text) to service_role;
grant execute on function public.academy_reserve_checkout_attempt(text, text, text, bigint, bigint, bigint) to service_role;
grant execute on function public.academy_bind_checkout_attempt(text, text) to service_role;
grant execute on function public.academy_record_checkout_session(text, text) to service_role;

revoke all on function public.academy_reject_audit_mutation()
  from public, anon, authenticated, service_role;
revoke all on function public.academy_reject_reversed_entitlement_activation()
  from public, anon, authenticated, service_role;
