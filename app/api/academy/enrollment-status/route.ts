import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import { academyAccessCookieName, parseAcademyAccess } from "../../../../lib/academyAccess";

export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get("course") ?? "";
  if (!courseForId(courseId)) return NextResponse.json({ error: "Unknown course" }, { status: 400 });
  const state = parseAcademyAccess((await cookies()).get(academyAccessCookieName)?.value);
  return NextResponse.json({ enrolled: Boolean(state?.courses[courseId]), progress: state?.progress[courseId] ?? null });
}
