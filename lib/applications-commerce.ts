import "server-only";

import { createHmac, randomUUID } from "node:crypto";

const APPLICATIONS_PROJECT_REF = "ykmrlcfitsubqajgfnye";
const APPLICATION_SLUG = /^obserra-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SUBJECT_ID = /^user_[A-Za-z0-9_-]{8,}$/;
const TENANT_ID = /^(?:org_[A-Za-z0-9_-]{8,}|subject:user_[A-Za-z0-9_-]{8,})$/;
const CUSTOMER_ID = /^cus_[A-Za-z0-9]+$/;
const SESSION_ID = /^cs_(?:live|test)_[A-Za-z0-9_]+$/;

type ApplicationsSupabaseConfig = { url: string; serviceRoleKey: string };

export type ApplicationsCommerceHealth = {
  schemaVersion: "applications-commerce-v1";
  operational: true;
  customerRows: number;
  checkoutAttemptRows: number;
  subscriptionRows: number;
  paymentEventRows: number;
  eventLedger: "append-only";
  entitlementAuthority: "durable-subscription-snapshot-v1";
};

export type DurableApplicationEntitlement = {
  appSlug?: string;
  allowed: boolean;
  status: string;
  stripeStatus?: string;
  subscriptionId?: string;
  customerId?: string;
  plan?: string;
  deploymentModel?: string;
  billingInterval?: string;
  seatsPurchased?: number;
  currentPeriodEnd?: string | null;
  startsAt?: string;
  revision?: number;
  authoritative: true;
  source: "applications-commerce-ledger";
};

export type ApplicationsCheckoutReservation = {
  attemptId: string;
  requestKey: string;
  stripeCustomerId: string | null;
  stripeSessionId: string | null;
  state: string;
  issuedAt: number;
  expiresAt: number;
  idempotentReplay: boolean;
};

export class ApplicationsCommerceError extends Error {
  constructor(
    message: string,
    readonly code: "configuration-required" | "invalid-input" | "request-failed" | "invalid-response",
    readonly status = 503,
  ) {
    super(message);
    this.name = "ApplicationsCommerceError";
  }
}

function legacyJwtIsServiceRole(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

function validServiceRoleKey(value: string) {
  return (value.startsWith("sb_secret_") && value.length >= 32) || legacyJwtIsServiceRole(value);
}

function applicationsSupabaseConfig(): ApplicationsSupabaseConfig {
  const rawUrl = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== "https:" ||
      url.hostname !== `${APPLICATIONS_PROJECT_REF}.supabase.co` ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "") ||
      !validServiceRoleKey(serviceRoleKey)
    ) throw new Error("invalid");
    return { url: url.origin, serviceRoleKey };
  } catch {
    throw new ApplicationsCommerceError(
      "Applications durable commerce is not configured.",
      "configuration-required",
    );
  }
}

export function applicationsPersistenceConfigured() {
  try {
    applicationsSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

async function rpc<ResponseBody>(name: string, body: Record<string, unknown>): Promise<ResponseBody> {
  const config = applicationsSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  }).catch((error) => {
    console.error("Applications durable commerce unavailable", {
      operation: name,
      error: error instanceof Error ? error.name : "unknown",
    });
    throw new ApplicationsCommerceError("Applications durable commerce is unavailable.", "request-failed");
  });
  if (!response.ok) {
    console.error("Applications durable commerce rejected operation", { operation: name, status: response.status });
    throw new ApplicationsCommerceError("Applications durable commerce rejected the operation.", "request-failed", response.status);
  }
  try {
    return await response.json() as ResponseBody;
  } catch {
    throw new ApplicationsCommerceError("Applications durable commerce returned invalid data.", "invalid-response");
  }
}

function assertIdentity(subjectId: string, tenantId: string) {
  if (!SUBJECT_ID.test(subjectId) || !TENANT_ID.test(tenantId)) {
    throw new ApplicationsCommerceError("Applications purchaser identity is invalid.", "invalid-input", 400);
  }
}

export function applicationsTenantId(subjectId: string, organizationId?: string | null) {
  const tenantId = organizationId || `subject:${subjectId}`;
  assertIdentity(subjectId, tenantId);
  return tenantId;
}

export async function applicationsCommerceHealth() {
  const health = await rpc<ApplicationsCommerceHealth>("obserra_applications_commerce_health", {});
  if (
    health?.schemaVersion !== "applications-commerce-v1" ||
    health.operational !== true ||
    health.eventLedger !== "append-only" ||
    health.entitlementAuthority !== "durable-subscription-snapshot-v1"
  ) throw new ApplicationsCommerceError("Applications commerce health is invalid.", "invalid-response");
  return health;
}

export async function durableApplicationsCustomer(subjectId: string, tenantId: string) {
  assertIdentity(subjectId, tenantId);
  const value = await rpc<{ subjectId: string; tenantId: string; stripeCustomerId: string } | null>(
    "obserra_applications_customer",
    { p_subject_id: subjectId, p_tenant_id: tenantId },
  );
  if (value !== null && (!CUSTOMER_ID.test(value.stripeCustomerId) || value.subjectId !== subjectId || value.tenantId !== tenantId)) {
    throw new ApplicationsCommerceError("Applications customer binding is invalid.", "invalid-response");
  }
  return value;
}

export async function bindDurableApplicationsCustomer(subjectId: string, tenantId: string, stripeCustomerId: string) {
  assertIdentity(subjectId, tenantId);
  if (!CUSTOMER_ID.test(stripeCustomerId)) throw new ApplicationsCommerceError("Stripe customer identity is invalid.", "invalid-input", 400);
  return rpc<{ subjectId: string; tenantId: string; stripeCustomerId: string }>("obserra_applications_bind_customer", {
    p_subject_id: subjectId,
    p_tenant_id: tenantId,
    p_stripe_customer_id: stripeCustomerId,
  });
}

export function applicationsCheckoutRequestKey(input: {
  subjectId: string;
  tenantId: string;
  appSlug: string;
  planId: string;
  billingInterval: string;
  deploymentModel: string;
  issuedAt: number;
}) {
  const secret = process.env.OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET?.trim() ?? "";
  if (secret.length < 32) throw new ApplicationsCommerceError("Applications checkout hashing is not configured.", "configuration-required");
  const window = Math.floor(input.issuedAt / 900);
  return createHmac("sha256", secret).update(JSON.stringify([
    "applications-checkout-v1",
    input.subjectId,
    input.tenantId,
    input.appSlug,
    input.planId,
    input.billingInterval,
    input.deploymentModel,
    window,
  ])).digest("hex");
}

export function applicationsCustomerIdempotencyKey(subjectId: string, tenantId: string) {
  assertIdentity(subjectId, tenantId);
  const secret = process.env.OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET?.trim() ?? "";
  if (secret.length < 32) throw new ApplicationsCommerceError("Applications customer hashing is not configured.", "configuration-required");
  const digest = createHmac("sha256", secret)
    .update(JSON.stringify(["applications-customer-v1", subjectId, tenantId]))
    .digest("hex");
  return `applications-customer-v1-${digest}`;
}

export async function reserveApplicationsCheckout(input: {
  subjectId: string;
  tenantId: string;
  appSlug: string;
  planId: "professional" | "enterprise";
  billingInterval: "monthly" | "annual";
  deploymentModel: "SaaS" | "Private Cloud" | "Hybrid" | "On-Premises";
}) {
  assertIdentity(input.subjectId, input.tenantId);
  if (!APPLICATION_SLUG.test(input.appSlug)) throw new ApplicationsCommerceError("Application identity is invalid.", "invalid-input", 400);
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 30 * 60;
  const requestKey = applicationsCheckoutRequestKey({ ...input, issuedAt });
  const value = await rpc<ApplicationsCheckoutReservation>("obserra_applications_reserve_checkout", {
    p_attempt_id: randomUUID(),
    p_request_key: requestKey,
    p_subject_id: input.subjectId,
    p_tenant_id: input.tenantId,
    p_app_slug: input.appSlug,
    p_plan_id: input.planId,
    p_billing_interval: input.billingInterval,
    p_deployment_model: input.deploymentModel,
    p_issued_at: issuedAt,
    p_expires_at: expiresAt,
  });
  if (
    !/^[0-9a-f-]{36}$/.test(value?.attemptId ?? "") ||
    !/^[0-9a-f]{64}$/.test(value?.requestKey ?? "") ||
    (value.stripeCustomerId !== null && !CUSTOMER_ID.test(value.stripeCustomerId)) ||
    (value.stripeSessionId !== null && !SESSION_ID.test(value.stripeSessionId))
  ) throw new ApplicationsCommerceError("Applications checkout reservation is invalid.", "invalid-response");
  return value;
}

export async function recordApplicationsCheckoutSession(attemptId: string, stripeCustomerId: string, stripeSessionId: string) {
  if (!CUSTOMER_ID.test(stripeCustomerId) || !SESSION_ID.test(stripeSessionId)) {
    throw new ApplicationsCommerceError("Applications checkout provider identity is invalid.", "invalid-input", 400);
  }
  return rpc<{ attemptId: string; stripeCustomerId: string; stripeSessionId: string; state: string }>(
    "obserra_applications_record_checkout_session",
    { p_attempt_id: attemptId, p_stripe_customer_id: stripeCustomerId, p_stripe_checkout_session_id: stripeSessionId },
  );
}

export async function durableApplicationEntitlement(subjectId: string, tenantId: string, appSlug: string) {
  assertIdentity(subjectId, tenantId);
  if (!APPLICATION_SLUG.test(appSlug)) throw new ApplicationsCommerceError("Application identity is invalid.", "invalid-input", 400);
  const value = await rpc<DurableApplicationEntitlement>("obserra_applications_entitlement", {
    p_subject_id: subjectId,
    p_tenant_id: tenantId,
    p_app_slug: appSlug,
  });
  if (!value || value.authoritative !== true || value.source !== "applications-commerce-ledger" || typeof value.allowed !== "boolean") {
    throw new ApplicationsCommerceError("Applications entitlement response is invalid.", "invalid-response");
  }
  return value;
}

export async function durableApplicationEntitlements(subjectId: string, tenantId: string) {
  assertIdentity(subjectId, tenantId);
  const value = await rpc<DurableApplicationEntitlement[]>("obserra_applications_entitlements", {
    p_subject_id: subjectId,
    p_tenant_id: tenantId,
  });
  if (!Array.isArray(value) || value.some((entry) => entry.authoritative !== true || entry.source !== "applications-commerce-ledger")) {
    throw new ApplicationsCommerceError("Applications entitlement list is invalid.", "invalid-response");
  }
  return value;
}

export type ApplicationsSubscriptionSnapshot = {
  eventId: string;
  eventType: string;
  eventObjectId: string;
  payloadSha256: string;
  eventCreated: number;
  livemode: boolean;
  subscriptionId: string;
  customerId: string;
  checkoutSessionId?: string;
  subjectId: string;
  tenantId: string;
  appSlug: string;
  planId: string;
  billingInterval: string;
  deploymentModel: string;
  stripeStatus: string;
  accessStatus: string;
  currency: string;
  unitAmount: number;
  quantity: number;
  currentPeriodEnd?: number;
  cancelAt?: number;
};

export async function applyDurableApplicationSubscription(input: ApplicationsSubscriptionSnapshot) {
  return rpc<Record<string, unknown>>("obserra_applications_apply_subscription", {
    p_event_id: input.eventId,
    p_event_type: input.eventType,
    p_event_object_id: input.eventObjectId,
    p_payload_sha256: input.payloadSha256,
    p_event_created: input.eventCreated,
    p_livemode: input.livemode,
    p_subscription_id: input.subscriptionId,
    p_customer_id: input.customerId,
    p_checkout_session_id: input.checkoutSessionId ?? "",
    p_subject_id: input.subjectId,
    p_tenant_id: input.tenantId,
    p_app_slug: input.appSlug,
    p_plan_id: input.planId,
    p_billing_interval: input.billingInterval,
    p_deployment_model: input.deploymentModel,
    p_stripe_status: input.stripeStatus,
    p_access_status: input.accessStatus,
    p_currency: input.currency,
    p_unit_amount: input.unitAmount,
    p_quantity: input.quantity,
    p_current_period_end: input.currentPeriodEnd ?? 0,
    p_cancel_at: input.cancelAt ?? 0,
  });
}

export async function applyDurableApplicationReversal(input: {
  eventId: string;
  eventType: string;
  eventObjectId: string;
  payloadSha256: string;
  eventCreated: number;
  livemode: boolean;
  subscriptionId?: string;
  reversalStatus: "full_refund" | "partial_refund_review" | "dispute_open" | "dispute_closed_review";
}) {
  return rpc<Record<string, unknown>>("obserra_applications_apply_reversal", {
    p_event_id: input.eventId,
    p_event_type: input.eventType,
    p_event_object_id: input.eventObjectId,
    p_payload_sha256: input.payloadSha256,
    p_event_created: input.eventCreated,
    p_livemode: input.livemode,
    p_subscription_id: input.subscriptionId ?? "",
    p_reversal_status: input.reversalStatus,
  });
}
