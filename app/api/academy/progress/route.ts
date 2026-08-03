import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import { academyAccessCookieName, accessCookieOptions, markAnonymousLessonComplete, parseAcademyAccess, serializeAcademyAccess } from "../../../../lib/academyAccess";

export async function POST(request: Request) {
  const body = await request.json() as { courseId?: string; lessonIndex?: number };
  if (typeof body.courseId !== "string" || typeof body.lessonIndex !== "number" || !Number.isInteger(body.lessonIndex)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const course = courseForId(body.courseId);
    const state = parseAcademyAccess((await cookies()).get(academyAccessCookieName)?.value);
    if (!course || !state) return NextResponse.json({ error: "Paid course access is required" }, { status: 403 });
    const progress = markAnonymousLessonComplete(state, body.courseId, body.lessonIndex, course.modules.length);
    const response = NextResponse.json({ progress });
    response.cookies.set(academyAccessCookieName, serializeAcademyAccess(state), accessCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save progress" }, { status: 400 });
  }
}
