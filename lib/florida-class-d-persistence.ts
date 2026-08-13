import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";

const DEFAULT_SUPABASE_URL = "https://nwxnyqlyzyufgoadtqxs.supabase.co";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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

function configuredServiceRoleKey() {
  return (
    process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  );
}

function getConfig(): SupabaseConfig {
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
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
  const payload = raw ? JSON.parse(raw) as unknown : null;
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

function tableQuery(table: string, filters: Record<string, string>) {
  const query = new URLSearchParams({ select: "*", ...filters });
  return `${table}?${query.toString()}`;
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
  const [identity, attendance, instructionTime, moduleProgress, learningChecks, remediation, holds, audit] = await Promise.all([
    identityId && UUID_PATTERN.test(identityId)
      ? supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_student_identities", { id: `eq.${identityId}`, limit: "1" }))
      : Promise.resolve([]),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_attendance_entries", enrollmentFilter)),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_instruction_time_entries", enrollmentFilter)),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_module_progress", { enrollment_id: `eq.${enrollmentId}`, order: "module_id.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_learning_check_results", { enrollment_id: `eq.${enrollmentId}`, order: "module_id.asc,attempt.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_remediation_records", { enrollment_id: `eq.${enrollmentId}`, order: "assigned_at.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_record_holds", { enrollment_id: `eq.${enrollmentId}`, order: "placed_at.asc" })),
    supabaseRequest<Record<string, unknown>[]>(tableQuery("fdacs_class_d_audit_events", { enrollment_id: `eq.${enrollmentId}`, order: "occurred_at.asc" })),
  ]);

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    enrollment,
    identity: identity[0] ?? null,
    attendance,
    instructionTime,
    moduleProgress,
    learningChecks,
    remediation,
    holds,
    audit,
  };
}
