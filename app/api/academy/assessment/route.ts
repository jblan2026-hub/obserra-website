import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { gradeAcademyFinalAssessment } from "../../../../lib/academy-delivery-server";
import { recordAssessment } from "../../../../lib/academy";

type AssessmentRequest = {
  courseId?: string;
  answers?: Array<{ questionId?: string; answerIndex?: number }>;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in is required" }, { status: 401 });

  let body: AssessmentRequest;
  try {
    body = (await request.json()) as AssessmentRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof body.courseId !== "string" || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const answers = body.answers.map((answer) => ({
    questionId: typeof answer.questionId === "string" ? answer.questionId : "",
    answerIndex: typeof answer.answerIndex === "number" ? answer.answerIndex : -1,
  }));
  if (
    answers.length === 0 ||
    answers.some((answer) => !answer.questionId || !Number.isInteger(answer.answerIndex) || answer.answerIndex < 0)
  ) {
    return NextResponse.json({ error: "Answer every assessment question" }, { status: 400 });
  }

  try {
    const grade = await gradeAcademyFinalAssessment({
      courseId: body.courseId,
      learnerId: userId,
      answers,
    });
    const progress = await recordAssessment(userId, body.courseId, grade.score);

    return NextResponse.json({
      score: grade.score,
      passingScore: grade.passingScore,
      passed: grade.passed,
      releaseVersion: grade.releaseVersion,
      certificateId: progress.certificateId,
      certificateUrl: progress.certificateId ? `/academy/certificate/${body.courseId}` : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to score assessment" },
      { status: 400 },
    );
  }
}
