import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDSignedInUser,
} from "../../../../lib/florida-class-d-auth";
import {
  floridaClassDMakeupEnabled,
  FloridaClassDMakeupError,
  getFloridaClassDStudentMakeup,
  submitFloridaClassDMakeupQuestion,
} from "../../../../lib/florida-class-d-makeup";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type Body = {
  action?: unknown;
  assignmentId?: unknown;
  question?: unknown;
  correlationId?: unknown;
};

function disabled() {
  return NextResponse.json(
    { error: "Florida Class D make-up training is not yet enabled.", code: "FDACS_MAKEUP_NOT_ENABLED" },
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
  console.error("Florida Class D student make-up API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process the regulated make-up training request.", code: "FDACS_MAKEUP_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function GET() {
  try {
    if (!floridaClassDMakeupEnabled()) return disabled();
    const { userId } = await requireFloridaClassDSignedInUser();
    const state = await getFloridaClassDStudentMakeup(userId);
    return NextResponse.json(state, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDMakeupEnabled()) return disabled();
    const { userId } = await requireFloridaClassDSignedInUser();
    const body = await request.json().catch(() => null) as Body | null;
    if (!body || body.action !== "question" || typeof body.assignmentId !== "string" || typeof body.question !== "string") {
      return NextResponse.json({ error: "Invalid make-up training request.", code: "FDACS_MAKEUP_INVALID_REQUEST" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const question = await submitFloridaClassDMakeupQuestion(userId, {
      assignmentId: body.assignmentId,
      question: body.question,
      correlationId,
    });
    return NextResponse.json({ question, correlationId }, { status: 201, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
