import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";
import { FloridaClassDMakeupError, floridaClassDMakeupEnabled } from "./florida-class-d-makeup";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StaffActor = { userId: string; role: FloridaClassDStaffRole };

export type FloridaClassDMakeupCertificationResult = {
  assignmentId: string;
  certifiedMinutes: number;
  dayInstructionalMinutesAfterReconciliation: number;
  courseInstructionalMinutesAfterReconciliation: number;
  instructionTimeEntryId: string;
  attendanceEntryId: string;
  idempotentReplay: boolean;
};

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDMakeupError("Class D make-up persistence is not configured.", 503, "FDACS_MAKEUP_PERSISTENCE_NOT_CONFIGURED");
  }
  return { key, url };
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new FloridaClassDMakeupError(`Invalid ${field}.`, 400, "FDACS_MAKEUP_INVALID_IDENTIFIER");
  }
}

function requireStaff(actor: StaffActor) {
  if (!["instructor", "school_admin", "compliance_admin"].includes(actor.role)) {
    throw new FloridaClassDMakeupError("Class D make-up certification requires authorized staff.", 403, "FDACS_MAKEUP_STAFF_REQUIRED");
  }
}

function requireIsoTimestamp(value: string, field: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new FloridaClassDMakeupError(`Invalid ${field}.`, 400, "FDACS_MAKEUP_INVALID_EVIDENCE_TIME");
  }
  return new Date(parsed).toISOString();
}

async function rpc<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDMakeupError("Class D make-up certification returned an invalid response.", 502, "FDACS_MAKEUP_CERTIFICATION_INVALID_RESPONSE");
    }
  }

  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDMakeupError(
      typeof record?.message === "string" ? record.message : "Class D make-up certification failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_MAKEUP_CERTIFICATION_FAILED",
    );
  }

  return payload as T;
}

export async function certifyFloridaClassDMakeupAtomic(actor: StaffActor, input: {
  assignmentId: string;
  certifiedMinutes: number;
  evidenceReference: string;
  evidenceStartedAt: string;
  evidenceEndedAt: string;
  idempotencyKey: string;
  correlationId: string;
}) {
  requireStaff(actor);
  if (!floridaClassDMakeupEnabled()) {
    throw new FloridaClassDMakeupError("Florida Class D make-up administration is not enabled.", 503, "FDACS_MAKEUP_NOT_ENABLED");
  }

  requireUuid(input.assignmentId, "assignment id");
  requireUuid(input.correlationId, "correlation id");
  if (!Number.isInteger(input.certifiedMinutes) || input.certifiedMinutes < 1 || input.certifiedMinutes > 480) {
    throw new FloridaClassDMakeupError("Certified make-up minutes must be between 1 and 480.", 400, "FDACS_MAKEUP_INVALID_CERTIFIED_MINUTES");
  }

  const evidenceReference = input.evidenceReference.trim();
  if (evidenceReference.length < 3 || evidenceReference.length > 500) {
    throw new FloridaClassDMakeupError("A controlled evidence reference is required.", 400, "FDACS_MAKEUP_EVIDENCE_REFERENCE_REQUIRED");
  }

  if (input.idempotencyKey.trim().length < 12 || input.idempotencyKey.trim().length > 180) {
    throw new FloridaClassDMakeupError("A valid make-up certification idempotency key is required.", 400, "FDACS_MAKEUP_INVALID_IDEMPOTENCY_KEY");
  }

  const evidenceStartedAt = requireIsoTimestamp(input.evidenceStartedAt, "evidence start time");
  const evidenceEndedAt = requireIsoTimestamp(input.evidenceEndedAt, "evidence end time");
  if (Date.parse(evidenceEndedAt) < Date.parse(evidenceStartedAt)) {
    throw new FloridaClassDMakeupError("Evidence end time must not precede the start time.", 400, "FDACS_MAKEUP_INVALID_EVIDENCE_TIME");
  }

  const result = await rpc<FloridaClassDMakeupCertificationResult>("fdacs_class_d_certify_makeup_atomic", {
    p_assignment_id: input.assignmentId,
    p_certified_minutes: input.certifiedMinutes,
    p_evidence_reference: evidenceReference,
    p_evidence_started_at: evidenceStartedAt,
    p_evidence_ended_at: evidenceEndedAt,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_idempotency_key: input.idempotencyKey.trim(),
    p_correlation_id: input.correlationId,
  });

  if (!result?.assignmentId || result.assignmentId !== input.assignmentId) {
    throw new FloridaClassDMakeupError("Make-up certification response did not match the controlled assignment.", 502, "FDACS_MAKEUP_CERTIFICATION_RESPONSE_MISMATCH");
  }

  return result;
}
