import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  FloridaClassDPersistenceError,
  recordFloridaClassDInstructionTime,
} from "../../../../../lib/florida-class-d-persistence";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

const sources = new Set(["lms_session", "instructor_attested_makeup"]);

type InstructionTimeRequest = {
  enrollmentId?: unknown;
  moduleId?: unknown;
  startedAt?: unknown;
  endedAt?: unknown;
  creditedMinutes?: unknown;
  source?: unknown;
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
  console.error("Florida Class D instructional-time API failed", error);
  return NextResponse.json(
    { error: "Unable to record regulated instructional time.", code: "FDACS_INSTRUCTION_TIME_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as InstructionTimeRequest | null;
    if (
      !body ||
      typeof body.enrollmentId !== "string" ||
      typeof body.moduleId !== "number" ||
      !Number.isInteger(body.moduleId) ||
      body.moduleId < 1 ||
      body.moduleId > 18 ||
      typeof body.startedAt !== "string" ||
      typeof body.endedAt !== "string" ||
      typeof body.creditedMinutes !== "number" ||
      !Number.isInteger(body.creditedMinutes) ||
      typeof body.source !== "string" ||
      !sources.has(body.source) ||
      typeof body.idempotencyKey !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid instructional-time request.", code: "FDACS_INVALID_INSTRUCTION_TIME_REQUEST" },
        { status: 400, headers: responseHeaders },
      );
    }

    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const entryId = await recordFloridaClassDInstructionTime(
      { userId: actor.userId, role: actor.role },
      {
        enrollmentId: body.enrollmentId,
        moduleId: body.moduleId,
        startedAt: body.startedAt,
        endedAt: body.endedAt,
        creditedMinutes: body.creditedMinutes,
        source: body.source as "lms_session" | "instructor_attested_makeup",
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
