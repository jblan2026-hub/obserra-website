-- Academy payment reversal governance. Source only until provider promotion is authorized.
-- No payment, refund, dispute, learner, or FDACS record is created by this migration.

create table if not exists public.academy_payment_reversal_events (
  event_id text primary key,
  event_type text not null,
  provider_object_id text not null,
  charge_id text not null,
  payment_intent_id text not null,
  checkout_session_id text not null,
  customer_id text not null,
  course_slug text not null,
  course_version text not null,
  amount_captured bigint not null,
  amount_reversed bigint not null,
  currency text not null,
  livemode boolean not null,
  disposition text not null,
  target_access_status text not null,
  processing_state text not null,
  access_status_result text not null,
  delivery_count integer not null default 1,
  first_received_at timestamptz not null default now(),
  last_received_at timestamptz not null default now(),
  constraint academy_payment_reversal_event_id check (event_id ~ '^evt_[A-Za-z0-9_]+$'),
  constraint academy_payment_reversal_event_type check (
    event_type in ('charge.refunded', 'charge.dispute.created', 'charge.dispute.closed')
  ),
  constraint academy_payment_reversal_object_id check (
    provider_object_id ~ '^(ch|du|dp)_[A-Za-z0-9_]+$'
  ),
  constraint academy_payment_reversal_charge_id check (charge_id ~ '^ch_[A-Za-z0-9_]+$'),
  constraint academy_payment_reversal_intent_id check (payment_intent_id ~ '^pi_[A-Za-z0-9_]+$'),
  constraint academy_payment_reversal_session_id check (checkout_session_id ~ '^cs_(live|test)_[A-Za-z0-9_]+$'),
  constraint academy_payment_reversal_customer_id check (customer_id ~ '^cus_[A-Za-z0-9_]+$'),
  constraint academy_payment_reversal_course_slug check (course_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint academy_payment_reversal_course_version check (course_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  constraint academy_payment_reversal_amounts check (
    amount_captured > 0 and amount_reversed > 0 and amount_reversed <= amount_captured
  ),
  constraint academy_payment_reversal_currency check (currency = 'usd'),
  constraint academy_payment_reversal_disposition check (
    disposition in ('full-refund', 'partial-refund-review', 'dispute-open', 'dispute-closed-review')
  ),
  constraint academy_payment_reversal_target check (target_access_status in ('refunded', 'revoked')),
  constraint academy_payment_reversal_processing check (
    processing_state in ('applied', 'recorded-no-entitlement', 'manual-review-required')
  ),
  constraint academy_payment_reversal_access_result check (
    access_status_result in ('refunded', 'revoked', 'unchanged')
  ),
  constraint academy_payment_reversal_delivery_count check (delivery_count > 0)
);

create index if not exists academy_payment_reversal_payment_idx
  on public.academy_payment_reversal_events (payment_intent_id, checkout_session_id, last_received_at desc);
create index if not exists academy_payment_reversal_course_idx
  on public.academy_payment_reversal_events (course_slug, last_received_at desc);

alter table public.academy_payment_reversal_events enable row level security;
alter table public.academy_payment_reversal_events force row level security;
revoke all on public.academy_payment_reversal_events from public, anon, authenticated;
revoke all on public.academy_payment_reversal_events from service_role;
grant select, insert, update on public.academy_payment_reversal_events to service_role;

create or replace function public.academy_reject_reversed_entitlement_activation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.access_status = 'active' and exists (
    select 1 from public.academy_payment_reversal_events r
    where r.checkout_session_id = new.payment_reference
      and r.course_slug = new.course_slug
      and r.target_access_status in ('refunded', 'revoked')
  ) then
    raise exception 'Reversed payment cannot activate Academy access';
  end if;
  return new;
end;
$$;

drop trigger if exists academy_learner_state_reversal_guard on public.academy_learner_state;
create trigger academy_learner_state_reversal_guard
before insert or update of access_status, payment_reference on public.academy_learner_state
for each row execute function public.academy_reject_reversed_entitlement_activation();

revoke all on function public.academy_reject_reversed_entitlement_activation() from public, anon, authenticated;

create or replace function public.academy_record_payment_reversal(
  p_event_id text,
  p_event_type text,
  p_provider_object_id text,
  p_charge_id text,
  p_payment_intent_id text,
  p_checkout_session_id text,
  p_customer_id text,
  p_course_slug text,
  p_course_version text,
  p_amount_captured bigint,
  p_amount_reversed bigint,
  p_currency text,
  p_livemode boolean,
  p_disposition text,
  p_target_access_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.academy_payment_events%rowtype;
  v_existing public.academy_payment_reversal_events%rowtype;
  v_processing_state text;
  v_access_status text;
  v_updated integer;
begin
  select * into v_existing from public.academy_payment_reversal_events
    where event_id = p_event_id for update;
  if found then
    if v_existing.event_type <> p_event_type or
       v_existing.provider_object_id <> p_provider_object_id or
       v_existing.charge_id <> p_charge_id or
       v_existing.payment_intent_id <> p_payment_intent_id or
       v_existing.checkout_session_id <> p_checkout_session_id or
       v_existing.customer_id <> p_customer_id or
       v_existing.course_slug <> p_course_slug or
       v_existing.course_version <> p_course_version or
       v_existing.amount_captured <> p_amount_captured or
       v_existing.amount_reversed <> p_amount_reversed or
       v_existing.currency <> p_currency or
       v_existing.livemode <> p_livemode or
       v_existing.disposition <> p_disposition or
       v_existing.target_access_status <> p_target_access_status then
      raise exception 'Stripe reversal event material identity mismatch';
    end if;
    update public.academy_payment_reversal_events
      set delivery_count = delivery_count + 1, last_received_at = now()
      where event_id = p_event_id;
    return jsonb_build_object(
      'state', v_existing.processing_state,
      'accessStatus', v_existing.access_status_result,
      'idempotentReplay', true
    );
  end if;

  select * into v_payment from public.academy_payment_events
    where payment_intent_id = p_payment_intent_id
      and checkout_session_id = p_checkout_session_id
      and course_slug = p_course_slug
      and course_version = p_course_version
      and processing_state in ('fulfilled', 'paid_pending_claim')
    order by last_received_at desc
    limit 1
    for update;
  if not found then
    raise exception 'Paid checkout mapping is unavailable';
  end if;
  if exists (
    select 1 from public.academy_payment_events candidate
    where (candidate.payment_intent_id = p_payment_intent_id or candidate.checkout_session_id = p_checkout_session_id)
      and (
        candidate.payment_intent_id is distinct from p_payment_intent_id or
        candidate.checkout_session_id is distinct from p_checkout_session_id or
        candidate.course_slug is distinct from p_course_slug or
        candidate.course_version is distinct from p_course_version or
        candidate.identity_mode is distinct from v_payment.identity_mode or
        candidate.clerk_user_id is distinct from v_payment.clerk_user_id or
        candidate.purchaser_email_hash is distinct from v_payment.purchaser_email_hash
      )
  ) then
    raise exception 'Ambiguous paid checkout mapping';
  end if;
  if (p_event_type = 'charge.refunded' and p_disposition not in ('full-refund', 'partial-refund-review')) or
     (p_event_type = 'charge.dispute.created' and p_disposition <> 'dispute-open') or
     (p_event_type = 'charge.dispute.closed' and p_disposition <> 'dispute-closed-review') or
     (p_disposition = 'full-refund' and p_target_access_status <> 'refunded') or
     (p_disposition <> 'full-refund' and p_target_access_status <> 'revoked') then
    raise exception 'Invalid payment reversal policy';
  end if;

  if p_target_access_status = 'refunded' then
    update public.academy_learner_state
      set access_status = 'refunded', record_version = record_version + 1, updated_at = now()
      where payment_reference = p_checkout_session_id
        and course_slug = p_course_slug
        and access_status in ('active', 'revoked');
  else
    update public.academy_learner_state
      set access_status = 'revoked', record_version = record_version + 1, updated_at = now()
      where payment_reference = p_checkout_session_id
        and course_slug = p_course_slug
        and access_status = 'active';
  end if;
  get diagnostics v_updated = row_count;

  if v_updated = 1 then
    v_processing_state := 'applied';
    v_access_status := p_target_access_status;
  elsif exists (
    select 1 from public.academy_learner_state
    where course_slug = p_course_slug and clerk_user_id = v_payment.clerk_user_id
  ) then
    v_processing_state := 'manual-review-required';
    v_access_status := 'unchanged';
  else
    v_processing_state := 'recorded-no-entitlement';
    v_access_status := 'unchanged';
  end if;

  insert into public.academy_payment_reversal_events (
    event_id, event_type, provider_object_id, charge_id, payment_intent_id,
    checkout_session_id, customer_id, course_slug, course_version,
    amount_captured, amount_reversed, currency, livemode, disposition,
    target_access_status, processing_state, access_status_result
  ) values (
    p_event_id, p_event_type, p_provider_object_id, p_charge_id, p_payment_intent_id,
    p_checkout_session_id, p_customer_id, p_course_slug, p_course_version,
    p_amount_captured, p_amount_reversed, p_currency, p_livemode, p_disposition,
    p_target_access_status, v_processing_state, v_access_status
  );

  return jsonb_build_object(
    'state', v_processing_state,
    'accessStatus', v_access_status,
    'idempotentReplay', false
  );
end;
$$;

revoke all on function public.academy_record_payment_reversal(
  text, text, text, text, text, text, text, text, text, bigint, bigint, text, boolean, text, text
) from public, anon, authenticated;
grant execute on function public.academy_record_payment_reversal(
  text, text, text, text, text, text, text, text, text, bigint, bigint, text, boolean, text, text
) to service_role;
