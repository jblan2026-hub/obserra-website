-- A single-item Stripe import review is evidence only. It cannot publish a
-- binding manifest, issue an entitlement, enable checkout, or alter delivery.
create table if not exists obserra_ai_marketplace.v12_binding_import_reviews (
  catalog_revision text not null,
  product_id text not null,
  purchase_option text not null,
  artifact_sha256 text not null check (artifact_sha256 ~ '^[a-f0-9]{64}$'),
  stripe_product_id text not null check (stripe_product_id ~ '^prod_[A-Za-z0-9]+$'),
  stripe_price_id text not null check (stripe_price_id ~ '^price_[A-Za-z0-9]+$'),
  stripe_livemode boolean not null,
  owner_principal_id text not null,
  correlation_id text not null,
  evidence_key text not null check (evidence_key ~ '^[a-f0-9]{64}$'),
  reviewed_at timestamptz not null default now(),
  primary key (catalog_revision, product_id, purchase_option)
);

alter table obserra_ai_marketplace.v12_binding_import_reviews enable row level security;

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

revoke all on obserra_ai_marketplace.v12_binding_import_reviews from public, anon, authenticated;
revoke all on function public.obserra_ai_marketplace_record_v12_binding_review(text,text,text,text,text,text,text,text,boolean,text) from public, anon, authenticated;
grant execute on function public.obserra_ai_marketplace_record_v12_binding_review(text,text,text,text,text,text,text,text,boolean,text) to service_role;
