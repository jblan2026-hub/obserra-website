import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  activateFloridaClassDOwnerUatEnrollment,
  assignFloridaClassDCohort,
  FloridaClassDPersistenceError,
  listFloridaClassDPendingEnrollments,
  reviewFloridaClassDEnrollment,
} from "../../../../../lib/florida-class-d-persistence";
import {
  floridaClassDOwnerUatExecutionAuthorized,
} from "../../../../../lib/florida-class-d-owner-uat";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

const outcomes = new Set(["approved_pending_entitlement", "needs_information", "rejected"]);

type EnrollmentActionRequest = {
  action?: unknown;
  enrollmentId?: unknown;
  cohortId?: unknown;
  outcome?: unknown;
  reviewNote?: unknown;
  correlationId?: unknown;
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDPersistenceError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_AUTHORIZATION_FAILED" },
      { status: error.status, headers: responseHeaders },
    );
  }
  console.error("Florida Class D enrollment administration API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process regulated enrollment administration.", code: "FDACS_ENROLLMENT_ADMIN_FAILED" },
    { status: 500, headers: responseHeaders },
  );
}

export async function GET() {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const enrollments = await listFloridaClassDPendingEnrollments();
    return NextResponse.json({ enrollments }, { headers: responseHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as EnrollmentActionRequest | null;
    if (!body || typeof body.action !== "string" || typeof body.enrollmentId !== "string") {
      return NextResponse.json(
        { error: "Invalid enrollment action request.", code: "FDACS_INVALID_ENROLLMENT_ACTION" },
        { status: 400, headers: responseHeaders },
      );
    }

    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();

    if (body.action === "assign_cohort") {
      if (typeof body.cohortId !== "string") {
        return NextResponse.json(
          { error: "Cohort id is required.", code: "FDACS_COHORT_ID_REQUIRED" },
          { status: 400, headers: responseHeaders },
        );
      }
      await assignFloridaClassDCohort(
        { userId: actor.userId, role: actor.role },
        { enrollmentId: body.enrollmentId, cohortId: body.cohortId, correlationId },
      );
      return NextResponse.json(
        { action: "assign_cohort", correlationId, status: "updated" },
        { headers: responseHeaders },
      );
    }

    if (body.action === "review") {
      if (
        typeof body.outcome !== "string" ||
        !outcomes.has(body.outcome) ||
        (body.reviewNote != null && typeof body.reviewNote !== "string")
      ) {
        return NextResponse.json(
          { error: "Valid enrollment review outcome is required.", code: "FDACS_REVIEW_OUTCOME_REQUIRED" },
          { status: 400, headers: responseHeaders },
        );
      }
      const reviewId = await reviewFloridaClassDEnrollment(
        { userId: actor.userId, role: actor.role },
        {
          enrollmentId: body.enrollmentId,
          outcome: body.outcome as "approved_pending_entitlement" | "needs_information" | "rejected",
          reviewNote: typeof body.reviewNote === "string" ? body.reviewNote : null,
          correlationId,
        },
      );
      return NextResponse.json(
        { action: "review", reviewId, correlationId, outcome: body.outcome },
        { headers: responseHeaders },
      );
    }

    if (body.action === "activate_owner_uat") {
      if (!floridaClassDOwnerUatExecutionAuthorized()) {
        return NextResponse.json(
          { error: "Exact-release owner UAT is not authorized.", code: "FDACS_OWNER_UAT_NOT_AUTHORIZED" },
          { status: 503, headers: responseHeaders },
        );
      }
      const result = await activateFloridaClassDOwnerUatEnrollment(
        { userId: actor.userId, role: actor.role },
        body.enrollmentId,
        process.env.VERCEL_GIT_COMMIT_SHA?.trim() || "",
        correlationId,
      );
      return NextResponse.json(
        { action: "activate_owner_uat", correlationId, result },
        { headers: responseHeaders },
      );
    }

    return NextResponse.json(
      { error: "Unsupported enrollment action.", code: "FDACS_UNSUPPORTED_ENROLLMENT_ACTION" },
      { status: 400, headers: responseHeaders },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
