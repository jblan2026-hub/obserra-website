import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recordAssessment } from "../../../../lib/academy";
import { validateAcademyJsonMutation } from "../../../../lib/academy-request";
import { finalAssessment } from "../../../academy/courseExperience";

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

  let body: { courseId?: string; answers?: number[] };
  try {
    body = await request.json() as { courseId?: string; answers?: number[] };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }
  if (typeof body.courseId !== "string" || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }

  const questions = finalAssessment(body.courseId);
  if (questions.length !== 25 || body.answers.length !== questions.length) {
    return NextResponse.json({ error: "Answer every assessment question" }, { status: 400, headers: responseHeaders });
  }

  const correct = body.answers.filter((answer, index) => answer === questions[index]?.answer).length;
  const score = Math.round((correct / questions.length) * 100);

  try {
    const progress = await recordAssessment(userId, body.courseId, score, {
      correctCount: correct,
      questionCount: questions.length,
    });
    return NextResponse.json({
      score,
      passed: score >= 80,
      certificateId: progress.certificateId,
      certificateUrl: progress.certificateId ? `/academy/certificate/${body.courseId}` : null,
    }, { headers: responseHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to score assessment" },
      { status: 400, headers: responseHeaders },
    );
  }
}
