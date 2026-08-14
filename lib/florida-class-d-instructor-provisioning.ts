import "server-only";

import {
  createCipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import type { FloridaClassDStaffRole } from "./florida-class-d-auth";
import { floridaClassDPersistenceRequest } from "./florida-class-d-persistence";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const STANDARD_BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4}){10}[A-Za-z0-9+/]{3}=$/;
const MAX_EVIDENCE_FILE_BYTES = 2_000_000;

type EvidenceFile = {
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
};

type ProvisioningActor = {
  userId: string;
  role: FloridaClassDStaffRole;
};

type EncryptedEvidence = {
  idempotencyKey: string;
  initializationVector: string;
  encryptedPayload: string;
  plaintextSha256: string;
  plaintextSizeBytes: number;
  contentType: string;
};

export type FloridaClassDInstructorReadiness = {
  ready?: boolean;
  verifiedActiveInstructorCount?: number;
  requiredThrough?: string;
  licenseValuesExposed?: false;
};

export class FloridaClassDInstructorProvisioningError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDInstructorProvisioningError";
  }
}

function value(name: string) {
  return process.env[name]?.trim() || "";
}

function decodeEncryptionKey() {
  const encoded = value("OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_BASE64");
  if (!STANDARD_BASE64_PATTERN.test(encoded)) {
    throw new FloridaClassDInstructorProvisioningError(
      "The protected FDACS record-encryption key is not configured correctly.",
      503,
      "FDACS_INSTRUCTOR_ENCRYPTION_NOT_CONFIGURED",
    );
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    key.fill(0);
    throw new FloridaClassDInstructorProvisioningError(
      "The protected FDACS record-encryption key is not configured correctly.",
      503,
      "FDACS_INSTRUCTOR_ENCRYPTION_NOT_CONFIGURED",
    );
  }
  return key;
}

function encryptionKeyReference() {
  const reference = value("OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_REFERENCE");
  if (reference.length < 3 || reference.length > 255 || /[\u0000-\u001F\u007F]/.test(reference)) {
    throw new FloridaClassDInstructorProvisioningError(
      "The external FDACS encryption-key reference is not configured correctly.",
      503,
      "FDACS_INSTRUCTOR_KEY_REFERENCE_NOT_CONFIGURED",
    );
  }
  return reference;
}

export function floridaClassDRecordEncryptionConfigured() {
  let key: Buffer | null = null;
  try {
    key = decodeEncryptionKey();
    encryptionKeyReference();
    return true;
  } catch {
    return false;
  } finally {
    key?.fill(0);
  }
}

function normalizeText(value: string, field: string, minimum: number, maximum: number) {
  const normalized = value.trim();
  if (
    normalized.length < minimum
    || normalized.length > maximum
    || /[\u0000-\u001F\u007F]/.test(normalized)
  ) {
    throw new FloridaClassDInstructorProvisioningError(
      `Invalid ${field}.`,
      400,
      "FDACS_INSTRUCTOR_INVALID_TEXT",
    );
  }
  return normalized;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new FloridaClassDInstructorProvisioningError(
      `Invalid ${field}.`,
      400,
      "FDACS_INSTRUCTOR_INVALID_IDENTIFIER",
    );
  }
}

function validCalendarDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function detectContentType(bytes: Buffer) {
  if (bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

async function readEvidence(file: EvidenceFile, label: string) {
  if (
    !file
    || typeof file.arrayBuffer !== "function"
    || !Number.isInteger(file.size)
    || file.size < 1
    || file.size > MAX_EVIDENCE_FILE_BYTES
  ) {
    throw new FloridaClassDInstructorProvisioningError(
      `${label} must be a non-empty PDF or supported image no larger than 2 MB.`,
      413,
      "FDACS_INSTRUCTOR_EVIDENCE_SIZE_INVALID",
    );
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = detectContentType(bytes);
  if (!contentType) {
    bytes.fill(0);
    throw new FloridaClassDInstructorProvisioningError(
      `${label} must be a valid PDF, JPEG, PNG, or WebP document.`,
      415,
      "FDACS_INSTRUCTOR_EVIDENCE_TYPE_INVALID",
    );
  }
  return { bytes, contentType };
}

function byteaHex(value: Buffer) {
  return `\\x${value.toString("hex")}`;
}

function encryptEvidence(
  kind: "qualification" | "license",
  instructorUserId: string,
  bytes: Buffer,
  contentType: string,
  key: Buffer,
): EncryptedEvidence {
  const plaintextSha256 = createHash("sha256").update(bytes).digest("hex");
  const idempotencyDigest = createHash("sha256")
    .update(`fdacs-class-d-instructor-${kind}-v1\0${instructorUserId}\0${plaintextSha256}`, "utf8")
    .digest("hex");
  const idempotencyKey = `fdacs-di-${kind}-v1:${idempotencyDigest}`;
  const initializationVector = randomBytes(12);
  const aad = Buffer.from(
    `obserra.fdacs.class-d.archive.v1|instructor_${kind}|${idempotencyKey}`,
    "utf8",
  );
  try {
    const cipher = createCipheriv("aes-256-gcm", key, initializationVector);
    cipher.setAAD(aad);
    const encryptedPayload = Buffer.concat([
      cipher.update(bytes),
      cipher.final(),
      cipher.getAuthTag(),
    ]);
    try {
      return {
        idempotencyKey,
        initializationVector: byteaHex(initializationVector),
        encryptedPayload: byteaHex(encryptedPayload),
        plaintextSha256,
        plaintextSizeBytes: bytes.length,
        contentType,
      };
    } finally {
      encryptedPayload.fill(0);
    }
  } finally {
    initializationVector.fill(0);
    aad.fill(0);
  }
}

export async function getFloridaClassDOwnerUatInstructorReadiness(requiredThrough: string) {
  if (!validCalendarDate(requiredThrough)) {
    throw new FloridaClassDInstructorProvisioningError(
      "A valid instructor-coverage date is required.",
      400,
      "FDACS_INSTRUCTOR_READINESS_DATE_INVALID",
    );
  }
  return floridaClassDPersistenceRequest<FloridaClassDInstructorReadiness>(
    "rpc/fdacs_class_d_owner_uat_instructor_readiness",
    {
      method: "POST",
      body: JSON.stringify({ p_required_through: requiredThrough }),
    },
  );
}

export async function provisionFloridaClassDInstructorFile(
  actor: ProvisioningActor,
  input: {
    instructorClerkUserId: string;
    instructorLegalName: string;
    diLicenseNumber: string;
    licenseVerifiedAt: string;
    licenseExpiresOn: string | null;
    qualificationEvidence: EvidenceFile;
    licenseEvidence: EvidenceFile;
    supersedesInstructorFileId: string | null;
    correlationId: string;
  },
) {
  if (actor.role !== "school_admin" && actor.role !== "compliance_admin") {
    throw new FloridaClassDInstructorProvisioningError(
      "Instructor-file provisioning requires school or compliance administration.",
      403,
      "FDACS_INSTRUCTOR_PROVISIONING_ADMIN_REQUIRED",
    );
  }
  const instructorClerkUserId = normalizeText(input.instructorClerkUserId, "instructor identity", 3, 255);
  const instructorLegalName = normalizeText(input.instructorLegalName, "instructor legal name", 1, 200);
  const diLicenseNumber = normalizeText(input.diLicenseNumber, "Class DI license number", 3, 80);
  requireUuid(input.correlationId, "correlation id");
  if (input.supersedesInstructorFileId) requireUuid(input.supersedesInstructorFileId, "superseded instructor-file id");
  const verifiedAt = Date.parse(input.licenseVerifiedAt);
  if (!Number.isFinite(verifiedAt) || verifiedAt > Date.now() + 5 * 60_000) {
    throw new FloridaClassDInstructorProvisioningError(
      "The license verification timestamp is invalid.",
      400,
      "FDACS_INSTRUCTOR_VERIFICATION_TIME_INVALID",
    );
  }
  if (!input.licenseExpiresOn || !validCalendarDate(input.licenseExpiresOn)) {
    throw new FloridaClassDInstructorProvisioningError(
      "A valid Class DI expiration date is required.",
      400,
      "FDACS_INSTRUCTOR_EXPIRATION_DATE_INVALID",
    );
  }

  const qualification = await readEvidence(input.qualificationEvidence, "Instructor qualification evidence");
  let license: Awaited<ReturnType<typeof readEvidence>>;
  try {
    license = await readEvidence(input.licenseEvidence, "Class DI license evidence");
  } catch (error) {
    qualification.bytes.fill(0);
    throw error;
  }
  let key: Buffer | null = null;
  try {
    key = decodeEncryptionKey();
    const keyReference = encryptionKeyReference();
    const encryptedQualification = encryptEvidence(
      "qualification",
      instructorClerkUserId,
      qualification.bytes,
      qualification.contentType,
      key,
    );
    const encryptedLicense = encryptEvidence(
      "license",
      instructorClerkUserId,
      license.bytes,
      license.contentType,
      key,
    );
    return await floridaClassDPersistenceRequest<Record<string, unknown>>(
      "rpc/fdacs_class_d_archive_and_register_instructor_file",
      {
        method: "POST",
        body: JSON.stringify({
          p_instructor_clerk_user_id: instructorClerkUserId,
          p_instructor_legal_name: instructorLegalName,
          p_di_license_number: diLicenseNumber,
          p_license_verified_at: new Date(verifiedAt).toISOString(),
          p_license_expires_on: input.licenseExpiresOn,
          p_key_reference: keyReference,
          p_qualification_idempotency_key: encryptedQualification.idempotencyKey,
          p_qualification_initialization_vector: encryptedQualification.initializationVector,
          p_qualification_encrypted_payload: encryptedQualification.encryptedPayload,
          p_qualification_plaintext_sha256: encryptedQualification.plaintextSha256,
          p_qualification_plaintext_size_bytes: encryptedQualification.plaintextSizeBytes,
          p_qualification_content_type: encryptedQualification.contentType,
          p_license_idempotency_key: encryptedLicense.idempotencyKey,
          p_license_initialization_vector: encryptedLicense.initializationVector,
          p_license_encrypted_payload: encryptedLicense.encryptedPayload,
          p_license_plaintext_sha256: encryptedLicense.plaintextSha256,
          p_license_plaintext_size_bytes: encryptedLicense.plaintextSizeBytes,
          p_license_content_type: encryptedLicense.contentType,
          p_supersedes_instructor_file_id: input.supersedesInstructorFileId,
          p_actor_role: actor.role,
          p_actor_clerk_user_id: actor.userId,
          p_correlation_id: input.correlationId,
        }),
      },
    );
  } finally {
    key?.fill(0);
    qualification.bytes.fill(0);
    license.bytes.fill(0);
  }
}
