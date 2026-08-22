-- Project: ykmrlcfitsubqajgfnye (Obserra Applications Release Authority)
-- Purpose: Make refund and dispute projection fail closed under delayed and out-of-order Stripe delivery.

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
  v_latest_reversal obserra_app_commerce.payment_events%rowtype;
  v_subscription obserra_app_commerce.subscriptions%rowtype;
  v_projected_reversal_status text := 'none';
  v_projected_access_status text := p_access_status;
  v_projected_last_event_id text := p_event_id;
  v_projected_last_event_created bigint := p_event_created;
  v_stale boolean := false;
  v_inserted integer := 0;
begin
  select * into v_subscription
  from obserra_app_commerce.subscriptions
  where stripe_subscription_id = p_subscription_id;

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
    select * into strict v_existing_event
    from obserra_app_commerce.payment_events
    where stripe_event_id = p_event_id;
    if v_existing_event.payload_sha256 <> p_payload_sha256 then
      raise exception 'Applications Stripe event identity collision';
    end if;
    select * into v_subscription
    from obserra_app_commerce.subscriptions
    where stripe_subscription_id = p_subscription_id;
    return pg_catalog.jsonb_build_object(
      'subscriptionId', p_subscription_id,
      'accessStatus', v_subscription.access_status,
      'stripeStatus', v_subscription.stripe_status,
      'revision', v_subscription.revision,
      'idempotentReplay', true,
      'staleIgnored', false
    );
  end if;

  if not v_stale then
    select * into v_latest_reversal
    from obserra_app_commerce.payment_events
    where stripe_subscription_id = p_subscription_id
      and event_type in ('charge.refunded', 'charge.dispute.created', 'charge.dispute.closed')
    order by event_created desc, received_at desc, stripe_event_id desc
    limit 1;

    if found then
      v_projected_reversal_status := case
        when v_latest_reversal.event_type = 'charge.refunded' and v_latest_reversal.outcome = 'manual_review' then 'partial_refund_review'
        when v_latest_reversal.event_type = 'charge.refunded' then 'full_refund'
        when v_latest_reversal.event_type = 'charge.dispute.created' then 'dispute_open'
        else 'dispute_closed_review'
      end;
      v_projected_access_status := case
        when v_projected_reversal_status in ('full_refund', 'dispute_open') then 'revoked'
        else 'suspended'
      end;
      if v_latest_reversal.event_created > p_event_created then
        v_projected_last_event_id := v_latest_reversal.stripe_event_id;
        v_projected_last_event_created := v_latest_reversal.event_created;
      end if;
    end if;

    insert into obserra_app_commerce.subscriptions (
      stripe_subscription_id, stripe_customer_id, stripe_checkout_session_id,
      subject_id, tenant_id, app_slug, plan_id, billing_interval, deployment_model,
      stripe_status, access_status, reversal_status, currency, unit_amount, quantity,
      livemode, current_period_end, cancel_at, last_event_id, last_event_created
    ) values (
      p_subscription_id, p_customer_id, nullif(p_checkout_session_id, ''),
      p_subject_id, p_tenant_id, p_app_slug, p_plan_id, p_billing_interval, p_deployment_model,
      p_stripe_status, v_projected_access_status, v_projected_reversal_status,
      p_currency, p_unit_amount, p_quantity, p_livemode,
      case when p_current_period_end > 0 then pg_catalog.to_timestamp(p_current_period_end) else null end,
      case when p_cancel_at > 0 then pg_catalog.to_timestamp(p_cancel_at) else null end,
      v_projected_last_event_id, v_projected_last_event_created
    ) on conflict (stripe_subscription_id) do update set
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_checkout_session_id = coalesce(excluded.stripe_checkout_session_id, obserra_app_commerce.subscriptions.stripe_checkout_session_id),
      subject_id = excluded.subject_id,
      tenant_id = excluded.tenant_id,
      app_slug = excluded.app_slug,
      plan_id = excluded.plan_id,
      billing_interval = excluded.billing_interval,
      deployment_model = excluded.deployment_model,
      stripe_status = excluded.stripe_status,
      reversal_status = case
        when obserra_app_commerce.subscriptions.reversal_status = 'full_refund' then 'full_refund'
        when excluded.reversal_status <> 'none' then excluded.reversal_status
        else obserra_app_commerce.subscriptions.reversal_status
      end,
      access_status = case
        when obserra_app_commerce.subscriptions.reversal_status in ('full_refund', 'dispute_open') then 'revoked'
        when excluded.reversal_status in ('full_refund', 'dispute_open') then 'revoked'
        when obserra_app_commerce.subscriptions.reversal_status <> 'none' or excluded.reversal_status <> 'none' then 'suspended'
        else excluded.access_status
      end,
      currency = excluded.currency,
      unit_amount = excluded.unit_amount,
      quantity = excluded.quantity,
      livemode = excluded.livemode,
      current_period_end = excluded.current_period_end,
      cancel_at = excluded.cancel_at,
      last_event_id = excluded.last_event_id,
      last_event_created = excluded.last_event_created,
      revision = obserra_app_commerce.subscriptions.revision + 1,
      updated_at = pg_catalog.now()
    returning * into v_subscription;

    update obserra_app_commerce.checkout_attempts
    set stripe_subscription_id = p_subscription_id,
        state = 'completed',
        updated_at = pg_catalog.now()
    where stripe_checkout_session_id = nullif(p_checkout_session_id, '');
  end if;

  return pg_catalog.jsonb_build_object(
    'subscriptionId', p_subscription_id,
    'accessStatus', v_subscription.access_status,
    'stripeStatus', v_subscription.stripe_status,
    'revision', v_subscription.revision,
    'idempotentReplay', false,
    'staleIgnored', v_stale
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
  v_latest_reversal obserra_app_commerce.payment_events%rowtype;
  v_subscription obserra_app_commerce.subscriptions%rowtype;
  v_latest_reversal_status text;
  v_latest_access_status text;
  v_inserted integer := 0;
  v_outcome text;
begin
  v_outcome := case
    when p_reversal_status in ('partial_refund_review', 'dispute_closed_review') then 'manual_review'
    else 'applied'
  end;

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
    select * into strict v_existing_event
    from obserra_app_commerce.payment_events
    where stripe_event_id = p_event_id;
    if v_existing_event.payload_sha256 <> p_payload_sha256 then
      raise exception 'Applications Stripe reversal event identity collision';
    end if;
    select * into v_subscription
    from obserra_app_commerce.subscriptions
    where stripe_subscription_id = nullif(p_subscription_id, '');
    return pg_catalog.jsonb_build_object(
      'subscriptionId', nullif(p_subscription_id, ''),
      'accessStatus', v_subscription.access_status,
      'reversalStatus', v_subscription.reversal_status,
      'revision', v_subscription.revision,
      'idempotentReplay', true,
      'manualReview', v_existing_event.outcome = 'manual_review'
    );
  end if;

  if p_subscription_id <> '' then
    select * into strict v_latest_reversal
    from obserra_app_commerce.payment_events
    where stripe_subscription_id = p_subscription_id
      and event_type in ('charge.refunded', 'charge.dispute.created', 'charge.dispute.closed')
    order by event_created desc, received_at desc, stripe_event_id desc
    limit 1;

    v_latest_reversal_status := case
      when v_latest_reversal.event_type = 'charge.refunded' and v_latest_reversal.outcome = 'manual_review' then 'partial_refund_review'
      when v_latest_reversal.event_type = 'charge.refunded' then 'full_refund'
      when v_latest_reversal.event_type = 'charge.dispute.created' then 'dispute_open'
      else 'dispute_closed_review'
    end;
    v_latest_access_status := case
      when v_latest_reversal_status in ('full_refund', 'dispute_open') then 'revoked'
      else 'suspended'
    end;

    update obserra_app_commerce.subscriptions
    set reversal_status = case
          when reversal_status = 'full_refund' then 'full_refund'
          else v_latest_reversal_status
        end,
        access_status = case
          when reversal_status = 'full_refund' or v_latest_reversal_status in ('full_refund', 'dispute_open') then 'revoked'
          else v_latest_access_status
        end,
        last_event_id = case
          when last_event_created <= v_latest_reversal.event_created then v_latest_reversal.stripe_event_id
          else last_event_id
        end,
        last_event_created = greatest(last_event_created, v_latest_reversal.event_created),
        revision = revision + 1,
        updated_at = pg_catalog.now()
    where stripe_subscription_id = p_subscription_id
    returning * into v_subscription;
  end if;

  return pg_catalog.jsonb_build_object(
    'subscriptionId', nullif(p_subscription_id, ''),
    'accessStatus', v_subscription.access_status,
    'reversalStatus', v_subscription.reversal_status,
    'revision', v_subscription.revision,
    'idempotentReplay', false,
    'manualReview', v_outcome = 'manual_review'
  );
end;
$$;

revoke all on function public.obserra_applications_apply_subscription(text, text, text, text, bigint, boolean, text, text, text, text, text, text, text, text, text, text, text, text, bigint, integer, bigint, bigint) from public, anon, authenticated, service_role;
revoke all on function public.obserra_applications_apply_reversal(text, text, text, text, bigint, boolean, text, text) from public, anon, authenticated, service_role;
grant execute on function public.obserra_applications_apply_subscription(text, text, text, text, bigint, boolean, text, text, text, text, text, text, text, text, text, text, text, text, bigint, integer, bigint, bigint) to service_role;
grant execute on function public.obserra_applications_apply_reversal(text, text, text, text, bigint, boolean, text, text) to service_role;
