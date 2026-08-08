import { NextRequest, NextResponse } from "next/server";
import { courseForId } from "../../../../../lib/academy";
import { publicAcademyCourse } from "../../../../../lib/academy-control";
import { publicationForCourse } from "../../../../academy/coursePublication";

const COURSE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{2,159}$/;

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": status === 200 ? "public, max-age=30, s-maxage=60, stale-while-revalidate=120" : "private, no-store, max-age=0",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const courseId = String((await context.params).courseId || "").trim().toLowerCase();
  if (!COURSE_ID_PATTERN.test(courseId)) return response({ ok: false, error: "invalid-course-id" }, 400);

  const baseCourse = courseForId(courseId);
  if (!baseCourse) return response({ ok: false, error: "course-not-found" }, 404);

  const runtime = await publicAcademyCourse(baseCourse);
  if (!runtime.course) return response({ ok: false, error: "course-not-published" }, 404);

  const course = runtime.course;
  const publication = publicationForCourse(course.id);

  return response({
    ok: true,
    schemaVersion: "1.0",
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      track: course.track,
      level: course.level,
      audience: course.audience,
      duration: course.duration,
      price: course.price,
      currency: "USD",
      outcomes: course.outcomes,
      modules: course.modules.map((module, index) => ({
        sequence: index + 1,
        title: module.title,
        description: module.description,
        format: module.format,
        duration: module.duration,
      })),
      publication: {
        purchaseEnabled: runtime.controlPlane === "operational" && runtime.control.purchaseEnabled === true,
        releaseStatus: publication.releaseStatus,
        version: publication.version || null,
        assessmentRequired: publication.assessmentRequired,
        passingScore: publication.passingScore,
        certificateIssued: publication.certificateIssued,
        credentialDisclaimer: publication.credentialDisclaimer || null,
      },
    },
    generatedAt: new Date().toISOString(),
  });
}
