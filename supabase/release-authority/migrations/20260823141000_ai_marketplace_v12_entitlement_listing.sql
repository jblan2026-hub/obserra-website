-- Subject-and-tenant-scoped customer Hangar projection. This does not expose
-- Stripe customer IDs, sessions, prices, or receipt URLs; those remain behind
-- the billing authority. The application joins product metadata locally from
-- the verified catalog revision after this RPC returns.
create or replace function public.obserra_ai_marketplace_v12_entitlements(
  p_subject_id text,
  p_tenant_id text
) returns jsonb
language sql
security definer
set search_path = pg_catalog, obserra_ai_marketplace
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'productId', product_id,
        'catalogRevision', catalog_revision,
        'artifactSha256', artifact_sha256,
        'purchaseOption', purchase_option,
        'accessStatus', access_status,
        'updatedAt', updated_at
      ) order by updated_at desc, product_id asc
    ),
    '[]'::jsonb
  )
  from obserra_ai_marketplace.v12_artifact_entitlements
  where subject_id = p_subject_id
    and tenant_id = p_tenant_id;
$$;

revoke all on function public.obserra_ai_marketplace_v12_entitlements(text, text) from public, anon, authenticated;
grant execute on function public.obserra_ai_marketplace_v12_entitlements(text, text) to service_role;
