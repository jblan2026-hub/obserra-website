import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { academyStateWithOwnerAccess } from "../../../../lib/academy";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const courseId = new URL(request.url).searchParams.get("course") ?? "";
  try {
    const state = await academyStateWithOwnerAccess(userId, courseId);
    return NextResponse.json({ enrolled: Boolean(state.entitlements[courseId]), progress: state.progress[courseId] ?? null });
  } catch {
    return NextResponse.json({ error: "Unknown course" }, { status: 400 });
  }
}
