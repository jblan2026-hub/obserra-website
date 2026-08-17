import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createFloridaClassDProductionOwnerIdentityVerification,
  getFloridaClassDProductionOwnerIdentityVerificationStatus,
} from "../../../../../lib/florida-class-d-production-owner-identity";

const COOKIE_NAME = "__Host-obserra-fdacs-owner-idv";
const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  pragma: "no-cache",
  expires: "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

function unavailableResponse() {
  return NextResponse.json(
    {
      error: "Production owner identity validation is not authorized for this exact release.",
      code: "FDACS_OWNER_IDENTITY_VALIDATION_NOT_AUTHORIZED",
      trainingCreditEligible: false,
      enrollmentCreated: false,
      fdacsApprovalClaimed: false,
    },
    { status: 503, headers: responseHeaders },
  );
}

export async function POST() {
  try {
    const created = await createFloridaClassDProductionOwnerIdentityVerification();
    const response = NextResponse.json(
      {
        url: created.verificationUrl,
        status: created.status,
        providerLivemode: created.providerLivemode,
        trainingCreditEligible: false,
        enrollmentCreated: false,
        fdacsApprovalClaimed: false,
      },
      { status: 201, headers: responseHeaders },
    );
    response.cookies.set(COOKIE_NAME, created.verificationSessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("Production owner Stripe Identity session creation failed", error instanceof Error ? error.name : "unknown_error");
    return unavailableResponse();
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const verificationSessionId = cookieStore.get(COOKIE_NAME)?.value ?? "";
  if (!verificationSessionId) {
    return NextResponse.json(
      {
        error: "No production owner identity validation session is active.",
        code: "FDACS_OWNER_IDENTITY_SESSION_NOT_FOUND",
        trainingCreditEligible: false,
        enrollmentCreated: false,
        fdacsApprovalClaimed: false,
      },
      { status: 404, headers: responseHeaders },
    );
  }

  try {
    const status = await getFloridaClassDProductionOwnerIdentityVerificationStatus(verificationSessionId);
    return NextResponse.json(
      {
        status: status.status,
        verified: status.verified,
        providerLivemode: status.providerLivemode,
        providerErrorCode: status.providerErrorCode,
        trainingCreditEligible: false,
        enrollmentCreated: false,
        fdacsApprovalClaimed: false,
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("Production owner Stripe Identity session retrieval failed", error instanceof Error ? error.name : "unknown_error");
    return unavailableResponse();
  }
}
