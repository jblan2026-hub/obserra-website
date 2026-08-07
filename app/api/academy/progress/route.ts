import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { gradeAcademyKnowledgeCheck } from "../../../../lib/academy-delivery-server";
import { markLessonComplete } from "../../../../lib/academy";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

type ProgressRequest = {
  courseId?: string;
  lessonPosition?: number;
  questionId?: string;
  answerIndex?: number;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in is required" }, { status: 401, headers: responseHeaders });

  let body: ProgressRequest;
  try {
    body = (await request.json()) as ProgressRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }

  if (
    typeof body.courseId !== "string" ||
    typeof body.lessonPosition !== "number" ||
    !Number.isInteger(body.lessonPosition) ||
    body.lessonPosition < 1 ||
    typeof body.questionId !== "string" ||
    !body.questionId.trim() ||
    typeof body.answerIndex !== "number" ||
    !Number.isInteger(body.answerIndex) ||
    body.answerIndex < 0
  ) {
    return NextResponse.json({ error: "Invalid knowledge-check submission" }, { status: 400, headers: responseHeaders });
  }

  try {
    const result = await gradeAcademyKnowledgeCheck({
      courseId: body.courseId,
      learnerId: userId,
      lessonPosition: body.lessonPosition,
      questionId: body.questionId,
      answerIndex: body.answerIndex,
    });

    if (!result.correct) {
      return NextResponse.json(
        {
          correct: false,
          explanation: result.explanation,
          error: "Complete the lesson knowledge check correctly before recording completion.",
        },
        { status: 400, headers: responseHeaders },
      );
    }

    const progress = await markLessonComplete(userId, body.courseId, body.lessonPosition - 1);
    return NextResponse.json(
      { progress, correct: true, explanation: result.explanation },
      { headers: responseHeaders },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save progress" },
      { status: 400, headers: responseHeaders },
    );
  }
}
