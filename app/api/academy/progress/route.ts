import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { lessonBrief } from "../../../academy/courseExperience";
import { markLessonComplete } from "../../../../lib/academy";
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in is required" }, { status: 401, headers: responseHeaders });

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
    const progress = await markLessonComplete(userId, body.courseId, body.lessonIndex);
    return NextResponse.json({ progress }, { headers: responseHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save progress" },
      { status: 400, headers: responseHeaders },
    );
  }
}
