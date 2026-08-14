import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  FloridaClassDPersistenceError,
  recordFloridaClassDAttendance,
} from "../../../../../lib/florida-class-d-persistence";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

const statuses = new Set(["present", "partial", "absent", "makeup_required", "made_up"]);

type AttendanceRequest = {
  enrollmentId?: unknown;
  day?: unknown;
  status?: unknown;
  checkedInAt?: unknown;
  checkedOutAt?: unknown;
  instructionalMinutesCredited?: unknown;
  idempotencyKey?: unknown;
  correlationId?: unknown;
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDPersistenceError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_AUTHORIZATION_FAILED" },
      { status: error.status, headers: responseHeaders },
    );
  }
  console.error("Florida Class D attendance API failed", error);
  return NextResponse.json(
    { error: "Unable to record regulated attendance.", code: "FDACS_ATTENDANCE_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as AttendanceRequest | null;
    if (
      !body ||
      typeof body.enrollmentId !== "string" ||
      typeof body.day !== "number" ||
      !Number.isInteger(body.day) ||
      body.day < 1 ||
      body.day > 5 ||
      typeof body.status !== "string" ||
      !statuses.has(body.status) ||
      typeof body.instructionalMinutesCredited !== "number" ||
      !Number.isInteger(body.instructionalMinutesCredited) ||
      typeof body.idempotencyKey !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid attendance request.", code: "FDACS_INVALID_ATTENDANCE_REQUEST" },
        { status: 400, headers: responseHeaders },
      );
    }

    const checkedInAt = body.checkedInAt == null ? null : typeof body.checkedInAt === "string" ? body.checkedInAt : undefined;
    const checkedOutAt = body.checkedOutAt == null ? null : typeof body.checkedOutAt === "string" ? body.checkedOutAt : undefined;
    if (checkedInAt === undefined || checkedOutAt === undefined) {
      return NextResponse.json(
        { error: "Invalid attendance timestamp.", code: "FDACS_INVALID_ATTENDANCE_TIMESTAMP" },
        { status: 400, headers: responseHeaders },
      );
    }

    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const entryId = await recordFloridaClassDAttendance(
      { userId: actor.userId, role: actor.role },
      {
        enrollmentId: body.enrollmentId,
        day: body.day as 1 | 2 | 3 | 4 | 5,
        status: body.status as "present" | "partial" | "absent" | "makeup_required" | "made_up",
        checkedInAt,
        checkedOutAt,
        instructionalMinutesCredited: body.instructionalMinutesCredited,
        idempotencyKey: body.idempotencyKey,
        correlationId,
      },
    );

    return NextResponse.json(
      { entryId, correlationId, status: "recorded" },
      { status: 201, headers: responseHeaders },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
