-- Harden Obserra EPI Marketplace lifecycle ordering without changing the RPC signature.
-- This migration is backward-compatible with the currently deployed webhook.

create or replace function public.obserra_ai_marketplace_record_v12_lifecycle(
  p_event_id text,
  p_event_type text,
  p_payload_sha256 text,
  p_livemode boolean,
  p_lifecycle text,
  p_stripe_checkout_session_id text,
  p_stripe_subscription_id text,
  p_stripe_payment_intent_id text
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'obserra_ai_marketplace'
as $function$
declare
  o obserra_ai_marketplace.v12_orders%rowtype;
  next_order_status text;
  next_access_status text;
  attempt_updated boolean := false;
  transition_applied boolean := false;
begin
  if p_event_id !~ '^evt_[A-Za-z0-9]+$'
    or p_payload_sha256 !~ '^[a-f0-9]{64}$'
    or p_livemode is not true
    or p_lifecycle not in (
      'checkout_failed', 'checkout_expired', 'subscription_cancelled',
      'subscription_expired', 'payment_failed', 'payment_recovered',
      'refund', 'dispute', 'chargeback'
    )
  then
    raise exception 'invalid v12 lifecycle';
  end if;

  insert into obserra_ai_marketplace.v12_webhook_events(
    stripe_event_id, event_type, payload_sha256, livemode, outcome,
    stripe_checkout_session_id
  ) values (
    p_event_id, p_event_type, p_payload_sha256, p_livemode, p_lifecycle,
    p_stripe_checkout_session_id
  ) on conflict(stripe_event_id) do nothing;

  if not found then
    return jsonb_build_object('idempotentReplay', true);
  end if;

  if p_lifecycle in ('checkout_failed', 'checkout_expired')
    and p_stripe_checkout_session_id is not null
  then
    update obserra_ai_marketplace.v12_checkout_attempts
       set state = case when p_lifecycle = 'checkout_expired' then 'expired' else 'failed' end,
           updated_at = now()
     where stripe_checkout_session_id = p_stripe_checkout_session_id
       and state in ('reserved', 'checkout_created');
    attempt_updated := found;
  end if;

  select * into o
    from obserra_ai_marketplace.v12_orders
   where (p_stripe_checkout_session_id is not null and stripe_checkout_session_id = p_stripe_checkout_session_id)
      or (p_stripe_subscription_id is not null and stripe_subscription_id = p_stripe_subscription_id)
      or (p_stripe_payment_intent_id is not null and stripe_payment_intent_id = p_stripe_payment_intent_id)
   for update;

  if not found then
    return jsonb_build_object(
      'recorded', true,
      'matched', false,
      'attemptUpdated', attempt_updated
    );
  end if;

  if p_lifecycle in ('checkout_failed', 'checkout_expired') then
    insert into obserra_ai_marketplace.v12_audit_events(
      subject_id, tenant_id, product_id, action, correlation_id, facts
    ) values (
      o.subject_id, o.tenant_id, o.product_id,
      concat('lifecycle_', p_lifecycle), p_event_id,
      jsonb_build_object(
        'checkoutSession', o.stripe_checkout_session_id,
        'currentOrderStatus', o.order_status,
        'transitionApplied', false,
        'attemptUpdated', attempt_updated
      )
    );
    return jsonb_build_object(
      'recorded', true,
      'matched', true,
      'attemptUpdated', attempt_updated,
      'transitionApplied', false
    );
  end if;

  if p_lifecycle = 'payment_recovered' then
    if o.order_status = 'payment_failed'
      or (p_event_type = 'charge.dispute.closed' and o.order_status = 'disputed')
    then
      next_order_status := 'active';
      next_access_status := 'active';
    end if;
  elsif p_lifecycle = 'payment_failed' then
    if o.order_status in ('active', 'payment_failed') then
      next_order_status := 'payment_failed';
      next_access_status := 'suspended';
    end if;
  elsif p_lifecycle = 'dispute' then
    if o.order_status in ('active', 'payment_failed', 'disputed') then
      next_order_status := 'disputed';
      next_access_status := 'suspended';
    end if;
  elsif p_lifecycle = 'refund' then
    if o.order_status <> 'chargeback' then
      next_order_status := 'refunded';
      next_access_status := 'revoked';
    end if;
  elsif p_lifecycle = 'chargeback' then
    next_order_status := 'chargeback';
    next_access_status := 'revoked';
  elsif p_lifecycle = 'subscription_cancelled' then
    if o.order_status not in ('refunded', 'chargeback', 'revoked', 'expired', 'cancelled') then
      next_order_status := 'cancelled';
      next_access_status := 'revoked';
    end if;
  elsif p_lifecycle = 'subscription_expired' then
    if o.order_status not in ('refunded', 'chargeback', 'revoked', 'expired', 'cancelled') then
      next_order_status := 'expired';
      next_access_status := 'expired';
    end if;
  end if;

  if next_order_status is not null then
    update obserra_ai_marketplace.v12_orders
       set order_status = next_order_status,
           updated_at = now()
     where stripe_checkout_session_id = o.stripe_checkout_session_id;

    update obserra_ai_marketplace.v12_artifact_entitlements as e
       set access_status = next_access_status,
           revision = e.revision + 1,
           updated_at = now()
     where e.subject_id = o.subject_id
       and e.tenant_id = o.tenant_id
       and e.product_id = o.product_id
       and e.catalog_revision = o.catalog_revision
       and e.artifact_sha256 = o.artifact_sha256;

    transition_applied := true;
  end if;

  insert into obserra_ai_marketplace.v12_audit_events(
    subject_id, tenant_id, product_id, action, correlation_id, facts
  ) values (
    o.subject_id, o.tenant_id, o.product_id,
    concat('lifecycle_', p_lifecycle), p_event_id,
    jsonb_build_object(
      'checkoutSession', o.stripe_checkout_session_id,
      'previousOrderStatus', o.order_status,
      'orderStatus', coalesce(next_order_status, o.order_status),
      'accessStatus', next_access_status,
      'transitionApplied', transition_applied
    )
  );

  return jsonb_build_object(
    'recorded', true,
    'matched', true,
    'transitionApplied', transition_applied,
    'orderStatus', coalesce(next_order_status, o.order_status)
  );
end
$function$;

revoke all on function public.obserra_ai_marketplace_record_v12_lifecycle(text,text,text,boolean,text,text,text,text) from public, anon, authenticated;
grant execute on function public.obserra_ai_marketplace_record_v12_lifecycle(text,text,text,boolean,text,text,text,text) to service_role;
