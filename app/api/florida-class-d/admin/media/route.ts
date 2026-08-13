import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  FloridaClassDMediaError,
  floridaClassDLiveMediaEnabled,
  getFloridaClassDInstructorMediaAccess,
} from "../../../../../lib/florida-class-d-media";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDMediaError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_MEDIA_AUTHORIZATION_FAILED" },
      { status: error.status, headers },
    );
  }
  console.error("Florida Class D instructor media broker failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to provision instructor live media.", code: "FDACS_MEDIA_ADMIN_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function GET(request: Request) {
  try {
    if (!floridaClassDLiveMediaEnabled()) {
      return NextResponse.json(
        { error: "Class D live video is not yet enabled.", code: "FDACS_MEDIA_NOT_ENABLED" },
        { status: 503, headers: { ...headers, "retry-after": "86400" } },
      );
    }
    const actor = await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    const liveSessionId = new URL(request.url).searchParams.get("liveSessionId");
    if (!liveSessionId) {
      return NextResponse.json({ error: "Live session id is required.", code: "FDACS_MEDIA_SESSION_REQUIRED" }, { status: 400, headers });
    }
    const access = await getFloridaClassDInstructorMediaAccess(actor.userId, liveSessionId);
    return NextResponse.json(access, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
