import { NextResponse } from "next/server";
import { FloridaClassDAuthorizationError, requireFloridaClassDSignedInUser } from "../../../../lib/florida-class-d-auth";
import {
  answerFloridaClassDExamQuestion,
  floridaClassDExamEnabled,
  FloridaClassDExamError,
  getFloridaClassDExamState,
  startFloridaClassDExam,
  submitFloridaClassDExam,
} from "../../../../lib/florida-class-d-exam";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "content-security-policy": "frame-ancestors 'none'",
};

type Body = {
  action?: unknown;
  browserInstanceId?: unknown;
  attemptId?: unknown;
  questionId?: unknown;
  selectedChoiceKey?: unknown;
  direction?: unknown;
  correlationId?: unknown;
};

function disabled() {
  return NextResponse.json(
    { error: "Florida Class D final examination is not yet enabled.", code: "FDACS_EXAM_NOT_ENABLED" },
    { status: 503, headers: { ...headers, "retry-after": "86400" } },
  );
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDExamError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_EXAM_AUTHORIZATION_FAILED" },
      { status: error.status, headers },
    );
  }
  console.error("Florida Class D exam API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json({ error: "Unable to process the regulated examination request.", code: "FDACS_EXAM_REQUEST_FAILED" }, { status: 500, headers });
}

export async function GET() {
  try {
    if (!floridaClassDExamEnabled()) return disabled();
    const { userId } = await requireFloridaClassDSignedInUser();
    return NextResponse.json(await getFloridaClassDExamState(userId), { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDExamEnabled()) return disabled();
    const { userId, sessionId } = await requireFloridaClassDSignedInUser();
    const body = await request.json().catch(() => null) as Body | null;
    if (!body || typeof body.action !== "string") return NextResponse.json({ error: "Invalid examination request.", code: "FDACS_EXAM_INVALID_REQUEST" }, { status: 400, headers });
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();

    if (body.action === "start") {
      if (typeof body.browserInstanceId !== "string") return NextResponse.json({ error: "Browser instance identifier is required.", code: "FDACS_EXAM_DEVICE_REQUIRED" }, { status: 400, headers });
      return NextResponse.json(await startFloridaClassDExam(userId, sessionId, { browserInstanceId: body.browserInstanceId, correlationId }), { status: 201, headers });
    }

    if (body.action === "answer") {
      if (
        typeof body.attemptId !== "string" ||
        typeof body.questionId !== "string" ||
        typeof body.selectedChoiceKey !== "string" ||
        !["next", "previous", "stay"].includes(String(body.direction))
      ) return NextResponse.json({ error: "Answer fields are incomplete.", code: "FDACS_EXAM_ANSWER_INVALID" }, { status: 400, headers });
      return NextResponse.json(await answerFloridaClassDExamQuestion(userId, {
        attemptId: body.attemptId,
        questionId: body.questionId,
        selectedChoiceKey: body.selectedChoiceKey,
        direction: body.direction as "next" | "previous" | "stay",
      }), { headers });
    }

    if (body.action === "submit") {
      if (typeof body.attemptId !== "string") return NextResponse.json({ error: "Attempt identifier is required.", code: "FDACS_EXAM_ATTEMPT_REQUIRED" }, { status: 400, headers });
      return NextResponse.json(await submitFloridaClassDExam(userId, { attemptId: body.attemptId, correlationId }), { headers });
    }

    return NextResponse.json({ error: "Unsupported examination action.", code: "FDACS_EXAM_ACTION_UNSUPPORTED" }, { status: 400, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
