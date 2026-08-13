import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";

const DEFAULT_SUPABASE_URL = "https://nwxnyqlyzyufgoadtqxs.supabase.co";
const DEFAULT_BUCKET = "fdacs-class-d-private";
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

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDCompletionDocumentsEnabled() {
  return enabled(process.env.OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED);
}

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const bucket = process.env.OBSERRA_FDACS_DOCUMENTS_BUCKET?.trim() || DEFAULT_BUCKET;
  if (!key || !url.startsWith("https://") || !bucket) {
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
    body: bytes,
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new FloridaClassDExamError("Protected document storage upload failed.", 502, "FDACS_COMPLETION_DOCUMENT_UPLOAD_FAILED");
  }
  return bucket;
}

async function storageDownload(bucket: string, objectKey: string) {
  const { key, url } = config();
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
  const documents = await restRequest<Array<CompletionDocument & { storage_bucket?: string | null; storage_object_key?: string | null }>>(
    `fdacs_class_d_completion_documents?${new URLSearchParams({ select: "id,enrollment_id,completion_record_id,document_type,status,storage_bucket,storage_object_key,external_reference,issued_at,source_system,sha256,content_type", id: `eq.${documentId}`, status: "eq.available", limit: "1" })}`,
  );
  const document = documents[0];
  if (!document?.storage_bucket || !document.storage_object_key) {
    throw new FloridaClassDExamError("Completion document is not available for download.", 404, "FDACS_COMPLETION_DOCUMENT_NOT_FOUND");
  }
  const enrollment = await restRequest<Array<{ id: string }>>(
    `fdacs_class_d_enrollments?${new URLSearchParams({ select: "id", id: `eq.${document.enrollment_id}`, clerk_user_id: `eq.${clerkUserId}`, status: "eq.completed", limit: "1" })}`,
  );
  if (!enrollment[0]) throw new FloridaClassDExamError("Completion document access is not authorized.", 403, "FDACS_COMPLETION_DOCUMENT_FORBIDDEN");
  const response = await storageDownload(document.storage_bucket, document.storage_object_key);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (document.sha256 && digest !== document.sha256) {
    throw new FloridaClassDExamError("Completion document integrity validation failed.", 502, "FDACS_COMPLETION_DOCUMENT_INTEGRITY_FAILED");
  }
  return { document, bytes, contentType: document.content_type || "application/pdf" };
}
