import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  floridaClassDIdentityErrorStatus,
  getFloridaClassDInstructorIdentityReviewContext,
  recordFloridaClassDDailyAttendanceAttestation,
  recordFloridaClassDDailyIdentityCheckin,
  recordFloridaClassDInstructorIdentityAttestation,
} from "../../../../../lib/florida-class-d-identity-verification";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  pragma: "no-cache",
  expires: "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

type AttestationRequest = {
  action?: unknown;
  enrollmentId?: unknown;
  verificationSessionId?: unknown;
  instructorFileId?: unknown;
  observedPhotoIdType?: unknown;
  issuingJurisdiction?: unknown;
  acceptanceRunId?: unknown;
  anchorLiveSessionId?: unknown;
  attendanceEntryId?: unknown;
  identityAttestationId?: unknown;
  attestedAt?: unknown;
  correlationId?: unknown;
};

const photoIdTypes = new Set([
  "state_driver_license",
  "state_identification_card",
  "us_passport",
  "federal_photo_identification",
]);

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
  console.error("Florida Class D instructor identity API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process instructor identity evidence.", code: "FDACS_INSTRUCTOR_IDENTITY_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function GET(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["instructor"]);
    const searchParams = new URL(request.url).searchParams;
    const enrollmentId = searchParams.get("enrollmentId");
    const liveSessionId = searchParams.get("liveSessionId");
    if (!enrollmentId || !liveSessionId) {
      return NextResponse.json(
        { error: "Enrollment and live-session ids are required.", code: "FDACS_IDENTITY_CONTEXT_REQUIRED" },
        { status: 400, headers: responseHeaders },
      );
    }
    const correlationId = crypto.randomUUID();
    const context = await getFloridaClassDInstructorIdentityReviewContext({
      enrollmentId,
      liveSessionId,
      actorClerkUserId: actor.userId,
      correlationId,
    });
    return NextResponse.json({ context, correlationId }, { headers: responseHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["instructor"]);
    const body = await request.json().catch(() => null) as AttestationRequest | null;
    if (!body || typeof body.action !== "string" || typeof body.enrollmentId !== "string") {
      return NextResponse.json(
        { error: "Invalid instructor identity request.", code: "FDACS_INSTRUCTOR_IDENTITY_REQUEST_INVALID" },
        { status: 400, headers: responseHeaders },
      );
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const attestedAt = typeof body.attestedAt === "string" ? body.attestedAt : new Date().toISOString();

    if (body.action === "identity_attestation") {
      if (
        typeof body.verificationSessionId !== "string" ||
        typeof body.instructorFileId !== "string" ||
        typeof body.observedPhotoIdType !== "string" ||
        !photoIdTypes.has(body.observedPhotoIdType) ||
        typeof body.issuingJurisdiction !== "string" ||
        (body.acceptanceRunId != null && typeof body.acceptanceRunId !== "string")
      ) {
        return NextResponse.json(
          { error: "Identity attestation evidence is incomplete.", code: "FDACS_IDENTITY_ATTESTATION_INCOMPLETE" },
          { status: 400, headers: responseHeaders },
        );
      }
      const result = await recordFloridaClassDInstructorIdentityAttestation({
        enrollmentId: body.enrollmentId,
        verificationSessionId: body.verificationSessionId,
        instructorFileId: body.instructorFileId,
        observedPhotoIdType: body.observedPhotoIdType as "state_driver_license" | "state_identification_card" | "us_passport" | "federal_photo_identification",
        issuingJurisdiction: body.issuingJurisdiction,
        actorClerkUserId: actor.userId,
        attestedAt,
        acceptanceRunId: typeof body.acceptanceRunId === "string" ? body.acceptanceRunId : null,
        correlationId,
      });
      return NextResponse.json({ result, correlationId }, { status: 201, headers: responseHeaders });
    }

    if (body.action === "daily_identity_checkin") {
      if (
        typeof body.anchorLiveSessionId !== "string" ||
        typeof body.identityAttestationId !== "string" ||
        typeof body.instructorFileId !== "string"
      ) {
        return NextResponse.json(
          { error: "Daily identity check-in evidence is incomplete.", code: "FDACS_DAILY_IDENTITY_CHECKIN_INCOMPLETE" },
          { status: 400, headers: responseHeaders },
        );
      }
      const result = await recordFloridaClassDDailyIdentityCheckin({
        enrollmentId: body.enrollmentId,
        anchorLiveSessionId: body.anchorLiveSessionId,
        identityAttestationId: body.identityAttestationId,
        instructorFileId: body.instructorFileId,
        actorClerkUserId: actor.userId,
        attestedAt,
        correlationId,
      });
      return NextResponse.json({ result, correlationId }, { status: 201, headers: responseHeaders });
    }

    if (body.action === "daily_attendance_attestation") {
      if (
        typeof body.anchorLiveSessionId !== "string" ||
        typeof body.attendanceEntryId !== "string" ||
        typeof body.identityAttestationId !== "string" ||
        typeof body.instructorFileId !== "string"
      ) {
        return NextResponse.json(
          { error: "Daily attendance attestation evidence is incomplete.", code: "FDACS_DAILY_ATTESTATION_INCOMPLETE" },
          { status: 400, headers: responseHeaders },
        );
      }
      const result = await recordFloridaClassDDailyAttendanceAttestation({
        enrollmentId: body.enrollmentId,
        anchorLiveSessionId: body.anchorLiveSessionId,
        attendanceEntryId: body.attendanceEntryId,
        identityAttestationId: body.identityAttestationId,
        instructorFileId: body.instructorFileId,
        actorClerkUserId: actor.userId,
        attestedAt,
        correlationId,
      });
      return NextResponse.json({ result, correlationId }, { status: 201, headers: responseHeaders });
    }

    return NextResponse.json(
      { error: "Unsupported instructor identity action.", code: "FDACS_INSTRUCTOR_IDENTITY_ACTION_UNSUPPORTED" },
      { status: 400, headers: responseHeaders },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
