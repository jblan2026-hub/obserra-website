-- v1.2 commerce authority. These records are intentionally separate from the
-- legacy catalog so a price, webhook, entitlement, release, download, and
-- install-grant decision remain bound to the immutable v1.2 release identity.
create table if not exists obserra_ai_marketplace.v12_checkout_attempts (
  attempt_id uuid primary key,
  request_key text not null unique,
  subject_id text not null,
  tenant_id text not null,
  product_id text not null,
  purchase_option text not null check (purchase_option in ('recurring:month','recurring:year','one_time:once','team_license:once','activation:once')),
  catalog_revision text not null check (catalog_revision ~ '^[a-f0-9]{64}$'),
  artifact_sha256 text not null check (artifact_sha256 ~ '^[a-f0-9]{64}$'),
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  state text not null default 'reserved' check (state in ('reserved','checkout_created','paid','failed','expired')),
  issued_at bigint not null,
  expires_at bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > issued_at)
);

create table if not exists obserra_ai_marketplace.v12_orders (
  stripe_checkout_session_id text primary key,
  attempt_id uuid not null unique references obserra_ai_marketplace.v12_checkout_attempts(attempt_id),
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  stripe_payment_intent_id text unique,
  subject_id text not null,
  tenant_id text not null,
  product_id text not null,
  purchase_option text not null,
  catalog_revision text not null check (catalog_revision ~ '^[a-f0-9]{64}$'),
  artifact_sha256 text not null check (artifact_sha256 ~ '^[a-f0-9]{64}$'),
  stripe_price_id text,
  livemode boolean not null,
  order_status text not null default 'pending' check (order_status in ('pending','active','payment_failed','cancelled','expired','refunded','disputed','chargeback','revoked')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists obserra_ai_marketplace.v12_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  livemode boolean not null,
  outcome text not null,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now()
);

create table if not exists obserra_ai_marketplace.v12_audit_events (
  event_id uuid primary key default gen_random_uuid(),
  subject_id text,
  tenant_id text,
  product_id text,
  action text not null,
  correlation_id text not null,
  facts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists obserra_ai_marketplace.v12_download_events (
  download_id uuid primary key default gen_random_uuid(),
  subject_id text not null,
  tenant_id text not null,
  product_id text not null,
  catalog_revision text not null check (catalog_revision ~ '^[a-f0-9]{64}$'),
  artifact_sha256 text not null check (artifact_sha256 ~ '^[a-f0-9]{64}$'),
  correlation_id uuid not null,
  outcome text not null check (outcome in ('authorized','denied')),
  created_at timestamptz not null default now()
);

create table if not exists obserra_ai_marketplace.v12_bridge_enrollments (
  bridge_id text primary key check (bridge_id ~ '^bridge_[A-Za-z0-9_-]{16,128}$'),
  platform text not null check (platform ~ '^[a-z][a-z0-9_-]{1,31}$'),
  public_key_pem text not null check (length(public_key_pem) between 64 and 8192),
  enrollment_status text not null default 'active' check (enrollment_status in ('active','revoked')),
  enrolled_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists obserra_ai_marketplace.v12_install_grants (
  grant_id uuid primary key,
  subject_id text not null,
  tenant_id text not null,
  product_id text not null,
  catalog_revision text not null check (catalog_revision ~ '^[a-f0-9]{64}$'),
  artifact_sha256 text not null check (artifact_sha256 ~ '^[a-f0-9]{64}$'),
  bridge_id text not null references obserra_ai_marketplace.v12_bridge_enrollments(bridge_id),
  platform text not null,
  install_profile text not null check (install_profile in ('skill-upload','codex-plugin','desktop-installer-bundle','collection')),
  correlation_id uuid not null,
  expires_at bigint not null,
  consumed_at timestamptz,
  receipt_correlation_id uuid,
  created_at timestamptz not null default now()
);

alter table obserra_ai_marketplace.v12_artifact_entitlements drop constraint if exists v12_artifact_entitlements_access_status_check;
alter table obserra_ai_marketplace.v12_artifact_entitlements add constraint v12_artifact_entitlements_access_status_check check (access_status in ('active','suspended','revoked','expired')) not valid;
alter table obserra_ai_marketplace.v12_artifact_entitlements validate constraint v12_artifact_entitlements_access_status_check;

alter table obserra_ai_marketplace.v12_checkout_attempts enable row level security;
alter table obserra_ai_marketplace.v12_orders enable row level security;
alter table obserra_ai_marketplace.v12_webhook_events enable row level security;
alter table obserra_ai_marketplace.v12_audit_events enable row level security;
alter table obserra_ai_marketplace.v12_download_events enable row level security;
alter table obserra_ai_marketplace.v12_bridge_enrollments enable row level security;
alter table obserra_ai_marketplace.v12_install_grants enable row level security;

create or replace function public.obserra_ai_marketplace_reserve_v12_checkout(
  p_attempt_id uuid,p_request_key text,p_subject_id text,p_tenant_id text,p_product_id text,p_purchase_option text,p_catalog_revision text,p_artifact_sha256 text,p_issued_at bigint,p_expires_at bigint
) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare a obserra_ai_marketplace.v12_checkout_attempts%rowtype; c text;
begin
  if p_request_key !~ '^[a-f0-9]{64}$' or p_subject_id = '' or p_tenant_id = '' or p_product_id = '' or p_purchase_option not in ('recurring:month','recurring:year','one_time:once','team_license:once','activation:once') or p_catalog_revision !~ '^[a-f0-9]{64}$' or p_artifact_sha256 !~ '^[a-f0-9]{64}$' or p_expires_at <= p_issued_at then raise exception 'invalid v12 checkout reservation'; end if;
  select * into a from obserra_ai_marketplace.v12_checkout_attempts where request_key=p_request_key and expires_at >= extract(epoch from now())::bigint for update;
  if found then
    if a.subject_id <> p_subject_id or a.tenant_id <> p_tenant_id or a.product_id <> p_product_id or a.purchase_option <> p_purchase_option or a.catalog_revision <> p_catalog_revision or a.artifact_sha256 <> p_artifact_sha256 then raise exception 'v12 checkout reservation mismatch'; end if;
    return jsonb_build_object('attemptId',a.attempt_id::text,'stripeCustomerId',a.stripe_customer_id,'stripeSessionId',a.stripe_checkout_session_id,'expiresAt',a.expires_at);
  end if;
  select stripe_customer_id into c from obserra_ai_marketplace.customers where subject_id=p_subject_id and tenant_id=p_tenant_id;
  insert into obserra_ai_marketplace.v12_checkout_attempts(attempt_id,request_key,subject_id,tenant_id,product_id,purchase_option,catalog_revision,artifact_sha256,stripe_customer_id,issued_at,expires_at) values(p_attempt_id,p_request_key,p_subject_id,p_tenant_id,p_product_id,p_purchase_option,p_catalog_revision,p_artifact_sha256,c,p_issued_at,p_expires_at) returning * into a;
  return jsonb_build_object('attemptId',a.attempt_id::text,'stripeCustomerId',a.stripe_customer_id,'stripeSessionId',null,'expiresAt',a.expires_at);
end $$;

create or replace function public.obserra_ai_marketplace_record_v12_checkout(
  p_attempt_id uuid,p_stripe_customer_id text,p_stripe_checkout_session_id text,p_stripe_subscription_id text,p_stripe_payment_intent_id text
) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare a obserra_ai_marketplace.v12_checkout_attempts%rowtype;
begin
  select * into a from obserra_ai_marketplace.v12_checkout_attempts where attempt_id=p_attempt_id for update;
  if not found or a.expires_at < extract(epoch from now())::bigint then raise exception 'v12 checkout unavailable'; end if;
  if p_stripe_customer_id !~ '^cus_[A-Za-z0-9]+$' or p_stripe_checkout_session_id !~ '^cs_(live|test)_[A-Za-z0-9_]+$' or (p_stripe_subscription_id is not null and p_stripe_subscription_id !~ '^sub_[A-Za-z0-9]+$') or (p_stripe_payment_intent_id is not null and p_stripe_payment_intent_id !~ '^pi_[A-Za-z0-9]+$') or not exists(select 1 from obserra_ai_marketplace.customers where subject_id=a.subject_id and tenant_id=a.tenant_id and stripe_customer_id=p_stripe_customer_id) then raise exception 'v12 checkout customer authority mismatch'; end if;
  if a.stripe_checkout_session_id is not null then
    if a.stripe_checkout_session_id <> p_stripe_checkout_session_id or a.stripe_customer_id <> p_stripe_customer_id then raise exception 'v12 checkout replay mismatch'; end if;
    return jsonb_build_object('attemptId',a.attempt_id::text,'replayed',true);
  end if;
  update obserra_ai_marketplace.v12_checkout_attempts set stripe_customer_id=p_stripe_customer_id,stripe_checkout_session_id=p_stripe_checkout_session_id,stripe_subscription_id=p_stripe_subscription_id,stripe_payment_intent_id=p_stripe_payment_intent_id,state='checkout_created',updated_at=now() where attempt_id=p_attempt_id;
  insert into obserra_ai_marketplace.v12_orders(stripe_checkout_session_id,attempt_id,stripe_customer_id,stripe_subscription_id,stripe_payment_intent_id,subject_id,tenant_id,product_id,purchase_option,catalog_revision,artifact_sha256,livemode) values(p_stripe_checkout_session_id,p_attempt_id,p_stripe_customer_id,p_stripe_subscription_id,p_stripe_payment_intent_id,a.subject_id,a.tenant_id,a.product_id,a.purchase_option,a.catalog_revision,a.artifact_sha256,false);
  insert into obserra_ai_marketplace.v12_audit_events(subject_id,tenant_id,product_id,action,correlation_id,facts) values(a.subject_id,a.tenant_id,a.product_id,'checkout_created',p_attempt_id::text,jsonb_build_object('session',p_stripe_checkout_session_id));
  return jsonb_build_object('attemptId',p_attempt_id::text,'recorded',true);
end $$;

create or replace function public.obserra_ai_marketplace_record_v12_paid_checkout(
  p_event_id text,p_event_type text,p_payload_sha256 text,p_livemode boolean,p_attempt_id uuid,p_stripe_checkout_session_id text,p_stripe_customer_id text,p_subject_id text,p_tenant_id text,p_product_id text,p_purchase_option text,p_stripe_price_id text,p_catalog_revision text,p_artifact_sha256 text,p_stripe_subscription_id text,p_stripe_payment_intent_id text
) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare a obserra_ai_marketplace.v12_checkout_attempts%rowtype; o obserra_ai_marketplace.v12_orders%rowtype;
begin
  if p_event_id !~ '^evt_[A-Za-z0-9]+$' or p_payload_sha256 !~ '^[a-f0-9]{64}$' or p_stripe_price_id !~ '^price_[A-Za-z0-9]+$' or p_livemode is not true then raise exception 'invalid v12 paid checkout'; end if;
  select * into a from obserra_ai_marketplace.v12_checkout_attempts where attempt_id=p_attempt_id for update;
  if not found or a.stripe_checkout_session_id <> p_stripe_checkout_session_id or a.stripe_customer_id <> p_stripe_customer_id or a.subject_id <> p_subject_id or a.tenant_id <> p_tenant_id or a.product_id <> p_product_id or a.purchase_option <> p_purchase_option or a.catalog_revision <> p_catalog_revision or a.artifact_sha256 <> p_artifact_sha256 then raise exception 'v12 paid checkout authority mismatch'; end if;
  insert into obserra_ai_marketplace.v12_webhook_events(stripe_event_id,event_type,payload_sha256,livemode,outcome,stripe_checkout_session_id) values(p_event_id,p_event_type,p_payload_sha256,p_livemode,'paid',p_stripe_checkout_session_id) on conflict(stripe_event_id) do nothing;
  if not found then return jsonb_build_object('idempotentReplay',true); end if;
  select * into o from obserra_ai_marketplace.v12_orders where stripe_checkout_session_id=p_stripe_checkout_session_id for update;
  if not found or o.attempt_id <> p_attempt_id or o.subject_id <> p_subject_id or o.tenant_id <> p_tenant_id or o.product_id <> p_product_id or o.purchase_option <> p_purchase_option or o.catalog_revision <> p_catalog_revision or o.artifact_sha256 <> p_artifact_sha256 then raise exception 'v12 order authority mismatch'; end if;
  update obserra_ai_marketplace.v12_orders set stripe_subscription_id=coalesce(p_stripe_subscription_id,stripe_subscription_id),stripe_payment_intent_id=coalesce(p_stripe_payment_intent_id,stripe_payment_intent_id),stripe_price_id=p_stripe_price_id,livemode=p_livemode,order_status='active',paid_at=coalesce(paid_at,now()),updated_at=now() where stripe_checkout_session_id=p_stripe_checkout_session_id;
  update obserra_ai_marketplace.v12_checkout_attempts set state='paid',updated_at=now() where attempt_id=p_attempt_id;
  insert into obserra_ai_marketplace.v12_artifact_entitlements(subject_id,tenant_id,product_id,catalog_revision,artifact_sha256,stripe_customer_id,stripe_checkout_session_id,stripe_price_id,purchase_option,access_status) values(p_subject_id,p_tenant_id,p_product_id,p_catalog_revision,p_artifact_sha256,p_stripe_customer_id,p_stripe_checkout_session_id,p_stripe_price_id,p_purchase_option,'active') on conflict(subject_id,tenant_id,product_id,catalog_revision,artifact_sha256) do update set access_status='active',stripe_customer_id=excluded.stripe_customer_id,stripe_checkout_session_id=excluded.stripe_checkout_session_id,stripe_price_id=excluded.stripe_price_id,purchase_option=excluded.purchase_option,revision=obserra_ai_marketplace.v12_artifact_entitlements.revision+1,updated_at=now();
  insert into obserra_ai_marketplace.v12_audit_events(subject_id,tenant_id,product_id,action,correlation_id,facts) values(p_subject_id,p_tenant_id,p_product_id,'entitlement_activated',p_event_id,jsonb_build_object('checkoutSession',p_stripe_checkout_session_id,'catalogRevision',p_catalog_revision,'artifactSha256',p_artifact_sha256));
  return jsonb_build_object('recorded',true);
end $$;

create or replace function public.obserra_ai_marketplace_record_v12_lifecycle(
  p_event_id text,p_event_type text,p_payload_sha256 text,p_livemode boolean,p_lifecycle text,p_stripe_checkout_session_id text,p_stripe_subscription_id text,p_stripe_payment_intent_id text
) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare o obserra_ai_marketplace.v12_orders%rowtype; target_status text; access_status text;
begin
  if p_event_id !~ '^evt_[A-Za-z0-9]+$' or p_payload_sha256 !~ '^[a-f0-9]{64}$' or p_livemode is not true or p_lifecycle not in ('checkout_failed','checkout_expired','subscription_cancelled','subscription_expired','payment_failed','payment_recovered','refund','dispute','chargeback') then raise exception 'invalid v12 lifecycle'; end if;
  insert into obserra_ai_marketplace.v12_webhook_events(stripe_event_id,event_type,payload_sha256,livemode,outcome,stripe_checkout_session_id) values(p_event_id,p_event_type,p_payload_sha256,p_livemode,p_lifecycle,p_stripe_checkout_session_id) on conflict(stripe_event_id) do nothing;
  if not found then return jsonb_build_object('idempotentReplay',true); end if;
  select * into o from obserra_ai_marketplace.v12_orders where (p_stripe_checkout_session_id is not null and stripe_checkout_session_id=p_stripe_checkout_session_id) or (p_stripe_subscription_id is not null and stripe_subscription_id=p_stripe_subscription_id) or (p_stripe_payment_intent_id is not null and stripe_payment_intent_id=p_stripe_payment_intent_id) for update;
  if not found then return jsonb_build_object('recorded',true,'matched',false); end if;
  target_status := case p_lifecycle when 'checkout_failed' then 'payment_failed' when 'checkout_expired' then 'expired' when 'subscription_cancelled' then 'cancelled' when 'subscription_expired' then 'expired' when 'payment_failed' then 'payment_failed' when 'payment_recovered' then 'active' when 'refund' then 'refunded' when 'dispute' then 'disputed' when 'chargeback' then 'chargeback' end;
  access_status := case p_lifecycle when 'payment_recovered' then 'active' when 'payment_failed' then 'suspended' when 'subscription_cancelled' then 'revoked' when 'subscription_expired' then 'expired' when 'refund' then 'revoked' when 'dispute' then 'suspended' when 'chargeback' then 'revoked' else 'revoked' end;
  update obserra_ai_marketplace.v12_orders set order_status=target_status,updated_at=now() where stripe_checkout_session_id=o.stripe_checkout_session_id;
  if p_lifecycle in ('checkout_failed','checkout_expired') then update obserra_ai_marketplace.v12_checkout_attempts set state=case when p_lifecycle='checkout_expired' then 'expired' else 'failed' end,updated_at=now() where attempt_id=o.attempt_id; else update obserra_ai_marketplace.v12_artifact_entitlements set access_status=access_status,revision=revision+1,updated_at=now() where subject_id=o.subject_id and tenant_id=o.tenant_id and product_id=o.product_id and catalog_revision=o.catalog_revision and artifact_sha256=o.artifact_sha256; end if;
  insert into obserra_ai_marketplace.v12_audit_events(subject_id,tenant_id,product_id,action,correlation_id,facts) values(o.subject_id,o.tenant_id,o.product_id,concat('lifecycle_',p_lifecycle),p_event_id,jsonb_build_object('checkoutSession',o.stripe_checkout_session_id,'orderStatus',target_status,'accessStatus',access_status));
  return jsonb_build_object('recorded',true,'matched',true);
end $$;

create or replace function public.obserra_ai_marketplace_record_v12_download(
  p_subject_id text,p_tenant_id text,p_product_id text,p_catalog_revision text,p_artifact_sha256 text,p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare allowed boolean;
begin
  select exists(select 1 from obserra_ai_marketplace.v12_artifact_entitlements where subject_id=p_subject_id and tenant_id=p_tenant_id and product_id=p_product_id and catalog_revision=p_catalog_revision and artifact_sha256=p_artifact_sha256 and access_status='active') into allowed;
  insert into obserra_ai_marketplace.v12_download_events(subject_id,tenant_id,product_id,catalog_revision,artifact_sha256,correlation_id,outcome) values(p_subject_id,p_tenant_id,p_product_id,p_catalog_revision,p_artifact_sha256,p_correlation_id,case when allowed then 'authorized' else 'denied' end);
  insert into obserra_ai_marketplace.v12_audit_events(subject_id,tenant_id,product_id,action,correlation_id,facts) values(p_subject_id,p_tenant_id,p_product_id,case when allowed then 'download_authorized' else 'download_denied' end,p_correlation_id::text,jsonb_build_object('catalogRevision',p_catalog_revision,'artifactSha256',p_artifact_sha256));
  return jsonb_build_object('allowed',allowed);
end $$;

create or replace function public.obserra_ai_marketplace_v12_bridge_enrollment(p_bridge_id text) returns jsonb language sql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
  select coalesce((select jsonb_build_object('bridgeId',bridge_id,'publicKeyPem',public_key_pem,'platform',platform) from obserra_ai_marketplace.v12_bridge_enrollments where bridge_id=p_bridge_id and enrollment_status='active'),'null'::jsonb)
$$;

create or replace function public.obserra_ai_marketplace_create_v12_install_grant(
  p_grant_id uuid,p_subject_id text,p_tenant_id text,p_product_id text,p_catalog_revision text,p_artifact_sha256 text,p_bridge_id text,p_platform text,p_install_profile text,p_correlation_id uuid,p_expires_at bigint
) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare enrolled boolean; allowed boolean;
begin
  if p_expires_at <= extract(epoch from now())::bigint or p_expires_at > extract(epoch from now())::bigint+600 then raise exception 'invalid install grant expiry'; end if;
  select exists(select 1 from obserra_ai_marketplace.v12_bridge_enrollments where bridge_id=p_bridge_id and platform=p_platform and enrollment_status='active') into enrolled;
  select exists(select 1 from obserra_ai_marketplace.v12_artifact_entitlements where subject_id=p_subject_id and tenant_id=p_tenant_id and product_id=p_product_id and catalog_revision=p_catalog_revision and artifact_sha256=p_artifact_sha256 and access_status='active') into allowed;
  if not enrolled or not allowed then raise exception 'install grant authorization unavailable'; end if;
  insert into obserra_ai_marketplace.v12_install_grants(grant_id,subject_id,tenant_id,product_id,catalog_revision,artifact_sha256,bridge_id,platform,install_profile,correlation_id,expires_at) values(p_grant_id,p_subject_id,p_tenant_id,p_product_id,p_catalog_revision,p_artifact_sha256,p_bridge_id,p_platform,p_install_profile,p_correlation_id,p_expires_at);
  insert into obserra_ai_marketplace.v12_audit_events(subject_id,tenant_id,product_id,action,correlation_id,facts) values(p_subject_id,p_tenant_id,p_product_id,'install_grant_created',p_correlation_id::text,jsonb_build_object('bridgeId',p_bridge_id,'catalogRevision',p_catalog_revision,'artifactSha256',p_artifact_sha256));
  return jsonb_build_object('grantId',p_grant_id::text,'bridgeId',p_bridge_id,'productId',p_product_id,'catalogRevision',p_catalog_revision,'artifactSha256',p_artifact_sha256,'expiresAt',p_expires_at);
end $$;

create or replace function public.obserra_ai_marketplace_lookup_v12_install_grant(p_grant_id uuid,p_bridge_id text) returns jsonb language sql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
  select coalesce((select jsonb_build_object('productId',g.product_id,'catalogRevision',g.catalog_revision,'artifactSha256',g.artifact_sha256,'platform',g.platform,'installProfile',g.install_profile,'correlationId',g.correlation_id::text) from obserra_ai_marketplace.v12_install_grants g join obserra_ai_marketplace.v12_artifact_entitlements e on e.subject_id=g.subject_id and e.tenant_id=g.tenant_id and e.product_id=g.product_id and e.catalog_revision=g.catalog_revision and e.artifact_sha256=g.artifact_sha256 and e.access_status='active' join obserra_ai_marketplace.v12_bridge_enrollments b on b.bridge_id=g.bridge_id and b.enrollment_status='active' where g.grant_id=p_grant_id and g.bridge_id=p_bridge_id and g.consumed_at is null and g.expires_at >= extract(epoch from now())::bigint),'null'::jsonb)
$$;

create or replace function public.obserra_ai_marketplace_consume_v12_install_grant(p_grant_id uuid,p_bridge_id text,p_receipt_correlation_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare g obserra_ai_marketplace.v12_install_grants%rowtype; allowed boolean;
begin
  select * into g from obserra_ai_marketplace.v12_install_grants where grant_id=p_grant_id and bridge_id=p_bridge_id for update;
  if not found or g.consumed_at is not null or g.expires_at < extract(epoch from now())::bigint then raise exception 'install grant unavailable'; end if;
  select exists(select 1 from obserra_ai_marketplace.v12_artifact_entitlements where subject_id=g.subject_id and tenant_id=g.tenant_id and product_id=g.product_id and catalog_revision=g.catalog_revision and artifact_sha256=g.artifact_sha256 and access_status='active') into allowed;
  if not allowed then raise exception 'install grant entitlement unavailable'; end if;
  update obserra_ai_marketplace.v12_install_grants set consumed_at=now(),receipt_correlation_id=p_receipt_correlation_id where grant_id=p_grant_id;
  insert into obserra_ai_marketplace.v12_audit_events(subject_id,tenant_id,product_id,action,correlation_id,facts) values(g.subject_id,g.tenant_id,g.product_id,'install_grant_consumed',p_receipt_correlation_id::text,jsonb_build_object('bridgeId',g.bridge_id,'catalogRevision',g.catalog_revision,'artifactSha256',g.artifact_sha256));
  return jsonb_build_object('consumed',true);
end $$;

revoke all on all tables in schema obserra_ai_marketplace from public,anon,authenticated;
revoke all on function public.obserra_ai_marketplace_reserve_v12_checkout(uuid,text,text,text,text,text,text,text,bigint,bigint),public.obserra_ai_marketplace_record_v12_checkout(uuid,text,text,text,text),public.obserra_ai_marketplace_record_v12_paid_checkout(text,text,text,boolean,uuid,text,text,text,text,text,text,text,text,text,text,text),public.obserra_ai_marketplace_record_v12_lifecycle(text,text,text,boolean,text,text,text,text),public.obserra_ai_marketplace_record_v12_download(text,text,text,text,text,uuid),public.obserra_ai_marketplace_v12_bridge_enrollment(text),public.obserra_ai_marketplace_create_v12_install_grant(uuid,text,text,text,text,text,text,text,text,uuid,bigint),public.obserra_ai_marketplace_lookup_v12_install_grant(uuid,text),public.obserra_ai_marketplace_consume_v12_install_grant(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.obserra_ai_marketplace_reserve_v12_checkout(uuid,text,text,text,text,text,text,text,bigint,bigint),public.obserra_ai_marketplace_record_v12_checkout(uuid,text,text,text,text),public.obserra_ai_marketplace_record_v12_paid_checkout(text,text,text,boolean,uuid,text,text,text,text,text,text,text,text,text,text,text),public.obserra_ai_marketplace_record_v12_lifecycle(text,text,text,boolean,text,text,text,text),public.obserra_ai_marketplace_record_v12_download(text,text,text,text,text,uuid),public.obserra_ai_marketplace_v12_bridge_enrollment(text),public.obserra_ai_marketplace_create_v12_install_grant(uuid,text,text,text,text,text,text,text,text,uuid,bigint),public.obserra_ai_marketplace_lookup_v12_install_grant(uuid,text),public.obserra_ai_marketplace_consume_v12_install_grant(uuid,text,uuid) to service_role;

create table if not exists obserra_ai_marketplace.v12_install_receipts (
  grant_id uuid primary key references obserra_ai_marketplace.v12_install_grants(grant_id),
  bridge_id text not null references obserra_ai_marketplace.v12_bridge_enrollments(bridge_id),
  receipt_correlation_id uuid not null unique,
  outcome text not null check (outcome in ('installed','failed','rolled_back')),
  installed_version text,
  diagnostic_code text,
  received_at timestamptz not null default now()
);
alter table obserra_ai_marketplace.v12_install_receipts enable row level security;

create or replace function public.obserra_ai_marketplace_record_v12_install_receipt(
  p_grant_id uuid,p_bridge_id text,p_receipt_correlation_id uuid,p_outcome text,p_installed_version text,p_diagnostic_code text
) returns jsonb language plpgsql security definer set search_path=pg_catalog,obserra_ai_marketplace as $$
declare g obserra_ai_marketplace.v12_install_grants%rowtype;
begin
  if p_outcome not in ('installed','failed','rolled_back') or (p_installed_version is not null and p_installed_version !~ '^[0-9A-Za-z.+-]{1,80}$') or (p_diagnostic_code is not null and p_diagnostic_code !~ '^[A-Z0-9_:-]{1,120}$') then raise exception 'invalid install receipt'; end if;
  select * into g from obserra_ai_marketplace.v12_install_grants where grant_id=p_grant_id and bridge_id=p_bridge_id for update;
  if not found or g.consumed_at is null or g.receipt_correlation_id <> p_receipt_correlation_id then raise exception 'install receipt authorization unavailable'; end if;
  insert into obserra_ai_marketplace.v12_install_receipts(grant_id,bridge_id,receipt_correlation_id,outcome,installed_version,diagnostic_code) values(p_grant_id,p_bridge_id,p_receipt_correlation_id,p_outcome,p_installed_version,p_diagnostic_code) on conflict(grant_id) do nothing;
  if not found then return jsonb_build_object('recorded',true,'idempotentReplay',true); end if;
  insert into obserra_ai_marketplace.v12_audit_events(subject_id,tenant_id,product_id,action,correlation_id,facts) values(g.subject_id,g.tenant_id,g.product_id,concat('install_',p_outcome),p_receipt_correlation_id::text,jsonb_build_object('bridgeId',g.bridge_id,'catalogRevision',g.catalog_revision,'artifactSha256',g.artifact_sha256,'installedVersion',p_installed_version,'diagnosticCode',p_diagnostic_code));
  return jsonb_build_object('recorded',true);
end $$;

revoke all on obserra_ai_marketplace.v12_install_receipts from public,anon,authenticated;
revoke all on function public.obserra_ai_marketplace_record_v12_install_receipt(uuid,text,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.obserra_ai_marketplace_record_v12_install_receipt(uuid,text,uuid,text,text,text) to service_role;
