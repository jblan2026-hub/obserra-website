import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";
import {
  getFloridaClassDInstructorLicenseNumber,
  getFloridaClassDSchoolLicenseNumber,
} from "./florida-class-d-live-policy";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_RECORDED_MAKEUP_MINUTES = 600;
const MAX_DAILY_INSTRUCTIONAL_MINUTES = 480;
const MAX_COURSE_INSTRUCTIONAL_MINUTES = 2400;

export type FloridaClassDMakeupMethod = "live_makeup" | "recorded_makeup";
export type FloridaClassDMakeupStatus = "assigned" | "in_progress" | "ready_for_review" | "certified" | "cancelled" | "failed";

export type FloridaClassDMakeupAssignment = {
  id: string;
  enrollment_id: string;
  training_day: number;
  module_id: number;
  source_live_session_id?: string | null;
  delivery_method: FloridaClassDMakeupMethod;
  assigned_minutes: number;
  reason: string;
  recording_asset_reference?: string | null;
  status: FloridaClassDMakeupStatus;
  certified_minutes: number;
  assigned_at?: string;
  evidence_reference?: string | null;
  evidence_started_at?: string | null;
  evidence_ended_at?: string | null;
};

export type FloridaClassDMakeupQuestion = {
  id: string;
  assignment_id: string;
  enrollment_id: string;
  question_text: string;
  asked_at?: string;
  answer_text?: string | null;
  answered_at?: string | null;
};

type StaffActor = { userId: string; role: FloridaClassDStaffRole };
type EnrollmentRow = { id: string; clerk_user_id: string; cohort_id: string; status: string };
type LiveTimeRow = { day?: number; instructional_presence_seconds?: number };

export class FloridaClassDMakeupError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
    this.name = "FloridaClassDMakeupError";
  }
}

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDMakeupEnabled() {
  return (
    enabled(process.env.OBSERRA_FDACS_CLASS_D_MAKEUP_ENABLED) &&
    process.env.OBSERRA_FDACS_DS_LICENSE_STATUS?.trim().toLowerCase() === "active" &&
    Boolean(getFloridaClassDInstructorLicenseNumber()) &&
    Boolean(getFloridaClassDSchoolLicenseNumber())
  );
}

export const FLORIDA_CLASS_D_MAKEUP_POLICY = {
  maximumRecordedMinutes: MAX_RECORDED_MAKEUP_MINUTES,
  maximumDailyInstructionalMinutes: MAX_DAILY_INSTRUCTIONAL_MINUTES,
  maximumCourseInstructionalMinutes: MAX_COURSE_INSTRUCTIONAL_MINUTES,
  originalLiveAttendanceRemainsImmutable: true,
  certificationMutationEnabledInThisGate: false,
  recordedPlaybackEnabledInThisGate: false,
  studentQuestionsRequiredForRecordedMakeup: true,
} as const;

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDMakeupError("Class D make-up persistence is not configured.", 503, "FDACS_MAKEUP_PERSISTENCE_NOT_CONFIGURED");
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
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDMakeupError("Class D make-up persistence returned an invalid response.", 502, "FDACS_MAKEUP_INVALID_RESPONSE");
    }
  }
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDMakeupError(
      typeof record?.message === "string" ? record.message : "Class D make-up operation failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_MAKEUP_PERSISTENCE_FAILED",
    );
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDMakeupError(`Invalid ${field}.`, 400, "FDACS_MAKEUP_INVALID_IDENTIFIER");
}

function requireStaff(actor: StaffActor) {
  if (!["instructor", "school_admin", "compliance_admin"].includes(actor.role)) {
    throw new FloridaClassDMakeupError("Class D make-up administration requires authorized staff.", 403, "FDACS_MAKEUP_STAFF_REQUIRED");
  }
}

async function getEnrollment(enrollmentId: string) {
  requireUuid(enrollmentId, "enrollment id");
  const query = new URLSearchParams({ select: "id,clerk_user_id,cohort_id,status", id: `eq.${enrollmentId}`, limit: "1" });
  const rows = await request<EnrollmentRow[]>(`fdacs_class_d_enrollments?${query}`);
  if (!rows[0]) throw new FloridaClassDMakeupError("Regulated enrollment was not found.", 404, "FDACS_MAKEUP_ENROLLMENT_NOT_FOUND");
  return rows[0];
}

async function insertAudit(input: {
  actorRole: "student" | FloridaClassDStaffRole;
  actorUserId: string;
  enrollmentId: string;
  entityId: string;
  action: string;
  correlationId: string;
  metadata: Record<string, unknown>;
}) {
  await request("fdacs_class_d_audit_events", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({
      actor_role: input.actorRole,
      actor_clerk_user_id: input.actorUserId,
      enrollment_id: input.enrollmentId,
      entity_type: "remediation",
      entity_id: input.entityId,
      action: input.action,
      correlation_id: input.correlationId,
      metadata: { recordType: "makeup_training", ...input.metadata },
    }),
  });
}

async function listEnrollmentAssignments(enrollmentId: string) {
  const query = new URLSearchParams({
    select: "id,enrollment_id,training_day,module_id,source_live_session_id,delivery_method,assigned_minutes,reason,recording_asset_reference,status,certified_minutes,assigned_at,evidence_reference,evidence_started_at,evidence_ended_at",
    enrollment_id: `eq.${enrollmentId}`,
    order: "created_at.desc",
    limit: "250",
  });
  return request<FloridaClassDMakeupAssignment[]>(`fdacs_class_d_makeup_assignments?${query}`);
}

function activeRecordedAssignedMinutes(assignments: FloridaClassDMakeupAssignment[]) {
  return assignments
    .filter((item) => item.delivery_method === "recorded_makeup" && !["cancelled", "failed"].includes(item.status))
    .reduce((total, item) => total + item.assigned_minutes, 0);
}

export async function assignFloridaClassDMakeup(actor: StaffActor, input: {
  enrollmentId: string;
  trainingDay: number;
  moduleId: number;
  sourceLiveSessionId?: string | null;
  deliveryMethod: FloridaClassDMakeupMethod;
  assignedMinutes: number;
  reason: string;
  recordingAssetReference?: string | null;
  assignedInstructorClerkUserId: string;
  correlationId: string;
}) {
  requireStaff(actor);
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.correlationId, "correlation id");
  if (input.sourceLiveSessionId) requireUuid(input.sourceLiveSessionId, "source live session id");
  if (!Number.isInteger(input.trainingDay) || input.trainingDay < 1 || input.trainingDay > 5) throw new FloridaClassDMakeupError("Training day must be between 1 and 5.", 400, "FDACS_MAKEUP_INVALID_DAY");
  if (!Number.isInteger(input.moduleId) || input.moduleId < 1 || input.moduleId > 18) throw new FloridaClassDMakeupError("Module must be between 1 and 18.", 400, "FDACS_MAKEUP_INVALID_MODULE");
  if (!Number.isInteger(input.assignedMinutes) || input.assignedMinutes < 1 || input.assignedMinutes > 480) throw new FloridaClassDMakeupError("Assigned make-up minutes must be between 1 and 480.", 400, "FDACS_MAKEUP_INVALID_MINUTES");
  if (input.reason.trim().length < 3 || input.reason.trim().length > 4000) throw new FloridaClassDMakeupError("A documented make-up reason is required.", 400, "FDACS_MAKEUP_REASON_REQUIRED");
  if (input.assignedInstructorClerkUserId.trim().length < 3) throw new FloridaClassDMakeupError("A Class DI instructor must be assigned.", 400, "FDACS_MAKEUP_INSTRUCTOR_REQUIRED");

  const enrollment = await getEnrollment(input.enrollmentId);
  if (["completed", "failed", "withdrawn"].includes(enrollment.status)) throw new FloridaClassDMakeupError("This enrollment is not eligible for a new make-up assignment.", 409, "FDACS_MAKEUP_ENROLLMENT_CLOSED");

  if (input.sourceLiveSessionId) {
    const query = new URLSearchParams({ select: "id,cohort_id,day", id: `eq.${input.sourceLiveSessionId}`, limit: "1" });
    const rows = await request<Array<{ id: string; cohort_id: string; day: number }>>(`fdacs_class_d_live_sessions?${query}`);
    if (!rows[0] || rows[0].cohort_id !== enrollment.cohort_id || rows[0].day !== input.trainingDay) {
      throw new FloridaClassDMakeupError("Source live session does not match the enrollment cohort and training day.", 409, "FDACS_MAKEUP_SESSION_MISMATCH");
    }
  }

  const before = await listEnrollmentAssignments(input.enrollmentId);
  if (input.deliveryMethod === "recorded_makeup" && activeRecordedAssignedMinutes(before) + input.assignedMinutes > MAX_RECORDED_MAKEUP_MINUTES) {
    throw new FloridaClassDMakeupError("Recorded make-up assignments may not exceed 600 minutes per student.", 409, "FDACS_MAKEUP_RECORDED_LIMIT");
  }

  const instructorLicenseNumber = getFloridaClassDInstructorLicenseNumber();
  const schoolLicenseNumber = getFloridaClassDSchoolLicenseNumber();
  if (!instructorLicenseNumber || !schoolLicenseNumber) throw new FloridaClassDMakeupError("Active Class DI and DS configuration is required.", 503, "FDACS_MAKEUP_LICENSE_CONFIGURATION_REQUIRED");

  const rows = await request<FloridaClassDMakeupAssignment[]>("fdacs_class_d_makeup_assignments", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      enrollment_id: input.enrollmentId,
      training_day: input.trainingDay,
      module_id: input.moduleId,
      source_live_session_id: input.sourceLiveSessionId ?? null,
      delivery_method: input.deliveryMethod,
      assigned_minutes: input.assignedMinutes,
      reason: input.reason.trim(),
      recording_asset_reference: input.recordingAssetReference?.trim() || null,
      status: "assigned",
      assigned_by_clerk_user_id: actor.userId,
      assigned_instructor_clerk_user_id: input.assignedInstructorClerkUserId.trim(),
      instructor_license_number: instructorLicenseNumber,
      school_license_number: schoolLicenseNumber,
      correlation_id: input.correlationId,
    }),
  });
  const assignment = rows[0];
  if (!assignment?.id || !UUID_PATTERN.test(assignment.id)) throw new FloridaClassDMakeupError("Make-up assignment was not created correctly.", 502, "FDACS_MAKEUP_CREATE_INVALID");

  if (input.deliveryMethod === "recorded_makeup") {
    const after = await listEnrollmentAssignments(input.enrollmentId);
    if (activeRecordedAssignedMinutes(after) > MAX_RECORDED_MAKEUP_MINUTES) {
      const patchQuery = new URLSearchParams({ id: `eq.${assignment.id}`, status: "eq.assigned" });
      await request(`fdacs_class_d_makeup_assignments?${patchQuery}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({ status: "cancelled", updated_at: new Date().toISOString() }),
      });
      await insertAudit({ actorRole: actor.role, actorUserId: actor.userId, enrollmentId: input.enrollmentId, entityId: assignment.id, action: "makeup_auto_cancelled_recorded_limit", correlationId: input.correlationId, metadata: { maximumRecordedMinutes: MAX_RECORDED_MAKEUP_MINUTES } });
      throw new FloridaClassDMakeupError("Concurrent assignment would exceed the 600-minute recorded make-up ceiling, so this assignment was cancelled.", 409, "FDACS_MAKEUP_RECORDED_LIMIT_CONCURRENT");
    }
  }

  await insertAudit({
    actorRole: actor.role,
    actorUserId: actor.userId,
    enrollmentId: input.enrollmentId,
    entityId: assignment.id,
    action: "makeup_assigned",
    correlationId: input.correlationId,
    metadata: { trainingDay: input.trainingDay, moduleId: input.moduleId, deliveryMethod: input.deliveryMethod, assignedMinutes: input.assignedMinutes },
  });
  return assignment;
}

export async function getFloridaClassDStudentMakeup(userId: string) {
  const query = new URLSearchParams({ select: "id,clerk_user_id,cohort_id,status", clerk_user_id: `eq.${userId}`, course_id: "eq.florida-class-d-40-hour", order: "enrolled_at.desc", limit: "10" });
  const enrollments = await request<EnrollmentRow[]>(`fdacs_class_d_enrollments?${query}`);
  const enrollment = enrollments.find((item) => !["withdrawn"].includes(item.status)) ?? enrollments[0];
  if (!enrollment) return { enrollment: null, assignments: [], questions: [] };
  const assignments = await listEnrollmentAssignments(enrollment.id);
  const ids = assignments.map((item) => item.id);
  const questions = ids.length
    ? await request<FloridaClassDMakeupQuestion[]>(`fdacs_class_d_makeup_questions?${new URLSearchParams({ select: "id,assignment_id,enrollment_id,question_text,asked_at,answer_text,answered_at", assignment_id: `in.(${ids.join(",")})`, order: "asked_at.asc", limit: "500" })}`)
    : [];
  return { enrollment, assignments, questions };
}

export async function submitFloridaClassDMakeupQuestion(userId: string, input: { assignmentId: string; question: string; correlationId: string }) {
  requireUuid(input.assignmentId, "assignment id");
  requireUuid(input.correlationId, "correlation id");
  const assignmentRows = await request<FloridaClassDMakeupAssignment[]>(`fdacs_class_d_makeup_assignments?${new URLSearchParams({ select: "id,enrollment_id,status", id: `eq.${input.assignmentId}`, limit: "1" })}`);
  const assignment = assignmentRows[0];
  if (!assignment || ["cancelled", "failed"].includes(assignment.status)) throw new FloridaClassDMakeupError("Make-up assignment is not available.", 404, "FDACS_MAKEUP_ASSIGNMENT_NOT_AVAILABLE");
  const enrollment = await getEnrollment(assignment.enrollment_id);
  if (enrollment.clerk_user_id !== userId) throw new FloridaClassDMakeupError("You are not authorized for this make-up assignment.", 403, "FDACS_MAKEUP_STUDENT_MISMATCH");
  const question = input.question.trim();
  if (question.length < 2 || question.length > 4000) throw new FloridaClassDMakeupError("Question must contain between 2 and 4,000 characters.", 400, "FDACS_MAKEUP_INVALID_QUESTION");

  const rows = await request<FloridaClassDMakeupQuestion[]>("fdacs_class_d_makeup_questions", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ assignment_id: assignment.id, enrollment_id: enrollment.id, question_text: question, asked_by_clerk_user_id: userId, correlation_id: input.correlationId }),
  });
  const record = rows[0];
  if (!record?.id) throw new FloridaClassDMakeupError("Make-up question was not recorded correctly.", 502, "FDACS_MAKEUP_QUESTION_INVALID");
  await insertAudit({ actorRole: "student", actorUserId: userId, enrollmentId: enrollment.id, entityId: record.id, action: "makeup_question_submitted", correlationId: input.correlationId, metadata: { assignmentId: assignment.id } });
  return record;
}

export async function getFloridaClassDAdminMakeup(actor: StaffActor, enrollmentId?: string | null) {
  requireStaff(actor);
  const params: Record<string, string> = {
    select: "id,enrollment_id,training_day,module_id,source_live_session_id,delivery_method,assigned_minutes,reason,recording_asset_reference,status,certified_minutes,assigned_at,evidence_reference,evidence_started_at,evidence_ended_at",
    order: "created_at.desc",
    limit: "250",
  };
  if (enrollmentId) {
    requireUuid(enrollmentId, "enrollment id");
    params.enrollment_id = `eq.${enrollmentId}`;
  }
  const assignments = await request<FloridaClassDMakeupAssignment[]>(`fdacs_class_d_makeup_assignments?${new URLSearchParams(params)}`);
  const ids = assignments.map((item) => item.id);
  const questions = ids.length
    ? await request<FloridaClassDMakeupQuestion[]>(`fdacs_class_d_makeup_questions?${new URLSearchParams({ select: "id,assignment_id,enrollment_id,question_text,asked_at,answer_text,answered_at", assignment_id: `in.(${ids.join(",")})`, order: "asked_at.asc", limit: "1000" })}`)
    : [];
  return { assignments, questions };
}

export async function answerFloridaClassDMakeupQuestion(actor: StaffActor, input: { questionId: string; answer: string; correlationId: string }) {
  requireStaff(actor);
  requireUuid(input.questionId, "question id");
  requireUuid(input.correlationId, "correlation id");
  const answer = input.answer.trim();
  if (answer.length < 2 || answer.length > 4000) throw new FloridaClassDMakeupError("Answer must contain between 2 and 4,000 characters.", 400, "FDACS_MAKEUP_INVALID_ANSWER");
  const query = new URLSearchParams({ select: "id,assignment_id,enrollment_id,answer_text", id: `eq.${input.questionId}`, limit: "1" });
  const rows = await request<Array<FloridaClassDMakeupQuestion & { answer_text?: string | null }>>(`fdacs_class_d_makeup_questions?${query}`);
  const question = rows[0];
  if (!question) throw new FloridaClassDMakeupError("Make-up question was not found.", 404, "FDACS_MAKEUP_QUESTION_NOT_FOUND");
  if (question.answer_text) throw new FloridaClassDMakeupError("This make-up question is already answered.", 409, "FDACS_MAKEUP_QUESTION_ALREADY_ANSWERED");

  const patch = new URLSearchParams({ id: `eq.${input.questionId}`, answer_text: "is.null" });
  await request(`fdacs_class_d_makeup_questions?${patch}`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ answer_text: answer, answered_by_clerk_user_id: actor.userId, answered_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  await insertAudit({ actorRole: actor.role, actorUserId: actor.userId, enrollmentId: question.enrollment_id, entityId: question.id, action: "makeup_question_answered", correlationId: input.correlationId, metadata: { assignmentId: question.assignment_id } });
  return { answered: true };
}

export async function previewFloridaClassDMakeupReconciliation(actor: StaffActor, assignmentId: string) {
  requireStaff(actor);
  requireUuid(assignmentId, "assignment id");
  const rows = await request<FloridaClassDMakeupAssignment[]>(`fdacs_class_d_makeup_assignments?${new URLSearchParams({ select: "id,enrollment_id,training_day,module_id,delivery_method,assigned_minutes,status,certified_minutes", id: `eq.${assignmentId}`, limit: "1" })}`);
  const assignment = rows[0];
  if (!assignment) throw new FloridaClassDMakeupError("Make-up assignment was not found.", 404, "FDACS_MAKEUP_ASSIGNMENT_NOT_FOUND");

  const liveRows = await request<LiveTimeRow[]>(`fdacs_class_d_live_time_totals?${new URLSearchParams({ select: "day,instructional_presence_seconds", enrollment_id: `eq.${assignment.enrollment_id}`, limit: "500" })}`);
  const allAssignments = await listEnrollmentAssignments(assignment.enrollment_id);
  const liveDayMinutes = Math.min(MAX_DAILY_INSTRUCTIONAL_MINUTES, Math.floor(liveRows.filter((row) => row.day === assignment.training_day).reduce((sum, row) => sum + (row.instructional_presence_seconds ?? 0), 0) / 60));
  const liveCourseMinutes = Math.min(MAX_COURSE_INSTRUCTIONAL_MINUTES, Math.floor(liveRows.reduce((sum, row) => sum + (row.instructional_presence_seconds ?? 0), 0) / 60));
  const certified = allAssignments.filter((item) => item.status === "certified" && item.id !== assignment.id);
  const certifiedDayMakeupMinutes = certified.filter((item) => item.training_day === assignment.training_day).reduce((sum, item) => sum + item.certified_minutes, 0);
  const certifiedCourseMakeupMinutes = certified.reduce((sum, item) => sum + item.certified_minutes, 0);
  const certifiedRecordedMinutes = certified.filter((item) => item.delivery_method === "recorded_makeup").reduce((sum, item) => sum + item.certified_minutes, 0);
  const dayRemaining = Math.max(0, MAX_DAILY_INSTRUCTIONAL_MINUTES - liveDayMinutes - certifiedDayMakeupMinutes);
  const courseRemaining = Math.max(0, MAX_COURSE_INSTRUCTIONAL_MINUTES - liveCourseMinutes - certifiedCourseMakeupMinutes);
  const recordedRemaining = assignment.delivery_method === "recorded_makeup" ? Math.max(0, MAX_RECORDED_MAKEUP_MINUTES - certifiedRecordedMinutes) : MAX_COURSE_INSTRUCTIONAL_MINUTES;
  const maximumCertifiableMinutes = Math.max(0, Math.min(assignment.assigned_minutes, dayRemaining, courseRemaining, recordedRemaining));

  return {
    assignmentId: assignment.id,
    liveDayMinutes,
    certifiedDayMakeupMinutes,
    dayRemaining,
    liveCourseMinutes,
    certifiedCourseMakeupMinutes,
    courseRemaining,
    certifiedRecordedMinutes,
    recordedRemaining,
    maximumCertifiableMinutes,
    certificationMutationEnabled: FLORIDA_CLASS_D_MAKEUP_POLICY.certificationMutationEnabledInThisGate,
    note: "Gate 10 calculates the auditable reconciliation ceiling but does not mutate instructional credit until the transactional certification subgate is promoted.",
  };
}
