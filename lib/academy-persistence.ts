import "server-only";

import { createHmac } from "node:crypto";

const COURSE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

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
  schemaVersion: "academy-durable-state-v1";
  operational: true;
  learnerStateRows: number;
  paymentEventRows: number;
  assessmentRecordRows: number;
  auditEventRows: number;
};

export type DurableAcademyAggregateMetrics = {
  learnerAccounts: number;
  enrollments: number;
  certificates: number;
  coursesByEnrollment: Record<string, number>;
  coursesByCertificate: Record<string, number>;
};

type AcademySupabaseConfig = { url: string; serviceRoleKey: string };

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

function academySupabaseConfig(): AcademySupabaseConfig {
  const rawUrl = process.env.OBSERRA_ACADEMY_SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = process.env.OBSERRA_ACADEMY_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "") ||
      !validServiceRoleKey(serviceRoleKey)
    ) {
      throw new Error("invalid");
    }
    return { url: url.origin, serviceRoleKey };
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
    console.error("Academy durable storage request unavailable", {
      operation: name,
      error: error instanceof Error ? error.name : "unknown",
    });
    throw new AcademyPersistenceError("Academy durable storage is unavailable.", "request-failed");
  });

  if (!response.ok) {
    console.error("Academy durable storage request rejected", { operation: name, status: response.status });
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
  if (
    value?.schemaVersion !== "academy-durable-state-v1" ||
    value.operational !== true ||
    !Number.isSafeInteger(Number(value.learnerStateRows)) ||
    !Number.isSafeInteger(Number(value.paymentEventRows)) ||
    !Number.isSafeInteger(Number(value.assessmentRecordRows)) ||
    !Number.isSafeInteger(Number(value.auditEventRows))
  ) {
    throw new AcademyPersistenceError("Academy durable storage health is invalid.", "invalid-response");
  }
  return value;
}

export async function durableAcademyAggregateMetrics() {
  return rpc<DurableAcademyAggregateMetrics>("academy_aggregate_metrics", {});
}

export async function durableAcademyState(userId: string, courseId: string) {
  if (!userId || !COURSE_ID_PATTERN.test(courseId)) return null;
  return rpc<DurableAcademyState | null>("academy_get_learner_state", {
    p_clerk_user_id: userId,
    p_course_slug: courseId,
  });
}

export async function recordPaidCheckout(input: {
  eventId: string;
  eventType: "checkout.session.completed" | "checkout.session.async_payment_succeeded";
  checkoutSessionId: string;
  paymentIntentId?: string;
  courseId: string;
  courseVersion: string;
  identityMode: "authenticated" | "guest-email";
  clerkUserId?: string;
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
      p_clerk_user_id: input.clerkUserId ?? "",
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
  clerkUserId: string;
  purchaserEmail?: string;
}) {
  requireCourseVersion(input.courseId, input.courseVersion);
  return rpc<DurableAcademyState>("academy_claim_paid_checkout", {
    p_checkout_session_id: input.checkoutSessionId,
    p_course_slug: input.courseId,
    p_course_version: input.courseVersion,
    p_clerk_user_id: input.clerkUserId,
    p_purchaser_email_hash: input.purchaserEmail ? purchaserEmailHash(input.purchaserEmail) : "",
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
  requireCourseVersion(input.courseId, input.courseVersion);
  return rpc<DurableAcademyState>("academy_import_legacy_state", {
    p_clerk_user_id: input.userId,
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

export async function completeDurableLesson(input: {
  userId: string;
  courseId: string;
  lessonIndex: number;
  lessonCount: number;
  courseVersion: string;
}) {
  requireCourseVersion(input.courseId, input.courseVersion);
  return rpc<DurableAcademyState>("academy_complete_lesson", {
    p_clerk_user_id: input.userId,
    p_course_slug: input.courseId,
    p_lesson_index: input.lessonIndex,
    p_lesson_count: input.lessonCount,
    p_course_version: input.courseVersion,
  });
}

export async function recordDurableAssessment(input: {
  userId: string;
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
    p_clerk_user_id: input.userId,
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
