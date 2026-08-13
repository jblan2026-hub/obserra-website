import "server-only";

import { randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";

const DEFAULT_SUPABASE_URL = "https://nwxnyqlyzyufgoadtqxs.supabase.co";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FLORIDA_CLASS_D_RETEST_POLICY = {
  priorFailedAttemptPreserved: true,
  remediationDocumentationRequired: true,
  staffAuthorizationRequired: true,
  fixedWaitingPeriodDefinedInSource: false,
  fixedRetestCountDefinedInSource: false,
  priorScoresOverwritten: false,
  oneOpenAuthorizationPerEnrollment: true,
  authorizationConsumedByNextRetest: true,
} as const;

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDExamRetestAdminEnabled() {
  return enabled(process.env.OBSERRA_FDACS_CLASS_D_EXAM_ADMIN_ENABLED);
}

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) throw new FloridaClassDExamError("Exam retest administration is not configured.", 503, "FDACS_EXAM_RETEST_NOT_CONFIGURED");
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
    throw new FloridaClassDExamError(typeof record?.message === "string" ? record.message : "Exam retest administration failed.", response.status >= 500 ? 502 : response.status, typeof record?.code === "string" ? record.code : "FDACS_EXAM_RETEST_FAILED");
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_EXAM_RETEST_INVALID_IDENTIFIER");
}

export async function listFloridaClassDExamRetestCases() {
  return request<Array<Record<string, unknown>>>(`fdacs_class_d_exam_attempts?${new URLSearchParams({
    select: "id,enrollment_id,clerk_user_id,status,score,passed,started_at,submitted_at,retest_authorization_id",
    status: "eq.failed",
    order: "submitted_at.desc",
    limit: "100",
  })}`);
}

export async function listFloridaClassDExamRetestAuthorizations(enrollmentId?: string) {
  const params = new URLSearchParams({
    select: "id,enrollment_id,failed_attempt_id,status,remediation_summary,authorization_note,authorized_by_clerk_user_id,authorized_at,consumed_by_attempt_id,consumed_at,revoked_by_clerk_user_id,revoked_at,revocation_reason,correlation_id",
    order: "authorized_at.desc",
    limit: "100",
  });
  if (enrollmentId) {
    requireUuid(enrollmentId, "enrollment id");
    params.set("enrollment_id", `eq.${enrollmentId}`);
  }
  return request<Array<Record<string, unknown>>>(`fdacs_class_d_exam_retest_authorizations?${params}`);
}

export async function authorizeFloridaClassDExamRetest(
  actorUserId: string,
  input: { enrollmentId: string; failedAttemptId: string; remediationSummary: string; authorizationNote: string; correlationId?: string },
) {
  if (!floridaClassDExamRetestAdminEnabled()) throw new FloridaClassDExamError("Exam retest administration is disabled.", 503, "FDACS_EXAM_RETEST_DISABLED");
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.failedAttemptId, "failed attempt id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  if (input.remediationSummary.trim().length < 3) throw new FloridaClassDExamError("Documented remediation is required.", 400, "FDACS_EXAM_RETEST_REMEDIATION_REQUIRED");
  if (input.authorizationNote.trim().length < 3) throw new FloridaClassDExamError("Authorization note is required.", 400, "FDACS_EXAM_RETEST_NOTE_REQUIRED");

  const result = await request<unknown>("rpc/fdacs_class_d_authorize_exam_retest", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_failed_attempt_id: input.failedAttemptId,
      p_actor_clerk_user_id: actorUserId,
      p_remediation_summary: input.remediationSummary.trim(),
      p_authorization_note: input.authorizationNote.trim(),
      p_correlation_id: correlationId,
    }),
  });
  const authorizationId = typeof result === "string" ? result : Array.isArray(result) && typeof result[0] === "string" ? result[0] : null;
  if (!authorizationId || !UUID_PATTERN.test(authorizationId)) throw new FloridaClassDExamError("Retest authorization was not created correctly.", 502, "FDACS_EXAM_RETEST_AUTHORIZATION_INVALID");
  return { authorizationId, status: "authorized", correlationId };
}

export async function revokeFloridaClassDExamRetest(
  actorUserId: string,
  input: { authorizationId: string; reason: string; correlationId?: string },
) {
  if (!floridaClassDExamRetestAdminEnabled()) throw new FloridaClassDExamError("Exam retest administration is disabled.", 503, "FDACS_EXAM_RETEST_DISABLED");
  requireUuid(input.authorizationId, "authorization id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  if (input.reason.trim().length < 3) throw new FloridaClassDExamError("Revocation reason is required.", 400, "FDACS_EXAM_RETEST_REVOCATION_REASON_REQUIRED");

  await request("rpc/fdacs_class_d_revoke_exam_retest", {
    method: "POST",
    body: JSON.stringify({
      p_authorization_id: input.authorizationId,
      p_actor_clerk_user_id: actorUserId,
      p_reason: input.reason.trim(),
      p_correlation_id: correlationId,
    }),
  });
  return { authorizationId: input.authorizationId, status: "revoked", correlationId };
}
