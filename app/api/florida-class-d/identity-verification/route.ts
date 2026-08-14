import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDSignedInUser,
} from "../../../../lib/florida-class-d-auth";
import {
  createFloridaClassDAutomatedIdentityVerification,
  FLORIDA_CLASS_D_IDENTITY_CONSENT_VERSION,
  floridaClassDAutomatedIdentityVerificationEnabled,
  floridaClassDIdentityErrorStatus,
  getFloridaClassDIdentityVerificationStatus,
} from "../../../../lib/florida-class-d-identity-verification";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  pragma: "no-cache",
  expires: "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

type CreateRequest = {
  enrollmentId?: unknown;
  consentAccepted?: unknown;
  consentVersion?: unknown;
  correlationId?: unknown;
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError) {
    return NextResponse.json(
      { error: error.message, code: "FDACS_AUTHORIZATION_FAILED" },
      { status: error.status, headers: responseHeaders },
    );
  }
  const identityError = floridaClassDIdentityErrorStatus(error);
  if (identityError) {
    return NextResponse.json(
      { error: identityError.message, code: identityError.code },
      { status: identityError.status, headers: responseHeaders },
    );
  }
  console.error("Florida Class D identity API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process automated identity verification.", code: "FDACS_IDENTITY_VERIFICATION_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function GET() {
  try {
    const { userId } = await requireFloridaClassDSignedInUser();
    const status = await getFloridaClassDIdentityVerificationStatus(userId);
    return NextResponse.json(
      {
        status,
        verificationEnabled: floridaClassDAutomatedIdentityVerificationEnabled(),
        consentVersion: FLORIDA_CLASS_D_IDENTITY_CONSENT_VERSION,
        identityImagesStoredByLms: false,
        biometricTemplatesStoredByLms: false,
        instructorAttestationRequired: true,
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
    const body = await request.json().catch(() => null) as CreateRequest | null;
    if (
      !body ||
      typeof body.enrollmentId !== "string" ||
      body.consentAccepted !== true ||
      typeof body.consentVersion !== "string"
    ) {
      return NextResponse.json(
        { error: "Current consent and enrollment are required.", code: "FDACS_IDENTITY_REQUEST_INVALID" },
        { status: 400, headers: responseHeaders },
      );
    }

    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const result = await createFloridaClassDAutomatedIdentityVerification({
      actorClerkUserId: userId,
      enrollmentId: body.enrollmentId,
      consentAccepted: true,
      consentVersion: body.consentVersion,
      correlationId,
    });
    return NextResponse.json(
      { ...result, correlationId },
      { status: result.url ? 201 : 200, headers: responseHeaders },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
