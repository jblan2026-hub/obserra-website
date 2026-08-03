import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import { academyAccessCookieName, accessCookieOptions, parseAcademyAccess, recordAnonymousAssessment, serializeAcademyAccess } from "../../../../lib/academyAccess";
import { finalAssessment } from "../../../academy/courseExperience";

export async function POST(request: Request) {
  const body = await request.json() as { courseId?: string; answers?: number[] };
  if (typeof body.courseId !== "string" || !Array.isArray(body.answers)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const questions = finalAssessment(body.courseId);
  if (questions.length !== 25 || body.answers.length !== questions.length) return NextResponse.json({ error: "Answer every assessment question" }, { status: 400 });
  const score = Math.round((body.answers.filter((answer, index) => answer === questions[index]?.answer).length / questions.length) * 100);
  try {
    const course = courseForId(body.courseId);
    const state = parseAcademyAccess((await cookies()).get(academyAccessCookieName)?.value);
    if (!course || !state) return NextResponse.json({ error: "Paid course access is required" }, { status: 403 });
    const progress = recordAnonymousAssessment(state, body.courseId, score, course.modules.length);
    const response = NextResponse.json({ score, passed: score >= 80, certificateId: progress.certificateId });
    response.cookies.set(academyAccessCookieName, serializeAcademyAccess(state), accessCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to score assessment" }, { status: 400 });
  }
}
