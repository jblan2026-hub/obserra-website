import "server-only";

import { createHash } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FLORIDA_CLASS_D_COMPLETION_PACKET_POLICY = {
  schema: "obserra.fdacs.class-d.completion-packet.v1",
  containsExamQuestionsOrAnswers: false,
  containsRawIdentityDocuments: false,
  requiresStaffAuthorization: true,
  directPublicAccessAllowed: false,
} as const;

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDExamError("Completion packet service is not configured.", 503, "FDACS_COMPLETION_PACKET_NOT_CONFIGURED");
  }
  return { key, url };
}

async function request<T>(path: string): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: "GET",
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(15_000),
  });
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDExamError("Completion packet datastore returned invalid JSON.", 502, "FDACS_COMPLETION_PACKET_INVALID_RESPONSE");
    }
  }
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(
      typeof record?.message === "string" ? record.message : "Completion packet query failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_COMPLETION_PACKET_QUERY_FAILED",
    );
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_COMPLETION_PACKET_INVALID_IDENTIFIER");
  }
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(",")}}`;
}

export async function getFloridaClassDCompletionPacket(enrollmentId: string) {
  requireUuid(enrollmentId, "enrollment id");

  const enrollmentRows = await request<Array<Record<string, unknown>>>(
    `fdacs_class_d_enrollments?${new URLSearchParams({
      select: "id,student_identity_id,course_id,cohort_id,status,enrolled_at,created_at,updated_at,retention_review_after",
      id: `eq.${enrollmentId}`,
      limit: "1",
    })}`,
  );
  const enrollment = enrollmentRows[0];
  if (!enrollment) throw new FloridaClassDExamError("Enrollment was not found.", 404, "FDACS_COMPLETION_PACKET_ENROLLMENT_NOT_FOUND");

  const studentIdentityId = typeof enrollment.student_identity_id === "string" && UUID_PATTERN.test(enrollment.student_identity_id)
    ? enrollment.student_identity_id
    : null;

  const [identity, attendance, instructionTime, liveTime, moduleProgress, learningChecks, remediation, examAttempts, completionRows, liasRows, documents, audit] = await Promise.all([
    studentIdentityId
      ? request<Array<Record<string, unknown>>>(`fdacs_class_d_student_identities?${new URLSearchParams({ select: "id,legal_name,identity_status,verified_at,created_at,updated_at", id: `eq.${studentIdentityId}`, limit: "1" })}`)
      : Promise.resolve([]),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_attendance_entries?${new URLSearchParams({ select: "id,day,status,checked_in_at,checked_out_at,instructional_minutes_credited,attested_by_clerk_user_id,created_at", enrollment_id: `eq.${enrollmentId}`, order: "day.asc,created_at.asc", limit: "500" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_instruction_time_entries?${new URLSearchParams({ select: "id,module_id,started_at,ended_at,credited_minutes,source,recorded_by_clerk_user_id,created_at", enrollment_id: `eq.${enrollmentId}`, order: "started_at.asc", limit: "1000" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_live_time_totals?${new URLSearchParams({ select: "id,live_session_id,day,connected_seconds,instructional_presence_seconds,break_presence_seconds,uncredited_connected_seconds,presence_state,last_heartbeat_at", enrollment_id: `eq.${enrollmentId}`, order: "day.asc", limit: "500" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_module_progress?${new URLSearchParams({ select: "module_id,status,instructional_minutes_credited,learning_check_passed,completed_at", enrollment_id: `eq.${enrollmentId}`, order: "module_id.asc", limit: "18" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_learning_check_results?${new URLSearchParams({ select: "id,module_id,attempt_number,status,score,passed,completed_at", enrollment_id: `eq.${enrollmentId}`, order: "module_id.asc,attempt_number.asc", limit: "500" })}`).catch(() => []),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_remediation_records?${new URLSearchParams({ select: "id,module_id,status,assigned_at,completed_at,reviewed_by_clerk_user_id,reviewed_at", enrollment_id: `eq.${enrollmentId}`, order: "assigned_at.asc", limit: "500" })}`).catch(() => []),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_exam_attempts?${new URLSearchParams({ select: "id,status,started_at,submitted_at,score,passed,bank_id,retest_authorization_id,invalidated_at,invalidation_reason", enrollment_id: `eq.${enrollmentId}`, order: "started_at.asc", limit: "50" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_completion_records?${new URLSearchParams({ select: "id,status,passed_exam_attempt_id,verified_instructional_minutes,completion_evidence,approved_by_clerk_user_id,approved_at,review_note,retention_review_after", enrollment_id: `eq.${enrollmentId}`, order: "approved_at.desc", limit: "5" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_lias_reporting_queue?${new URLSearchParams({ select: "id,status,prepared_at,reporting_due_on,submission_reference,submitted_at,confirmed_at,certificate_reference,exception_note,exception_at", enrollment_id: `eq.${enrollmentId}`, order: "prepared_at.desc", limit: "5" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_completion_documents?${new URLSearchParams({ select: "id,document_type,status,external_reference,issued_at,source_system,sha256,content_type", enrollment_id: `eq.${enrollmentId}`, order: "issued_at.asc", limit: "100" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_audit_events?${new URLSearchParams({ select: "id,occurred_at,actor_role,entity_type,entity_id,action,correlation_id,metadata", enrollment_id: `eq.${enrollmentId}`, order: "occurred_at.asc,id.asc", limit: "2500" })}`),
  ]);

  const completion = completionRows.find((row) => row.status !== "voided") ?? completionRows[0] ?? null;
  const lias = liasRows[0] ?? null;
  const liasQueueId = lias && typeof lias.id === "string" && UUID_PATTERN.test(lias.id) ? lias.id : null;
  const liasEvents = liasQueueId
    ? await request<Array<Record<string, unknown>>>(`fdacs_class_d_lias_workflow_events?${new URLSearchParams({ select: "id,event_type,actor_clerk_user_id,event_note,submission_reference,certificate_reference,correlation_id,occurred_at,metadata", queue_id: `eq.${liasQueueId}`, order: "occurred_at.asc,id.asc", limit: "500" })}`)
    : [];

  const generatedAt = new Date().toISOString();
  const payload = {
    schema: FLORIDA_CLASS_D_COMPLETION_PACKET_POLICY.schema,
    generatedAt,
    enrollment,
    learnerIdentity: identity[0] ?? null,
    attendance,
    instructionTime,
    liveTime,
    moduleProgress,
    learningChecks,
    remediation,
    examAttempts,
    completion,
    lias,
    liasEvents,
    completionDocuments: documents,
    audit,
    exclusions: {
      examQuestions: true,
      examAnswers: true,
      identityDocumentImages: true,
      paymentCardData: true,
      authenticationSecrets: true,
    },
  };
  const packetSha256 = createHash("sha256").update(canonicalize(payload)).digest("hex");
  return { ...payload, packetSha256 };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rowsHtml(rows: Array<Record<string, unknown>>, columns: string[]) {
  if (rows.length === 0) return "<p>No records.</p>";
  const header = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const body = rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`).join("");
  return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

export function renderFloridaClassDCompletionPacketHtml(packet: Awaited<ReturnType<typeof getFloridaClassDCompletionPacket>>) {
  const learner = packet.learnerIdentity as Record<string, unknown> | null;
  const completion = packet.completion as Record<string, unknown> | null;
  const lias = packet.lias as Record<string, unknown> | null;
  const examRows = packet.examAttempts as Array<Record<string, unknown>>;
  const attendanceRows = packet.attendance as Array<Record<string, unknown>>;
  const documentRows = packet.completionDocuments as Array<Record<string, unknown>>;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Florida Class D Completion Packet</title>
<style>body{font-family:Arial,sans-serif;margin:28px;color:#142033}h1,h2{color:#0b1d33}h1{border-bottom:3px solid #c6a34a;padding-bottom:10px}.meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 24px}.box{border:1px solid #ccd3db;padding:14px;margin:18px 0}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #ccd3db;padding:6px;text-align:left;vertical-align:top}th{background:#eef2f6}.hash{font-family:monospace;overflow-wrap:anywhere}.notice{font-size:12px;color:#475569}@media print{body{margin:.35in}.box{break-inside:avoid}}</style></head><body>
<h1>Florida Class D Completion / Inspection Packet</h1>
<p class="notice">Protected school record. This packet intentionally excludes examination questions/answers, identity-document images, payment-card data, and authentication secrets.</p>
<div class="box meta"><div><b>Learner</b><br/>${escapeHtml(learner?.legal_name ?? "Unavailable")}</div><div><b>Identity status</b><br/>${escapeHtml(learner?.identity_status ?? "Unavailable")}</div><div><b>Enrollment</b><br/>${escapeHtml(packet.enrollment.id)}</div><div><b>Enrollment status</b><br/>${escapeHtml(packet.enrollment.status)}</div><div><b>Generated</b><br/>${escapeHtml(packet.generatedAt)}</div><div><b>Packet SHA-256</b><br/><span class="hash">${escapeHtml(packet.packetSha256)}</span></div></div>
<h2>Successful Completion</h2><div class="box"><p><b>Status:</b> ${escapeHtml(completion?.status ?? "No completion record")}</p><p><b>Verified instructional minutes:</b> ${escapeHtml(completion?.verified_instructional_minutes ?? "")}</p><p><b>Approved at:</b> ${escapeHtml(completion?.approved_at ?? "")}</p><p><b>Passing exam attempt:</b> ${escapeHtml(completion?.passed_exam_attempt_id ?? "")}</p></div>
<h2>Attendance</h2>${rowsHtml(attendanceRows,["day","status","checked_in_at","checked_out_at","instructional_minutes_credited"])}
<h2>Final Examination History</h2>${rowsHtml(examRows,["id","status","started_at","submitted_at","score","passed"])}
<h2>FDACS / LIAS</h2><div class="box"><p><b>Status:</b> ${escapeHtml(lias?.status ?? "Not prepared")}</p><p><b>Reporting due:</b> ${escapeHtml(lias?.reporting_due_on ?? "")}</p><p><b>Submitted:</b> ${escapeHtml(lias?.submitted_at ?? "")}</p><p><b>Confirmed:</b> ${escapeHtml(lias?.confirmed_at ?? "")}</p><p><b>FDACS-16103 reference:</b> ${escapeHtml(lias?.certificate_reference ?? "")}</p></div>
<h2>Completion Documents</h2>${rowsHtml(documentRows,["document_type","status","external_reference","issued_at","source_system"])}
<h2>Module Progress</h2>${rowsHtml(packet.moduleProgress as Array<Record<string,unknown>>,["module_id","status","instructional_minutes_credited","learning_check_passed","completed_at"])}
<p class="notice">Successful course completion does not itself issue a Florida Class D Security Officer license. The official FDACS-16103 is generated through LIAS and is distinct from any supplemental OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC course-completion record.</p>
</body></html>`;
}
