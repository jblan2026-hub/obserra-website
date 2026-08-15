import "server-only";

import { randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";
import { floridaClassDSupabaseServerConfigAuthorized } from "./florida-class-d-supabase-config";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FLORIDA_CLASS_D_COMPLETION_POLICY = {
  featureFlag: "OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED",
  requiredInstructionalMinutes: 2400,
  requiredTrainingDays: 5,
  requiredModuleChecks: 18,
  requiresVerifiedIdentity: true,
  requiresPassingExam: true,
  passingScore: 128,
  liasExecutionMode: "manual_queue_only",
  completionDoesNotEqualLicense: true,
} as const;

export type FloridaClassDCompletionReadiness = {
  enrollmentId: string;
  identityVerified: boolean;
  enrollmentStatus: string;
  moduleChecksComplete: boolean;
  completedModuleCount: number;
  verifiedInstructionalMinutes: number;
  instructionalHoursSatisfied: boolean;
  fiveTrainingDaysSatisfied: boolean;
  trainingDaysSatisfied: number;
  passedExamAttemptId: string | null;
  examPassed: boolean;
  openSecurityIssues: number;
  openExamAttempts: number;
  openRemediationItems: number;
  existingCompletionId: string | null;
  ready: boolean;
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDCompletionReviewEnabled() {
  return enabled(process.env.OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED);
}

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!floridaClassDSupabaseServerConfigAuthorized(url, key)) {
    throw new FloridaClassDExamError("Completion review service is not configured.", 503, "FDACS_COMPLETION_NOT_CONFIGURED");
  }
  return { key, url };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(
      typeof record?.message === "string" ? record.message : "Completion review request failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_COMPLETION_REQUEST_FAILED",
    );
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_COMPLETION_INVALID_IDENTIFIER");
}

export async function getFloridaClassDCompletionReadiness(enrollmentId: string) {
  requireUuid(enrollmentId, "enrollment id");
  const payload = await request<FloridaClassDCompletionReadiness | FloridaClassDCompletionReadiness[]>("rpc/fdacs_class_d_completion_readiness", {
    method: "POST",
    body: JSON.stringify({ p_enrollment_id: enrollmentId }),
  });
  const readiness = Array.isArray(payload) ? payload[0] : payload;
  if (!readiness || typeof readiness !== "object") {
    throw new FloridaClassDExamError("Completion readiness was not returned.", 502, "FDACS_COMPLETION_READINESS_INVALID");
  }
  return readiness;
}

export async function listFloridaClassDCompletionCandidates() {
  const attempts = await request<Array<{ enrollment_id: string }>>(
    "fdacs_class_d_exam_attempts?" + new URLSearchParams({
      select: "enrollment_id",
      status: "eq.passed",
      passed: "eq.true",
      order: "submitted_at.desc",
      limit: "100",
    }),
  );
  const enrollmentIds = [...new Set(attempts.map((attempt) => attempt.enrollment_id).filter((value) => UUID_PATTERN.test(value)))].slice(0, 50);
  return Promise.all(enrollmentIds.map((enrollmentId) => getFloridaClassDCompletionReadiness(enrollmentId)));
}

export async function approveFloridaClassDCompletion(
  actorUserId: string,
  input: { enrollmentId: string; reviewNote: string; correlationId?: string },
) {
  if (!floridaClassDCompletionReviewEnabled()) {
    throw new FloridaClassDExamError("Completion review is disabled.", 503, "FDACS_COMPLETION_DISABLED");
  }
  requireUuid(input.enrollmentId, "enrollment id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  const reviewNote = input.reviewNote.trim();
  if (reviewNote.length < 3 || reviewNote.length > 4000) {
    throw new FloridaClassDExamError("Completion review note is required.", 400, "FDACS_COMPLETION_NOTE_REQUIRED");
  }

  const readiness = await getFloridaClassDCompletionReadiness(input.enrollmentId);
  if (!readiness.ready) {
    throw new FloridaClassDExamError("Enrollment is not ready for successful completion.", 409, "FDACS_COMPLETION_NOT_READY");
  }

  const result = await request<string | Array<Record<string, unknown>>>("rpc/fdacs_class_d_approve_completion", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_actor_clerk_user_id: actorUserId,
      p_review_note: reviewNote,
      p_correlation_id: correlationId,
    }),
  });
  const value = typeof result === "string" ? result : Array.isArray(result) && result[0] ? Object.values(result[0])[0] : null;
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new FloridaClassDExamError("Completion record was not created correctly.", 502, "FDACS_COMPLETION_RESULT_INVALID");
  }
  return { completionRecordId: value, enrollmentId: input.enrollmentId, liasQueueStatus: "prepared", correlationId };
}

export async function listFloridaClassDLiasQueue() {
  return request<Array<Record<string, unknown>>>(
    "fdacs_class_d_lias_reporting_queue?" + new URLSearchParams({
      select: "id,completion_record_id,enrollment_id,status,prepared_at,submission_reference,submitted_at,confirmed_at,exception_note,correlation_id",
      order: "prepared_at.asc",
      limit: "100",
    }),
  );
}
