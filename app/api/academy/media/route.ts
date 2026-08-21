import { NextRequest, NextResponse } from "next/server";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { safeAcademyIdentity } from "../../../../lib/academy-identity";
import { lessonMedia } from "../../../../lib/academy-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "private, no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get("courseId")?.trim() ?? "";
  const lessonIndex = Number(request.nextUrl.searchParams.get("lessonIndex"));
  const course = courseForId(courseId);

  if (!course || !Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.modules.length) {
    return NextResponse.json({ error: "Invalid lesson media request" }, { status: 400, headers });
  }

  const identity = await safeAcademyIdentity();
  if (!identity.configured || identity.status === "claims_unavailable") {
    return NextResponse.json({ error: "Identity service is unavailable" }, { status: 503, headers });
  }
  if (!identity.principalId || !identity.identity) {
    return NextResponse.json({ error: "Sign in is required" }, { status: 401, headers });
  }
  const state = await academyStateWithOwnerAccess(
    identity.principalId,
    courseId,
    identity.identity.roles,
  );
  if (!state.entitlements[courseId]) {
    return NextResponse.json({ error: "Paid course access is required" }, { status: 403, headers });
  }

  const media = lessonMedia(courseId, lessonIndex);
  if (!media) {
    return NextResponse.json(
      {
        available: false,
        courseId,
        lessonIndex,
        message: "No approved lesson video has been published for this lesson yet.",
      },
      { status: 404, headers },
    );
  }

  return NextResponse.json(
    {
      available: true,
      courseId,
      lessonIndex,
      videoUrl: media.videoUrl,
      posterUrl: media.posterUrl ?? null,
      captionsUrl: media.captionsUrl ?? null,
    },
    { status: 200, headers },
  );
}
