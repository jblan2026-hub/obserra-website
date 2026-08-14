import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  FloridaClassDPersistenceError,
  setFloridaClassDIdentityVerification,
} from "../../../../../lib/florida-class-d-persistence";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

const allowedStatuses = new Set(["pending", "verified", "rejected"]);

type IdentityRequest = {
  studentIdentityId?: unknown;
  status?: unknown;
  verificationReference?: unknown;
  correlationId?: unknown;
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDPersistenceError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_AUTHORIZATION_FAILED" },
      { status: error.status, headers: responseHeaders },
    );
  }
  console.error("Florida Class D identity verification API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to update regulated identity verification.", code: "FDACS_IDENTITY_VERIFICATION_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as IdentityRequest | null;
    if (
      !body ||
      typeof body.studentIdentityId !== "string" ||
      typeof body.status !== "string" ||
      !allowedStatuses.has(body.status) ||
      (body.verificationReference != null && typeof body.verificationReference !== "string")
    ) {
      return NextResponse.json(
        { error: "Invalid identity verification request.", code: "FDACS_INVALID_IDENTITY_REQUEST" },
        { status: 400, headers: responseHeaders },
      );
    }

    if (body.status === "verified" && (!body.verificationReference || body.verificationReference.trim().length < 3)) {
      return NextResponse.json(
        { error: "A verification reference is required to verify identity.", code: "FDACS_VERIFICATION_REFERENCE_REQUIRED" },
        { status: 400, headers: responseHeaders },
      );
    }

    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    await setFloridaClassDIdentityVerification(
      { userId: actor.userId, role: actor.role },
      {
        studentIdentityId: body.studentIdentityId,
        status: body.status as "pending" | "verified" | "rejected",
        verificationReference: typeof body.verificationReference === "string" ? body.verificationReference : null,
        correlationId,
      },
    );

    return NextResponse.json(
      { status: body.status, correlationId },
      { headers: responseHeaders },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
