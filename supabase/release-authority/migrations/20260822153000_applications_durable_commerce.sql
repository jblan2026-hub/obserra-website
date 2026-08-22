-- Project: ykmrlcfitsubqajgfnye (Obserra Applications Release Authority)
-- Purpose: Durable, fail-closed Applications commerce and entitlement ledger.

create schema if not exists obserra_app_commerce;
revoke all on schema obserra_app_commerce from public, anon, authenticated, service_role;

create table obserra_app_commerce.customers (
  subject_id text not null,
  tenant_id text not null,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  primary key (subject_id, tenant_id),
  unique (subject_id, tenant_id, stripe_customer_id),
  constraint applications_customer_subject_format check (subject_id ~ '^user_[A-Za-z0-9_-]{8,}$'),
  constraint applications_customer_tenant_format check (tenant_id ~ '^(org_[A-Za-z0-9_-]{8,}|subject:user_[A-Za-z0-9_-]{8,})$'),
  constraint applications_customer_stripe_format check (stripe_customer_id ~ '^cus_[A-Za-z0-9]+$')
);

create table obserra_app_commerce.checkout_attempts (
  attempt_id uuid primary key,
  request_key text not null unique,
  subject_id text not null,
  tenant_id text not null,
  app_slug text not null,
  plan_id text not null,
  billing_interval text not null,
  deployment_model text not null,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_subscription_id text,
  state text not null default 'reserved',
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_checkout_request_key_format check (request_key ~ '^[0-9a-f]{64}$'),
  constraint applications_checkout_app_format check (app_slug ~ '^obserra-[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint applications_checkout_plan check (plan_id in ('professional', 'enterprise')),
  constraint applications_checkout_interval check (billing_interval in ('monthly', 'annual')),
  constraint applications_checkout_deployment check (deployment_model in ('SaaS', 'Private Cloud', 'Hybrid', 'On-Premises')),
  constraint applications_checkout_state check (state in ('reserved', 'session_created', 'completed', 'expired', 'failed')),
  constraint applications_checkout_expiration check (expires_at > issued_at),
  constraint applications_checkout_customer_format check (stripe_customer_id is null or stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
  constraint applications_checkout_session_format check (stripe_checkout_session_id is null or stripe_checkout_session_id ~ '^cs_(live|test)_[A-Za-z0-9_]+$'),
  constraint applications_checkout_subscription_format check (stripe_subscription_id is null or stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$')
);

create table obserra_app_commerce.subscriptions (
  stripe_subscription_id text primary key,
  stripe_customer_id text not null,
  stripe_checkout_session_id text unique,
  subject_id text not null,
  tenant_id text not null,
  app_slug text not null,
  plan_id text not null,
  billing_interval text not null,
  deployment_model text not null,
  stripe_status text not null,
  access_status text not null,
  reversal_status text not null default 'none',
  currency text not null,
  unit_amount bigint not null,
  quantity integer not null,
  livemode boolean not null,
  current_period_end timestamptz,
  cancel_at timestamptz,
  last_event_id text not null,
  last_event_created bigint not null,
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_subscription_id_format check (stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$'),
  constraint applications_subscription_customer_format check (stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
  constraint applications_subscription_session_format check (stripe_checkout_session_id is null or stripe_checkout_session_id ~ '^cs_(live|test)_[A-Za-z0-9_]+$'),
  constraint applications_subscription_app_format check (app_slug ~ '^obserra-[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint applications_subscription_plan check (plan_id in ('professional', 'enterprise')),
  constraint applications_subscription_interval check (billing_interval in ('monthly', 'annual')),
  constraint applications_subscription_deployment check (deployment_model in ('SaaS', 'Private Cloud', 'Hybrid', 'On-Premises')),
  constraint applications_subscription_status check (stripe_status in ('active', 'trialing', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'paused')),
  constraint applications_subscription_access check (access_status in ('active', 'pending', 'suspended', 'revoked')),
  constraint applications_subscription_reversal check (reversal_status in ('none', 'full_refund', 'partial_refund_review', 'dispute_open', 'dispute_closed_review')),
  constraint applications_subscription_currency check (currency = 'usd'),
  constraint applications_subscription_amount check (unit_amount > 0),
  constraint applications_subscription_quantity check (quantity > 0),
  constraint applications_subscription_event_format check (last_event_id ~ '^evt_[A-Za-z0-9]+$'),
  constraint applications_subscription_revision check (revision > 0),
  foreign key (subject_id, tenant_id, stripe_customer_id)
    references obserra_app_commerce.customers (subject_id, tenant_id, stripe_customer_id)
    on update restrict on delete restrict
);

create table obserra_app_commerce.payment_events (
  stripe_event_id text primary key,
  event_type text not null,
  stripe_object_id text not null,
  stripe_subscription_id text,
  payload_sha256 text not null,
  livemode boolean not null,
  event_created bigint not null,
  outcome text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz not null default now(),
  constraint applications_event_id_format check (stripe_event_id ~ '^evt_[A-Za-z0-9]+$'),
  constraint applications_event_hash_format check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  constraint applications_event_outcome check (outcome in ('applied', 'duplicate', 'stale_ignored', 'recorded_no_subscription', 'manual_review')),
  constraint applications_event_subscription_format check (stripe_subscription_id is null or stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$')
);

create index applications_checkout_subject_app_idx on obserra_app_commerce.checkout_attempts (subject_id, app_slug, expires_at desc);
create index applications_subscriptions_subject_app_idx on obserra_app_commerce.subscriptions (subject_id, tenant_id, app_slug, updated_at desc);
create index applications_subscriptions_customer_idx on obserra_app_commerce.subscriptions (stripe_customer_id);
create index applications_events_subscription_idx on obserra_app_commerce.payment_events (stripe_subscription_id, event_created desc);

alter table obserra_app_commerce.customers enable row level security;
alter table obserra_app_commerce.customers force row level security;
alter table obserra_app_commerce.checkout_attempts enable row level security;
alter table obserra_app_commerce.checkout_attempts force row level security;
alter table obserra_app_commerce.subscriptions enable row level security;
alter table obserra_app_commerce.subscriptions force row level security;
alter table obserra_app_commerce.payment_events enable row level security;
alter table obserra_app_commerce.payment_events force row level security;

revoke all on all tables in schema obserra_app_commerce from public, anon, authenticated, service_role;
revoke all on all sequences in schema obserra_app_commerce from public, anon, authenticated, service_role;

create or replace function obserra_app_commerce.reject_payment_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Applications payment events are append-only';
end;
$$;

create trigger applications_payment_events_append_only
before update or delete on obserra_app_commerce.payment_events
for each row execute function obserra_app_commerce.reject_payment_event_mutation();

create or replace function public.obserra_applications_customer(p_subject_id text, p_tenant_id text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select case when c.stripe_customer_id is null then null else pg_catalog.jsonb_build_object(
    'subjectId', c.subject_id, 'tenantId', c.tenant_id, 'stripeCustomerId', c.stripe_customer_id
  ) end
  from (select p_subject_id as subject_id, p_tenant_id as tenant_id) requested
  left join obserra_app_commerce.customers c
    on c.subject_id = requested.subject_id and c.tenant_id = requested.tenant_id;
$$;

create or replace function public.obserra_applications_bind_customer(p_subject_id text, p_tenant_id text, p_stripe_customer_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_customer obserra_app_commerce.customers%rowtype;
begin
  insert into obserra_app_commerce.customers (subject_id, tenant_id, stripe_customer_id)
  values (p_subject_id, p_tenant_id, p_stripe_customer_id)
  on conflict (subject_id, tenant_id) do nothing;
  select * into strict v_customer from obserra_app_commerce.customers
  where subject_id = p_subject_id and tenant_id = p_tenant_id;
  if v_customer.stripe_customer_id <> p_stripe_customer_id then
    raise exception 'Applications customer binding is immutable';
  end if;
  return pg_catalog.jsonb_build_object('subjectId', v_customer.subject_id, 'tenantId', v_customer.tenant_id, 'stripeCustomerId', v_customer.stripe_customer_id);
end;
$$;

create or replace function public.obserra_applications_reserve_checkout(
  p_attempt_id uuid, p_request_key text, p_subject_id text, p_tenant_id text,
  p_app_slug text, p_plan_id text, p_billing_interval text, p_deployment_model text,
  p_issued_at bigint, p_expires_at bigint
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt obserra_app_commerce.checkout_attempts%rowtype;
  v_replay boolean := false;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request_key, 0));
  select * into v_attempt from obserra_app_commerce.checkout_attempts where request_key = p_request_key;
  if found then
    if v_attempt.subject_id <> p_subject_id or v_attempt.tenant_id <> p_tenant_id
      or v_attempt.app_slug <> p_app_slug or v_attempt.plan_id <> p_plan_id
      or v_attempt.billing_interval <> p_billing_interval or v_attempt.deployment_model <> p_deployment_model then
      raise exception 'Applications checkout request key collision';
    end if;
    v_replay := true;
  else
    insert into obserra_app_commerce.checkout_attempts (
      attempt_id, request_key, subject_id, tenant_id, app_slug, plan_id,
      billing_interval, deployment_model, issued_at, expires_at
    ) values (
      p_attempt_id, p_request_key, p_subject_id, p_tenant_id, p_app_slug, p_plan_id,
      p_billing_interval, p_deployment_model, pg_catalog.to_timestamp(p_issued_at), pg_catalog.to_timestamp(p_expires_at)
    ) returning * into v_attempt;
  end if;
  return pg_catalog.jsonb_build_object(
    'attemptId', v_attempt.attempt_id, 'requestKey', v_attempt.request_key,
    'stripeCustomerId', v_attempt.stripe_customer_id, 'stripeSessionId', v_attempt.stripe_checkout_session_id,
    'state', v_attempt.state, 'issuedAt', extract(epoch from v_attempt.issued_at)::bigint,
    'expiresAt', extract(epoch from v_attempt.expires_at)::bigint, 'idempotentReplay', v_replay
  );
end;
$$;

create or replace function public.obserra_applications_record_checkout_session(
  p_attempt_id uuid, p_stripe_customer_id text, p_stripe_checkout_session_id text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_attempt obserra_app_commerce.checkout_attempts%rowtype;
begin
  update obserra_app_commerce.checkout_attempts
  set stripe_customer_id = p_stripe_customer_id, stripe_checkout_session_id = p_stripe_checkout_session_id,
      state = 'session_created', updated_at = pg_catalog.now()
  where attempt_id = p_attempt_id
    and (stripe_customer_id is null or stripe_customer_id = p_stripe_customer_id)
    and (stripe_checkout_session_id is null or stripe_checkout_session_id = p_stripe_checkout_session_id)
  returning * into v_attempt;
  if not found then raise exception 'Applications checkout session binding was rejected'; end if;
  return pg_catalog.jsonb_build_object('attemptId', v_attempt.attempt_id, 'stripeCustomerId', v_attempt.stripe_customer_id, 'stripeSessionId', v_attempt.stripe_checkout_session_id, 'state', v_attempt.state);
end;
$$;

create or replace function public.obserra_applications_apply_subscription(
  p_event_id text, p_event_type text, p_event_object_id text, p_payload_sha256 text,
  p_event_created bigint, p_livemode boolean, p_subscription_id text, p_customer_id text,
  p_checkout_session_id text, p_subject_id text, p_tenant_id text, p_app_slug text,
  p_plan_id text, p_billing_interval text, p_deployment_model text, p_stripe_status text,
  p_access_status text, p_currency text, p_unit_amount bigint, p_quantity integer,
  p_current_period_end bigint, p_cancel_at bigint
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_event obserra_app_commerce.payment_events%rowtype;
  v_subscription obserra_app_commerce.subscriptions%rowtype;
  v_stale boolean := false;
  v_inserted integer := 0;
begin
  select * into v_subscription from obserra_app_commerce.subscriptions where stripe_subscription_id = p_subscription_id;
  v_stale := found and v_subscription.last_event_created > p_event_created;
  insert into obserra_app_commerce.payment_events (
    stripe_event_id, event_type, stripe_object_id, stripe_subscription_id,
    payload_sha256, livemode, event_created, outcome
  ) values (
    p_event_id, p_event_type, p_event_object_id, p_subscription_id,
    p_payload_sha256, p_livemode, p_event_created,
    case when v_stale then 'stale_ignored' else 'applied' end
  )
  on conflict (stripe_event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    select * into strict v_existing_event from obserra_app_commerce.payment_events where stripe_event_id = p_event_id;
    if v_existing_event.payload_sha256 <> p_payload_sha256 then raise exception 'Applications Stripe event identity collision'; end if;
    select * into v_subscription from obserra_app_commerce.subscriptions where stripe_subscription_id = p_subscription_id;
    return pg_catalog.jsonb_build_object(
      'subscriptionId', p_subscription_id, 'accessStatus', v_subscription.access_status,
      'stripeStatus', v_subscription.stripe_status, 'revision', v_subscription.revision,
      'idempotentReplay', true, 'staleIgnored', false
    );
  end if;
  if not v_stale then
    insert into obserra_app_commerce.subscriptions (
      stripe_subscription_id, stripe_customer_id, stripe_checkout_session_id,
      subject_id, tenant_id, app_slug, plan_id, billing_interval, deployment_model,
      stripe_status, access_status, reversal_status, currency, unit_amount, quantity,
      livemode, current_period_end, cancel_at, last_event_id, last_event_created
    ) values (
      p_subscription_id, p_customer_id, nullif(p_checkout_session_id, ''),
      p_subject_id, p_tenant_id, p_app_slug, p_plan_id, p_billing_interval, p_deployment_model,
      p_stripe_status, p_access_status, 'none', p_currency, p_unit_amount, p_quantity,
      p_livemode, case when p_current_period_end > 0 then pg_catalog.to_timestamp(p_current_period_end) else null end,
      case when p_cancel_at > 0 then pg_catalog.to_timestamp(p_cancel_at) else null end,
      p_event_id, p_event_created
    ) on conflict (stripe_subscription_id) do update set
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_checkout_session_id = coalesce(excluded.stripe_checkout_session_id, obserra_app_commerce.subscriptions.stripe_checkout_session_id),
      subject_id = excluded.subject_id, tenant_id = excluded.tenant_id, app_slug = excluded.app_slug,
      plan_id = excluded.plan_id, billing_interval = excluded.billing_interval,
      deployment_model = excluded.deployment_model, stripe_status = excluded.stripe_status,
      access_status = case when obserra_app_commerce.subscriptions.reversal_status in ('full_refund', 'dispute_open') then 'revoked' else excluded.access_status end,
      currency = excluded.currency, unit_amount = excluded.unit_amount, quantity = excluded.quantity,
      livemode = excluded.livemode, current_period_end = excluded.current_period_end,
      cancel_at = excluded.cancel_at, last_event_id = excluded.last_event_id,
      last_event_created = excluded.last_event_created,
      revision = obserra_app_commerce.subscriptions.revision + 1, updated_at = pg_catalog.now()
    returning * into v_subscription;
    update obserra_app_commerce.checkout_attempts
    set stripe_subscription_id = p_subscription_id, state = 'completed', updated_at = pg_catalog.now()
    where stripe_checkout_session_id = nullif(p_checkout_session_id, '');
  end if;
  return pg_catalog.jsonb_build_object(
    'subscriptionId', p_subscription_id, 'accessStatus', v_subscription.access_status,
    'stripeStatus', v_subscription.stripe_status, 'revision', v_subscription.revision,
    'idempotentReplay', false, 'staleIgnored', v_stale
  );
end;
$$;

create or replace function public.obserra_applications_apply_reversal(
  p_event_id text, p_event_type text, p_event_object_id text, p_payload_sha256 text,
  p_event_created bigint, p_livemode boolean, p_subscription_id text, p_reversal_status text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_event obserra_app_commerce.payment_events%rowtype;
  v_subscription obserra_app_commerce.subscriptions%rowtype;
  v_inserted integer := 0;
  v_access_status text;
  v_outcome text;
begin
  v_access_status := case when p_reversal_status in ('full_refund', 'dispute_open') then 'revoked' else 'suspended' end;
  v_outcome := case when p_reversal_status in ('partial_refund_review', 'dispute_closed_review') then 'manual_review' else 'applied' end;
  insert into obserra_app_commerce.payment_events (
    stripe_event_id, event_type, stripe_object_id, stripe_subscription_id,
    payload_sha256, livemode, event_created, outcome
  ) values (
    p_event_id, p_event_type, p_event_object_id, nullif(p_subscription_id, ''),
    p_payload_sha256, p_livemode, p_event_created,
    case when p_subscription_id = '' then 'recorded_no_subscription' else v_outcome end
  ) on conflict (stripe_event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    select * into strict v_existing_event from obserra_app_commerce.payment_events where stripe_event_id = p_event_id;
    if v_existing_event.payload_sha256 <> p_payload_sha256 then raise exception 'Applications Stripe reversal event identity collision'; end if;
    select * into v_subscription from obserra_app_commerce.subscriptions where stripe_subscription_id = nullif(p_subscription_id, '');
    return pg_catalog.jsonb_build_object(
      'subscriptionId', nullif(p_subscription_id, ''), 'accessStatus', v_subscription.access_status,
      'reversalStatus', v_subscription.reversal_status, 'revision', v_subscription.revision,
      'idempotentReplay', true, 'manualReview', v_existing_event.outcome = 'manual_review'
    );
  end if;
  if p_subscription_id <> '' then
    update obserra_app_commerce.subscriptions
    set reversal_status = p_reversal_status, access_status = v_access_status,
        last_event_id = p_event_id, last_event_created = greatest(last_event_created, p_event_created),
        revision = revision + 1, updated_at = pg_catalog.now()
    where stripe_subscription_id = p_subscription_id and last_event_created <= p_event_created
    returning * into v_subscription;
  end if;
  return pg_catalog.jsonb_build_object(
    'subscriptionId', nullif(p_subscription_id, ''), 'accessStatus', v_subscription.access_status,
    'reversalStatus', v_subscription.reversal_status, 'revision', v_subscription.revision,
    'idempotentReplay', v_inserted = 0, 'manualReview', v_outcome = 'manual_review'
  );
end;
$$;

create or replace function public.obserra_applications_entitlement(p_subject_id text, p_tenant_id text, p_app_slug text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_subscription obserra_app_commerce.subscriptions%rowtype;
begin
  select * into v_subscription from obserra_app_commerce.subscriptions
  where subject_id = p_subject_id and tenant_id = p_tenant_id and app_slug = p_app_slug
  order by updated_at desc limit 1;
  if not found then
    return pg_catalog.jsonb_build_object('allowed', false, 'status', 'not-subscribed', 'authoritative', true, 'source', 'applications-commerce-ledger');
  end if;
  return pg_catalog.jsonb_build_object(
    'allowed', v_subscription.access_status = 'active' and v_subscription.stripe_status in ('active', 'trialing') and v_subscription.reversal_status = 'none',
    'status', v_subscription.access_status, 'stripeStatus', v_subscription.stripe_status,
    'subscriptionId', v_subscription.stripe_subscription_id, 'customerId', v_subscription.stripe_customer_id,
    'plan', v_subscription.plan_id, 'deploymentModel', v_subscription.deployment_model,
    'billingInterval', v_subscription.billing_interval, 'seatsPurchased', v_subscription.quantity,
    'currentPeriodEnd', v_subscription.current_period_end, 'revision', v_subscription.revision,
    'authoritative', true, 'source', 'applications-commerce-ledger'
  );
end;
$$;

create or replace function public.obserra_applications_commerce_health()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'schemaVersion', 'applications-commerce-v1', 'operational', true,
    'customerRows', (select pg_catalog.count(*) from obserra_app_commerce.customers),
    'checkoutAttemptRows', (select pg_catalog.count(*) from obserra_app_commerce.checkout_attempts),
    'subscriptionRows', (select pg_catalog.count(*) from obserra_app_commerce.subscriptions),
    'paymentEventRows', (select pg_catalog.count(*) from obserra_app_commerce.payment_events),
    'eventLedger', 'append-only', 'entitlementAuthority', 'durable-subscription-snapshot-v1'
  );
$$;

revoke all on function obserra_app_commerce.reject_payment_event_mutation() from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_customer(text, text) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_bind_customer(text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_reserve_checkout(uuid, text, text, text, text, text, text, text, bigint, bigint) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_record_checkout_session(uuid, text, text) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_apply_subscription(text, text, text, text, bigint, boolean, text, text, text, text, text, text, text, text, text, text, text, text, bigint, integer, bigint, bigint) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_apply_reversal(text, text, text, text, bigint, boolean, text, text) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_entitlement(text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_commerce_health() from public, anon, authenticated, service_role;

grant execute on function public.obserra_applications_customer(text, text) to service_role;
grant execute on function public.obserra_applications_bind_customer(text, text, text) to service_role;
grant execute on function public.obserra_applications_reserve_checkout(uuid, text, text, text, text, text, text, text, bigint, bigint) to service_role;
grant execute on function public.obserra_applications_record_checkout_session(uuid, text, text) to service_role;
grant execute on function public.obserra_applications_apply_subscription(text, text, text, text, bigint, boolean, text, text, text, text, text, text, text, text, text, text, text, text, bigint, integer, bigint, bigint) to service_role;
grant execute on function public.obserra_applications_apply_reversal(text, text, text, text, bigint, boolean, text, text) to service_role;
grant execute on function public.obserra_applications_entitlement(text, text, text) to service_role;
grant execute on function public.obserra_applications_commerce_health() to service_role;

alter default privileges in schema obserra_app_commerce revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema obserra_app_commerce revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges in schema obserra_app_commerce revoke execute on functions from public, anon, authenticated, service_role;
