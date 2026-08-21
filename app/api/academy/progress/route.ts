import { NextResponse } from "next/server";
import { lessonBrief } from "../../../academy/courseExperience";
import { markLessonComplete } from "../../../../lib/academy";
import { safeAcademyIdentity } from "../../../../lib/academy-identity";
import { validateAcademyJsonMutation } from "../../../../lib/academy-request";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

export async function POST(request: Request) {
  const rejection = validateAcademyJsonMutation(request);
  if (rejection) {
    return NextResponse.json({ error: rejection.error }, { status: rejection.status, headers: responseHeaders });
  }
  const identity = await safeAcademyIdentity();
  if (!identity.configured || identity.status === "claims_unavailable") {
    return NextResponse.json({ error: "Identity service is unavailable" }, { status: 503, headers: responseHeaders });
  }
  if (!identity.principalId) {
    return NextResponse.json({ error: "Sign in is required" }, { status: 401, headers: responseHeaders });
  }

  let body: { courseId?: string; lessonIndex?: number; checkAnswer?: number };
  try {
    body = (await request.json()) as { courseId?: string; lessonIndex?: number; checkAnswer?: number };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }

  if (
    typeof body.courseId !== "string" ||
    typeof body.lessonIndex !== "number" ||
    !Number.isInteger(body.lessonIndex) ||
    typeof body.checkAnswer !== "number" ||
    !Number.isInteger(body.checkAnswer)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }

  const lesson = lessonBrief(body.courseId, body.lessonIndex);
  if (!lesson) {
    return NextResponse.json({ error: "Unknown course lesson" }, { status: 404, headers: responseHeaders });
  }
  if (body.checkAnswer !== lesson.check.answer) {
    return NextResponse.json(
      { error: "Complete the lesson knowledge check correctly before recording completion." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const progress = await markLessonComplete(identity.principalId, body.courseId, body.lessonIndex);
    return NextResponse.json({ progress }, { headers: responseHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save progress" },
      { status: 400, headers: responseHeaders },
    );
  }
}
