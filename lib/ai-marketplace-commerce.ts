import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { ensureApplicationsRuntimeSecrets, ensureMarketplaceV12RuntimeSecrets } from "./production-runtime-secrets";
const SUBJECT=/^user_[A-Za-z0-9_-]{8,}$/, TENANT=/^(?:org_[A-Za-z0-9_-]{8,}|subject:user_[A-Za-z0-9_-]{8,})$/, CUSTOMER=/^cus_[A-Za-z0-9]+$/, SESSION=/^cs_(?:live|test)_[A-Za-z0-9_]+$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, PRICE=/^price_[A-Za-z0-9]+$/, REVISION=/^[a-f0-9]{64}$/, PRODUCT=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/, OPTION=/^(?:recurring:month|recurring:year|one_time:once|team_license:once|activation:once)$/;
export class AiMarketplaceCommerceError extends Error { constructor(message:string,readonly status=503){super(message);} }
function config(){const url=process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim()??"",key=process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim()??"";const parsed=new URL(url);if(parsed.protocol!=="https:"||parsed.hostname!=="ykmrlcfitsubqajgfnye.supabase.co"||!key)throw new AiMarketplaceCommerceError("Marketplace durable commerce is not configured.");return {url:parsed.origin,key,jwt:key.split(".").length===3};}
type CommerceRuntimeScope = "applications" | "marketplace-v12";

/**
 * Legacy catalogue calls keep their existing Applications scope. Every v1.2
 * durable decision explicitly uses the smaller v1.2 scope so an unrelated
 * legacy price catalogue cannot prevent checkout, webhook fulfilment, or an
 * entitlement decision.
 */
async function rpc<T>(name:string,body:Record<string,unknown>,scope:CommerceRuntimeScope="applications"){
  await (scope === "marketplace-v12" ? ensureMarketplaceV12RuntimeSecrets : ensureApplicationsRuntimeSecrets)();
  const c=config();
  const r=await fetch(`${c.url}/rest/v1/rpc/${name}`,{method:"POST",cache:"no-store",redirect:"error",headers:{apikey:c.key,...(c.jwt?{authorization:`Bearer ${c.key}`}:{ }),"content-type":"application/json",accept:"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(10_000)});
  if(!r.ok)throw new AiMarketplaceCommerceError("Marketplace durable commerce is unavailable.",r.status);
  try{return await r.json() as T;}catch{throw new AiMarketplaceCommerceError("Marketplace durable commerce returned invalid data.");}
}
function identity(subject:string,tenant:string){if(!SUBJECT.test(subject)||!TENANT.test(tenant))throw new AiMarketplaceCommerceError("Marketplace purchaser identity is invalid.",400);}
export function aiMarketplaceTenantId(subject:string,org?:string|null){const tenant=org||`subject:${subject}`;identity(subject,tenant);return tenant;}
function secret(){const value=process.env.OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET?.trim()??"";if(value.length<32)throw new AiMarketplaceCommerceError("Marketplace checkout hashing is not configured.");return value;}
export function aiMarketplaceCustomerKey(subject:string,tenant:string){identity(subject,tenant);return `ai-marketplace-customer-v1-${createHmac("sha256",secret()).update(`${subject}:${tenant}`).digest("hex")}`;}
export async function aiMarketplaceCustomer(subject:string,tenant:string,scope:CommerceRuntimeScope="applications"){identity(subject,tenant);const v=await rpc<{stripeCustomerId:string}|null>("obserra_ai_marketplace_customer",{p_subject_id:subject,p_tenant_id:tenant},scope);if(v&&!CUSTOMER.test(v.stripeCustomerId))throw new AiMarketplaceCommerceError("Marketplace customer record is invalid.");return v;}
export async function bindAiMarketplaceCustomer(subject:string,tenant:string,customer:string,scope:CommerceRuntimeScope="applications"){identity(subject,tenant);if(!CUSTOMER.test(customer))throw new AiMarketplaceCommerceError("Marketplace customer is invalid.",400);return rpc<{stripeCustomerId:string}>("obserra_ai_marketplace_bind_customer",{p_subject_id:subject,p_tenant_id:tenant,p_stripe_customer_id:customer},scope);}
export async function reserveAiMarketplaceCheckout(input:{subjectId:string;tenantId:string;productId:string;interval:string}){identity(input.subjectId,input.tenantId);const issued=Math.floor(Date.now()/1000),requestKey=createHmac("sha256",secret()).update(JSON.stringify(["ai-marketplace-checkout-v1",input.subjectId,input.tenantId,input.productId,input.interval,Math.floor(issued/900)])).digest("hex");const v=await rpc<{attemptId:string;stripeCustomerId:string|null;stripeSessionId:string|null}>("obserra_ai_marketplace_reserve_checkout",{p_attempt_id:randomUUID(),p_request_key:requestKey,p_subject_id:input.subjectId,p_tenant_id:input.tenantId,p_product_id:input.productId,p_billing_interval:input.interval,p_issued_at:issued,p_expires_at:issued+1800});if(!/^[0-9a-f-]{36}$/.test(v?.attemptId??"")||(v.stripeCustomerId!==null&&!CUSTOMER.test(v.stripeCustomerId))||(v.stripeSessionId!==null&&!SESSION.test(v.stripeSessionId)))throw new AiMarketplaceCommerceError("Marketplace checkout reservation is invalid.");return v;}
export async function recordAiMarketplaceCheckout(attempt:string,customer:string,session:string){if(!CUSTOMER.test(customer)||!SESSION.test(session))throw new AiMarketplaceCommerceError("Marketplace checkout provider identity is invalid.",400);return rpc("obserra_ai_marketplace_record_checkout",{p_attempt_id:attempt,p_stripe_customer_id:customer,p_stripe_checkout_session_id:session});}
export async function aiMarketplaceEntitlement(subject:string,tenant:string,product:string){identity(subject,tenant);return rpc<{allowed:boolean}>("obserra_ai_marketplace_entitlement",{p_subject_id:subject,p_tenant_id:tenant,p_product_id:product});}
export async function marketplaceV12DeliveryEntitlement(subject:string,tenant:string,product:string,revision:string,artifactSha256:string){identity(subject,tenant);if(!/^[a-f0-9]{64}$/.test(revision)||!/^[a-f0-9]{64}$/.test(artifactSha256))throw new AiMarketplaceCommerceError("Marketplace delivery identity is invalid.",400);return rpc<{allowed:boolean}>("obserra_ai_marketplace_v12_delivery_entitlement",{p_subject_id:subject,p_tenant_id:tenant,p_product_id:product,p_catalog_revision:revision,p_artifact_sha256:artifactSha256},"marketplace-v12");}
export type MarketplaceV12InventoryEntitlement=Readonly<{productId:string;catalogRevision:string;artifactSha256:string;purchaseOption:string;accessStatus:"active"|"revoked";updatedAt:string}>;
/**
 * The Hangar may only render a customer inventory that comes from the durable
 * entitlement authority. This intentionally returns no Stripe customer,
 * session, invoice, or tenant identifiers to a page component.
 */
export async function marketplaceV12CustomerInventory(subject:string,tenant:string){
  identity(subject,tenant);
  const value=await rpc<unknown>("obserra_ai_marketplace_v12_entitlements",{p_subject_id:subject,p_tenant_id:tenant},"marketplace-v12");
  if(!Array.isArray(value)||value.length>500)throw new AiMarketplaceCommerceError("Marketplace customer inventory is invalid.");
  return value.map((entry):MarketplaceV12InventoryEntitlement=>{
    if(!entry||typeof entry!=="object")throw new AiMarketplaceCommerceError("Marketplace customer inventory is invalid.");
    const record=entry as Record<string,unknown>,productId=record.productId,catalogRevision=record.catalogRevision,artifactSha256=record.artifactSha256,purchaseOption=record.purchaseOption,accessStatus=record.accessStatus,updatedAt=record.updatedAt;
    if(typeof productId!=="string"||!productId||typeof catalogRevision!=="string"||!/^[a-f0-9]{64}$/.test(catalogRevision)||typeof artifactSha256!=="string"||!/^[a-f0-9]{64}$/.test(artifactSha256)||typeof purchaseOption!=="string"||!purchaseOption||!(accessStatus==="active"||accessStatus==="revoked")||typeof updatedAt!=="string"||!Number.isFinite(Date.parse(updatedAt)))throw new AiMarketplaceCommerceError("Marketplace customer inventory is invalid.");
    return {productId,catalogRevision,artifactSha256,purchaseOption,accessStatus,updatedAt};
  });
}
export async function recordAiMarketplacePayment(v:{eventId:string;eventType:string;payload:string;live:boolean;session:string;customer:string;subject:string;tenant:string;product:string;interval:string;price:string}){return rpc("obserra_ai_marketplace_record_payment",{p_event_id:v.eventId,p_event_type:v.eventType,p_payload_sha256:v.payload,p_livemode:v.live,p_stripe_checkout_session_id:v.session,p_stripe_customer_id:v.customer,p_subject_id:v.subject,p_tenant_id:v.tenant,p_product_id:v.product,p_billing_interval:v.interval,p_stripe_price_id:v.price});}
export async function recordMarketplaceV12Payment(v:{eventId:string;eventType:string;payload:string;live:boolean;session:string;customer:string;subject:string;tenant:string;product:string;option:string;price:string;revision:string;artifactSha256:string}){if(!/^[a-f0-9]{64}$/.test(v.revision)||!/^[a-f0-9]{64}$/.test(v.artifactSha256))throw new AiMarketplaceCommerceError("Marketplace delivery identity is invalid.",400);return rpc("obserra_ai_marketplace_record_v12_payment",{p_event_id:v.eventId,p_event_type:v.eventType,p_payload_sha256:v.payload,p_livemode:v.live,p_stripe_checkout_session_id:v.session,p_stripe_customer_id:v.customer,p_subject_id:v.subject,p_tenant_id:v.tenant,p_product_id:v.product,p_purchase_option:v.option,p_stripe_price_id:v.price,p_catalog_revision:v.revision,p_artifact_sha256:v.artifactSha256},"marketplace-v12");}
export async function aiMarketplaceLedgerHealth(scope:CommerceRuntimeScope="applications"){const x=await rpc<{operational:boolean;entitlementAuthority:string}>("obserra_ai_marketplace_commerce_health",{},scope);if(!x||x.operational!==true||x.entitlementAuthority!=="ai-marketplace-commerce-ledger-v1")throw new AiMarketplaceCommerceError("Marketplace ledger health is invalid.");return x;}
export async function revokeAiMarketplaceEntitlement(eventId:string,sessionId:string,reason:string){return rpc("obserra_ai_marketplace_revoke_entitlement",{p_event_id:eventId,p_stripe_checkout_session_id:sessionId,p_reason:reason});}

export type MarketplaceV12PurchaseOption = "recurring:month" | "recurring:year" | "one_time:once" | "team_license:once" | "activation:once";
type V12Reservation = Readonly<{ attemptId: string; stripeCustomerId: string | null; stripeSessionId: string | null; expiresAt: number }>;
type V12Grant = Readonly<{ grantId: string; bridgeId: string; productId: string; catalogRevision: string; artifactSha256: string; expiresAt: number }>;

function v12Identity(value: { productId: string; option: string; revision: string; artifactSha256: string }) {
  if (!PRODUCT.test(value.productId) || !OPTION.test(value.option) || !REVISION.test(value.revision) || !REVISION.test(value.artifactSha256)) throw new AiMarketplaceCommerceError("Marketplace v1.2 commerce identity is invalid.", 400);
}

function v12Session(value: string) {
  if (!SESSION.test(value)) throw new AiMarketplaceCommerceError("Marketplace checkout provider identity is invalid.", 400);
}

/**
 * A v1.2 reservation is bound to the immutable release and purchase option;
 * it cannot be replayed for another catalog record, price, or tenant.
 */
export async function reserveMarketplaceV12Checkout(input: { subjectId: string; tenantId: string; productId: string; option: MarketplaceV12PurchaseOption; revision: string; artifactSha256: string }) {
  identity(input.subjectId, input.tenantId);
  v12Identity({ productId: input.productId, option: input.option, revision: input.revision, artifactSha256: input.artifactSha256 });
  const issued = Math.floor(Date.now() / 1000);
  // Stripe requires Checkout expiry to be at least 30 minutes ahead. Leave a
  // small server-validation and provider-call margin rather than racing that
  // boundary after the reservation has been created.
  const expiresAt = issued + 2100;
  const requestKey = createHmac("sha256", secret()).update(JSON.stringify(["ai-marketplace-v12-checkout", input.subjectId, input.tenantId, input.productId, input.option, input.revision, input.artifactSha256, Math.floor(issued / 900)])).digest("hex");
  const reservation = await rpc<V12Reservation>("obserra_ai_marketplace_reserve_v12_checkout", {
    p_attempt_id: randomUUID(), p_request_key: requestKey, p_subject_id: input.subjectId, p_tenant_id: input.tenantId,
    p_product_id: input.productId, p_purchase_option: input.option, p_catalog_revision: input.revision,
    p_artifact_sha256: input.artifactSha256, p_issued_at: issued, p_expires_at: expiresAt,
  }, "marketplace-v12");
  if (!UUID.test(reservation?.attemptId ?? "") || (reservation.stripeCustomerId !== null && !CUSTOMER.test(reservation.stripeCustomerId)) || (reservation.stripeSessionId !== null && !SESSION.test(reservation.stripeSessionId)) || !Number.isSafeInteger(reservation.expiresAt) || reservation.expiresAt < issued || reservation.expiresAt > expiresAt) throw new AiMarketplaceCommerceError("Marketplace checkout reservation is invalid.");
  return reservation;
}

export async function recordMarketplaceV12Checkout(input: { attemptId: string; customerId: string; sessionId: string; subscriptionId?: string | null; paymentIntentId?: string | null }) {
  if (!UUID.test(input.attemptId) || !CUSTOMER.test(input.customerId)) throw new AiMarketplaceCommerceError("Marketplace checkout reservation is invalid.", 400);
  v12Session(input.sessionId);
  if (input.subscriptionId !== undefined && input.subscriptionId !== null && !/^sub_[A-Za-z0-9]+$/.test(input.subscriptionId)) throw new AiMarketplaceCommerceError("Marketplace subscription identity is invalid.", 400);
  if (input.paymentIntentId !== undefined && input.paymentIntentId !== null && !/^pi_[A-Za-z0-9]+$/.test(input.paymentIntentId)) throw new AiMarketplaceCommerceError("Marketplace payment identity is invalid.", 400);
  return rpc("obserra_ai_marketplace_record_v12_checkout", {
    p_attempt_id: input.attemptId, p_stripe_customer_id: input.customerId, p_stripe_checkout_session_id: input.sessionId,
    p_stripe_subscription_id: input.subscriptionId ?? null, p_stripe_payment_intent_id: input.paymentIntentId ?? null,
  }, "marketplace-v12");
}

/** Only the signed webhook route may call this payment transition. */
export async function recordMarketplaceV12PaidCheckout(input: { eventId: string; eventType: string; payloadSha256: string; live: boolean; attemptId: string; sessionId: string; customerId: string; subjectId: string; tenantId: string; productId: string; option: MarketplaceV12PurchaseOption; priceId: string; revision: string; artifactSha256: string; subscriptionId?: string | null; paymentIntentId?: string | null }) {
  identity(input.subjectId, input.tenantId);
  v12Identity({ productId: input.productId, option: input.option, revision: input.revision, artifactSha256: input.artifactSha256 });
  if (!/^evt_[A-Za-z0-9]+$/.test(input.eventId) || !/^[a-f0-9]{64}$/.test(input.payloadSha256) || !UUID.test(input.attemptId) || !PRICE.test(input.priceId) || !CUSTOMER.test(input.customerId)) throw new AiMarketplaceCommerceError("Marketplace payment identity is invalid.", 400);
  v12Session(input.sessionId);
  return rpc("obserra_ai_marketplace_record_v12_paid_checkout", {
    p_event_id: input.eventId, p_event_type: input.eventType, p_payload_sha256: input.payloadSha256, p_livemode: input.live,
    p_attempt_id: input.attemptId, p_stripe_checkout_session_id: input.sessionId, p_stripe_customer_id: input.customerId,
    p_subject_id: input.subjectId, p_tenant_id: input.tenantId, p_product_id: input.productId, p_purchase_option: input.option,
    p_stripe_price_id: input.priceId, p_catalog_revision: input.revision, p_artifact_sha256: input.artifactSha256,
    p_stripe_subscription_id: input.subscriptionId ?? null, p_stripe_payment_intent_id: input.paymentIntentId ?? null,
  }, "marketplace-v12");
}

export type MarketplaceV12Lifecycle = "checkout_failed" | "checkout_expired" | "subscription_cancelled" | "subscription_expired" | "payment_failed" | "payment_recovered" | "refund" | "dispute" | "chargeback";
const LIFECYCLE = new Set<MarketplaceV12Lifecycle>(["checkout_failed", "checkout_expired", "subscription_cancelled", "subscription_expired", "payment_failed", "payment_recovered", "refund", "dispute", "chargeback"]);

/** Records a verified Stripe lifecycle event and projects its explicit access policy. */
export async function recordMarketplaceV12Lifecycle(input: { eventId: string; eventType: string; payloadSha256: string; live: boolean; lifecycle: MarketplaceV12Lifecycle; sessionId?: string | null; subscriptionId?: string | null; paymentIntentId?: string | null }) {
  if (!/^evt_[A-Za-z0-9]+$/.test(input.eventId) || !/^[a-f0-9]{64}$/.test(input.payloadSha256) || !LIFECYCLE.has(input.lifecycle)) throw new AiMarketplaceCommerceError("Marketplace lifecycle identity is invalid.", 400);
  if (!input.sessionId && !input.subscriptionId && !input.paymentIntentId) throw new AiMarketplaceCommerceError("Marketplace lifecycle reference is required.", 400);
  if (input.sessionId) v12Session(input.sessionId);
  if (input.subscriptionId && !/^sub_[A-Za-z0-9]+$/.test(input.subscriptionId)) throw new AiMarketplaceCommerceError("Marketplace subscription identity is invalid.", 400);
  if (input.paymentIntentId && !/^pi_[A-Za-z0-9]+$/.test(input.paymentIntentId)) throw new AiMarketplaceCommerceError("Marketplace payment identity is invalid.", 400);
  return rpc("obserra_ai_marketplace_record_v12_lifecycle", {
    p_event_id: input.eventId, p_event_type: input.eventType, p_payload_sha256: input.payloadSha256, p_livemode: input.live,
    p_lifecycle: input.lifecycle, p_stripe_checkout_session_id: input.sessionId ?? null,
    p_stripe_subscription_id: input.subscriptionId ?? null, p_stripe_payment_intent_id: input.paymentIntentId ?? null,
  }, "marketplace-v12");
}

export async function recordMarketplaceV12Download(input: { subjectId: string; tenantId: string; productId: string; revision: string; artifactSha256: string; correlationId: string }) {
  identity(input.subjectId, input.tenantId);
  v12Identity({ productId: input.productId, option: "one_time:once", revision: input.revision, artifactSha256: input.artifactSha256 });
  if (!UUID.test(input.correlationId)) throw new AiMarketplaceCommerceError("Marketplace delivery correlation is invalid.", 400);
  return rpc<{ allowed: boolean }>("obserra_ai_marketplace_record_v12_download", {
    p_subject_id: input.subjectId, p_tenant_id: input.tenantId, p_product_id: input.productId,
    p_catalog_revision: input.revision, p_artifact_sha256: input.artifactSha256, p_correlation_id: input.correlationId,
  }, "marketplace-v12");
}

export async function marketplaceV12BridgeEnrollment(bridgeId: string) {
  if (!/^bridge_[A-Za-z0-9_-]{16,128}$/.test(bridgeId)) throw new AiMarketplaceCommerceError("Marketplace bridge identity is invalid.", 400);
  const value = await rpc<{ bridgeId: string; publicKeyPem: string; platform: string } | null>("obserra_ai_marketplace_v12_bridge_enrollment", { p_bridge_id: bridgeId }, "marketplace-v12");
  if (!value || value.bridgeId !== bridgeId || typeof value.publicKeyPem !== "string" || value.publicKeyPem.length > 8192 || !/^[a-z][a-z0-9_-]{1,31}$/.test(value.platform)) return null;
  return value;
}

export async function createMarketplaceV12InstallGrant(input: { subjectId: string; tenantId: string; productId: string; revision: string; artifactSha256: string; bridgeId: string; platform: string; installProfile: string; correlationId: string }) {
  identity(input.subjectId, input.tenantId);
  v12Identity({ productId: input.productId, option: "one_time:once", revision: input.revision, artifactSha256: input.artifactSha256 });
  if (!/^bridge_[A-Za-z0-9_-]{16,128}$/.test(input.bridgeId) || !/^[a-z][a-z0-9_-]{1,31}$/.test(input.platform) || !/^(?:skill-upload|codex-plugin|desktop-installer-bundle|collection)$/.test(input.installProfile) || !UUID.test(input.correlationId)) throw new AiMarketplaceCommerceError("Marketplace install grant identity is invalid.", 400);
  const value = await rpc<V12Grant>("obserra_ai_marketplace_create_v12_install_grant", {
    p_grant_id: randomUUID(), p_subject_id: input.subjectId, p_tenant_id: input.tenantId, p_product_id: input.productId,
    p_catalog_revision: input.revision, p_artifact_sha256: input.artifactSha256, p_bridge_id: input.bridgeId,
    p_platform: input.platform, p_install_profile: input.installProfile, p_correlation_id: input.correlationId,
    p_expires_at: Math.floor(Date.now() / 1000) + 300,
  }, "marketplace-v12");
  if (!UUID.test(value?.grantId ?? "") || value.bridgeId !== input.bridgeId || value.productId !== input.productId || value.catalogRevision !== input.revision || value.artifactSha256 !== input.artifactSha256 || !Number.isSafeInteger(value.expiresAt)) throw new AiMarketplaceCommerceError("Marketplace install grant is invalid.");
  return value;
}

export async function lookupMarketplaceV12InstallGrant(input: { grantId: string; bridgeId: string }) {
  if (!UUID.test(input.grantId) || !/^bridge_[A-Za-z0-9_-]{16,128}$/.test(input.bridgeId)) throw new AiMarketplaceCommerceError("Marketplace install grant identity is invalid.", 400);
  return rpc<{ productId: string; catalogRevision: string; artifactSha256: string; platform: string; installProfile: string; correlationId: string } | null>("obserra_ai_marketplace_lookup_v12_install_grant", { p_grant_id: input.grantId, p_bridge_id: input.bridgeId }, "marketplace-v12");
}

export async function consumeMarketplaceV12InstallGrant(input: { grantId: string; bridgeId: string; receiptCorrelationId: string }) {
  if (!UUID.test(input.grantId) || !/^bridge_[A-Za-z0-9_-]{16,128}$/.test(input.bridgeId) || !UUID.test(input.receiptCorrelationId)) throw new AiMarketplaceCommerceError("Marketplace install grant identity is invalid.", 400);
  return rpc("obserra_ai_marketplace_consume_v12_install_grant", { p_grant_id: input.grantId, p_bridge_id: input.bridgeId, p_receipt_correlation_id: input.receiptCorrelationId }, "marketplace-v12");
}

export async function recordMarketplaceV12InstallReceipt(input: { grantId: string; bridgeId: string; receiptCorrelationId: string; outcome: "installed" | "failed" | "rolled_back"; installedVersion?: string | null; diagnosticCode?: string | null }) {
  if (!UUID.test(input.grantId) || !/^bridge_[A-Za-z0-9_-]{16,128}$/.test(input.bridgeId) || !UUID.test(input.receiptCorrelationId) || !["installed", "failed", "rolled_back"].includes(input.outcome) || (input.installedVersion !== undefined && input.installedVersion !== null && !/^[0-9A-Za-z.+-]{1,80}$/.test(input.installedVersion)) || (input.diagnosticCode !== undefined && input.diagnosticCode !== null && !/^[A-Z0-9_:-]{1,120}$/.test(input.diagnosticCode))) throw new AiMarketplaceCommerceError("Marketplace installation receipt is invalid.", 400);
  return rpc("obserra_ai_marketplace_record_v12_install_receipt", {
    p_grant_id: input.grantId, p_bridge_id: input.bridgeId, p_receipt_correlation_id: input.receiptCorrelationId,
    p_outcome: input.outcome, p_installed_version: input.installedVersion ?? null, p_diagnostic_code: input.diagnosticCode ?? null,
  }, "marketplace-v12");
}
