import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  FloridaClassDSchedulingError,
  floridaClassDSchedulingEnabled,
  prepareFloridaClassDOwnerUatCohort,
  publishFloridaClassDCohortSchedule,
} from "../../../../../lib/florida-class-d-scheduling";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type Body = {
  action?: unknown;
  cohortId?: unknown;
  trainingDates?: unknown;
  dayStartLocal?: unknown;
  timeZone?: unknown;
  instructorClerkUserId?: unknown;
  correlationId?: unknown;
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDSchedulingError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_SCHEDULE_AUTHORIZATION_FAILED" },
      { status: error.status, headers },
    );
  }
  console.error("Florida Class D cohort scheduling failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to publish the regulated Class D cohort schedule.", code: "FDACS_SCHEDULE_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDSchedulingEnabled()) {
      return NextResponse.json(
        { error: "Class D controlled scheduling is not yet enabled.", code: "FDACS_SCHEDULE_NOT_ENABLED" },
        { status: 503, headers: { ...headers, "retry-after": "86400" } },
      );
    }
    const actor = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as Body | null;
    if (body?.action === "prepare_owner_uat") {
      const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
      const cohortId = await prepareFloridaClassDOwnerUatCohort(actor, correlationId);
      return NextResponse.json(
        {
          action: "prepare_owner_uat",
          cohortId,
          correlationId,
          executionProfile: "owner_uat_noncredit",
          trainingCreditEligible: false,
          fdacsApprovalClaimed: false,
        },
        { status: 201, headers },
      );
    }
    if (
      !body ||
      typeof body.cohortId !== "string" ||
      !Array.isArray(body.trainingDates) ||
      !body.trainingDates.every((value) => typeof value === "string") ||
      typeof body.dayStartLocal !== "string" ||
      typeof body.timeZone !== "string" ||
      typeof body.instructorClerkUserId !== "string"
    ) {
      return NextResponse.json({ error: "Cohort scheduling fields are incomplete.", code: "FDACS_SCHEDULE_INVALID_REQUEST" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const lessons = await publishFloridaClassDCohortSchedule(actor, {
      cohortId: body.cohortId,
      trainingDates: body.trainingDates as string[],
      dayStartLocal: body.dayStartLocal,
      timeZone: body.timeZone,
      instructorClerkUserId: body.instructorClerkUserId,
      correlationId,
    });
    return NextResponse.json({
      cohortId: body.cohortId,
      lessonCount: lessons.length,
      lessons,
      correlationId,
    }, { status: 201, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
