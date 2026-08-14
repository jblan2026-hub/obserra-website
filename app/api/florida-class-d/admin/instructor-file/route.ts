import { NextResponse } from "next/server";
import {
  ensureFloridaClassDInstructorRole,
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
  validateFloridaClassDInstructorPrincipal,
} from "../../../../../lib/florida-class-d-auth";
import {
  FloridaClassDInstructorProvisioningError,
  getFloridaClassDOwnerUatInstructorReadiness,
  provisionFloridaClassDInstructorFile,
} from "../../../../../lib/florida-class-d-instructor-provisioning";
import {
  floridaClassDOwnerUatExecutionAuthorized,
  getFloridaClassDOwnerUatReport,
} from "../../../../../lib/florida-class-d-owner-uat";
import { FloridaClassDPersistenceError } from "../../../../../lib/florida-class-d-persistence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = 4_300_000;
const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  pragma: "no-cache",
  expires: "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

function value(form: FormData, key: string) {
  const entry = form.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function evidenceFile(form: FormData, key: string) {
  const entry = form.get(key);
  return entry && typeof entry === "object" && "arrayBuffer" in entry && "size" in entry
    ? entry as File
    : null;
}

function ownerUatDisabled() {
  return NextResponse.json(
    {
      error: "Instructor provisioning is available only in an authorized, exact-release owner-UAT Preview.",
      code: "FDACS_INSTRUCTOR_OWNER_UAT_NOT_AUTHORIZED",
    },
    { status: 503, headers: { ...headers, "retry-after": "86400" } },
  );
}

function errorResponse(error: unknown) {
  if (
    error instanceof FloridaClassDAuthorizationError
    || error instanceof FloridaClassDInstructorProvisioningError
    || error instanceof FloridaClassDPersistenceError
  ) {
    return NextResponse.json(
      {
        error: error.message,
        code: "code" in error ? error.code : "FDACS_INSTRUCTOR_AUTHORIZATION_FAILED",
      },
      { status: error.status, headers },
    );
  }
  console.error(
    "Florida Class D instructor provisioning failed",
    error instanceof Error ? error.name : "unknown_error",
  );
  return NextResponse.json(
    {
      error: "Unable to complete protected Class DI instructor provisioning.",
      code: "FDACS_INSTRUCTOR_PROVISIONING_FAILED",
    },
    { status: 500, headers },
  );
}

export async function GET() {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    if (!floridaClassDOwnerUatExecutionAuthorized()) return ownerUatDisabled();
    const report = getFloridaClassDOwnerUatReport();
    const requiredThrough = report.expiresAt?.slice(0, 10);
    if (!requiredThrough) return ownerUatDisabled();
    const readiness = await getFloridaClassDOwnerUatInstructorReadiness(requiredThrough);
    return NextResponse.json(
      {
        ...readiness,
        executionProfile: "owner_uat_noncredit",
        secretsExposed: false,
      },
      { status: readiness.ready ? 200 : 503, headers },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
      return NextResponse.json(
        { error: "Combined instructor evidence upload is too large.", code: "FDACS_INSTRUCTOR_MULTIPART_TOO_LARGE" },
        { status: 413, headers },
      );
    }
    const actor = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    if (!floridaClassDOwnerUatExecutionAuthorized()) return ownerUatDisabled();
    const form = await request.formData().catch(() => null);
    if (!form || value(form, "verificationAttestation") !== "accepted") {
      return NextResponse.json(
        {
          error: "The administrator verification attestation is required.",
          code: "FDACS_INSTRUCTOR_VERIFICATION_ATTESTATION_REQUIRED",
        },
        { status: 400, headers },
      );
    }

    const instructorClerkUserId = value(form, "instructorClerkUserId");
    const qualificationEvidence = evidenceFile(form, "qualificationEvidence");
    const licenseEvidence = evidenceFile(form, "licenseEvidence");
    if (!qualificationEvidence || !licenseEvidence) {
      return NextResponse.json(
        { error: "Both qualification and Class DI license evidence files are required.", code: "FDACS_INSTRUCTOR_EVIDENCE_REQUIRED" },
        { status: 400, headers },
      );
    }

    await validateFloridaClassDInstructorPrincipal(instructorClerkUserId, actor.userId);
    const correlationId = crypto.randomUUID();
    const result = await provisionFloridaClassDInstructorFile(actor, {
      instructorClerkUserId,
      instructorLegalName: value(form, "instructorLegalName"),
      diLicenseNumber: value(form, "diLicenseNumber"),
      licenseVerifiedAt: value(form, "licenseVerifiedAt"),
      licenseExpiresOn: value(form, "licenseExpiresOn") || null,
      qualificationEvidence,
      licenseEvidence,
      supersedesInstructorFileId: value(form, "supersedesInstructorFileId") || null,
      correlationId,
    });
    const role = await ensureFloridaClassDInstructorRole(instructorClerkUserId);
    return NextResponse.json(
      {
        instructorFileId: result.instructorFileId ?? null,
        recordSha256: result.recordSha256 ?? null,
        qualificationArtifactId: result.qualificationArtifactId ?? null,
        qualificationPlaintextSha256: result.qualificationPlaintextSha256 ?? null,
        licenseArtifactId: result.licenseArtifactId ?? null,
        licensePlaintextSha256: result.licensePlaintextSha256 ?? null,
        idempotentReplay: result.idempotentReplay === true,
        instructorRoleAssigned: role.roleAssigned,
        correlationId,
        licenseStatus: "verified_active",
        executionProfile: "owner_uat_noncredit",
        secretsExposed: false,
      },
      { status: 201, headers },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
