import "server-only";

import Stripe from "stripe";
import { getStripe } from "./stripe";
import {
  FloridaClassDPersistenceError,
  floridaClassDPersistenceRequest,
} from "./florida-class-d-persistence";
import {
  floridaClassDNonProductionExecutionAuthorized,
  floridaClassDProductionActivationAuthorized,
  floridaClassDRegulatedExecutionAuthorized,
} from "./florida-class-d-production-activation";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDER_ERROR_PATTERN = /^[a-z0-9_]{3,100}$/;
const PROVIDER_SESSION_PATTERN = /^vs_[A-Za-z0-9_]{8,255}$/;
const RELEVANT_EVENTS = new Set([
  "identity.verification_session.processing",
  "identity.verification_session.requires_input",
  "identity.verification_session.verified",
  "identity.verification_session.canceled",
  "identity.verification_session.redacted",
]);

export const FLORIDA_CLASS_D_IDENTITY_CONSENT_VERSION = "2026-08-14-v1";

export class FloridaClassDIdentityVerificationError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDIdentityVerificationError";
  }
}

export type FloridaClassDIdentityVerificationStatus = {
  enrollmentId: string | null;
  enrollmentStatus?: string | null;
  identityStatus?: string | null;
  verificationSessionId?: string | null;
  provider?: "stripe_identity";
  providerStatus?: "requires_input" | "processing" | "verified" | "canceled" | "redacted" | null;
  documentCheckStatus?: "pending" | "verified" | "unverified" | null;
  selfieCheckStatus?: "pending" | "verified" | "unverified" | null;
  providerLivemode?: boolean | null;
  consentVersion?: string | null;
  consentedAt?: string | null;
  providerVerifiedAt?: string | null;
  instructorAttestationRecorded?: boolean;
  instructionalAccessGranted?: boolean;
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDAutomatedIdentityVerificationEnabled() {
  return enabled(process.env.OBSERRA_FDACS_IDENTITY_VERIFICATION_ENABLED);
}

function publicOrigin() {
  const configured = process.env.OBSERRA_FDACS_PUBLIC_ORIGIN?.trim() || "";
  try {
    const url = new URL(configured);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "")
    ) {
      throw new Error("invalid origin");
    }
    return url.origin;
  } catch {
    throw new FloridaClassDIdentityVerificationError(
      "The regulated identity return origin is not configured.",
      503,
      "FDACS_IDENTITY_RETURN_ORIGIN_NOT_CONFIGURED",
    );
  }
}

function requireIdentityExecution() {
  if (!floridaClassDAutomatedIdentityVerificationEnabled()) {
    throw new FloridaClassDIdentityVerificationError(
      "Automated identity verification is not enabled.",
      503,
      "FDACS_IDENTITY_VERIFICATION_NOT_ENABLED",
    );
  }
  if (!floridaClassDRegulatedExecutionAuthorized()) {
    throw new FloridaClassDIdentityVerificationError(
      "Regulated identity verification is not authorized in this environment.",
      503,
      "FDACS_IDENTITY_EXECUTION_NOT_AUTHORIZED",
    );
  }
}

function configuredStripeMode() {
  const key = process.env.STRIPE_SECRET_KEY?.trim() || "";
  if (!/^sk_(live|test)_[A-Za-z0-9_]+$/.test(key)) {
    throw new FloridaClassDIdentityVerificationError(
      "Stripe Identity is not configured.",
      503,
      "FDACS_STRIPE_IDENTITY_NOT_CONFIGURED",
    );
  }
  const livemode = key.startsWith("sk_live_");
  if (livemode && !floridaClassDProductionActivationAuthorized()) {
    throw new FloridaClassDIdentityVerificationError(
      "Live identity verification is unavailable until controlled production activation.",
      503,
      "FDACS_LIVE_IDENTITY_NOT_AUTHORIZED",
    );
  }
  if (!livemode && !floridaClassDNonProductionExecutionAuthorized()) {
    throw new FloridaClassDIdentityVerificationError(
      "Test identity verification is available only during authorized synthetic non-production execution.",
      503,
      "FDACS_TEST_IDENTITY_NOT_AUTHORIZED",
    );
  }
  return { livemode };
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new FloridaClassDIdentityVerificationError(
      `Invalid ${field}.`,
      400,
      "FDACS_IDENTITY_INVALID_IDENTIFIER",
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringId(value: unknown) {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.id === "string") return value.id;
  return null;
}

export async function getFloridaClassDIdentityVerificationStatus(
  actorClerkUserId: string,
) {
  const status = await floridaClassDPersistenceRequest<FloridaClassDIdentityVerificationStatus>(
    "rpc/fdacs_class_d_student_identity_verification_status",
    {
      method: "POST",
      body: JSON.stringify({ p_actor_clerk_user_id: actorClerkUserId }),
    },
  );
  return status;
}

export async function createFloridaClassDAutomatedIdentityVerification(input: {
  actorClerkUserId: string;
  enrollmentId: string;
  consentAccepted: boolean;
  consentVersion: string;
  correlationId: string;
}) {
  requireIdentityExecution();
  const mode = configuredStripeMode();
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.correlationId, "correlation id");
  if (!input.consentAccepted || input.consentVersion !== FLORIDA_CLASS_D_IDENTITY_CONSENT_VERSION) {
    throw new FloridaClassDIdentityVerificationError(
      "Current identity-verification consent is required.",
      400,
      "FDACS_IDENTITY_CONSENT_REQUIRED",
    );
  }

  const current = await getFloridaClassDIdentityVerificationStatus(input.actorClerkUserId);
  if (current.enrollmentId !== input.enrollmentId) {
    throw new FloridaClassDIdentityVerificationError(
      "The identity-verification enrollment is unavailable.",
      404,
      "FDACS_IDENTITY_ENROLLMENT_NOT_FOUND",
    );
  }
  if (current.instructorAttestationRecorded || current.identityStatus === "verified") {
    return {
      status: "verified" as const,
      url: null,
      verificationSessionId: current.verificationSessionId ?? null,
      providerLivemode: current.providerLivemode ?? mode.livemode,
    };
  }
  if (!["pending_identity", "pending_entitlement"].includes(current.enrollmentStatus ?? "")) {
    throw new FloridaClassDIdentityVerificationError(
      "This enrollment is not eligible for identity verification.",
      409,
      "FDACS_IDENTITY_ENROLLMENT_NOT_ELIGIBLE",
    );
  }

  const retryable = current.providerStatus === "canceled" || current.providerStatus === "redacted";
  const idempotencyKey = retryable
    ? `fdacs-class-d-identity-v1-${input.enrollmentId}-${input.correlationId}`
    : `fdacs-class-d-identity-v1-${input.enrollmentId}`;
  const stripe = getStripe();
  const session = await stripe.identity.verificationSessions.create(
    {
      type: "document",
      return_url: `${publicOrigin()}/florida-security-training/identity?provider_return=1`,
      options: {
        document: {
          allowed_types: ["driving_license", "id_card", "passport"],
          require_matching_selfie: true,
        },
      },
    },
    { idempotencyKey },
  );

  if (!PROVIDER_SESSION_PATTERN.test(session.id) || !session.url) {
    throw new FloridaClassDIdentityVerificationError(
      "Stripe Identity did not return a valid hosted verification session.",
      502,
      "FDACS_IDENTITY_PROVIDER_RESPONSE_INVALID",
    );
  }

  const verificationSessionId = await floridaClassDPersistenceRequest<string>(
    "rpc/fdacs_class_d_register_identity_verification_session",
    {
      method: "POST",
      body: JSON.stringify({
        p_enrollment_id: input.enrollmentId,
        p_provider_session_id: session.id,
        p_provider_livemode: session.livemode,
        p_consent_version: input.consentVersion,
        p_consented_at: new Date().toISOString(),
        p_actor_clerk_user_id: input.actorClerkUserId,
        p_correlation_id: input.correlationId,
      }),
    },
  );

  return {
    status: session.status,
    url: session.url,
    verificationSessionId,
    providerLivemode: session.livemode,
  };
}

function normalizedProviderOutcome(session: Record<string, unknown>) {
  const rawStatus = typeof session.status === "string" ? session.status : "";
  const status = ["requires_input", "processing", "verified", "canceled", "redacted"].includes(rawStatus)
    ? rawStatus as "requires_input" | "processing" | "verified" | "canceled" | "redacted"
    : null;
  if (!status) {
    throw new FloridaClassDIdentityVerificationError(
      "Stripe Identity returned an unsupported verification status.",
      400,
      "FDACS_IDENTITY_PROVIDER_STATUS_UNSUPPORTED",
    );
  }

  const lastError = isRecord(session.last_error) ? session.last_error : null;
  const providerError = typeof lastError?.code === "string" && PROVIDER_ERROR_PATTERN.test(lastError.code)
    ? lastError.code
    : null;
  const providerReportRef = stringId(session.last_verification_report);
  return {
    status,
    documentCheckStatus: status === "verified" ? "verified" : status === "processing" ? "pending" : "unverified",
    selfieCheckStatus: status === "verified" ? "verified" : status === "processing" ? "pending" : "unverified",
    providerReportRef,
    providerError,
  } as const;
}

export async function recordFloridaClassDStripeIdentityWebhook(
  rawBody: string,
  stripeSignature: string,
) {
  requireIdentityExecution();
  const mode = configuredStripeMode();
  const webhookSecret = process.env.STRIPE_IDENTITY_WEBHOOK_SECRET?.trim() || "";
  if (!/^whsec_[A-Za-z0-9_]+$/.test(webhookSecret)) {
    throw new FloridaClassDIdentityVerificationError(
      "Stripe Identity webhook verification is not configured.",
      503,
      "FDACS_IDENTITY_WEBHOOK_NOT_CONFIGURED",
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
  } catch {
    throw new FloridaClassDIdentityVerificationError(
      "Invalid Stripe Identity webhook signature.",
      400,
      "FDACS_IDENTITY_WEBHOOK_SIGNATURE_INVALID",
    );
  }
  if (!RELEVANT_EVENTS.has(event.type)) {
    return { received: true, handled: false, eventId: event.id };
  }
  if (event.livemode !== mode.livemode) {
    throw new FloridaClassDIdentityVerificationError(
      "Stripe Identity webhook mode does not match the authorized runtime.",
      409,
      "FDACS_IDENTITY_WEBHOOK_MODE_MISMATCH",
    );
  }

  const session = isRecord(event.data.object) ? event.data.object : null;
  if (!session || typeof session.id !== "string" || !PROVIDER_SESSION_PATTERN.test(session.id)) {
    throw new FloridaClassDIdentityVerificationError(
      "Stripe Identity webhook payload is invalid.",
      400,
      "FDACS_IDENTITY_WEBHOOK_PAYLOAD_INVALID",
    );
  }
  const outcome = normalizedProviderOutcome(session);
  if (outcome.status === "verified" && !outcome.providerReportRef) {
    throw new FloridaClassDIdentityVerificationError(
      "Verified Stripe Identity evidence is missing its report reference.",
      409,
      "FDACS_IDENTITY_REPORT_REFERENCE_REQUIRED",
    );
  }

  const result = await floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_record_identity_verification_outcome",
    {
      method: "POST",
      body: JSON.stringify({
        p_provider_event_id: event.id,
        p_provider_session_id: session.id,
        p_status: outcome.status,
        p_document_check_status: outcome.documentCheckStatus,
        p_selfie_check_status: outcome.selfieCheckStatus,
        p_provider_report_ref: outcome.providerReportRef,
        p_provider_error_code: outcome.providerError,
        p_provider_occurred_at: new Date(event.created * 1000).toISOString(),
        p_correlation_id: crypto.randomUUID(),
      }),
    },
  );
  return { received: true, handled: true, eventId: event.id, result };
}

export async function getFloridaClassDInstructorIdentityReviewContext(input: {
  enrollmentId: string;
  liveSessionId: string;
  actorClerkUserId: string;
  correlationId: string;
}) {
  requireIdentityExecution();
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  return floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_instructor_identity_review_context",
    {
      method: "POST",
      body: JSON.stringify({
        p_enrollment_id: input.enrollmentId,
        p_live_session_id: input.liveSessionId,
        p_actor_clerk_user_id: input.actorClerkUserId,
        p_correlation_id: input.correlationId,
      }),
    },
  );
}

export async function recordFloridaClassDDailyIdentityCheckin(input: {
  enrollmentId: string;
  anchorLiveSessionId: string;
  identityAttestationId: string;
  instructorFileId: string;
  actorClerkUserId: string;
  attestedAt: string;
  correlationId: string;
}) {
  requireIdentityExecution();
  for (const [value, field] of [
    [input.enrollmentId, "enrollment id"],
    [input.anchorLiveSessionId, "live session id"],
    [input.identityAttestationId, "identity attestation id"],
    [input.instructorFileId, "instructor file id"],
    [input.correlationId, "correlation id"],
  ] as const) requireUuid(value, field);
  return floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_record_daily_identity_checkin",
    {
      method: "POST",
      body: JSON.stringify({
        p_enrollment_id: input.enrollmentId,
        p_anchor_live_session_id: input.anchorLiveSessionId,
        p_identity_attestation_id: input.identityAttestationId,
        p_instructor_file_id: input.instructorFileId,
        p_actor_clerk_user_id: input.actorClerkUserId,
        p_attested_at: input.attestedAt,
        p_correlation_id: input.correlationId,
      }),
    },
  );
}

export async function recordFloridaClassDInstructorIdentityAttestation(input: {
  enrollmentId: string;
  verificationSessionId: string;
  instructorFileId: string;
  observedPhotoIdType: "state_driver_license" | "state_identification_card" | "us_passport" | "federal_photo_identification";
  issuingJurisdiction: string;
  actorClerkUserId: string;
  attestedAt: string;
  acceptanceRunId?: string | null;
  correlationId: string;
}) {
  requireIdentityExecution();
  for (const [value, field] of [
    [input.enrollmentId, "enrollment id"],
    [input.verificationSessionId, "verification session id"],
    [input.instructorFileId, "instructor file id"],
    [input.correlationId, "correlation id"],
  ] as const) requireUuid(value, field);
  if (input.acceptanceRunId) requireUuid(input.acceptanceRunId, "acceptance run id");
  if (!/^[A-Z]{2,3}$/.test(input.issuingJurisdiction.trim().toUpperCase())) {
    throw new FloridaClassDIdentityVerificationError(
      "The issuing jurisdiction must be a U.S. state, territory, or federal code.",
      400,
      "FDACS_IDENTITY_JURISDICTION_INVALID",
    );
  }
  return floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_record_instructor_identity_attestation",
    {
      method: "POST",
      body: JSON.stringify({
        p_enrollment_id: input.enrollmentId,
        p_verification_session_id: input.verificationSessionId,
        p_instructor_file_id: input.instructorFileId,
        p_observed_photo_id_type: input.observedPhotoIdType,
        p_issuing_jurisdiction: input.issuingJurisdiction.trim().toUpperCase(),
        p_actor_clerk_user_id: input.actorClerkUserId,
        p_attested_at: input.attestedAt,
        p_acceptance_run_id: input.acceptanceRunId ?? null,
        p_correlation_id: input.correlationId,
      }),
    },
  );
}

export async function recordFloridaClassDDailyAttendanceAttestation(input: {
  enrollmentId: string;
  anchorLiveSessionId: string;
  attendanceEntryId: string;
  identityAttestationId: string;
  instructorFileId: string;
  actorClerkUserId: string;
  attestedAt: string;
  correlationId: string;
}) {
  requireIdentityExecution();
  for (const [value, field] of [
    [input.enrollmentId, "enrollment id"],
    [input.anchorLiveSessionId, "live session id"],
    [input.attendanceEntryId, "attendance entry id"],
    [input.identityAttestationId, "identity attestation id"],
    [input.instructorFileId, "instructor file id"],
    [input.correlationId, "correlation id"],
  ] as const) requireUuid(value, field);
  return floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_record_daily_attendance_attestation",
    {
      method: "POST",
      body: JSON.stringify({
        p_enrollment_id: input.enrollmentId,
        p_anchor_live_session_id: input.anchorLiveSessionId,
        p_attendance_entry_id: input.attendanceEntryId,
        p_identity_attestation_id: input.identityAttestationId,
        p_instructor_file_id: input.instructorFileId,
        p_actor_clerk_user_id: input.actorClerkUserId,
        p_attested_at: input.attestedAt,
        p_correlation_id: input.correlationId,
      }),
    },
  );
}

export function floridaClassDIdentityErrorStatus(error: unknown) {
  if (error instanceof FloridaClassDIdentityVerificationError || error instanceof FloridaClassDPersistenceError) {
    return { status: error.status, message: error.message, code: error.code };
  }
  return null;
}
