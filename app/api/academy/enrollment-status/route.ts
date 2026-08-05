import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";

export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get("course") ?? "";
  if (!courseForId(courseId)) {
    return NextResponse.json({ error: "Unknown course" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ enrolled: false, progress: null, signedIn: false });

  const state = await academyStateWithOwnerAccess(userId, courseId);
  return NextResponse.json({
    enrolled: Boolean(state.entitlements[courseId]),
    progress: state.progress[courseId] ?? null,
    signedIn: true,
  });
}
