-- Owner-only progress evidence for the single-item binding review workflow.
-- This reads review records only; it cannot publish a binding manifest,
-- update release evidence, create checkout, or issue entitlement.
create or replace function public.obserra_ai_marketplace_v12_binding_review_progress(
  p_catalog_revision text,
  p_product_id text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, obserra_ai_marketplace
as $$
declare
  v_reviewed_offer_bindings bigint;
  v_live_reviewed_offer_bindings bigint;
  v_reviewed_product_cards bigint;
  v_product_evidence jsonb;
begin
  if p_catalog_revision !~ '^[a-f0-9]{64}$'
    or p_product_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$' then
    raise exception 'invalid binding review progress identity';
  end if;

  select count(*), count(*) filter (where stripe_livemode), count(distinct product_id)
    into v_reviewed_offer_bindings, v_live_reviewed_offer_bindings, v_reviewed_product_cards
  from obserra_ai_marketplace.v12_binding_import_reviews
  where catalog_revision = p_catalog_revision;

  select coalesce(jsonb_agg(jsonb_build_object(
    'purchaseOption', purchase_option,
    'artifactSha256', artifact_sha256,
    'stripeProductId', stripe_product_id,
    'stripePriceId', stripe_price_id,
    'stripeLivemode', stripe_livemode,
    'evidenceKey', evidence_key,
    'reviewedAt', reviewed_at
  ) order by purchase_option), '[]'::jsonb)
    into v_product_evidence
  from obserra_ai_marketplace.v12_binding_import_reviews
  where catalog_revision = p_catalog_revision and product_id = p_product_id;

  return jsonb_build_object(
    'catalogRevision', p_catalog_revision,
    'productId', p_product_id,
    'reviewedOfferBindings', v_reviewed_offer_bindings,
    'liveReviewedOfferBindings', v_live_reviewed_offer_bindings,
    'reviewedProductCards', v_reviewed_product_cards,
    'productReviewedOfferBindings', jsonb_array_length(v_product_evidence),
    'productEvidence', v_product_evidence
  );
end
$$;

revoke all on function public.obserra_ai_marketplace_v12_binding_review_progress(text,text) from public, anon, authenticated;
grant execute on function public.obserra_ai_marketplace_v12_binding_review_progress(text,text) to service_role;
