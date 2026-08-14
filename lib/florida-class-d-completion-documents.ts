import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";

const REQUIRED_BUCKET = "fdacs-class-d-completion-documents";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export const FLORIDA_CLASS_D_COMPLETION_DOCUMENT_POLICY = {
  featureFlag: "OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED",
  officialTrainingCertificate: "FDACS-16103",
  officialCertificateSource: "LIAS",
  officialCertificateDeadlineBusinessDays: 3,
  officialCertificateRequiredForClassDApplication: true,
  officialCertificateMayBeGeneratedByObserra: false,
  brandedCertificateIsSupplementalOnly: true,
  supplementalCertificateRequiresPassingExam: true,
  supplementalCertificateMinimumScore: 128,
  maximumPdfBytes: MAX_PDF_BYTES,
} as const;

export type CompletionDocument = {
  id: string;
  enrollment_id: string;
  completion_record_id: string;
  document_type: "fdacs_16103" | "obserra_course_completion" | "class_d_application_instructions";
  status: "pending" | "available" | "superseded" | "voided";
  external_reference?: string | null;
  issued_at?: string | null;
  source_system: "lias" | "obserra" | "fdacs_public";
  sha256?: string | null;
  content_type?: string | null;
};

type CompletionDocumentRecord = CompletionDocument & {
  storage_bucket?: string | null;
  storage_object_key?: string | null;
  render_payload?: Record<string, unknown> | null;
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDCompletionDocumentsEnabled() {
  return enabled(process.env.OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED);
}

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  const bucket = process.env.OBSERRA_FDACS_DOCUMENTS_BUCKET?.trim() || "";
  if (!key || !url.startsWith("https://") || bucket !== REQUIRED_BUCKET) {
    throw new FloridaClassDExamError("Completion document service is not configured.", 503, "FDACS_COMPLETION_DOCUMENTS_NOT_CONFIGURED");
  }
  return { key, url, bucket };
}

async function restRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(
      typeof record?.message === "string" ? record.message : "Completion document request failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_COMPLETION_DOCUMENT_REQUEST_FAILED",
    );
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_COMPLETION_DOCUMENT_INVALID_IDENTIFIER");
}

function requireEnabled() {
  if (!floridaClassDCompletionDocumentsEnabled()) {
    throw new FloridaClassDExamError("Completion documents are disabled.", 503, "FDACS_COMPLETION_DOCUMENTS_DISABLED");
  }
}

async function storageUpload(objectKey: string, bytes: Uint8Array, contentType: string) {
  const { key, url, bucket } = config();
  const uploadBody = new Blob([Uint8Array.from(bytes)], { type: contentType });
  const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${objectKey.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": contentType,
      "x-upsert": "false",
      "cache-control": "no-store",
    },
    body: uploadBody,
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new FloridaClassDExamError("Protected document storage upload failed.", 502, "FDACS_COMPLETION_DOCUMENT_UPLOAD_FAILED");
  }
  return bucket;
}

async function storageDownload(bucket: string, objectKey: string) {
  const { key, url } = config();
  if (bucket !== REQUIRED_BUCKET) {
    throw new FloridaClassDExamError("Protected completion document storage boundary is invalid.", 409, "FDACS_COMPLETION_DOCUMENT_BUCKET_INVALID");
  }
  const response = await fetch(`${url}/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${objectKey.split("/").map(encodeURIComponent).join("/")}`, {
    method: "GET",
    cache: "no-store",
    redirect: "error",
    headers: { apikey: key, authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new FloridaClassDExamError("Protected completion document could not be retrieved.", 502, "FDACS_COMPLETION_DOCUMENT_DOWNLOAD_FAILED");
  return response;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requirePayloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new FloridaClassDExamError("Generated completion document data is incomplete.", 502, "FDACS_COMPLETION_DOCUMENT_RENDER_DATA_INVALID");
  }
  return value.trim();
}

function requirePayloadNumber(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new FloridaClassDExamError("Generated completion document data is incomplete.", 502, "FDACS_COMPLETION_DOCUMENT_RENDER_DATA_INVALID");
  }
  return value;
}

function renderCertificateHtml(payload: Record<string, unknown>) {
  const studentLegalName = requirePayloadString(payload, "studentLegalName");
  const courseTitle = requirePayloadString(payload, "courseTitle");
  const completionDate = requirePayloadString(payload, "completionDate");
  const certificateId = requirePayloadString(payload, "certificateId");
  const instructionalHours = requirePayloadNumber(payload, "instructionalHours");
  const examScore = requirePayloadNumber(payload, "examScore");
  const passingScore = requirePayloadNumber(payload, "passingScore");
  if (instructionalHours < 40 || examScore < passingScore || passingScore < 128) {
    throw new FloridaClassDExamError("Generated certificate failed completion validation.", 409, "FDACS_COMPLETION_CERTIFICATE_NOT_ELIGIBLE");
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC Florida Class D Course Completion Certificate</title>
<style>
@page{size:landscape;margin:0.45in}*{box-sizing:border-box}body{margin:0;background:#07111f;color:#f5f1e8;font-family:Georgia,"Times New Roman",serif}.sheet{min-height:7.3in;border:2px solid #c9a54d;padding:34px 44px;background:linear-gradient(145deg,#07111f,#0d1e34);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.brand{font-family:Arial,sans-serif;letter-spacing:.18em;color:#d5b45c;font-size:13px}.rule{width:120px;border-top:1px solid #c9a54d;margin:20px auto}.title{font-size:34px;letter-spacing:.03em;margin:8px 0 12px}.subtitle{font-family:Arial,sans-serif;font-size:14px;letter-spacing:.12em;color:#c9a54d;text-transform:uppercase}.name{font-size:38px;margin:24px 0 8px;border-bottom:1px solid #c9a54d;padding:0 28px 10px}.course{font-size:23px;margin:12px 0}.facts{font-family:Arial,sans-serif;display:flex;gap:34px;justify-content:center;flex-wrap:wrap;margin:24px 0;font-size:13px}.facts b{display:block;color:#d5b45c;font-size:15px;margin-bottom:4px}.notice{max-width:800px;font-family:Arial,sans-serif;font-size:11px;line-height:1.5;color:#d5dce6;margin-top:18px}.id{font-family:monospace;font-size:11px;color:#aeb8c5;margin-top:20px}@media print{body{background:#fff}.sheet{break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>
<main class="sheet">
<div class="brand">OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</div>
<div class="rule"></div>
<div class="subtitle">Supplemental School Record</div>
<h1 class="title">Course Completion Certificate</h1>
<p>This certifies that</p>
<div class="name">${escapeHtml(studentLegalName)}</div>
<p>successfully completed the school requirements for</p>
<div class="course">${escapeHtml(courseTitle)}</div>
<div class="facts">
<div><b>${escapeHtml(instructionalHours)}</b>Instructional Hours</div>
<div><b>${escapeHtml(examScore)} / 170</b>Final Examination Score</div>
<div><b>${escapeHtml(completionDate)}</b>Completion Date</div>
</div>
<p class="notice"><strong>Important:</strong> This is a supplemental OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC school record. It does not replace the official FDACS-16103 Certificate of Security Officer Training generated through LIAS, and course completion does not itself issue a Florida Class D Security Officer license.</p>
<div class="id">Certificate ID: ${escapeHtml(certificateId)}</div>
</main>
</body>
</html>`;
}

function renderApplicationHandoffHtml(payload: Record<string, unknown>) {
  const studentLegalName = requirePayloadString(payload, "studentLegalName");
  const completionDate = requirePayloadString(payload, "completionDate");
  const certificateId = requirePayloadString(payload, "certificateId");
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Florida Class D Application Handoff</title>
<style>body{font-family:Arial,sans-serif;max-width:850px;margin:40px auto;padding:0 24px;color:#132034;line-height:1.55}h1{color:#0b1d33}section{border:1px solid #d5b45c;padding:20px;margin:20px 0}.ref{font-family:monospace;background:#f4f6f8;padding:8px}.notice{font-weight:700}</style></head>
<body>
<h1>Florida Class D Application Handoff</h1>
<p>Student: <strong>${escapeHtml(studentLegalName)}</strong></p>
<p>Successful course completion date: <strong>${escapeHtml(completionDate)}</strong></p>
<p class="ref">OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC completion reference: ${escapeHtml(certificateId)}</p>
<section><h2>Official training certificate</h2><p>The official Florida training-completion record is the <strong>FDACS-16103 Certificate of Security Officer Training</strong>, generated through the school's LIAS reporting workflow after successful completion is reported. Retain that official document with your Class D application records.</p></section>
<section><h2>License application</h2><p>Submit the required Class D license application and supporting documents through the official Florida Department of Agriculture and Consumer Services process. This handoff document and any supplemental OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC certificate do not replace FDACS-16103.</p></section>
<p class="notice">Successful course completion does not itself issue a Florida Class D Security Officer license.</p>
</body></html>`;
}

function renderGeneratedDocument(document: CompletionDocumentRecord) {
  if (!document.render_payload || typeof document.render_payload !== "object" || Array.isArray(document.render_payload)) {
    throw new FloridaClassDExamError("Generated completion document data is unavailable.", 404, "FDACS_COMPLETION_DOCUMENT_RENDER_DATA_NOT_FOUND");
  }
  if (document.source_system !== "obserra") {
    throw new FloridaClassDExamError("Generated completion document source is invalid.", 409, "FDACS_COMPLETION_DOCUMENT_RENDER_SOURCE_INVALID");
  }
  const html = document.document_type === "obserra_course_completion"
    ? renderCertificateHtml(document.render_payload)
    : document.document_type === "class_d_application_instructions"
      ? renderApplicationHandoffHtml(document.render_payload)
      : null;
  if (!html) throw new FloridaClassDExamError("Generated completion document type is not supported.", 400, "FDACS_COMPLETION_DOCUMENT_RENDER_TYPE_INVALID");
  return new TextEncoder().encode(html);
}

export async function listCompletionDocumentsForStudent(clerkUserId: string) {
  const enrollments = await restRequest<Array<{ id: string }>>(
    `fdacs_class_d_enrollments?${new URLSearchParams({ select: "id", clerk_user_id: `eq.${clerkUserId}`, status: "eq.completed", order: "updated_at.desc", limit: "10" })}`,
  );
  if (enrollments.length === 0) return [] as CompletionDocument[];
  const ids = enrollments.map((item) => item.id).filter((id) => UUID_PATTERN.test(id));
  if (ids.length === 0) return [] as CompletionDocument[];
  return restRequest<CompletionDocument[]>(
    `fdacs_class_d_completion_documents?${new URLSearchParams({
      select: "id,enrollment_id,completion_record_id,document_type,status,external_reference,issued_at,source_system,sha256,content_type",
      enrollment_id: `in.(${ids.join(",")})`,
      status: "eq.available",
      order: "issued_at.desc",
      limit: "100",
    })}`,
  );
}

export async function uploadOfficialFdacs16103(
  actorUserId: string,
  input: { completionRecordId: string; pdfBytes: Uint8Array; externalReference: string; correlationId?: string },
) {
  requireEnabled();
  requireUuid(input.completionRecordId, "completion record id");
  if (input.pdfBytes.byteLength < 100 || input.pdfBytes.byteLength > MAX_PDF_BYTES) {
    throw new FloridaClassDExamError("FDACS-16103 PDF size is invalid.", 400, "FDACS_16103_PDF_SIZE_INVALID");
  }
  if (String.fromCharCode(...input.pdfBytes.slice(0, 5)) !== "%PDF-") {
    throw new FloridaClassDExamError("FDACS-16103 upload must be a PDF.", 400, "FDACS_16103_PDF_INVALID");
  }
  const externalReference = input.externalReference.trim();
  if (externalReference.length < 3 || externalReference.length > 500) {
    throw new FloridaClassDExamError("LIAS certificate reference is required.", 400, "FDACS_16103_REFERENCE_REQUIRED");
  }
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");

  const completions = await restRequest<Array<{ id: string; enrollment_id: string; status: string }>>(
    `fdacs_class_d_completion_records?${new URLSearchParams({ select: "id,enrollment_id,status", id: `eq.${input.completionRecordId}`, limit: "1" })}`,
  );
  const completion = completions[0];
  if (!completion || completion.status === "voided") {
    throw new FloridaClassDExamError("Active completion record was not found.", 404, "FDACS_COMPLETION_RECORD_NOT_FOUND");
  }
  requireUuid(completion.enrollment_id, "enrollment id");

  const sha256 = createHash("sha256").update(input.pdfBytes).digest("hex");
  const objectKey = `class-d/${completion.enrollment_id}/${input.completionRecordId}/fdacs-16103-${randomUUID()}.pdf`;
  const bucket = await storageUpload(objectKey, input.pdfBytes, "application/pdf");

  const result = await restRequest<string | Array<Record<string, unknown>>>("rpc/fdacs_class_d_register_completion_document", {
    method: "POST",
    body: JSON.stringify({
      p_completion_record_id: input.completionRecordId,
      p_document_type: "fdacs_16103",
      p_storage_bucket: bucket,
      p_storage_object_key: objectKey,
      p_external_reference: externalReference,
      p_sha256: sha256,
      p_content_type: "application/pdf",
      p_source_system: "lias",
      p_actor_clerk_user_id: actorUserId,
      p_correlation_id: correlationId,
    }),
  });
  const documentId = typeof result === "string" ? result : Array.isArray(result) && result[0] ? Object.values(result[0])[0] : null;
  if (typeof documentId !== "string" || !UUID_PATTERN.test(documentId)) {
    throw new FloridaClassDExamError("FDACS-16103 document registration failed.", 502, "FDACS_16103_REGISTRATION_FAILED");
  }
  return { documentId, enrollmentId: completion.enrollment_id, sha256, externalReference, correlationId };
}

export async function downloadStudentCompletionDocument(clerkUserId: string, documentId: string) {
  requireUuid(documentId, "document id");
  const documents = await restRequest<CompletionDocumentRecord[]>(
    `fdacs_class_d_completion_documents?${new URLSearchParams({ select: "id,enrollment_id,completion_record_id,document_type,status,storage_bucket,storage_object_key,external_reference,issued_at,source_system,sha256,content_type,render_payload", id: `eq.${documentId}`, status: "eq.available", limit: "1" })}`,
  );
  const document = documents[0];
  if (!document) {
    throw new FloridaClassDExamError("Completion document is not available for download.", 404, "FDACS_COMPLETION_DOCUMENT_NOT_FOUND");
  }

  const enrollment = await restRequest<Array<{ id: string }>>(
    `fdacs_class_d_enrollments?${new URLSearchParams({ select: "id", id: `eq.${document.enrollment_id}`, clerk_user_id: `eq.${clerkUserId}`, status: "eq.completed", limit: "1" })}`,
  );
  if (!enrollment[0]) throw new FloridaClassDExamError("Completion document access is not authorized.", 403, "FDACS_COMPLETION_DOCUMENT_FORBIDDEN");

  if (document.storage_bucket && document.storage_object_key) {
    const response = await storageDownload(document.storage_bucket, document.storage_object_key);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (document.sha256 && digest !== document.sha256) {
      throw new FloridaClassDExamError("Completion document integrity validation failed.", 502, "FDACS_COMPLETION_DOCUMENT_INTEGRITY_FAILED");
    }
    return { document, bytes, contentType: document.content_type || "application/pdf", generated: false };
  }

  if (document.content_type === "text/html" && document.render_payload) {
    const bytes = renderGeneratedDocument(document);
    return { document, bytes, contentType: "text/html; charset=utf-8", generated: true };
  }

  throw new FloridaClassDExamError("Completion document is not available for download.", 404, "FDACS_COMPLETION_DOCUMENT_NOT_FOUND");
}
