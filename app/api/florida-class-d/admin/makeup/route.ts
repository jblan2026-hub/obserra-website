import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  answerFloridaClassDMakeupQuestion,
  assignFloridaClassDMakeup,
  floridaClassDMakeupEnabled,
  FloridaClassDMakeupError,
  getFloridaClassDAdminMakeup,
  previewFloridaClassDMakeupReconciliation,
} from "../../../../../lib/florida-class-d-makeup";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type Body = {
  action?: unknown;
  enrollmentId?: unknown;
  trainingDay?: unknown;
  moduleId?: unknown;
  sourceLiveSessionId?: unknown;
  deliveryMethod?: unknown;
  assignedMinutes?: unknown;
  reason?: unknown;
  recordingAssetReference?: unknown;
  assignedInstructorClerkUserId?: unknown;
  questionId?: unknown;
  answer?: unknown;
  assignmentId?: unknown;
  correlationId?: unknown;
};

function disabled() {
  return NextResponse.json(
    { error: "Florida Class D make-up administration is not yet enabled.", code: "FDACS_MAKEUP_NOT_ENABLED" },
    { status: 503, headers: { ...headers, "retry-after": "86400" } },
  );
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDMakeupError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_MAKEUP_AUTHORIZATION_FAILED" },
      { status: error.status, headers },
    );
  }
  console.error("Florida Class D make-up administration API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process the regulated make-up administration request.", code: "FDACS_MAKEUP_ADMIN_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function GET(request: Request) {
  try {
    if (!floridaClassDMakeupEnabled()) return disabled();
    const actor = await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    const enrollmentId = new URL(request.url).searchParams.get("enrollmentId");
    const state = await getFloridaClassDAdminMakeup(actor, enrollmentId);
    return NextResponse.json(state, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDMakeupEnabled()) return disabled();
    const actor = await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as Body | null;
    if (!body || typeof body.action !== "string") {
      return NextResponse.json({ error: "Invalid make-up administration request.", code: "FDACS_MAKEUP_ADMIN_INVALID_REQUEST" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();

    if (body.action === "assign") {
      if (
        typeof body.enrollmentId !== "string" ||
        !Number.isInteger(body.trainingDay) ||
        !Number.isInteger(body.moduleId) ||
        (body.deliveryMethod !== "live_makeup" && body.deliveryMethod !== "recorded_makeup") ||
        !Number.isInteger(body.assignedMinutes) ||
        typeof body.reason !== "string" ||
        typeof body.assignedInstructorClerkUserId !== "string"
      ) {
        return NextResponse.json({ error: "Make-up assignment fields are incomplete.", code: "FDACS_MAKEUP_ASSIGNMENT_INVALID" }, { status: 400, headers });
      }
      const assignment = await assignFloridaClassDMakeup(actor, {
        enrollmentId: body.enrollmentId,
        trainingDay: body.trainingDay as number,
        moduleId: body.moduleId as number,
        sourceLiveSessionId: typeof body.sourceLiveSessionId === "string" ? body.sourceLiveSessionId : null,
        deliveryMethod: body.deliveryMethod,
        assignedMinutes: body.assignedMinutes as number,
        reason: body.reason,
        recordingAssetReference: typeof body.recordingAssetReference === "string" ? body.recordingAssetReference : null,
        assignedInstructorClerkUserId: body.assignedInstructorClerkUserId,
        correlationId,
      });
      return NextResponse.json({ assignment, correlationId }, { status: 201, headers });
    }

    if (body.action === "answer") {
      if (typeof body.questionId !== "string" || typeof body.answer !== "string") {
        return NextResponse.json({ error: "Question id and answer are required.", code: "FDACS_MAKEUP_ANSWER_INVALID" }, { status: 400, headers });
      }
      const result = await answerFloridaClassDMakeupQuestion(actor, { questionId: body.questionId, answer: body.answer, correlationId });
      return NextResponse.json({ ...result, correlationId }, { headers });
    }

    if (body.action === "preview_reconciliation") {
      if (typeof body.assignmentId !== "string") {
        return NextResponse.json({ error: "Make-up assignment id is required.", code: "FDACS_MAKEUP_ASSIGNMENT_REQUIRED" }, { status: 400, headers });
      }
      const preview = await previewFloridaClassDMakeupReconciliation(actor, body.assignmentId);
      return NextResponse.json({ preview, correlationId }, { headers });
    }

    if (body.action === "certify") {
      return NextResponse.json(
        {
          error: "Make-up instructional credit remains fail closed until the transactional certification subgate is promoted.",
          code: "FDACS_MAKEUP_CERTIFICATION_TRANSACTION_PENDING",
          correlationId,
        },
        { status: 503, headers: { ...headers, "retry-after": "86400" } },
      );
    }

    return NextResponse.json({ error: "Unsupported make-up administration action.", code: "FDACS_MAKEUP_ADMIN_ACTION_UNSUPPORTED" }, { status: 400, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
