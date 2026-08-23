-- Durable v1.2 artifact entitlement: a paid product entitlement is bound to the
-- exact catalog revision and verified artifact hash that may be delivered.
create table if not exists obserra_ai_marketplace.v12_artifact_entitlements(
  subject_id text not null, tenant_id text not null, product_id text not null,
  catalog_revision text not null check(catalog_revision ~ '^[a-f0-9]{64}$'),
  artifact_sha256 text not null check(artifact_sha256 ~ '^[a-f0-9]{64}$'),
  stripe_customer_id text not null, stripe_checkout_session_id text not null unique,
  stripe_price_id text not null, purchase_option text not null,
  access_status text not null check(access_status in ('active','revoked')),
  revision integer not null default 1, updated_at timestamptz not null default now(),
  primary key(subject_id,tenant_id,product_id,catalog_revision,artifact_sha256)
);
alter table obserra_ai_marketplace.v12_artifact_entitlements enable row level security;

create or replace function public.obserra_ai_marketplace_record_v12_payment(p_event_id text,p_event_type text,p_payload_sha256 text,p_livemode boolean,p_stripe_checkout_session_id text,p_stripe_customer_id text,p_subject_id text,p_tenant_id text,p_product_id text,p_purchase_option text,p_stripe_price_id text,p_catalog_revision text,p_artifact_sha256 text) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$declare a obserra_ai_marketplace.checkout_attempts%rowtype;begin select * into a from obserra_ai_marketplace.checkout_attempts where stripe_checkout_session_id=p_stripe_checkout_session_id for update;if not found or a.subject_id<>p_subject_id or a.tenant_id<>p_tenant_id or a.product_id<>p_product_id or a.stripe_customer_id<>p_stripe_customer_id then raise exception 'payment authority mismatch';end if;insert into obserra_ai_marketplace.payment_events values(p_event_id,p_event_type,p_payload_sha256,p_livemode,p_stripe_checkout_session_id) on conflict(stripe_event_id) do nothing;if not found then return jsonb_build_object('idempotentReplay',true);end if;insert into obserra_ai_marketplace.v12_artifact_entitlements(subject_id,tenant_id,product_id,catalog_revision,artifact_sha256,stripe_customer_id,stripe_checkout_session_id,stripe_price_id,purchase_option,access_status) values(p_subject_id,p_tenant_id,p_product_id,p_catalog_revision,p_artifact_sha256,p_stripe_customer_id,p_stripe_checkout_session_id,p_stripe_price_id,p_purchase_option,'active') on conflict(subject_id,tenant_id,product_id,catalog_revision,artifact_sha256) do update set access_status='active',stripe_customer_id=excluded.stripe_customer_id,stripe_checkout_session_id=excluded.stripe_checkout_session_id,stripe_price_id=excluded.stripe_price_id,purchase_option=excluded.purchase_option,revision=obserra_ai_marketplace.v12_artifact_entitlements.revision+1,updated_at=now();return jsonb_build_object('recorded',true);end$$;

create or replace function public.obserra_ai_marketplace_v12_delivery_entitlement(p_subject_id text,p_tenant_id text,p_product_id text,p_catalog_revision text,p_artifact_sha256 text) returns jsonb language sql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$select jsonb_build_object('allowed',exists(select 1 from obserra_ai_marketplace.v12_artifact_entitlements where subject_id=p_subject_id and tenant_id=p_tenant_id and product_id=p_product_id and catalog_revision=p_catalog_revision and artifact_sha256=p_artifact_sha256 and access_status='active'))$$;
revoke all on obserra_ai_marketplace.v12_artifact_entitlements from public,anon,authenticated;
revoke all on function public.obserra_ai_marketplace_record_v12_payment(text,text,text,boolean,text,text,text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.obserra_ai_marketplace_record_v12_payment(text,text,text,boolean,text,text,text,text,text,text,text,text,text) to service_role;
revoke all on function public.obserra_ai_marketplace_v12_delivery_entitlement(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.obserra_ai_marketplace_v12_delivery_entitlement(text,text,text,text,text) to service_role;
