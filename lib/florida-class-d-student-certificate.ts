import "server-only";

import { FloridaClassDExamError } from "./florida-class-d-exam";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type FloridaClassDStudentCertificate = {
  documentId: string;
  enrollmentId: string;
  completionRecordId: string;
  certificateId: string;
  studentLegalName: string;
  courseTitle: string;
  instructionalHours: number;
  verifiedInstructionalMinutes: number;
  completionDate: string;
  examScore: number;
  passingScore: number;
  provider: string;
  officialStateCertificate: false;
  licenseIssued: false;
};

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDExamError("Student certificate service is not configured.", 503, "FDACS_CERTIFICATE_NOT_CONFIGURED");
  }
  return { key, url };
}

async function request<T>(path: string): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    throw new FloridaClassDExamError("Student certificate request failed.", response.status >= 500 ? 502 : response.status, "FDACS_CERTIFICATE_REQUEST_FAILED");
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_CERTIFICATE_INVALID_IDENTIFIER");
}

export async function getFloridaClassDStudentCertificate(clerkUserId: string, documentId: string): Promise<FloridaClassDStudentCertificate> {
  requireUuid(documentId, "certificate document id");

  const documents = await request<Array<{
    id: string;
    enrollment_id: string;
    completion_record_id: string;
    external_reference: string | null;
    render_payload: Record<string, unknown> | null;
  }>>(`fdacs_class_d_completion_documents?${new URLSearchParams({
    select: "id,enrollment_id,completion_record_id,external_reference,render_payload",
    id: `eq.${documentId}`,
    document_type: "eq.obserra_course_completion",
    status: "eq.available",
    limit: "1",
  })}`);

  const document = documents[0];
  if (!document) throw new FloridaClassDExamError("Completion certificate was not found.", 404, "FDACS_CERTIFICATE_NOT_FOUND");

  const enrollment = await request<Array<{ id: string }>>(`fdacs_class_d_enrollments?${new URLSearchParams({
    select: "id",
    id: `eq.${document.enrollment_id}`,
    clerk_user_id: `eq.${clerkUserId}`,
    status: "eq.completed",
    limit: "1",
  })}`);
  if (!enrollment[0]) throw new FloridaClassDExamError("Completion certificate access is not authorized.", 403, "FDACS_CERTIFICATE_FORBIDDEN");

  const payload = document.render_payload || {};
  const studentLegalName = typeof payload.studentLegalName === "string" ? payload.studentLegalName.trim() : "";
  const courseTitle = typeof payload.courseTitle === "string" ? payload.courseTitle.trim() : "";
  const completionDate = typeof payload.completionDate === "string" ? payload.completionDate : "";
  const certificateId = typeof payload.certificateId === "string" ? payload.certificateId : document.external_reference || "";
  const instructionalHours = Number(payload.instructionalHours);
  const verifiedInstructionalMinutes = Number(payload.verifiedInstructionalMinutes);
  const examScore = Number(payload.examScore);
  const passingScore = Number(payload.passingScore);
  const provider = typeof payload.provider === "string" ? payload.provider.trim() : "Obserra Executive Protection & Intelligence LLC";

  if (!studentLegalName || !courseTitle || !completionDate || !certificateId || instructionalHours !== 40 || verifiedInstructionalMinutes < 2400 || examScore < 128 || passingScore !== 128) {
    throw new FloridaClassDExamError("Completion certificate evidence is incomplete.", 502, "FDACS_CERTIFICATE_EVIDENCE_INVALID");
  }

  return {
    documentId: document.id,
    enrollmentId: document.enrollment_id,
    completionRecordId: document.completion_record_id,
    certificateId,
    studentLegalName,
    courseTitle,
    instructionalHours,
    verifiedInstructionalMinutes,
    completionDate,
    examScore,
    passingScore,
    provider,
    officialStateCertificate: false,
    licenseIssued: false,
  };
}
