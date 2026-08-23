-- Compact runtime authority for the catalog-wide Stripe review. The full
-- binding set remains in durable rows and is never copied into Key Vault or a
-- serverless environment variable.
create extension if not exists pgcrypto with schema extensions;

create table if not exists obserra_ai_marketplace.v12_binding_authority_receipts (
  catalog_revision text primary key check (catalog_revision ~ '^[a-f0-9]{64}$'),
  binding_set_sha256 text not null check (binding_set_sha256 ~ '^[a-f0-9]{64}$'),
  required_product_cards integer not null check (required_product_cards > 0),
  required_offer_bindings integer not null check (required_offer_bindings > 0),
  reviewed_product_cards integer not null check (reviewed_product_cards = required_product_cards),
  live_reviewed_offer_bindings integer not null check (live_reviewed_offer_bindings = required_offer_bindings),
  verified_at timestamptz not null,
  recorded_at timestamptz not null default now()
);

alter table obserra_ai_marketplace.v12_binding_authority_receipts enable row level security;

-- Every review-table mutation invalidates the compact receipt in the same
-- transaction, including a service-role maintenance write that does not use
-- the public review RPC. Runtime can never mix a signed receipt with changed
-- per-product authority rows.
create or replace function obserra_ai_marketplace.invalidate_v12_binding_authority_receipt()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, obserra_ai_marketplace
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('obserra-ai-marketplace-v12-binding-authority'));
  if tg_op = 'DELETE' then
    delete from obserra_ai_marketplace.v12_binding_authority_receipts
    where catalog_revision = old.catalog_revision;
    return old;
  end if;
  delete from obserra_ai_marketplace.v12_binding_authority_receipts
  where catalog_revision = new.catalog_revision
    or (tg_op = 'UPDATE' and catalog_revision = old.catalog_revision);
  return new;
end
$$;

drop trigger if exists invalidate_v12_binding_authority_receipt on obserra_ai_marketplace.v12_binding_import_reviews;
create trigger invalidate_v12_binding_authority_receipt
before insert or update or delete on obserra_ai_marketplace.v12_binding_import_reviews
for each row execute function obserra_ai_marketplace.invalidate_v12_binding_authority_receipt();

create or replace function public.obserra_ai_marketplace_record_v12_binding_review(
  p_principal_id text,
  p_correlation_id text,
  p_product_id text,
  p_purchase_option text,
  p_catalog_revision text,
  p_artifact_sha256 text,
  p_stripe_product_id text,
  p_stripe_price_id text,
  p_stripe_livemode boolean,
  p_evidence_key text
) returns jsonb language plpgsql security definer set search_path = pg_catalog, obserra_ai_marketplace as $$
begin
  if p_principal_id = '' or p_correlation_id = '' or p_product_id = ''
    or p_purchase_option not in ('recurring:month','recurring:year','one_time:once','team_license:once','activation:once')
    or p_catalog_revision !~ '^[a-f0-9]{64}$' or p_artifact_sha256 !~ '^[a-f0-9]{64}$'
    or p_stripe_product_id !~ '^prod_[A-Za-z0-9]+$' or p_stripe_price_id !~ '^price_[A-Za-z0-9]+$'
    or p_evidence_key !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid binding import review';
  end if;
  insert into obserra_ai_marketplace.v12_binding_import_reviews(
    catalog_revision, product_id, purchase_option, artifact_sha256,
    stripe_product_id, stripe_price_id, stripe_livemode, owner_principal_id,
    correlation_id, evidence_key
  ) values (
    p_catalog_revision, p_product_id, p_purchase_option, p_artifact_sha256,
    p_stripe_product_id, p_stripe_price_id, p_stripe_livemode, p_principal_id,
    p_correlation_id, p_evidence_key
  ) on conflict (catalog_revision, product_id, purchase_option) do update set
    artifact_sha256 = excluded.artifact_sha256,
    stripe_product_id = excluded.stripe_product_id,
    stripe_price_id = excluded.stripe_price_id,
    stripe_livemode = excluded.stripe_livemode,
    owner_principal_id = excluded.owner_principal_id,
    correlation_id = excluded.correlation_id,
    evidence_key = excluded.evidence_key,
    reviewed_at = now();
  return jsonb_build_object('reviewed', true);
end $$;

-- Release verification reads a bounded, stable ordering of the durable review
-- rows. A later row change cannot race activation: finalization takes the same
-- advisory lock and recomputes the digest across the authoritative table.
create or replace function public.obserra_ai_marketplace_v12_binding_review_page(
  p_catalog_revision text,
  p_after_product_id text default '',
  p_after_purchase_option text default '',
  p_limit integer default 500
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, obserra_ai_marketplace
as $$
declare
  v_reviews jsonb;
  v_next_product_id text;
  v_next_purchase_option text;
begin
  if p_catalog_revision !~ '^[a-f0-9]{64}$'
    or (p_after_product_id <> '' and p_after_product_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$')
    or (p_after_purchase_option <> '' and p_after_purchase_option not in ('recurring:month','recurring:year','one_time:once','team_license:once','activation:once'))
    or ((p_after_product_id = '') <> (p_after_purchase_option = ''))
    or p_limit < 1 or p_limit > 1000 then
    raise exception 'invalid binding review page request';
  end if;

  with page as (
    select product_id, purchase_option, artifact_sha256, stripe_product_id,
      stripe_price_id, stripe_livemode, reviewed_at
    from obserra_ai_marketplace.v12_binding_import_reviews
    where catalog_revision = p_catalog_revision
      and (p_after_product_id = '' or (product_id, purchase_option) > (p_after_product_id, p_after_purchase_option))
    order by product_id, purchase_option
    limit p_limit
  ), page_json as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'productId', product_id,
      'purchaseOption', purchase_option,
      'artifactSha256', artifact_sha256,
      'stripeProductId', stripe_product_id,
      'stripePriceId', stripe_price_id,
      'stripeLivemode', stripe_livemode,
      'reviewedAt', reviewed_at
    ) order by product_id, purchase_option), '[]'::jsonb) as reviews
    from page
  ), last_row as (
    select product_id, purchase_option
    from page
    order by product_id desc, purchase_option desc
    limit 1
  )
  select page_json.reviews, last_row.product_id, last_row.purchase_option
  into v_reviews, v_next_product_id, v_next_purchase_option
  from page_json left join last_row on true;

  return jsonb_build_object(
    'revision', p_catalog_revision,
    'reviews', v_reviews,
    'nextProductId', v_next_product_id,
    'nextPurchaseOption', v_next_purchase_option
  );
end
$$;

-- The governed verifier supplies catalog expectations and its independently
-- computed binding-set digest. PostgreSQL recomputes the same ordered digest
-- from durable rows before publishing the compact receipt.
create or replace function public.obserra_ai_marketplace_finalize_v12_binding_authority(
  p_catalog_revision text,
  p_required_product_cards integer,
  p_required_offer_bindings integer,
  p_binding_set_sha256 text,
  p_verified_at timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, obserra_ai_marketplace, extensions
as $$
declare
  v_offer_bindings bigint;
  v_live_offer_bindings bigint;
  v_product_cards bigint;
  v_binding_set_sha256 text;
  v_latest_reviewed_at timestamptz;
begin
  if p_catalog_revision !~ '^[a-f0-9]{64}$'
    or p_binding_set_sha256 !~ '^[a-f0-9]{64}$'
    or p_required_product_cards <= 0 or p_required_offer_bindings <= 0
    or p_verified_at > now() + interval '5 minutes' then
    raise exception 'invalid binding authority receipt';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('obserra-ai-marketplace-v12-binding-authority'));
  select
    count(*),
    count(*) filter (where stripe_livemode),
    count(distinct product_id),
    max(reviewed_at),
    encode(extensions.digest(convert_to(coalesce(string_agg(
      product_id || E'\t' || purchase_option || E'\t' || artifact_sha256 || E'\t'
      || stripe_product_id || E'\t' || stripe_price_id || E'\t' || stripe_livemode::text,
      E'\n' order by product_id, purchase_option
    ) || E'\n', ''), 'UTF8'), 'sha256'), 'hex')
  into v_offer_bindings, v_live_offer_bindings, v_product_cards, v_latest_reviewed_at, v_binding_set_sha256
  from obserra_ai_marketplace.v12_binding_import_reviews
  where catalog_revision = p_catalog_revision;

  if v_product_cards <> p_required_product_cards
    or v_offer_bindings <> p_required_offer_bindings
    or v_live_offer_bindings <> p_required_offer_bindings
    or v_latest_reviewed_at > p_verified_at
    or v_binding_set_sha256 <> p_binding_set_sha256 then
    raise exception 'binding authority evidence mismatch';
  end if;

  insert into obserra_ai_marketplace.v12_binding_authority_receipts(
    catalog_revision, binding_set_sha256, required_product_cards,
    required_offer_bindings, reviewed_product_cards,
    live_reviewed_offer_bindings, verified_at
  ) values (
    p_catalog_revision, p_binding_set_sha256, p_required_product_cards,
    p_required_offer_bindings, v_product_cards, v_live_offer_bindings,
    p_verified_at
  ) on conflict (catalog_revision) do update set
    binding_set_sha256 = excluded.binding_set_sha256,
    required_product_cards = excluded.required_product_cards,
    required_offer_bindings = excluded.required_offer_bindings,
    reviewed_product_cards = excluded.reviewed_product_cards,
    live_reviewed_offer_bindings = excluded.live_reviewed_offer_bindings,
    verified_at = excluded.verified_at,
    recorded_at = now();

  return jsonb_build_object(
    'contract', 'obserra-marketplace-v12-runtime-binding-receipt-v1',
    'revision', p_catalog_revision,
    'requiredProducts', p_required_product_cards,
    'requiredOfferBindings', p_required_offer_bindings,
    'reviewedProductCards', v_product_cards,
    'liveReviewedOfferBindings', v_live_offer_bindings,
    'bindingSetSha256', p_binding_set_sha256,
    'verifiedAt', to_char(p_verified_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );
end
$$;

create or replace function public.obserra_ai_marketplace_v12_binding_authority_receipt(
  p_catalog_revision text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, obserra_ai_marketplace
as $$
declare
  v_receipt obserra_ai_marketplace.v12_binding_authority_receipts%rowtype;
begin
  if p_catalog_revision !~ '^[a-f0-9]{64}$' then raise exception 'invalid binding authority identity'; end if;
  perform pg_catalog.pg_advisory_xact_lock_shared(pg_catalog.hashtext('obserra-ai-marketplace-v12-binding-authority'));
  select * into v_receipt from obserra_ai_marketplace.v12_binding_authority_receipts where catalog_revision = p_catalog_revision;
  if not found then return null; end if;
  return jsonb_build_object(
    'contract', 'obserra-marketplace-v12-runtime-binding-receipt-v1',
    'revision', v_receipt.catalog_revision,
    'requiredProducts', v_receipt.required_product_cards,
    'requiredOfferBindings', v_receipt.required_offer_bindings,
    'reviewedProductCards', v_receipt.reviewed_product_cards,
    'liveReviewedOfferBindings', v_receipt.live_reviewed_offer_bindings,
    'bindingSetSha256', v_receipt.binding_set_sha256,
    'verifiedAt', to_char(v_receipt.verified_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );
end
$$;

create or replace function public.obserra_ai_marketplace_v12_product_binding_authority(
  p_catalog_revision text,
  p_product_id text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, obserra_ai_marketplace
as $$
declare
  v_receipt obserra_ai_marketplace.v12_binding_authority_receipts%rowtype;
  v_bindings jsonb;
begin
  if p_catalog_revision !~ '^[a-f0-9]{64}$'
    or p_product_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$' then
    raise exception 'invalid product binding authority identity';
  end if;
  perform pg_catalog.pg_advisory_xact_lock_shared(pg_catalog.hashtext('obserra-ai-marketplace-v12-binding-authority'));
  select * into v_receipt from obserra_ai_marketplace.v12_binding_authority_receipts where catalog_revision = p_catalog_revision;
  if not found then return null; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'purchaseOption', purchase_option,
    'artifactSha256', artifact_sha256,
    'stripeProductId', stripe_product_id,
    'stripePriceId', stripe_price_id,
    'stripeLivemode', stripe_livemode,
    'evidenceKey', evidence_key,
    'reviewedAt', reviewed_at
  ) order by purchase_option), '[]'::jsonb)
  into v_bindings
  from obserra_ai_marketplace.v12_binding_import_reviews
  where catalog_revision = p_catalog_revision and product_id = p_product_id;
  return jsonb_build_object(
    'revision', v_receipt.catalog_revision,
    'bindingSetSha256', v_receipt.binding_set_sha256,
    'verifiedAt', to_char(v_receipt.verified_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'productId', p_product_id,
    'bindings', v_bindings
  );
end
$$;

revoke all on obserra_ai_marketplace.v12_binding_authority_receipts from public, anon, authenticated;
revoke all on function obserra_ai_marketplace.invalidate_v12_binding_authority_receipt() from public, anon, authenticated;
revoke all on function public.obserra_ai_marketplace_record_v12_binding_review(text,text,text,text,text,text,text,text,boolean,text) from public, anon, authenticated;
revoke all on function public.obserra_ai_marketplace_v12_binding_review_page(text,text,text,integer) from public, anon, authenticated;
revoke all on function public.obserra_ai_marketplace_finalize_v12_binding_authority(text,integer,integer,text,timestamptz) from public, anon, authenticated;
revoke all on function public.obserra_ai_marketplace_v12_binding_authority_receipt(text) from public, anon, authenticated;
revoke all on function public.obserra_ai_marketplace_v12_product_binding_authority(text,text) from public, anon, authenticated;
grant execute on function public.obserra_ai_marketplace_v12_binding_review_page(text,text,text,integer) to service_role;
grant execute on function public.obserra_ai_marketplace_record_v12_binding_review(text,text,text,text,text,text,text,text,boolean,text) to service_role;
grant execute on function public.obserra_ai_marketplace_finalize_v12_binding_authority(text,integer,integer,text,timestamptz) to service_role;
grant execute on function public.obserra_ai_marketplace_v12_binding_authority_receipt(text) to service_role;
grant execute on function public.obserra_ai_marketplace_v12_product_binding_authority(text,text) to service_role;
