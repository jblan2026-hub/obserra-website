import "server-only";

import { createHmac } from "node:crypto";
import { academyCommerceStorageReady } from "./academy-payment";
import { requireSupabaseProjectOrigin } from "./supabase-project-origin";

const COURSE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const ACADEMY_PERSISTENCE_GATEWAY_PATH = "/functions/v1/academy-persistence-gateway";

/**
 * Persistence compatibility boundary.
 *
 * The deployed Academy schema predates the Supabase identity cutover and still names
 * its canonical learner key `clerk_user_id` / `p_clerk_user_id`. During the runtime
 * migration that legacy field stores the Obserra Academy canonical `principalId`.
 * No Clerk semantics are inferred from this field. A separate expand/contract database
 * migration will rename the column and RPC arguments after runtime identity is stable.
 */
export type DurableAcademyState = {
  clerk_user_id: string;
  course_slug: string;
  access_status: "active" | "refunded" | "revoked";
  enrolled_at: string;
  payment_reference: string;
  completed_lessons: number[];
  assessment_score: number | string | null;
  completed_at: string | null;
  certificate_id: string | null;
  signed_certificate: Record<string, unknown> | null;
  course_version: string;
  record_version: number;
  created_at: string;
  updated_at: string;
};

export type AcademyStorageHealth = {
  schemaVersion: "academy-durable-state-v2";
  operational: true;
  learnerStateRows: number;
  paymentEventRows: number;
  assessmentRecordRows: number;
  auditEventRows: number;
  paymentReversalRows: number;
  checkoutAttemptRows: number;
  reversalGuard: "enabled";
  checkoutSerialization: "purchaser-course-entitlement-revision-v1";
};

export type DurableAcademyAggregateMetrics = {
  learnerAccounts: number;
  enrollments: number;
  certificates: number;
  coursesByEnrollment: Record<string, number>;
  coursesByCertificate: Record<string, number>;
};

type AcademyDirectSupabaseConfig = {
  mode: "direct";
  url: string;
  serviceRoleKey: string;
  legacyJwt: boolean;
};

type AcademyWorkloadSupabaseConfig = {
  mode: "workload";
  url: string;
  gatewayUrl: string;
  oidcToken: string;
};

type AcademySupabaseConfig = AcademyDirectSupabaseConfig | AcademyWorkloadSupabaseConfig;

export class AcademyPersistenceError extends Error {
  constructor(
    message: string,
    readonly code: "configuration-required" | "request-failed" | "invalid-response",
    readonly status = 503,
  ) {
    super(message);
    this.name = "AcademyPersistenceError";
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

function validVercelOidcToken(value: string) {
  const parts = value.split(".");
  return parts.length === 3 && value.length >= 128 && value.length <= 16_384;
}

function academySupabaseConfig(): AcademySupabaseConfig {
  const rawUrl = process.env.OBSERRA_ACADEMY_SUPABASE_URL?.trim() ?? "";
  const rawProjectRef = process.env.OBSERRA_ACADEMY_SUPABASE_PROJECT_REF?.trim() ?? "";
  const serviceRoleKey = process.env.OBSERRA_ACADEMY_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim() ?? "";
  const vercelProduction = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

  try {
    const { origin: url } = requireSupabaseProjectOrigin(rawUrl, rawProjectRef);

    // Vercel production must use short-lived workload identity. Do not silently
    // fall back to a long-lived database administrator credential in that trust zone.
    if (vercelProduction) {
      if (!validVercelOidcToken(oidcToken)) throw new Error("oidc-unavailable");
      return {
        mode: "workload",
        url,
        gatewayUrl: `${url}${ACADEMY_PERSISTENCE_GATEWAY_PATH}`,
        oidcToken,
      };
    }

    if (!validServiceRoleKey(serviceRoleKey)) throw new Error("service-key-unavailable");
    return {
      mode: "direct",
      url,
      serviceRoleKey,
      legacyJwt: legacyJwtIsServiceRole(serviceRoleKey),
    };
  } catch {
    throw new AcademyPersistenceError(
      "Academy durable storage is not configured.",
      "configuration-required",
    );
  }
}

export function academyPersistenceConfigured() {
  try {
    academySupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

async function rpc<ResponseBody>(name: string, body: Record<string, unknown>): Promise<ResponseBody> {
  const config = academySupabaseConfig();
  const directHeaders: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  let endpoint: string;
  let requestBody: Record<string, unknown>;

  if (config.mode === "workload") {
    endpoint = config.gatewayUrl;
    requestBody = { operation: name, body };
    directHeaders.authorization = `Bearer ${config.oidcToken}`;
  } else {
    endpoint = `${config.url}/rest/v1/rpc/${name}`;
    requestBody = body;
    directHeaders.apikey = config.serviceRoleKey;
    // Modern sb_secret_ keys are API keys, not JWTs. Only legacy service_role
    // credentials belong in Authorization: Bearer.
    if (config.legacyJwt) directHeaders.authorization = `Bearer ${config.serviceRoleKey}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: directHeaders,
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(10_000),
  }).catch((error) => {
    console.error("Academy durable storage request unavailable", {
      operation: name,
      transport: config.mode,
      error: error instanceof Error ? error.name : "unknown",
    });
    throw new AcademyPersistenceError("Academy durable storage is unavailable.", "request-failed");
  });

  if (!response.ok) {
    console.error("Academy durable storage request rejected", {
      operation: name,
      transport: config.mode,
      status: response.status,
    });
    throw new AcademyPersistenceError(
      "Academy durable storage rejected the operation.",
      "request-failed",
      response.status,
    );
  }

  try {
    return await response.json() as ResponseBody;
  } catch {
    throw new AcademyPersistenceError("Academy durable storage returned an invalid response.", "invalid-response");
  }
}

function requireCourseVersion(courseId: string, courseVersion: string) {
  if (!COURSE_ID_PATTERN.test(courseId) || !SEMVER_PATTERN.test(courseVersion)) {
    throw new AcademyPersistenceError("Academy course identity is invalid.", "invalid-response", 400);
  }
}

export function purchaserEmailHash(email: string) {
  const secret = process.env.OBSERRA_ACADEMY_EMAIL_HASH_SECRET?.trim() ?? "";
  const normalized = email.trim().toLowerCase();
  if (secret.length < 32 || !normalized || normalized.length > 320) {
    throw new AcademyPersistenceError(
      "Academy purchaser identity hashing is not configured.",
      "configuration-required",
    );
  }
  return createHmac("sha256", secret).update(normalized).digest("hex");
}

export function academyPurchaserHashConfigured() {
  return (process.env.OBSERRA_ACADEMY_EMAIL_HASH_SECRET?.trim() ?? "").length >= 32;
}

export async function academyStorageHealth() {
  const value = await rpc<AcademyStorageHealth>("academy_storage_health", {});
  if (!academyCommerceStorageReady(value)) {
    throw new AcademyPersistenceError("Academy durable storage health is invalid.", "invalid-response");
  }
  return value;
}

export async function durableAcademyAggregateMetrics() {
  return rpc<DurableAcademyAggregateMetrics>("academy_aggregate_metrics", {});
}

export function durableAcademyPrincipalId(state: DurableAcademyState) {
  return state.clerk_user_id;
}

export async function durableAcademyState(principalId: string, courseId: string) {
  if (!principalId || !COURSE_ID_PATTERN.test(courseId)) return null;
  return rpc<DurableAcademyState | null>("academy_get_learner_state", {
    p_clerk_user_id: principalId,
    p_course_slug: courseId,
  });
}

export type AcademyCheckoutAttemptReservation = {
  attemptId: string;
  issuedAt: number;
  expiresAt: number;
  requestFingerprint: string | null;
  stripeSessionId: string | null;
  idempotentReplay: boolean;
  coalescedConcurrentAttempt: boolean;
};

export async function reserveAcademyCheckoutAttempt(input: {
  attemptId: string;
  purchaserReference: string;
  courseId: string;
  entitlementRevision: number;
  issuedAt: number;
  expiresAt: number;
}) {
  requireCourseVersion(input.courseId, "1.0.0");
  const value = await rpc<AcademyCheckoutAttemptReservation>("academy_reserve_checkout_attempt", {
    p_attempt_id: input.attemptId,
    p_purchaser_reference: input.purchaserReference,
    p_course_slug: input.courseId,
    p_entitlement_revision: input.entitlementRevision,
    p_issued_at: input.issuedAt,
    p_expires_at: input.expiresAt,
  });
  if (
    !value ||
    !/^[0-9a-f-]{36}$/.test(value.attemptId) ||
    !Number.isSafeInteger(Number(value.issuedAt)) ||
    !Number.isSafeInteger(Number(value.expiresAt)) ||
    (value.requestFingerprint !== null && !/^[0-9a-f]{64}$/.test(value.requestFingerprint)) ||
    (value.stripeSessionId !== null && !/^cs_(?:live|test)_[A-Za-z0-9_]+$/.test(value.stripeSessionId))
  ) throw new AcademyPersistenceError("Academy checkout reservation is invalid.", "invalid-response");
  return {
    ...value,
    issuedAt: Number(value.issuedAt),
    expiresAt: Number(value.expiresAt),
  };
}

export async function bindAcademyCheckoutAttempt(attemptId: string, requestFingerprint: string) {
  return rpc<{ attemptId: string; requestFingerprint: string; stripeSessionId: string | null }>(
    "academy_bind_checkout_attempt",
    { p_attempt_id: attemptId, p_request_fingerprint: requestFingerprint },
  );
}

export async function recordAcademyCheckoutSession(attemptId: string, stripeSessionId: string) {
  return rpc<{ attemptId: string; stripeSessionId: string; idempotentReplay: boolean }>(
    "academy_record_checkout_session",
    { p_attempt_id: attemptId, p_stripe_session_id: stripeSessionId },
  );
}

export async function recordPaidCheckout(input: {
  eventId: string;
  eventType: "checkout.session.completed" | "checkout.session.async_payment_succeeded";
  checkoutSessionId: string;
  paymentIntentId?: string;
  courseId: string;
  courseVersion: string;
  identityMode: "authenticated" | "guest-email";
  academyPrincipalId?: string;
  purchaserEmail?: string;
}) {
  requireCourseVersion(input.courseId, input.courseVersion);
  const purchaserHash = input.purchaserEmail ? purchaserEmailHash(input.purchaserEmail) : "";
  return rpc<{ state: "fulfilled" | "paid_pending_claim"; courseId: string; idempotentReplay: boolean }>(
    "academy_record_paid_checkout",
    {
      p_event_id: input.eventId,
      p_event_type: input.eventType,
      p_checkout_session_id: input.checkoutSessionId,
      p_payment_intent_id: input.paymentIntentId ?? "",
      p_course_slug: input.courseId,
      p_course_version: input.courseVersion,
      p_identity_mode: input.identityMode,
      p_clerk_user_id: input.academyPrincipalId ?? "",
      p_purchaser_email_hash: purchaserHash,
    },
  );
}

export async function recordAcademyPaymentReversal(input: {
  eventId: string;
  eventType: "charge.refunded" | "charge.dispute.created" | "charge.dispute.closed";
  providerObjectId: string;
  chargeId: string;
  paymentIntentId: string;
  checkoutSessionId: string;
  customerId: string;
  courseId: string;
  courseVersion: string;
  amountCaptured: number;
  amountReversed: number;
  currency: "usd";
  livemode: boolean;
  disposition: "full-refund" | "partial-refund-review" | "dispute-open" | "dispute-closed-review";
  targetAccessStatus: "refunded" | "revoked";
}) {
  requireCourseVersion(input.courseId, input.courseVersion);
  return rpc<{
    state: "applied" | "recorded-no-entitlement" | "manual-review-required";
    accessStatus: "refunded" | "revoked" | "unchanged";
    idempotentReplay: boolean;
  }>("academy_record_payment_reversal", {
    p_event_id: input.eventId,
    p_event_type: input.eventType,
    p_provider_object_id: input.providerObjectId,
    p_charge_id: input.chargeId,
    p_payment_intent_id: input.paymentIntentId,
    p_checkout_session_id: input.checkoutSessionId,
    p_customer_id: input.customerId,
    p_course_slug: input.courseId,
    p_course_version: input.courseVersion,
    p_amount_captured: input.amountCaptured,
    p_amount_reversed: input.amountReversed,
    p_currency: input.currency,
    p_livemode: input.livemode,
    p_disposition: input.disposition,
    p_target_access_status: input.targetAccessStatus,
  });
}

export async function claimPaidCheckout(input: {
  checkoutSessionId: string;
  courseId: string;
  courseVersion: string;
  academyPrincipalId: string;
  purchaserEmail?: string;
}) {
  requireCourseVersion(input.courseId, input.courseVersion);
  return rpc<DurableAcademyState>("academy_claim_paid_checkout", {
    p_checkout_session_id: input.checkoutSessionId,
    p_course_slug: input.courseId,
    p_course_version: input.courseVersion,
    p_clerk_user_id: input.academyPrincipalId,
    p_purchaser_email_hash: input.purchaserEmail ? purchaserEmailHash(input.purchaserEmail) : "",
  });
}

type AcademyStateProvisionInput = {
  principalId: string;
  courseId: string;
  courseVersion: string;
  enrolledAt: string;
  paymentReference: string;
  completedLessons: number[];
  assessmentScore?: number;
  completedAt?: string;
  certificateId?: string;
  signedCertificate?: Record<string, unknown>;
};

export async function provisionAcademyPrincipalState(input: AcademyStateProvisionInput) {
  requireCourseVersion(input.courseId, input.courseVersion);
  return rpc<DurableAcademyState>("academy_import_legacy_state", {
    p_clerk_user_id: input.principalId,
    p_course_slug: input.courseId,
    p_enrolled_at: input.enrolledAt,
    p_payment_reference: input.paymentReference,
    p_completed_lessons: input.completedLessons,
    p_assessment_score: input.assessmentScore ?? null,
    p_completed_at: input.completedAt ?? null,
    p_certificate_id: input.certificateId ?? "",
    p_signed_certificate: input.signedCertificate ?? null,
    p_course_version: input.courseVersion,
  });
}

export async function importLegacyAcademyState(input: {
  userId: string;
  courseId: string;
  courseVersion: string;
  enrolledAt: string;
  paymentReference: string;
  completedLessons: number[];
  assessmentScore?: number;
  completedAt?: string;
  certificateId?: string;
  signedCertificate?: Record<string, unknown>;
}) {
  return provisionAcademyPrincipalState({
    principalId: input.userId,
    courseId: input.courseId,
    courseVersion: input.courseVersion,
    enrolledAt: input.enrolledAt,
    paymentReference: input.paymentReference,
    completedLessons: input.completedLessons,
    assessmentScore: input.assessmentScore,
    completedAt: input.completedAt,
    certificateId: input.certificateId,
    signedCertificate: input.signedCertificate,
  });
}

export async function completeDurableLesson(input: {
  principalId: string;
  courseId: string;
  lessonIndex: number;
  lessonCount: number;
  courseVersion: string;
}) {
  requireCourseVersion(input.courseId, input.courseVersion);
  return rpc<DurableAcademyState>("academy_complete_lesson", {
    p_clerk_user_id: input.principalId,
    p_course_slug: input.courseId,
    p_lesson_index: input.lessonIndex,
    p_lesson_count: input.lessonCount,
    p_course_version: input.courseVersion,
  });
}

export async function recordDurableAssessment(input: {
  principalId: string;
  courseId: string;
  score: number;
  correctCount: number;
  questionCount: number;
  lessonCount: number;
  assessmentVersion: string;
  completedAt?: string;
  certificateId?: string;
  signedCertificate?: Record<string, unknown>;
}) {
  requireCourseVersion(input.courseId, input.assessmentVersion);
  return rpc<DurableAcademyState>("academy_record_assessment", {
    p_clerk_user_id: input.principalId,
    p_course_slug: input.courseId,
    p_score: input.score,
    p_correct_count: input.correctCount,
    p_question_count: input.questionCount,
    p_lesson_count: input.lessonCount,
    p_assessment_version: input.assessmentVersion,
    p_completed_at: input.completedAt ?? null,
    p_certificate_id: input.certificateId ?? "",
    p_signed_certificate: input.signedCertificate ?? null,
  });
}

export async function durableCertificate(certificateId: string) {
  return rpc<DurableAcademyState | null>("academy_find_certificate", {
    p_certificate_id: certificateId,
  });
}