import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";
import {
  FLORIDA_CLASS_D_ENROLLMENT_POLICY_VERSION,
  validateFloridaClassDAcknowledgments,
} from "./florida-class-d-enrollment-policy";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9._:-]{12,180}$/;

export class FloridaClassDPersistenceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDPersistenceError";
  }
}

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

type AttendanceRpcInput = {
  enrollmentId: string;
  day: 1 | 2 | 3 | 4 | 5;
  status: "present" | "partial" | "absent" | "makeup_required" | "made_up";
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  instructionalMinutesCredited: number;
  idempotencyKey: string;
  correlationId: string;
};

type InstructionTimeRpcInput = {
  enrollmentId: string;
  moduleId: number;
  startedAt: string;
  endedAt: string;
  creditedMinutes: number;
  source: "lms_session" | "instructor_attested_makeup";
  idempotencyKey: string;
  correlationId: string;
};

type PreEnrollmentInput = {
  legalName: string;
  dateOfBirth: string;
  cohortId: string;
  acceptedAcknowledgmentCodes: readonly string[];
  correlationId: string;
};

type IdentityVerificationInput = {
  studentIdentityId: string;
  status: "pending" | "verified" | "rejected";
  verificationReference?: string | null;
  correlationId: string;
};

type CohortAssignmentInput = {
  enrollmentId: string;
  cohortId: string;
  correlationId: string;
};

type EnrollmentReviewInput = {
  enrollmentId: string;
  outcome: "approved_pending_entitlement" | "needs_information" | "rejected";
  reviewNote?: string | null;
  correlationId: string;
};

function configuredServiceRoleKey() {
  return process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
}

function getConfig(): SupabaseConfig {
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  const serviceRoleKey = configuredServiceRoleKey();
  if (!serviceRoleKey) {
    throw new FloridaClassDPersistenceError(
      "Florida Class D regulated persistence is not configured.",
      503,
      "FDACS_PERSISTENCE_NOT_CONFIGURED",
    );
  }
  if (!url.startsWith("https://")) {
    throw new FloridaClassDPersistenceError(
      "Florida Class D regulated persistence URL is invalid.",
      503,
      "FDACS_PERSISTENCE_INVALID_URL",
    );
  }
  return { url, serviceRoleKey };
}

export function floridaClassDPersistenceConfigured() {
  return Boolean(configuredServiceRoleKey());
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new FloridaClassDPersistenceError(`Invalid ${field}.`, 400, "FDACS_INVALID_IDENTIFIER");
  }
}

function requireIdempotencyKey(value: string) {
  if (!IDEMPOTENCY_PATTERN.test(value)) {
    throw new FloridaClassDPersistenceError(
      "Invalid idempotency key.",
      400,
      "FDACS_INVALID_IDEMPOTENCY_KEY",
    );
  }
}

function requireIsoTimestamp(value: string, field: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new FloridaClassDPersistenceError(`Invalid ${field}.`, 400, "FDACS_INVALID_TIMESTAMP");
  }
}

function requireBirthDate(value: string) {
  if (!DATE_PATTERN.test(value)) {
    throw new FloridaClassDPersistenceError("Invalid date of birth.", 400, "FDACS_INVALID_DATE_OF_BIRTH");
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed >= new Date()) {
    throw new FloridaClassDPersistenceError("Invalid date of birth.", 400, "FDACS_INVALID_DATE_OF_BIRTH");
  }
}

function requireLegalName(value: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 200 || /[\u0000-\u001F\u007F]/.test(normalized)) {
    throw new FloridaClassDPersistenceError("Invalid legal name.", 400, "FDACS_INVALID_LEGAL_NAME");
  }
  return normalized;
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });

  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDPersistenceError(
        "Regulated persistence returned an invalid response.",
        502,
        "FDACS_PERSISTENCE_INVALID_RESPONSE",
      );
    }
  }
  if (!response.ok) {
    const error = payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload as Record<string, unknown>
      : null;
    throw new FloridaClassDPersistenceError(
      typeof error?.message === "string" ? error.message : "Regulated persistence operation failed.",
      response.status,
      typeof error?.code === "string" ? error.code : "FDACS_PERSISTENCE_OPERATION_FAILED",
    );
  }
  return payload as T;
}

/**
 * Server-only request boundary for the dedicated FDACS student-record project.
 * Callers must use narrowly scoped database RPCs for newly hardened tables.
 */
export async function floridaClassDPersistenceRequest<T>(path: string, init: RequestInit = {}) {
  return supabaseRequest<T>(path, init);
}

export async function recordFloridaClassDAttendance(
  actor: { userId: string; role: FloridaClassDStaffRole },
  input: AttendanceRpcInput,
) {
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.correlationId, "correlation id");
  requireIdempotencyKey(input.idempotencyKey);
  if (!Number.isInteger(input.instructionalMinutesCredited) || input.instructionalMinutesCredited < 0 || input.instructionalMinutesCredited > 480) {
    throw new FloridaClassDPersistenceError(
      "Instructional attendance credit must be between 0 and 480 minutes.",
      400,
      "FDACS_INVALID_ATTENDANCE_CREDIT",
    );
  }
  if (input.checkedInAt) requireIsoTimestamp(input.checkedInAt, "check-in time");
  if (input.checkedOutAt) requireIsoTimestamp(input.checkedOutAt, "check-out time");
  if (input.checkedInAt && input.checkedOutAt && Date.parse(input.checkedOutAt) < Date.parse(input.checkedInAt)) {
    throw new FloridaClassDPersistenceError(
      "Check-out may not precede check-in.",
      400,
      "FDACS_INVALID_ATTENDANCE_WINDOW",
    );
  }

  return supabaseRequest<string>("rpc/fdacs_class_d_record_attendance", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_day: input.day,
      p_status: input.status,
      p_checked_in_at: input.checkedInAt ?? null,
      p_checked_out_at: input.checkedOutAt ?? null,
      p_instructional_minutes_credited: input.instructionalMinutesCredited,
      p_actor_role: actor.role,
      p_actor_clerk_user_id: actor.userId,
      p_idempotency_key: input.idempotencyKey,
      p_correlation_id: input.correlationId,
    }),
  });
}

export async function recordFloridaClassDInstructionTime(
  actor: { userId: string; role: FloridaClassDStaffRole },
  input: InstructionTimeRpcInput,
) {
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.correlationId, "correlation id");
  requireIdempotencyKey(input.idempotencyKey);
  requireIsoTimestamp(input.startedAt, "start time");
  requireIsoTimestamp(input.endedAt, "end time");
  if (Date.parse(input.endedAt) < Date.parse(input.startedAt)) {
    throw new FloridaClassDPersistenceError(
      "Instruction end time may not precede start time.",
      400,
      "FDACS_INVALID_INSTRUCTION_WINDOW",
    );
  }
  if (!Number.isInteger(input.moduleId) || input.moduleId < 1 || input.moduleId > 18) {
    throw new FloridaClassDPersistenceError("Invalid module id.", 400, "FDACS_INVALID_MODULE");
  }
  if (!Number.isInteger(input.creditedMinutes) || input.creditedMinutes < 1 || input.creditedMinutes > 480) {
    throw new FloridaClassDPersistenceError(
      "Instructional credit must be between 1 and 480 minutes.",
      400,
      "FDACS_INVALID_INSTRUCTION_CREDIT",
    );
  }

  return supabaseRequest<string>("rpc/fdacs_class_d_record_instruction_time", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_module_id: input.moduleId,
      p_started_at: input.startedAt,
      p_ended_at: input.endedAt,
      p_credited_minutes: input.creditedMinutes,
      p_source: input.source,
      p_actor_role: actor.role,
      p_actor_clerk_user_id: actor.userId,
      p_idempotency_key: input.idempotencyKey,
      p_correlation_id: input.correlationId,
    }),
  });
}

export async function createFloridaClassDPreEnrollment(
  userId: string,
  input: PreEnrollmentInput,
) {
  const legalName = requireLegalName(input.legalName);
  requireBirthDate(input.dateOfBirth);
  requireUuid(input.cohortId, "cohort id");
  requireUuid(input.correlationId, "correlation id");
  if (!validateFloridaClassDAcknowledgments(input.acceptedAcknowledgmentCodes)) {
    throw new FloridaClassDPersistenceError(
      "All required enrollment acknowledgments must be accepted.",
      400,
      "FDACS_ACKNOWLEDGMENTS_INCOMPLETE",
    );
  }

  return supabaseRequest<string>("rpc/fdacs_class_d_create_pre_enrollment", {
    method: "POST",
    body: JSON.stringify({
      p_clerk_user_id: userId,
      p_legal_name: legalName,
      p_date_of_birth: input.dateOfBirth,
      p_cohort_id: input.cohortId,
      p_policy_version: FLORIDA_CLASS_D_ENROLLMENT_POLICY_VERSION,
      p_acknowledgments: input.acceptedAcknowledgmentCodes,
      p_correlation_id: input.correlationId,
    }),
  });
}

export async function setFloridaClassDIdentityVerification(
  actor: { userId: string; role: FloridaClassDStaffRole },
  input: IdentityVerificationInput,
) {
  requireUuid(input.studentIdentityId, "student identity id");
  requireUuid(input.correlationId, "correlation id");
  if (input.verificationReference && input.verificationReference.length > 500) {
    throw new FloridaClassDPersistenceError(
      "Verification reference is too long.",
      400,
      "FDACS_VERIFICATION_REFERENCE_TOO_LONG",
    );
  }
  return supabaseRequest<null>("rpc/fdacs_class_d_set_identity_verification", {
    method: "POST",
    body: JSON.stringify({
      p_student_identity_id: input.studentIdentityId,
      p_status: input.status,
      p_verification_reference: input.verificationReference ?? null,
      p_actor_role: actor.role,
      p_actor_clerk_user_id: actor.userId,
      p_correlation_id: input.correlationId,
    }),
  });
}

export async function assignFloridaClassDCohort(
  actor: { userId: string; role: FloridaClassDStaffRole },
  input: CohortAssignmentInput,
) {
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.cohortId, "cohort id");
  requireUuid(input.correlationId, "correlation id");
  return supabaseRequest<null>("rpc/fdacs_class_d_assign_cohort", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_cohort_id: input.cohortId,
      p_actor_role: actor.role,
      p_actor_clerk_user_id: actor.userId,
      p_correlation_id: input.correlationId,
    }),
  });
}

export async function reviewFloridaClassDEnrollment(
  actor: { userId: string; role: FloridaClassDStaffRole },
  input: EnrollmentReviewInput,
) {
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.correlationId, "correlation id");
  if (input.reviewNote && input.reviewNote.length > 4000) {
    throw new FloridaClassDPersistenceError(
      "Enrollment review note is too long.",
      400,
      "FDACS_REVIEW_NOTE_TOO_LONG",
    );
  }
  return supabaseRequest<string>("rpc/fdacs_class_d_review_enrollment", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_outcome: input.outcome,
      p_review_note: input.reviewNote ?? null,
      p_policy_version: FLORIDA_CLASS_D_ENROLLMENT_POLICY_VERSION,
      p_actor_role: actor.role,
      p_actor_clerk_user_id: actor.userId,
      p_correlation_id: input.correlationId,
    }),
  });
}

function tableQuery(table: string, filters: Record<string, string>) {
  const query = new URLSearchParams({ select: "*", ...filters });
  return `${table}?${query.toString()}`;
}

export async function getFloridaClassDEnrollmentStatusForUser(userId: string) {
  const query = new URLSearchParams({
    select: "id,status,cohort_id,student_identity_id,enrolled_at,created_at,updated_at",
    clerk_user_id: `eq.${userId}`,
    order: "created_at.desc",
    limit: "1",
  });
  const rows = await supabaseRequest<Record<string, unknown>[]>(
    `fdacs_class_d_enrollments?${query.toString()}`,
  );
  return rows[0] ?? null;
}

export async function listFloridaClassDPendingEnrollments() {
  const query = new URLSearchParams({
    select: "id,status,cohort_id,student_identity_id,created_at,fdacs_class_d_student_identities(id,legal_name,date_of_birth,identity_status)",
    or: "(status.eq.pending_identity,status.eq.pending_entitlement)",
    order: "created_at.asc",
    limit: "250",
  });
  return supabaseRequest<Record<string, unknown>[]>(
    `fdacs_class_d_enrollments?${query.toString()}`,
  );
}

export async function getFloridaClassDInspectionRecord(enrollmentId: string) {
  requireUuid(enrollmentId, "enrollment id");
  const enrollmentRows = await supabaseRequest<Record<string, unknown>[]>(
    tableQuery("fdacs_class_d_enrollments", { id: `eq.${enrollmentId}`, limit: "1" }),
  );
  const enrollment = enrollmentRows[0] ?? null;
  if (!enrollment) {
    throw new FloridaClassDPersistenceError("Enrollment not found.", 404, "FDACS_ENROLLMENT_NOT_FOUND");
  }

  const identityId = typeof enrollment.student_identity_id === "string" ? enrollment.student_identity_id : null;
  const enrollmentFilter = { enrollment_id: `eq.${enrollmentId}`, order: "created_at.asc" };
  const [identity, acknowledgments, reviews, attendance, instructionTime, moduleProgress, learningChecks, remediation, holds, audit] = await Promise.all([
    identityId && UUID_PATTERN.test(identityId)
      ? supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_student_identities", { id: `eq.${identityId}`, limit: "1" }))
      : Promise.resolve([]),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_student_acknowledgments", { enrollment_id: `eq.${enrollmentId}`, order: "accepted_at.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_enrollment_reviews", { enrollment_id: `eq.${enrollmentId}`, order: "reviewed_at.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_attendance_entries", enrollmentFilter)),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_instruction_time_entries", enrollmentFilter)),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_module_progress", { enrollment_id: `eq.${enrollmentId}`, order: "module_id.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_learning_check_results", { enrollment_id: `eq.${enrollmentId}`, order: "module_id.asc,attempt.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_remediation_records", { enrollment_id: `eq.${enrollmentId}`, order: "assigned_at.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_record_holds", { enrollment_id: `eq.${enrollmentId}`, order: "placed_at.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_audit_events", { enrollment_id: `eq.${enrollmentId}`, order: "occurred_at.asc" })),
  ]);

  return {
    schemaVersion: "1.1",
    generatedAt: new Date().toISOString(),
    enrollment,
    identity: identity[0] ?? null,
    acknowledgments,
    reviews,
    attendance,
    instructionTime,
    moduleProgress,
    learningChecks,
    remediation,
    holds,
    audit,
  };
}
