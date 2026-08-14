import "server-only";

import {
  createCipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { getFloridaClassDCompletionPacket } from "./florida-class-d-completion-packet";
import {
  FloridaClassDPersistenceError,
  floridaClassDPersistenceRequest,
  getFloridaClassDInspectionRecord,
} from "./florida-class-d-persistence";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const SAFE_ERROR_CODE_PATTERN = /^[A-Z0-9_]{3,100}$/;
const WORKER_REF = "obserra-fdacs-record-archive-v1";
const MAX_ARTIFACT_BYTES = 52_428_800;

export const FLORIDA_CLASS_D_RECORD_ARCHIVE_POLICY = {
  featureFlag: "OBSERRA_FDACS_RECORD_ARCHIVE_ENABLED",
  schema: "obserra.fdacs.class-d.automatic-archive-envelope.v1",
  encryptionProfile: "AES-256-GCM-APPLICATION-ENVELOPE-V1",
  encryptionKeyEnvironmentVariable: "OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_BASE64",
  encryptionKeyReferenceEnvironmentVariable: "OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_REFERENCE",
  authenticationTagBytes: 16,
  initializationVectorBytes: 12,
  additionalAuthenticatedDataFormat: "obserra.fdacs.class-d.archive.v1|<artifact-type>|<idempotency-key>",
  minimumRetentionYears: 2,
  operationalRetentionYears: 3,
  automaticDeletionEnabled: false,
  containsCui: false,
  containsPaymentCardData: false,
  studentIdentityImagesStored: false,
  biometricTemplatesStored: false,
} as const;

type ArchiveJob = {
  job_id: string;
  job_type: "enrollment_record_snapshot" | "completion_evidence_package";
  enrollment_id: string;
  completion_record_id: string | null;
  idempotency_key: string;
  correlation_id: string;
  attempt: number;
};

type ArchiveJobLookup = {
  jobId: string;
  jobType: ArchiveJob["job_type"];
  enrollmentId: string;
  completionRecordId: string | null;
  idempotencyKey: string;
  status: "pending" | "processing" | "retry_wait" | "completed" | "dead_letter";
  correlationId: string;
  attempts: number;
};

type ExistingArtifact = {
  artifactId: string;
  recordSha256: string;
  plaintextSha256: string;
  ciphertextSha256: string;
};

type ArchivedArtifact = {
  artifactId: string;
  recordSha256: string;
  plaintextSha256: string;
  ciphertextSha256: string;
  minimumRetainUntil: string;
  operationalRetainUntil: string;
  encrypted: true;
  idempotentReplay: boolean;
};

export class FloridaClassDRecordArchiveError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDRecordArchiveError";
  }
}

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDRecordArchiveEnabled() {
  return enabled(process.env.OBSERRA_FDACS_RECORD_ARCHIVE_ENABLED);
}

function requireArchiveEnabled() {
  if (!floridaClassDRecordArchiveEnabled()) {
    throw new FloridaClassDRecordArchiveError(
      "The controlled FDACS record archive worker is disabled.",
      503,
      "FDACS_RECORD_ARCHIVE_DISABLED",
    );
  }
}

function archiveConfig() {
  const encodedKey = process.env.OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_BASE64?.trim() || "";
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encodedKey)) {
    throw new FloridaClassDRecordArchiveError(
      "The FDACS record-encryption key is not configured.",
      503,
      "FDACS_RECORD_ENCRYPTION_KEY_NOT_CONFIGURED",
    );
  }
  const key = Buffer.from(encodedKey, "base64");
  if (key.byteLength !== 32) {
    throw new FloridaClassDRecordArchiveError(
      "The FDACS record-encryption key must decode to exactly 32 bytes.",
      503,
      "FDACS_RECORD_ENCRYPTION_KEY_INVALID",
    );
  }
  const keyReference = process.env.OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_REFERENCE?.trim() || "";
  if (
    keyReference.length < 3 ||
    keyReference.length > 255 ||
    /[\u0000-\u001F\u007F]/.test(keyReference)
  ) {
    key.fill(0);
    throw new FloridaClassDRecordArchiveError(
      "The external FDACS record-encryption key reference is not configured.",
      503,
      "FDACS_RECORD_ENCRYPTION_KEY_REFERENCE_INVALID",
    );
  }
  return { key, keyReference };
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? "null" : encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(",")}}`;
}

function toBytea(value: Buffer) {
  return `\\x${value.toString("hex")}`;
}

function dateOnly(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : null;
}

function plusCalendarYears(dateValue: string, years: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCFullYear(value.getUTCFullYear() + years);
  return value.toISOString().slice(0, 10);
}

function requireJob(job: ArchiveJob) {
  if (
    !UUID_PATTERN.test(job.job_id) ||
    !UUID_PATTERN.test(job.enrollment_id) ||
    !UUID_PATTERN.test(job.correlation_id) ||
    !["enrollment_record_snapshot", "completion_evidence_package"].includes(job.job_type) ||
    job.idempotency_key.length < 12
  ) {
    throw new FloridaClassDRecordArchiveError(
      "The archive queue returned an invalid controlled job.",
      502,
      "FDACS_RECORD_ARCHIVE_JOB_INVALID",
    );
  }
  if (job.job_type === "completion_evidence_package" && (!job.completion_record_id || !UUID_PATTERN.test(job.completion_record_id))) {
    throw new FloridaClassDRecordArchiveError(
      "The completion archive job is missing its controlled completion reference.",
      502,
      "FDACS_RECORD_ARCHIVE_COMPLETION_REFERENCE_INVALID",
    );
  }
}

async function getIdentityAttendanceEvidence(job: ArchiveJob) {
  return floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_identity_attendance_evidence_export",
    {
      method: "POST",
      body: JSON.stringify({
        p_enrollment_id: job.enrollment_id,
        p_actor_ref: WORKER_REF,
        p_actor_role: "system",
        p_purpose: "Automatic encrypted FDACS enrollment and completion evidence archiving",
        p_correlation_id: job.correlation_id,
      }),
    },
  );
}

async function buildArchivePayload(job: ArchiveJob) {
  if (job.job_type === "completion_evidence_package") {
    const [packet, identityAttendanceEvidence] = await Promise.all([
      getFloridaClassDCompletionPacket(job.enrollment_id),
      getIdentityAttendanceEvidence(job),
    ]);
    const completion = packet.completion as Record<string, unknown> | null;
    if (completion?.id !== job.completion_record_id) {
      throw new FloridaClassDRecordArchiveError(
        "The completion packet does not match the controlled archive job.",
        409,
        "FDACS_RECORD_ARCHIVE_COMPLETION_MISMATCH",
      );
    }
    return {
      artifactType: job.job_type,
      retentionAnchorDate: dateOnly(completion?.approved_at) ?? new Date().toISOString().slice(0, 10),
      payload: {
        schema: FLORIDA_CLASS_D_RECORD_ARCHIVE_POLICY.schema,
        job: {
          jobId: job.job_id,
          jobType: job.job_type,
          enrollmentId: job.enrollment_id,
          completionRecordId: job.completion_record_id,
          idempotencyKey: job.idempotency_key,
          correlationId: job.correlation_id,
        },
        completionPacket: packet,
        identityAttendanceEvidence,
        exclusions: {
          identityDocumentImages: true,
          selfieImages: true,
          biometricTemplates: true,
          paymentCardData: true,
          authenticationSecrets: true,
          controlledUnclassifiedInformation: true,
        },
      },
    } as const;
  }

  const [record, identityAttendanceEvidence] = await Promise.all([
    getFloridaClassDInspectionRecord(job.enrollment_id),
    getIdentityAttendanceEvidence(job),
  ]);
  const enrollment = record.enrollment as Record<string, unknown>;
  return {
    artifactType: job.job_type,
    retentionAnchorDate: dateOnly(enrollment.enrolled_at) ?? dateOnly(enrollment.created_at) ?? new Date().toISOString().slice(0, 10),
    payload: {
      schema: FLORIDA_CLASS_D_RECORD_ARCHIVE_POLICY.schema,
      job: {
        jobId: job.job_id,
        jobType: job.job_type,
        enrollmentId: job.enrollment_id,
        completionRecordId: null,
        idempotencyKey: job.idempotency_key,
        correlationId: job.correlation_id,
      },
      inspectionRecord: record,
      identityAttendanceEvidence,
      exclusions: {
        identityDocumentImages: true,
        selfieImages: true,
        biometricTemplates: true,
        paymentCardData: true,
        authenticationSecrets: true,
        controlledUnclassifiedInformation: true,
      },
    },
  } as const;
}

function encryptPayload(
  payload: unknown,
  artifactType: ArchiveJob["job_type"],
  idempotencyKey: string,
) {
  const { key, keyReference } = archiveConfig();
  try {
    const plaintext = Buffer.from(canonicalize(payload), "utf8");
    if (plaintext.byteLength < 1 || plaintext.byteLength > MAX_ARTIFACT_BYTES) {
      throw new FloridaClassDRecordArchiveError(
        "The controlled archive payload exceeds the permitted size.",
        413,
        "FDACS_RECORD_ARCHIVE_PAYLOAD_SIZE_INVALID",
      );
    }
    const initializationVector = randomBytes(FLORIDA_CLASS_D_RECORD_ARCHIVE_POLICY.initializationVectorBytes);
    const additionalAuthenticatedData = Buffer.from(
      `obserra.fdacs.class-d.archive.v1|${artifactType}|${idempotencyKey}`,
      "utf8",
    );
    const cipher = createCipheriv("aes-256-gcm", key, initializationVector, {
      authTagLength: FLORIDA_CLASS_D_RECORD_ARCHIVE_POLICY.authenticationTagBytes,
    });
    cipher.setAAD(additionalAuthenticatedData);
    const encryptedPayload = Buffer.concat([
      cipher.update(plaintext),
      cipher.final(),
      cipher.getAuthTag(),
    ]);
    return {
      keyReference,
      initializationVector,
      encryptedPayload,
      plaintextSha256: createHash("sha256").update(plaintext).digest("hex"),
      plaintextSizeBytes: plaintext.byteLength,
    };
  } finally {
    key.fill(0);
  }
}

async function completeExistingArtifact(job: ArchiveJob) {
  const existing = await floridaClassDPersistenceRequest<ExistingArtifact | null>(
    "rpc/fdacs_class_d_lookup_record_archive_job_artifact",
    {
      method: "POST",
      body: JSON.stringify({ p_job_id: job.job_id, p_worker_ref: WORKER_REF }),
    },
  );
  if (!existing) return null;
  if (!UUID_PATTERN.test(existing.artifactId) || !SHA256_PATTERN.test(existing.recordSha256)) {
    throw new FloridaClassDRecordArchiveError(
      "The existing controlled artifact reference is invalid.",
      502,
      "FDACS_RECORD_ARCHIVE_EXISTING_ARTIFACT_INVALID",
    );
  }
  await floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_complete_record_archive_job",
    {
      method: "POST",
      body: JSON.stringify({
        p_job_id: job.job_id,
        p_worker_ref: WORKER_REF,
        p_protected_artifact_id: existing.artifactId,
        p_artifact_record_sha256: existing.recordSha256,
      }),
    },
  );
  return { ...existing, recoveredCommittedArtifact: true as const };
}

async function archiveJob(job: ArchiveJob) {
  requireJob(job);
  const recovered = await completeExistingArtifact(job);
  if (recovered) return recovered;

  const source = await buildArchivePayload(job);
  const encrypted = encryptPayload(source.payload, source.artifactType, job.idempotency_key);
  const operationalRetainUntil = plusCalendarYears(
    source.retentionAnchorDate,
    FLORIDA_CLASS_D_RECORD_ARCHIVE_POLICY.operationalRetentionYears,
  );
  const artifact = await floridaClassDPersistenceRequest<ArchivedArtifact>(
    "rpc/fdacs_class_d_archive_protected_artifact",
    {
      method: "POST",
      body: JSON.stringify({
        p_enrollment_id: job.enrollment_id,
        p_idempotency_key: job.idempotency_key,
        p_artifact_type: source.artifactType,
        p_classification: "regulated_student_pii",
        p_key_reference: encrypted.keyReference,
        p_initialization_vector: toBytea(encrypted.initializationVector),
        p_encrypted_payload: toBytea(encrypted.encryptedPayload),
        p_plaintext_sha256: encrypted.plaintextSha256,
        p_plaintext_size_bytes: encrypted.plaintextSizeBytes,
        p_content_type: "application/json",
        p_source_system: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC LMS",
        p_retention_anchor_date: source.retentionAnchorDate,
        p_operational_retain_until: operationalRetainUntil,
        p_legal_hold_active: false,
        p_actor_ref: WORKER_REF,
        p_correlation_id: job.correlation_id,
      }),
    },
  );
  if (!UUID_PATTERN.test(artifact.artifactId) || !SHA256_PATTERN.test(artifact.recordSha256)) {
    throw new FloridaClassDRecordArchiveError(
      "The controlled archive returned an invalid artifact reference.",
      502,
      "FDACS_RECORD_ARCHIVE_ARTIFACT_INVALID",
    );
  }
  await floridaClassDPersistenceRequest<Record<string, unknown>>(
    "rpc/fdacs_class_d_complete_record_archive_job",
    {
      method: "POST",
      body: JSON.stringify({
        p_job_id: job.job_id,
        p_worker_ref: WORKER_REF,
        p_protected_artifact_id: artifact.artifactId,
        p_artifact_record_sha256: artifact.recordSha256,
      }),
    },
  );
  return { ...artifact, recoveredCommittedArtifact: false as const };
}

function safeFailure(error: unknown) {
  const requestedCode = error && typeof error === "object" && "code" in error && typeof error.code === "string"
    ? error.code.toUpperCase().replace(/[^A-Z0-9_]/g, "_").slice(0, 100)
    : "FDACS_RECORD_ARCHIVE_JOB_FAILED";
  const code = SAFE_ERROR_CODE_PATTERN.test(requestedCode) ? requestedCode : "FDACS_RECORD_ARCHIVE_JOB_FAILED";
  const fingerprintInput = error instanceof Error ? `${error.name}:${error.message}` : "unknown archive failure";
  return { code, sha256: createHash("sha256").update(fingerprintInput).digest("hex") };
}

async function failJob(job: ArchiveJob, error: unknown) {
  const safe = safeFailure(error);
  try {
    return await floridaClassDPersistenceRequest<Record<string, unknown>>(
      "rpc/fdacs_class_d_fail_record_archive_job",
      {
        method: "POST",
        body: JSON.stringify({
          p_job_id: job.job_id,
          p_worker_ref: WORKER_REF,
          p_error_code: safe.code,
          p_error_sha256: safe.sha256,
        }),
      },
    );
  } catch {
    return { status: "failure_record_deferred" };
  }
}

export async function processFloridaClassDRecordArchiveJobs(input: {
  limit?: number;
  jobId?: string | null;
} = {}) {
  requireArchiveEnabled();
  const limit = input.limit ?? 10;
  if (!Number.isInteger(limit) || limit < 1 || limit > 25) {
    throw new FloridaClassDRecordArchiveError(
      "Archive worker limit must be between 1 and 25.",
      400,
      "FDACS_RECORD_ARCHIVE_LIMIT_INVALID",
    );
  }
  if (input.jobId && !UUID_PATTERN.test(input.jobId)) {
    throw new FloridaClassDRecordArchiveError(
      "Archive job identifier is invalid.",
      400,
      "FDACS_RECORD_ARCHIVE_JOB_ID_INVALID",
    );
  }
  archiveConfig().key.fill(0);

  const jobs = await floridaClassDPersistenceRequest<ArchiveJob[]>(
    "rpc/fdacs_class_d_claim_record_archive_jobs",
    {
      method: "POST",
      body: JSON.stringify({
        p_worker_ref: WORKER_REF,
        p_limit: limit,
        p_job_id: input.jobId ?? null,
      }),
    },
  );

  const results: Array<Record<string, unknown>> = [];
  for (const job of jobs) {
    try {
      const artifact = await archiveJob(job);
      results.push({
        jobId: job.job_id,
        jobType: job.job_type,
        status: "completed",
        artifactId: artifact.artifactId,
        recordSha256: artifact.recordSha256,
        recoveredCommittedArtifact: artifact.recoveredCommittedArtifact,
      });
    } catch (error) {
      const failure = await failJob(job, error);
      results.push({
        jobId: job.job_id,
        jobType: job.job_type,
        status: "deferred",
        errorCode: safeFailure(error).code,
        queue: failure,
      });
    }
  }
  return {
    schema: "obserra.fdacs.class-d.automatic-record-archive-run.v1",
    processed: results.length,
    completed: results.filter((result) => result.status === "completed").length,
    deferred: results.filter((result) => result.status === "deferred").length,
    results,
  };
}

export async function processFloridaClassDRecordArchiveByIdempotencyKey(idempotencyKey: string) {
  if (!floridaClassDRecordArchiveEnabled()) {
    return { attempted: false as const, status: "queued_archive_disabled" as const };
  }
  const job = await floridaClassDPersistenceRequest<ArchiveJobLookup | null>(
    "rpc/fdacs_class_d_lookup_record_archive_job",
    {
      method: "POST",
      body: JSON.stringify({ p_idempotency_key: idempotencyKey }),
    },
  );
  if (!job) return { attempted: false as const, status: "job_not_found" as const };
  if (job.status === "completed") return { attempted: false as const, status: "completed" as const, jobId: job.jobId };
  if (job.status === "processing" || job.status === "dead_letter") {
    return { attempted: false as const, status: job.status, jobId: job.jobId };
  }
  const run = await processFloridaClassDRecordArchiveJobs({ limit: 1, jobId: job.jobId });
  return { attempted: true as const, status: run.completed === 1 ? "completed" as const : "deferred" as const, jobId: job.jobId, run };
}

export function floridaClassDRecordArchiveErrorStatus(error: unknown) {
  if (error instanceof FloridaClassDRecordArchiveError || error instanceof FloridaClassDPersistenceError) {
    return { status: error.status, message: error.message, code: error.code };
  }
  return null;
}
