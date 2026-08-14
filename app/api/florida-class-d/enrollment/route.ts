import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDSignedInUser,
} from "../../../../lib/florida-class-d-auth";
import {
  floridaClassDPreEnrollmentEnabled,
} from "../../../../lib/florida-class-d-enrollment-policy";
import {
  floridaClassDOwnerUatEvidenceSha256,
  floridaClassDOwnerUatExecutionAuthorized,
  floridaClassDOwnerUatProfileRequested,
} from "../../../../lib/florida-class-d-owner-uat";
import { floridaClassDProductionActivationAuthorized } from "../../../../lib/florida-class-d-production-activation";
import { getFloridaClassDProviderReadiness } from "../../../../lib/florida-class-d-provider-readiness";
import {
  createFloridaClassDPreEnrollment,
  FloridaClassDPersistenceError,
  getFloridaClassDEnrollmentStatusForUser,
  listFloridaClassDOpenEnrollmentCohorts,
} from "../../../../lib/florida-class-d-persistence";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type PreEnrollmentRequest = {
  legalName?: unknown;
  dateOfBirth?: unknown;
  cohortId?: unknown;
  acceptedAcknowledgmentCodes?: unknown;
  correlationId?: unknown;
};

function enrollmentEnabled() {
  const authorized = floridaClassDOwnerUatProfileRequested()
    ? floridaClassDOwnerUatExecutionAuthorized()
    : floridaClassDProductionActivationAuthorized();
  return authorized && floridaClassDPreEnrollmentEnabled();
}

function executionProfile() {
  return floridaClassDOwnerUatProfileRequested()
    ? "owner_uat_noncredit" as const
    : "production" as const;
}

function deployedReleaseSha() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.trim().toLowerCase() || "";
}

async function ownerUatProviderReadiness(profile: "production" | "owner_uat_noncredit") {
  if (profile !== "owner_uat_noncredit") return null;
  return getFloridaClassDProviderReadiness();
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDPersistenceError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_AUTHORIZATION_FAILED" },
      { status: error.status, headers: responseHeaders },
    );
  }
  console.error("Florida Class D pre-enrollment API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process the regulated pre-enrollment request.", code: "FDACS_PRE_ENROLLMENT_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function GET() {
  try {
    const { userId } = await requireFloridaClassDSignedInUser();
    const enrollment = await getFloridaClassDEnrollmentStatusForUser(userId);
    const profile = executionProfile();
    const configured = enrollmentEnabled();
    const providerReadiness = configured && !enrollment
      ? await ownerUatProviderReadiness(profile)
      : null;
    const enabled = configured && (providerReadiness?.ready ?? true);
    const cohorts = enabled && !enrollment
      ? await listFloridaClassDOpenEnrollmentCohorts(profile, deployedReleaseSha())
      : [];
    return NextResponse.json(
      {
        enrollment,
        cohorts,
        preEnrollmentEnabled: enabled,
        executionProfile: profile,
        trainingCreditEligible: profile === "production",
        fdacsApprovalClaimed: false,
        providerReadiness,
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireFloridaClassDSignedInUser();
    if (!enrollmentEnabled()) {
      return NextResponse.json(
        {
          error: "Florida Class D pre-enrollment is not yet enabled.",
          code: "FDACS_PRE_ENROLLMENT_NOT_ENABLED",
        },
        { status: 503, headers: { ...responseHeaders, "retry-after": "86400" } },
      );
    }

    const profile = executionProfile();
    const providerReadiness = await ownerUatProviderReadiness(profile);
    if (providerReadiness && !providerReadiness.ready) {
      return NextResponse.json(
        {
          error: "Live FDACS providers have not passed the protected read-only preflight.",
          code: "FDACS_OWNER_UAT_PROVIDER_PREFLIGHT_FAILED",
          providerReadiness,
        },
        { status: 503, headers: { ...responseHeaders, "retry-after": "300" } },
      );
    }

    const body = await request.json().catch(() => null) as PreEnrollmentRequest | null;
    if (
      !body ||
      typeof body.legalName !== "string" ||
      typeof body.dateOfBirth !== "string" ||
      typeof body.cohortId !== "string" ||
      !Array.isArray(body.acceptedAcknowledgmentCodes) ||
      !body.acceptedAcknowledgmentCodes.every((code) => typeof code === "string")
    ) {
      return NextResponse.json(
        { error: "Invalid pre-enrollment request.", code: "FDACS_INVALID_PRE_ENROLLMENT_REQUEST" },
        { status: 400, headers: responseHeaders },
      );
    }

    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const enrollmentId = await createFloridaClassDPreEnrollment(userId, {
      legalName: body.legalName,
      dateOfBirth: body.dateOfBirth,
      cohortId: body.cohortId,
      acceptedAcknowledgmentCodes: body.acceptedAcknowledgmentCodes,
      correlationId,
      executionProfile: profile,
      runtimeReleaseSha: deployedReleaseSha(),
      authorizationEvidenceSha256: floridaClassDOwnerUatEvidenceSha256(),
    });

    return NextResponse.json(
      {
        enrollmentId,
        correlationId,
        status: "pending_identity",
        instructionalAccessGranted: false,
        examAccessGranted: false,
        executionProfile: profile,
        trainingCreditEligible: profile === "production",
        fdacsApprovalClaimed: false,
      },
      { status: 201, headers: responseHeaders },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
