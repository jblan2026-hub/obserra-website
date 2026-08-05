import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recordAssessment } from "../../../../lib/academy";
import { finalAssessment } from "../../../academy/courseExperience";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in is required" }, { status: 401 });

  const body = (await request.json()) as { courseId?: string; answers?: number[] };
  if (typeof body.courseId !== "string" || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const questions = finalAssessment(body.courseId);
  if (questions.length !== 25 || body.answers.length !== questions.length) {
    return NextResponse.json({ error: "Answer every assessment question" }, { status: 400 });
  }

  const correct = body.answers.filter((answer, index) => answer === questions[index]?.answer).length;
  const score = Math.round((correct / questions.length) * 100);

  try {
    const progress = await recordAssessment(userId, body.courseId, score);
    return NextResponse.json({
      score,
      passed: score >= 80,
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
