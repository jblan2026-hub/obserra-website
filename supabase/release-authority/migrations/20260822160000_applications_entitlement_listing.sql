-- Project: ykmrlcfitsubqajgfnye (Obserra Applications Release Authority)
-- Purpose: Subject-scoped durable entitlement listing for the authenticated license portal.

create or replace function public.obserra_applications_entitlements(p_subject_id text, p_tenant_id text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
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
    'revision', s.revision,
    'authoritative', true,
    'source', 'applications-commerce-ledger'
  ) order by s.updated_at desc), '[]'::jsonb)
  from obserra_app_commerce.subscriptions s
  where s.subject_id = p_subject_id and s.tenant_id = p_tenant_id;
$$;

revoke all on function public.obserra_applications_entitlements(text, text) from public, anon, authenticated, service_role;
grant execute on function public.obserra_applications_entitlements(text, text) to service_role;
