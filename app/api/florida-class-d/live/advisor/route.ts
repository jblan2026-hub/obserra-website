import { NextResponse } from "next/server";
import { requireFloridaClassDSignedInUser } from "../../../../../lib/florida-class-d-auth";
import { generateFloridaClassDAiAdvisorResponse, FloridaClassDAiAdvisorError } from "../../../../../lib/florida-class-d-ai-advisor";
import { getFloridaClassDLiveStudentState } from "../../../../../lib/florida-class-d-live-persistence";
import { getFloridaClassDActiveTextScreen } from "../../../../../lib/florida-class-d-text-screen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NO_STORE = "private, no-store, max-age=0";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function headers(extra?: Record<string, string>) {
  return {
    "cache-control": NO_STORE,
    "x-content-type-options": "nosniff",
    "x-robots-tag": "noindex, nofollow, noarchive",
    ...extra,
  };
}

function rejected(status: number, error: string, code: string) {
  return NextResponse.json({ error, code }, { status, headers: headers() });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function GET() {
  return rejected(405, "Method not allowed", "FDACS_AI_METHOD_NOT_ALLOWED");
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return rejected(403, "Forbidden", "FDACS_AI_SAME_ORIGIN_REQUIRED");
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return rejected(415, "Application JSON is required", "FDACS_AI_CONTENT_TYPE_REQUIRED");
  }

  let body: { liveSessionId?: unknown; question?: unknown; voice?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return rejected(400, "Invalid request body", "FDACS_AI_INVALID_REQUEST");
  }

  const liveSessionId = typeof body.liveSessionId === "string" ? body.liveSessionId.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const voice = body.voice === true;
  if (!UUID.test(liveSessionId) || question.length < 2 || question.length > 1_200) {
    return rejected(400, "Invalid advisor request", "FDACS_AI_INVALID_REQUEST");
  }

  try {
    const { userId } = await requireFloridaClassDSignedInUser();
    const studentState = await getFloridaClassDLiveStudentState(userId, liveSessionId);
    const textScreen = await getFloridaClassDActiveTextScreen(liveSessionId);
    const session = studentState.session as Record<string, unknown> | undefined;

    const result = await generateFloridaClassDAiAdvisorResponse({
      question,
      voice,
      context: {
        day: typeof session?.day === "number" ? session.day : null,
        lessonId: typeof session?.lesson_id === "string" ? session.lesson_id : null,
        segment: session?.current_segment_type === "instruction" || session?.current_segment_type === "break"
          ? session.current_segment_type
          : null,
        screenTitle: textScreen?.title ?? null,
        screenBody: textScreen?.body ?? null,
      },
    });

    return NextResponse.json(
      {
        ...result,
        liveSessionId,
        nonCredit: true,
        authoritativeInstructor: true,
      },
      { status: 200, headers: headers({ "x-obserra-correlation-id": result.correlationId }) },
    );
  } catch (error) {
    if (error instanceof FloridaClassDAiAdvisorError) {
      return NextResponse.json(
        { error: error.message, code: error.code, retryable: error.retryable },
        { status: error.status, headers: headers() },
      );
    }
    const status = typeof error === "object" && error && "status" in error && typeof error.status === "number"
      ? error.status
      : 503;
    const code = typeof error === "object" && error && "code" in error && typeof error.code === "string"
      ? error.code
      : "FDACS_AI_ADVISOR_UNAVAILABLE";
    return rejected(status, "AI Advisor is unavailable", code);
  }
}
