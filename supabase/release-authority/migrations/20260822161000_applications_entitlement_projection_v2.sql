-- Project: ykmrlcfitsubqajgfnye (Obserra Applications Release Authority)
-- Purpose: Stable latest-per-product license projection with immutable start evidence.

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
    'appSlug', v_subscription.app_slug,
    'allowed', v_subscription.access_status = 'active' and v_subscription.stripe_status in ('active', 'trialing') and v_subscription.reversal_status = 'none',
    'status', v_subscription.access_status, 'stripeStatus', v_subscription.stripe_status,
    'subscriptionId', v_subscription.stripe_subscription_id, 'customerId', v_subscription.stripe_customer_id,
    'plan', v_subscription.plan_id, 'deploymentModel', v_subscription.deployment_model,
    'billingInterval', v_subscription.billing_interval, 'seatsPurchased', v_subscription.quantity,
    'currentPeriodEnd', v_subscription.current_period_end, 'startsAt', v_subscription.created_at,
    'revision', v_subscription.revision, 'authoritative', true, 'source', 'applications-commerce-ledger'
  );
end;
$$;

create or replace function public.obserra_applications_entitlements(p_subject_id text, p_tenant_id text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with latest as (
    select distinct on (s.app_slug) s.*
    from obserra_app_commerce.subscriptions s
    where s.subject_id = p_subject_id and s.tenant_id = p_tenant_id
    order by s.app_slug, s.updated_at desc
  )
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'appSlug', s.app_slug,
    'allowed', s.access_status = 'active' and s.stripe_status in ('active', 'trialing') and s.reversal_status = 'none',
    'status', s.access_status,
    'stripeStatus', s.stripe_status,
    'subscriptionId', s.stripe_subscription_id,
    'customerId', s.stripe_customer_id,
    'plan', s.plan_id,
    'deploymentModel', s.deployment_model,
    'billingInterval', s.billing_interval,
    'seatsPurchased', s.quantity,
    'currentPeriodEnd', s.current_period_end,
    'startsAt', s.created_at,
    'revision', s.revision,
    'authoritative', true,
    'source', 'applications-commerce-ledger'
  ) order by s.app_slug), '[]'::jsonb)
  from latest s;
$$;
