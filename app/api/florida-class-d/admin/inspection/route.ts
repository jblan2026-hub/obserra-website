import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  FloridaClassDPersistenceError,
  getFloridaClassDInspectionRecord,
} from "../../../../../lib/florida-class-d-persistence";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "content-disposition": "inline",
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDPersistenceError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_AUTHORIZATION_FAILED" },
      { status: error.status, headers: responseHeaders },
    );
  }
  console.error("Florida Class D inspection API failed", error);
  return NextResponse.json(
    { error: "Unable to produce the regulated inspection record.", code: "FDACS_INSPECTION_EXPORT_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function GET(request: Request) {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const enrollmentId = new URL(request.url).searchParams.get("enrollmentId");
    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment id is required.", code: "FDACS_ENROLLMENT_ID_REQUIRED" },
        { status: 400, headers: responseHeaders },
      );
    }

    const record = await getFloridaClassDInspectionRecord(enrollmentId);
    return NextResponse.json(record, { headers: responseHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}
