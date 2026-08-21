import { NextResponse } from "next/server";
import { recordAssessment } from "../../../../lib/academy";
import {
  academyLearnerDisplayName,
  safeAcademyIdentity,
} from "../../../../lib/academy-identity";
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
  const identity = await safeAcademyIdentity();
  if (!identity.configured || identity.status === "claims_unavailable") {
    return NextResponse.json({ error: "Identity service is unavailable" }, { status: 503, headers: responseHeaders });
  }
  if (!identity.principalId || !identity.identity) {
    return NextResponse.json({ error: "Sign in is required" }, { status: 401, headers: responseHeaders });
  }

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
    const progress = await recordAssessment(identity.principalId, body.courseId, score, {
      correctCount: correct,
      questionCount: questions.length,
      learnerName: academyLearnerDisplayName(identity.identity),
      roles: identity.identity.roles,
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
