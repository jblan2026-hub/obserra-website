import { NextResponse } from "next/server";
import { finalAssessment } from "../../../../academy/courseExperience";
import { courseForId } from "../../../../../lib/academy";
import { requireOwnerApi } from "../../../../../lib/owner-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;
const responseHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

export async function POST(request: Request) {
  const owner = await requireOwnerApi();
  if (!owner) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: responseHeaders });
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return NextResponse.json({ error: "JSON is required" }, { status: 415, headers: responseHeaders });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large" }, { status: 413, headers: responseHeaders });
  }

  let body: { courseId?: unknown; answers?: unknown };
  try {
    body = await request.json() as { courseId?: unknown; answers?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }

  if (typeof body.courseId !== "string" || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }

  const course = courseForId(body.courseId);
  const questions = finalAssessment(body.courseId);
  if (!course || questions.length !== 25 || body.answers.length !== questions.length) {
    return NextResponse.json({ error: "Invalid assessment review" }, { status: 400, headers: responseHeaders });
  }

  if (!body.answers.every((answer) => Number.isInteger(answer) && Number(answer) >= 0 && Number(answer) <= 7)) {
    return NextResponse.json({ error: "Every answer must be completed" }, { status: 400, headers: responseHeaders });
  }

  const answers = body.answers.map(Number);
  const correctCount = answers.filter((answer, index) => answer === questions[index]?.answer).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return NextResponse.json(
    {
      courseId: course.id,
      score,
      passed: score >= 80,
      correctCount,
      questionCount: questions.length,
      persistence: "none",
    },
    { status: 200, headers: responseHeaders },
  );
}
